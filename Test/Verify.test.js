jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "mock.jwt.token"),
  verify: jest.fn(),
}));

jest.mock("dotenv", () => ({ config: jest.fn() }));

jest.mock("../services/email.service", () => ({
  sendOTP: jest.fn(),
}));

const mockUpdate = jest.fn();
const mockFindOne = jest.fn();

jest.mock("../models/user.model", () => ({
  findOne: mockFindOne,
}));

const { verifyOTP } = require("../controllers/controllers_auth");

const fakeUser = {
  user_id: 1,
  email: "test@example.com",
  otp_code: "123456",
  otp_expires_at: new Date(Date.now() + 5 * 60 * 1000),
  is_verified: false,
  update: mockUpdate,
};

const makeRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
});

beforeEach(() => {
  jest.clearAllMocks();
  mockUpdate.mockResolvedValue(true);
});

describe("verifyOTP", () => {

  it("should return 200 and a token if otp is correct", async () => {
    mockFindOne.mockResolvedValue(fakeUser);

    const req = { body: { email: "test@example.com", otp: "123456" } };
    const res = makeRes();

    await verifyOTP(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Email verified successfully",
      token: "mock.jwt.token",
    });
  });

  it("should set is_verified to true in the database", async () => {
    mockFindOne.mockResolvedValue(fakeUser);

    const req = { body: { email: "test@example.com", otp: "123456" } };
    const res = makeRes();

    await verifyOTP(req, res);

    expect(mockUpdate).toHaveBeenCalledWith({
      is_verified: true,
      otp_code: null,
      otp_expires_at: null,
    });
  });

  it("should return 404 if the email doesnt exist", async () => {
    mockFindOne.mockResolvedValue(null); // user not found

    const req = { body: { email: "nobody@example.com", otp: "123456" } };
    const res = makeRes();

    await verifyOTP(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should not update the user if email doesnt exist", async () => {
    mockFindOne.mockResolvedValue(null);

    const req = { body: { email: "nobody@example.com", otp: "123456" } };
    const res = makeRes();

    await verifyOTP(req, res);

    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("should return 400 if otp is wrong", async () => {
    mockFindOne.mockResolvedValue(fakeUser);

    const req = { body: { email: "test@example.com", otp: "000000" } }; // wrong otp
    const res = makeRes();

    await verifyOTP(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid OTP" });
  });

  it("should not update user if otp is wrong", async () => {
    mockFindOne.mockResolvedValue(fakeUser);

    const req = { body: { email: "test@example.com", otp: "000000" } };
    const res = makeRes();

    await verifyOTP(req, res);

    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("should return 400 if otp is expired", async () => {
    const expiredUser = {
      ...fakeUser,
      otp_expires_at: new Date(Date.now() - 1000), // already expired
    };
    mockFindOne.mockResolvedValue(expiredUser);

    const req = { body: { email: "test@example.com", otp: "123456" } };
    const res = makeRes();

    await verifyOTP(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "OTP has expired" });
  });

  it("should not update user if otp is expired", async () => {
    const expiredUser = {
      ...fakeUser,
      otp_expires_at: new Date(Date.now() - 1000),
    };
    mockFindOne.mockResolvedValue(expiredUser);

    const req = { body: { email: "test@example.com", otp: "123456" } };
    const res = makeRes();

    await verifyOTP(req, res);

    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("should return 500 if something goes wrong with the database", async () => {
    mockFindOne.mockRejectedValue(new Error("database error"));

    const req = { body: { email: "test@example.com", otp: "123456" } };
    const res = makeRes();

    await verifyOTP(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "database error" });
  });

  it("should return 500 if update fails", async () => {
    mockFindOne.mockResolvedValue(fakeUser);
    mockUpdate.mockRejectedValue(new Error("update failed"));

    const req = { body: { email: "test@example.com", otp: "123456" } };
    const res = makeRes();

    await verifyOTP(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "update failed" });
  });
});
