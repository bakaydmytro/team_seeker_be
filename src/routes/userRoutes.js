const express = require('express');
const { updateUser } = require('../controllers/UpdateUser');
const router = express.Router();

router.put('/api/user/:user_id', updateUser);

module.exports = { router };

