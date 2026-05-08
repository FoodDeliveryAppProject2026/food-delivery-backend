const { createProfile, getProfile, updateProfile } = require("../controllers/customer.controller");

jest.mock("../models/customer.model");
const Customer = require("../models/customer.model");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockReq = (body = {}, user = { user_id: 1 }) => ({ body, user });

const mockCustomerInstance = {
  customer_id: 1,
  user_id: 1,
  first_name: "John",
  last_name: "Doe",
  default_address: "123 Main St",
  default_latitude: 31.256,
  default_longitude: 32.284,
  update: jest.fn().mockResolvedValue(true), // Ensure update is a mock function
};

beforeEach(() => {
  jest.clearAllMocks();
});

// --- createProfile Tests ---
describe("createProfile", () => {
  it("creates a profile", async () => {
    Customer.findOne.mockResolvedValue(null);
    Customer.create.mockResolvedValue(mockCustomerInstance);

    const fullData = { 
      first_name: "John", 
      last_name: "Doe", 
      default_address: "123 Main St",
      default_latitude: 31.256,
      default_longitude: 32.284
    };
    const req = mockReq(fullData);
    const res = mockRes();

    await createProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(Customer.create).toHaveBeenCalledWith(expect.objectContaining({
      ...fullData,
      user_id: 1
    }));
  });

  it("creates a profile with only required fields", async () => {
    Customer.findOne.mockResolvedValue(null);
    Customer.create.mockResolvedValue({ ...mockCustomerInstance, default_address: null });

    const req = mockReq({ first_name: "John", last_name: "Doe" });
    const res = mockRes();

    await createProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(Customer.create).toHaveBeenCalledWith(expect.objectContaining({
      first_name: "John",
      last_name: "Doe",
      user_id: 1
    }));
  });

  it("returns 400 if first_name or last_name is missing", async () => {
    const req = mockReq({ first_name: "first_name" });
     const res = mockRes();

    await createProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "First and last name are required" });
  });

  it("returns 400 if profile already exists", async () => {
    Customer.findOne.mockResolvedValue(mockCustomerInstance);

    const req = mockReq({ first_name: "John", last_name: "Doe" });
    const res = mockRes();

    await createProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Profile already exists" });
  });

  it("returns 500 on unexpected database error", async () => {
    Customer.findOne.mockRejectedValue(new Error("Database connection lost"));

    const req = mockReq({ first_name: "John", last_name: "Doe" });
    const res = mockRes();

    await createProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Database connection lost" });
  });
});

// --- getProfile Tests ---
describe("getProfile", () => {
  it("returns the customer profile", async () => {
    Customer.findOne.mockResolvedValue(mockCustomerInstance);

    const req = mockReq();
    const res = mockRes();

    await getProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockCustomerInstance);
    expect(Customer.findOne).toHaveBeenCalledWith({ where: { user_id: 1 } });
  });

  it("returns 404 if profile does not exist", async () => {
    Customer.findOne.mockResolvedValue(null);

    const req = mockReq();
    const res = mockRes();

    await getProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Profile not found" });
  });
});

// --- updateProfile Tests ---
describe("updateProfile", () => {
  it("updates specific fields successfully", async () => {
    Customer.findOne.mockResolvedValue(mockCustomerInstance);
    
    const update_data = { first_name: "Jane", last_name: "Smith" };
    const req = mockReq(update_data);
    const res = mockRes();

    await updateProfile(req, res);

    expect(mockCustomerInstance.update).toHaveBeenCalledWith(expect.objectContaining(update_data));

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: "Profile updated successfully"
    }));
  });

  it("updates coordinates successfully", async () => {
    Customer.findOne.mockResolvedValue(mockCustomerInstance);
    
    const coordUpdate = { default_latitude: 40.7128, default_longitude: -74.0060 };
    const req = mockReq(coordUpdate);
    const res = mockRes();

    await updateProfile(req, res);

    expect(mockCustomerInstance.update).toHaveBeenCalledWith(expect.objectContaining(coordUpdate));
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("returns 404 if profile is missing during update", async () => {
    Customer.findOne.mockResolvedValue(null);

    const req = mockReq({ first_name: "NewName" });
    const res = mockRes();

    await updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Profile not found" });
  });

  it("returns 500 if update fails", async () => {
    Customer.findOne.mockResolvedValue(mockCustomerInstance);
    mockCustomerInstance.update.mockRejectedValue(new Error("Update failed"));

    const req = mockReq({ first_name: "Jane" });
    const res = mockRes();

    await updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Update failed" });
  });
});