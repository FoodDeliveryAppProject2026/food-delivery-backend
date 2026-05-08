// tests for forgotPassword

jest.mock("jsonwebtoken", () => ({ sign: jest.fn(() => "mock.jwt.token") }));
jest.mock("dotenv", () => ({ config: jest.fn() }));

const mockUpdate = jest.fn();
const mockFindOne = jest.fn();

jest.mock("../models/user.model", () => ({
  findOne: mockFindOne,
}));

const mockSendOTP = jest.fn();
jest.mock("../services/email.service", () => ({
  sendOTP: mockSendOTP,
}));

const { forgotPassword } = require("../controllers/controllers_auth");

const fakeUser = {
  user_id: 1,
  email: "user@example.com",
  update: mockUpdate,
};

const makeRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
});

beforeEach(() => {
  jest.clearAllMocks();
  mockUpdate.mockResolvedValue(true);
  mockSendOTP.mockResolvedValue(true);
});

describe("forgotPassword", () => {

  it("should return 200 if the email exists", async () => {
    mockFindOne.mockResolvedValue(fakeUser);

    const req = { body: { email: "user@example.com" } };
    const res = makeRes();

    await forgotPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "OTP sent to your email" });
  });

  it("should save the otp code to the user in the database", async () => {
    mockFindOne.mockResolvedValue(fakeUser);

    const req = { body: { email: "user@example.com" } };
    const res = makeRes();

    await forgotPassword(req, res);

    expect(mockUpdate).toHaveBeenCalledTimes(1);
    const updateArg = mockUpdate.mock.calls[0][0];
    expect(updateArg.otp_code).toMatch(/^\d{6}$/);
  });

  it("should save an expiry time that is about 10 minutes from now", async () => {
    mockFindOne.mockResolvedValue(fakeUser);

    const req = { body: { email: "user@example.com" } };
    const res = makeRes();

    const timeBefore = Date.now();
    await forgotPassword(req, res);

    const updateArg = mockUpdate.mock.calls[0][0];
    const expiry = new Date(updateArg.otp_expires_at).getTime();
    const tenMins = 10 * 60 * 1000;

    expect(expiry).toBeGreaterThanOrEqual(timeBefore + tenMins - 1000);
    expect(expiry).toBeLessThanOrEqual(timeBefore + tenMins + 1000);
  });

  it("should send an email with the otp to the user", async () => {
    mockFindOne.mockResolvedValue(fakeUser);

    const req = { body: { email: "user@example.com" } };
    const res = makeRes();

    await forgotPassword(req, res);

    expect(mockSendOTP).toHaveBeenCalledTimes(1);
    expect(mockSendOTP).toHaveBeenCalledWith("user@example.com", expect.stringMatching(/^\d{6}$/));
  });

  it("the otp in the email should be the same one saved to the database", async () => {
    mockFindOne.mockResolvedValue(fakeUser);

    const req = { body: { email: "user@example.com" } };
    const res = makeRes();

    await forgotPassword(req, res);

    const savedOtp = mockUpdate.mock.calls[0][0].otp_code;
    const emailedOtp = mockSendOTP.mock.calls[0][1];

    expect(savedOtp).toBe(emailedOtp);
  });

  it("should return 404 if the email is not registered", async () => {
    mockFindOne.mockResolvedValue(null); // no user found

    const req = { body: { email: "doesntexist@example.com" } };
    const res = makeRes();

    await forgotPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Email not found" });
  });

  it("should not send an email if user is not found", async () => {
    mockFindOne.mockResolvedValue(null);

    const req = { body: { email: "doesntexist@example.com" } };
    const res = makeRes();

    await forgotPassword(req, res);

    expect(mockSendOTP).not.toHaveBeenCalled();
  });

  it("should not update the database if user is not found", async () => {
    mockFindOne.mockResolvedValue(null);

    const req = { body: { email: "doesntexist@example.com" } };
    const res = makeRes();

    await forgotPassword(req, res);

    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("should return 500 if the database crashes", async () => {
    mockFindOne.mockRejectedValue(new Error("database error"));

    const req = { body: { email: "user@example.com" } };
    const res = makeRes();

    await forgotPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "database error" });
  });

  it("should return 500 if saving the otp fails", async () => {
    mockFindOne.mockResolvedValue(fakeUser);
    mockUpdate.mockRejectedValue(new Error("update failed"));

    const req = { body: { email: "user@example.com" } };
    const res = makeRes();

    await forgotPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "update failed" });
  });

  it("should return 500 if sending the email fails", async () => {
    mockFindOne.mockResolvedValue(fakeUser);
    mockSendOTP.mockRejectedValue(new Error("email failed to send"));

    const req = { body: { email: "user@example.com" } };
    const res = makeRes();

    await forgotPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "email failed to send" });
  });

});
