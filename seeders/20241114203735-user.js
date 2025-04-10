"use strict";
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
     const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("qwertyuiop", salt);
    return queryInterface.bulkInsert("users", [
      {
        username: "Admin",
        email: "admin01@example.com",
        password: hashedPassword, 
        role_id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("users", null, {});
  },
};
