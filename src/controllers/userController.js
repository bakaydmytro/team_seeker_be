const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const axios = require('axios');
const { Game, User } = require('../../models');
const SteamAuth = require('node-steam-openid');
const { Op } = require("sequelize");
const escapeWildcards = (input) => input.replace(/[%_]/g, "\\$&"); 

const steam = new SteamAuth({
  realm: 'http://localhost:5000', 
  returnUrl: 'http://localhost:5000/api/users/steam/authenticate', 
  apiKey: process.env.STEAM_API_KEY,
});

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
    req.session.userId = user.id;
    res.status(201).json({
      id: user.id,
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

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user && (await bcrypt.compare(password, user.password))) {
    req.session.userId = user.id;
    res.json({
      id: user.id,
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
  
  if (!req.user) {
    res.status(401);
    throw new Error("Not authenticated");
  }

  res.status(200).json(req.user);
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

const steamLogin = asyncHandler(async (req, res) => {
  try {
    const redirectUrl = await steam.getRedirectUrl();

    res.redirect(redirectUrl);
  } catch (error) {
    console.error("Error initiating Steam login:", error);
    res.status(500).json({ 
      message: "Unable to initiate Steam login. Please try again later." 
    });
  }
});



const steamRedirect = asyncHandler(async (req, res) => {
  try {
    const steamUser = await steam.authenticate(req);
    const steamId = steamUser._json.steamid;
    const personaname = steamUser._json.personaname;
    const profileUrl = steamUser._json.profileurl;
    const avatarUrl = steamUser._json.avatarfull; 
    const gameNowPlaying = steamUser._json.gameextrainfo || "No game currently playing"; 

    console.log(steamUser._json);  

    if (!personaname) {
      throw new Error("Missing personaname in Steam user data");
    }

    if (!steamId) {
      throw new Error("Missing steamid in Steam user data");
    }

    
    let user = await User.findOne({ where: { steamid: steamId } });

    if (!user) {
      user = await User.create({
        username: personaname,
        steamid: steamId,
        password: steamId,
        profile_url: profileUrl,
        avatar_url: avatarUrl,
        game_now_playing: gameNowPlaying, 
      });
    } else {
      user = await user.update({
        avatar_url: avatarUrl,
        game_now_playing: gameNowPlaying,
      });
    }

    const token = generateToken(user.id);
    req.session.username = user.username;

     const redirectUrl = `http://localhost:3000/dashboard?token=${token}`;
     res.redirect(redirectUrl);

  } catch (error) {
    console.error("Error during Steam authentication:", error);

    res.status(500).json({
      message: "Steam authentication failed. Please try again later.",
    });
  }
});

const allowedGames = [730, 570, 440]; // CS2, Dota 2, Team Fortress 2

const getRecentlyPlayedGames = asyncHandler(async (req, res) => {
  try {
    const { steamid } = req.user;
    const apiKey = process.env.STEAM_API_KEY;

    if (!steamid) {
      return res.status(400).json({ message: "SteamID not found for the user" });
    }

    
    const url = `http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${apiKey}&steamid=${steamid}&format=json`;
    const response = await axios.get(url);
    const { games, total_count } = response.data.response;

    if (!games || total_count === 0) {
      return res.status(404).json({ message: "No recently played games found" });
    }

    const user = await User.findOne({ where: { steamid } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

      const filteredGames = games.filter((game) =>
        allowedGames.includes(game.appid)
      );

      if (filteredGames.length > 0) {
        
        const gameRecords = filteredGames.map((game) => ({
          appid: game.appid,
          name: game.name,
          playtime_2weeks: game.playtime_2weeks || null,
          playtime_forever: game.playtime_forever,
          img_icon_url: game.img_icon_url,
          img_logo_url: game.img_logo_url,
          user_id: req.user.id,
        }));

        await Game.bulkCreate(gameRecords, { ignoreDuplicates: true });

        
        return res
          .status(200)
          .json({ message: "Recently played games saved successfully", games: filteredGames });
      }
    


    const allTimeGames = await Game.findAll({
      where: { user_id: req.user.id },
    });

    if (allTimeGames.length === 0) {
      return res.status(404).json({ message: "No games found for this user" });
    }

    const gamesWithoutrecentgames= allTimeGames.map((game) => ({
      appid: game.appid,
      name: game.name,
      playtime_forever: game.playtime_forever,
      img_icon_url: game.img_icon_url,
      img_logo_url: game.img_logo_url,
      user_id: game.user_id,
    }));

    return res.status(200).json({
      message: "No recently played games found. Returning all-time games.",
      games: gamesWithoutrecentgames,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch games", error });
  }
});



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
  steamLogin,
  steamRedirect,
  getRecentlyPlayedGames,
  searchUsers,
};



