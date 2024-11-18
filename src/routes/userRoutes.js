const express = require("express");
const { updateUser } = require('../controllers/userController');
const router = express.Router();

router.put("/:id", updateUser);

module.exports =  router;

