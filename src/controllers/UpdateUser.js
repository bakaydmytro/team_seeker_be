// controllerUser.js

const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const { User } = require('../config/db'); 
const { logger } = require('../config/db'); 

async function updateUser(req, res) {
    const { user_id } = req.params;  // Get user_id from the URL params
    const { username, email, password } = req.body;  // Get user data from the request body
  
    try {
      // Find the user by ID
      const user = await User.findByPk(user_id);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });  // Handle user not found
      }
  
      // Hash the password if it's provided
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);  // Hash password
        user.password = hashedPassword;  // Update password
      }
  
      // Update other fields
      user.username = username || user.username;  // Update username if provided
      user.email = email || user.email;  // Update email if provided
  
      // Save the updated user data to the database
      await user.save();

      logger.info(`User with ID ${user_id} was successfully updated.`);
      
      res.status(200).json(user);  // Send updated user data in response
    } catch (error) {
      res.status(500).json({ message: 'Error updating user', error });  // Handle server error
    }

  };

module.exports = { updateUser };
