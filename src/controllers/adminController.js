const asyncHandler = require("express-async-handler");
const { User, Game } = require('../../models');
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
      const users = await User.findAll({
        attributes: ["id", "username", "avatar_url", "status"],
        include: [
          {
            model: Game,
            as: "Games",
            attributes: ["appid", "name", "playtime_forever", "last_played"],
          },
        ],
      });
  
      const usersJson = users.map(user => {
        return {
          id: user.id,
          username: user.username,
          avatar_url: user.avatar_url,
          status: user.status,
          games: user.Games.map(game => ({
            appid: game.appid,
            name: game.name,
            playtime_forever: game.playtime_forever,
            last_played: game.last_played,
          })),
        };
      });
  
      res.status(200).json(usersJson);
    } catch (error) {
      console.error("Unable to get users with games:", error);
      res.status(500).send("Unable to get users");
    }
  });

module.exports = {
    getUsersJSON,
    getUsers
};