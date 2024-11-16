//controllers/userController.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const User = require("../../models").User;

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
      token: generateToken(user._id),
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
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid credentials");
  }
});


const getLoggedInUser = asyncHandler(async (req, res) => {
  const { _id, username, email, birthday } = await User.findById(req.user.id);
  res.status(200).json({
    id: _id,
    username,
    email,
    birthday,
  });
});




module.exports = {
  registerUser,
  loginUser,
  getLoggedInUser,
};




