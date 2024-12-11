//controllers/userController.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const User = require("../../models").User;
const { Op } = require("sequelize");
const escapeWildcards = (input) => input.replace(/[%_]/g, "\\$&"); //To prevent SQL-injections


const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, birthday, password } = req.body;

  if (!username || !email || !birthday || !password) {
    res.status(400);
    throw new Error("Please add all fields");
  }
  const userExists = await User.findOne({
    where: { email }
  });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    username,
    email,
    birthday,
    password: hashedPassword,
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.username,
      email: user.email,
      birthday: user.birthday,
      token: generateToken(user.id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please add all fields");
  }
  const user = await User.findOne({where: { email }});

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user.id,
      name: user.username,
      email: user.email,
      birthday: user.birthday,
      token: generateToken(user.id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid credentials");
  }
});


const getLoggedInUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    id: req.user.id,
    username: req.user.username,
    email: req.user.email,
    birthday: req.user.birthday,
  });
});

const updateUser = async (req, res) => {
  try {
    const { id } = req.params; 
    const { username, email, birthday, password } = req.body; 

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    
    const updatedUser = await user.update({
      username,
      email,
      birthday,
      password: hashedPassword,
    });

    return res.status(200).json({ message: "User updated successfully", updatedUser });
  } catch (error) {
    console.error("Error in updateUser:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};


const searchUsers = asyncHandler(async (req, res) => {
  try {
    const { query, id, page = 1, limit = 10 } = req.query;

    const loggedInUserId = req.user.id; 

    if (!query || typeof query !== "string" || query.length > 100) {
      return res.status(400).json({ error: "Invalid query parameter." });
    }

    const safeQuery = escapeWildcards(query);

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    if (isNaN(pageNum) || pageNum <= 0 || isNaN(limitNum) || limitNum <= 0 || limitNum > 100) {
      return res.status(400).json({ error: "Invalid pagination parameters." });
    }

    const offset = (pageNum - 1) * limitNum;

    const where = {
      username: { [Op.like]: `${safeQuery}%` }, 
      id: { [Op.ne]: loggedInUserId }, 
    };


    const users = await User.findAndCountAll({
      where,
      attributes: ["id", "username"], // Limit exposed fields
      limit: limitNum,
      offset,
    });

    if (users.rows.length === 0) {
      return res.status(404).json({
        message: "No users found matching the given criteria.",
        criteria: { query, id },
      });
    }

    res.status(200).json({
      metadata: {
        query,
        caseSensitive: false,
        totalResults: users.count,
        totalPages: Math.ceil(users.count / limit),
        currentPage: parseInt(page),
      },
      data: users.rows,
    });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong", details: err.message });
  }
});


module.exports = {
  registerUser,
  loginUser,
  getLoggedInUser,
  updateUser,
  searchUsers
};



