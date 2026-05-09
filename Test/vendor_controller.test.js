const mockQuery = jest.fn();
const mockDb = { query: mockQuery };

jest.mock("../config/db", () => mockDb);

const vendorsController = require("../controllers/vendors.controller");

const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const makeReq = (query = {}) => ({ query });

const vendorRows = [
  {
    vendor_id: 1,
    store_name: "Pizza Palace",
    logo_url: "https://example.com/logo1.png",
    description: "Best pizza in town",
    is_open: true,
    average_rating: "4.80",
    category_name: "Italian",
  },
  {
    vendor_id: 2,
    store_name: "Burger Barn",
    logo_url: "https://example.com/logo2.png",
    description: "Juicy burgers",
    is_open: false,
    average_rating: "4.50",
    category_name: "Fast Food",
  },
];

describe("getVendors", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

    it("returns all approved vendors with no filters", () => {
      mockQuery.mockImplementation((sql, params, cb) => cb(null, vendorRows));

      const req = makeReq();
      const res = makeRes();

      vendorsController.getVendors(req, res);

      expect(mockQuery).toHaveBeenCalledTimes(1);

      const [sql, params] = mockQuery.mock.calls[0];
      expect(sql).toContain("application_status = 'Approved'");
      expect(sql).toContain("ORDER BY v.average_rating DESC");
      expect(params).toEqual([]);

      expect(res.json).toHaveBeenCalledWith(vendorRows);
      expect(res.status).not.toHaveBeenCalled();
    });

    it("applies category filter when filter is not 'all'", () => {
      const filtered = [vendorRows[0]];
      mockQuery.mockImplementation((sql, params, cb) => cb(null, filtered));

      const req = makeReq({ filter: "Italian" });
      const res = makeRes();

      vendorsController.getVendors(req, res);

      const [sql, params] = mockQuery.mock.calls[0];
      expect(sql).toContain("AND vc.name = ?");
      expect(params).toContain("Italian");
      expect(res.json).toHaveBeenCalledWith(filtered);
    });

    it("applies search filter when search param is provided", () => {
      const searched = [vendorRows[1]];
      mockQuery.mockImplementation((sql, params, cb) => cb(null, searched));

      const req = makeReq({ search: "Burger" });
      const res = makeRes();

      vendorsController.getVendors(req, res);

      const [sql, params] = mockQuery.mock.calls[0];
      expect(sql).toContain("AND v.store_name LIKE ?");
      expect(params).toContain("%Burger%");
      expect(res.json).toHaveBeenCalledWith(searched);
    });

    it("applies both category filter and search filter together", () => {
      mockQuery.mockImplementation((sql, params, cb) => cb(null, vendorRows));

      const req = makeReq({ filter: "Fast Food", search: "Burger" });
      const res = makeRes();

      vendorsController.getVendors(req, res);

      const [sql, params] = mockQuery.mock.calls[0];
      expect(sql).toContain("AND vc.name = ?");
      expect(sql).toContain("AND v.store_name LIKE ?");
      expect(params).toEqual(["Fast Food", "%Burger%"]);
    });

    it("skips category filter when filter is 'all'", () => {
      mockQuery.mockImplementation((sql, params, cb) => cb(null, vendorRows));

      const req = makeReq({ filter: "all" });
      const res = makeRes();

      vendorsController.getVendors(req, res);

      const [sql, params] = mockQuery.mock.calls[0];
      expect(sql).not.toContain("AND vc.name = ?");
      expect(params).toEqual([]);
    });

    it("returns an empty array when no vendors match", () => {
      mockQuery.mockImplementation((sql, params, cb) => cb(null, []));

      const req = makeReq({ search: "nonexistent" });
      const res = makeRes();

      vendorsController.getVendors(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it("wraps search term in wildcard % characters", () => {
      mockQuery.mockImplementation((sql, params, cb) => cb(null, []));

      const req = makeReq({ search: "pizza" });
      const res = makeRes();

      vendorsController.getVendors(req, res);

      const [, params] = mockQuery.mock.calls[0];
      expect(params[0]).toBe("%pizza%");
    });

    it("selects all expected columns from the query", () => {
      mockQuery.mockImplementation((sql, params, cb) => cb(null, vendorRows));

      const req = makeReq();
      const res = makeRes();

      vendorsController.getVendors(req, res);

      const [sql] = mockQuery.mock.calls[0];
      expect(sql).toContain("v.vendor_id");
      expect(sql).toContain("v.store_name");
      expect(sql).toContain("v.logo_url");
      expect(sql).toContain("v.description");
      expect(sql).toContain("v.is_open");
      expect(sql).toContain("v.average_rating");
      expect(sql).toContain("vc.name AS category_name");
    });

    it("joins vendors with vendor_categories on category_id", () => {
      mockQuery.mockImplementation((sql, params, cb) => cb(null, vendorRows));

      const req = makeReq();
      const res = makeRes();

      vendorsController.getVendors(req, res);

      const [sql] = mockQuery.mock.calls[0];
      expect(sql).toContain("JOIN vendor_categories vc");
      expect(sql).toContain("ON v.category_id = vc.category_id");
    });

  describe("error handling", () => {
    it("returns 500 with the error message on DB failure", () => {
      const dbError = new Error("Connection lost");
      mockQuery.mockImplementation((sql, params, cb) => cb(dbError, null));

      const req = makeReq();
      const res = makeRes();

      vendorsController.getVendors(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Connection lost" });
    });

    it("does not call res.json with data when DB fails", () => {
      mockQuery.mockImplementation((sql, params, cb) =>
        cb(new Error("Timeout"), null)
      );

      const req = makeReq();
      const res = makeRes();

      vendorsController.getVendors(req, res);

      expect(res.json).toHaveBeenCalledTimes(1);
      expect(res.json).not.toHaveBeenCalledWith(expect.any(Array));
    });
  });

    it("does not append LIKE clause for an empty search string", () => {
      mockQuery.mockImplementation((sql, params, cb) => cb(null, vendorRows));

      const req = makeReq({ search: "" });
      const res = makeRes();

      vendorsController.getVendors(req, res);

      const [sql, params] = mockQuery.mock.calls[0];
      expect(sql).not.toContain("LIKE");
      expect(params).toEqual([]);
    });

    it("does not append category clause when filter is undefined", () => {
      mockQuery.mockImplementation((sql, params, cb) => cb(null, vendorRows));

      const req = makeReq({ filter: undefined });
      const res = makeRes();

      vendorsController.getVendors(req, res);

      const [sql] = mockQuery.mock.calls[0];
      expect(sql).not.toContain("AND vc.name = ?");
    });

    it("always orders by average_rating DESC regardless of filters", () => {
      mockQuery.mockImplementation((sql, params, cb) => cb(null, vendorRows));

      const req = makeReq({ filter: "Italian", search: "pizza" });
      const res = makeRes();

      vendorsController.getVendors(req, res);

      const [sql] = mockQuery.mock.calls[0];
      expect(sql).toContain("ORDER BY v.average_rating DESC");
    });

    it("calls db.query exactly once per request", () => {
      mockQuery.mockImplementation((sql, params, cb) => cb(null, []));

      vendorsController.getVendors(makeReq(), makeRes());

      expect(mockQuery).toHaveBeenCalledTimes(1);
    });
  });