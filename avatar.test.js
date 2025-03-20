//UPDATE AVATAR UNIT TEST
//For succesfull test, please, follow to instruction:
//1. Bring any .jpg image and rename it to "test-avatar.jpg"
//2. Put it to your/project/path/team_seeker_be
//3. write in console "npm test"
//4. After test, you will get succesfull results and cropped image of test avatar in your/project/path/team_seeker_be/uploads/avatars

require("dotenv").config();
const jwt = require("jsonwebtoken");
const { updateAvatar } = require("./src/controllers/userController");
const { User } = require("./models");
const request = require("supertest");
const express = require("express");
const app = express();
app.use("/api/users", require("./src/routes/userRoutes"));
const fs = require("fs");
const path = require("path");

const testImagePath = path.join(__dirname, "test-avatar.jpg"); 
const testImageBuffer = fs.readFileSync(testImagePath);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

beforeEach(() => {
    jest.clearAllMocks();
  });


jest.mock("./models", () => ({
    User: {
      findByPk: jest.fn(),
    },
  }));

describe("User Controller - updateAvatar", () => {
  it("Succesfull avatar update on controller level", async () => {
    const req = {
      user: { id: 1 },
      file: { path: "/uploads/avatar.jpg" },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    const user = { id: 1, avatar_url: "", save: jest.fn() };
    User.findByPk.mockResolvedValue(user);

    await updateAvatar(req, res);

    expect(user.avatar_url).toBe("http://localhost:5000/uploads/avatar.jpg");
    expect(user.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Avatar updated successfully",
      avatar_url: "http://localhost:5000/uploads/avatar.jpg",
    });
  });

  it("Returning 404, if user is not found", async () => {
    const req = { user: { id: 1 }, file: { path: "/uploads/avatar.jpg" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    User.findByPk.mockResolvedValue(null);

    await expect(updateAvatar(req, res)).rejects.toThrow("User not found");
  });

  it("Returning 400, if avatar is not uploaded", async () => {
    const req = { user: { id: 1 }, file: null };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    const mockUser = { id: 1, avatar_url: "", save: jest.fn() };
    User.findByPk.mockResolvedValue(mockUser);

    await expect(updateAvatar(req, res)).rejects.toThrow("No file uploaded");
  });
});

describe("User Routes - /avatar", () => {
    let token;
    const user = { id: 1, username: "Alice", avatar_url: "/uploads/avatars/avatar1.jpg" };
  
    beforeEach(() => {
      token = generateToken(user);
    });

    it("Successful avatar update on router level", async () => {
      User.findByPk.mockResolvedValue({
        ...user,
        save: jest.fn().mockResolvedValue(),
      });

      const res = await request(app)
        .put("/api/users/avatar")
        .set("Authorization", `Bearer ${token}`)
        .attach("avatar_url", testImageBuffer, "avatar.jpg");
  
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Avatar updated successfully");
    });
  
    it("Returning 401, if user is not authorized", async () => {
      const res = await request(app)
        .put("/api/users/avatar")
        .attach("avatar_url", testImageBuffer, "avatar.jpg");
  
      expect(res.status).toBe(401);
    });

    it("Returning 500, if server has some internal problems", async () => {
      User.findByPk.mockResolvedValue({
        ...user,
        save: jest.fn().mockResolvedValue(),
      });

      const res = await request(app)
        .put("/api/users/avatar")
        .set("Authorization", `Bearer ${token}`)
        .attach("avatar_url", Buffer.from("fake image content"), "avatar.jpg");
  
      expect(res.status).toBe(500);
    });
  });