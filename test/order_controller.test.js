jest.mock("../models/order.model");
jest.mock("../models/customer.model");

const Order = require("../models/order.model");
const Customer = require("../models/customer.model");
const {
  placeOrder,
  getMyOrders,
  getOrderDetails,
  updateOrderStatus,
  cancelOrder,
} = require("../controllers/order.controller");

function makeReqRes(overrides = {}) {
  const req = {
    user: { user_id: 1 },   
    body: {},
    params: {},
    ...overrides,
  };

  const res = {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;             
    },
    json(payload) {
      this.data = payload;
      return this;
    },
  };

  return { req, res };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("placeOrder", () => {

  test("returns 400 when required fields are missing", async () => {
    const { req, res } = makeReqRes({
      body: { payment_method: "COD" }, // missing total_amount, delivery_address, vendor_id
    });

    await placeOrder(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.data.message).toBe("Missing required fields");
  });

  test("returns 404 when customer profile does not exist", async () => {
    const { req, res } = makeReqRes({
      body: {
        total_amount: 100,
        delivery_address: "123 Main St",
        vendor_id: 5,
      },
    });

    Customer.findOne.mockResolvedValue(null);

    await placeOrder(req, res);

    expect(res.statusCode).toBe(404);
    expect(res.data.message).toMatch(/Customer profile not found/);
  });

  test("creates order and returns 201 on success", async () => {
    const { req, res } = makeReqRes({
      body: {
        total_amount: 250,
        payment_method: "Online",
        delivery_address: "456 Elm St",
        delivery_lat: 31.25,
        delivery_long: 32.28,
        vendor_id: 3,
      },
    });

    Customer.findOne.mockResolvedValue({ customer_id: 7 });

    const fakeOrder = { order_id: 101, status: "Pending", total_amount: 250 };
    Order.create.mockResolvedValue(fakeOrder);

    await placeOrder(req, res);

    expect(res.statusCode).toBe(201);
    expect(res.data.message).toBe("Order placed successfully");
    expect(res.data.order).toEqual(fakeOrder);

    expect(Order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        total_amount: 250,
        vendor_id: 3,
        customer_id: 7,
      })
    );
  });

  test("defaults payment_method to COD when not provided", async () => {
    const { req, res } = makeReqRes({
      body: {
        total_amount: 100,
        delivery_address: "789 Oak Ave",
        vendor_id: 2,
      },
    });

    Customer.findOne.mockResolvedValue({ customer_id: 5 });
    Order.create.mockResolvedValue({ order_id: 55 });

    await placeOrder(req, res);

    expect(Order.create).toHaveBeenCalledWith(
      expect.objectContaining({ payment_method: "COD" })
    );
  });

  test("returns 500 when an unexpected error occurs", async () => {
    const { req, res } = makeReqRes({
      body: {
        total_amount: 100,
        delivery_address: "789 Oak Ave",
        vendor_id: 2,
      },
    });

    // Simulate a database crash
    Customer.findOne.mockRejectedValue(new Error("DB connection lost"));

    await placeOrder(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.data.message).toBe("DB connection lost");
  });
});

describe("getMyOrders", () => {

  test("returns 404 when customer profile is not found", async () => {
    const { req, res } = makeReqRes();
    Customer.findOne.mockResolvedValue(null);

    await getMyOrders(req, res);

    expect(res.statusCode).toBe(404);
    expect(res.data.message).toBe("Customer profile not found");
  });

  test("returns list of orders for the logged-in customer", async () => {
    const { req, res } = makeReqRes();

    Customer.findOne.mockResolvedValue({ customer_id: 7 });

    const fakeOrders = [
      { order_id: 1, total_amount: 100, status: "Delivered" },
      { order_id: 2, total_amount: 200, status: "Pending" },
    ];
    Order.findAll.mockResolvedValue(fakeOrders);

    await getMyOrders(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.data).toEqual(fakeOrders);

    expect(Order.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { customer_id: 7 },
      })
    );
  });

  test("returns empty array when customer has no orders", async () => {
    const { req, res } = makeReqRes();

    Customer.findOne.mockResolvedValue({ customer_id: 7 });
    Order.findAll.mockResolvedValue([]);

    await getMyOrders(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.data).toEqual([]);
  });

  test("returns 500 on unexpected error", async () => {
    const { req, res } = makeReqRes();
    Customer.findOne.mockRejectedValue(new Error("Timeout"));

    await getMyOrders(req, res);

    expect(res.statusCode).toBe(500);
  });
});

describe("getOrderDetails", () => {

  test("returns 404 when order does not exist", async () => {
    const { req, res } = makeReqRes({ params: { order_id: 999 } });
    Order.findByPk.mockResolvedValue(null);

    await getOrderDetails(req, res);

    expect(res.statusCode).toBe(404);
    expect(res.data.message).toBe("Order not found");
  });

  test("returns order details when order exists", async () => {
    const fakeOrder = { order_id: 42, status: "Confirmed", total_amount: 150 };
    const { req, res } = makeReqRes({ params: { order_id: 42 } });

    Order.findByPk.mockResolvedValue(fakeOrder);

    await getOrderDetails(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.data).toEqual(fakeOrder);
    expect(Order.findByPk).toHaveBeenCalledWith(42);
  });

  test("returns 500 on unexpected error", async () => {
    const { req, res } = makeReqRes({ params: { order_id: 1 } });
    Order.findByPk.mockRejectedValue(new Error("Query failed"));

    await getOrderDetails(req, res);

    expect(res.statusCode).toBe(500);
  });
});

describe("updateOrderStatus", () => {

  test("returns 404 when order does not exist", async () => {
    const { req, res } = makeReqRes({
      params: { order_id: 999 },
      body: { status: "Confirmed" },
    });
    Order.findByPk.mockResolvedValue(null);

    await updateOrderStatus(req, res);

    expect(res.statusCode).toBe(404);
    expect(res.data.message).toBe("Order not found");
  });

  test("updates order status and returns updated order", async () => {
    const fakeOrder = {
      order_id: 10,
      status: "Pending",
      update: jest.fn().mockResolvedValue({ order_id: 10, status: "Confirmed" }),
    };

    const { req, res } = makeReqRes({
      params: { order_id: 10 },
      body: { status: "Confirmed" },
    });

    Order.findByPk.mockResolvedValue(fakeOrder);

    await updateOrderStatus(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.data.message).toBe("Order status updated");
    
    expect(fakeOrder.update).toHaveBeenCalledWith({ status: "Confirmed" });
  });

  test("returns 500 on unexpected error", async () => {
    const { req, res } = makeReqRes({
      params: { order_id: 1 },
      body: { status: "Confirmed" },
    });
    Order.findByPk.mockRejectedValue(new Error("DB error"));

    await updateOrderStatus(req, res);

    expect(res.statusCode).toBe(500);
  });
});

describe("cancelOrder", () => {

  test("returns 404 when order does not exist", async () => {
    const { req, res } = makeReqRes({ params: { order_id: 999 } });
    Order.findByPk.mockResolvedValue(null);

    await cancelOrder(req, res);

    expect(res.statusCode).toBe(404);
    expect(res.data.message).toBe("Order not found");
  });

  test("returns 400 when trying to cancel a confirmed order", async () => {
    const fakeOrder = { order_id: 5, status: "Confirmed" };
    const { req, res } = makeReqRes({ params: { order_id: 5 } });

    Order.findByPk.mockResolvedValue(fakeOrder);

    await cancelOrder(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.data.message).toBe("Only pending orders can be cancelled");
  });

  test("cancels a pending order successfully", async () => {
    const fakeOrder = {
      order_id: 8,
      status: "Pending",
      update: jest.fn().mockResolvedValue(true),
    };
    const { req, res } = makeReqRes({ params: { order_id: 8 } });

    Order.findByPk.mockResolvedValue(fakeOrder);

    await cancelOrder(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.data.message).toBe("Order cancelled successfully");
    expect(fakeOrder.update).toHaveBeenCalledWith({ status: "Cancelled" });
  });

  test("returns 500 on unexpected error", async () => {
    const { req, res } = makeReqRes({ params: { order_id: 1 } });
    Order.findByPk.mockRejectedValue(new Error("Unexpected error"));

    await cancelOrder(req, res);

    expect(res.statusCode).toBe(500);
  });
});