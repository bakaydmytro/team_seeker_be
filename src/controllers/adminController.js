const asyncHandler = require("express-async-handler");
const { User } = require('../../models');
const fs = require("fs");
const path = require("path");

 const getUsersJSON = asyncHandler(async (req, res) => {
    try {
        const users = await User.findAll();
        const usersJson = users.map((user) => user.toJSON());
        const filePath = path.join(__dirname, "../../users.json");
    
        fs.writeFileSync(filePath, JSON.stringify(usersJson, null, 2), "utf-8");
    
        res.download(filePath, "users.json", (err) => {
          if (err) {
            console.error("Error during file download:", err);
            res.status(500).send("Unable to download file");
          }
        });
      } catch (error) {
        console.error(error);
        res.status(500).send("Unable to get users");
    }
  });

  const getUsers = asyncHandler(async (req, res) => {
    try {
        const users = await User.findAll();
        const usersJson = users.map((user) => user.toJSON());
        res.json(usersJson);
      } catch (error) {
        console.error(error);
        res.status(500).send("Unable to get users");
      }
  });

module.exports = {
    getUsersJSON,
    getUsers
};