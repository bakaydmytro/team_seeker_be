const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const axios = require("axios");
const { Game, User, Friendship } = require("../../models");
const SteamAuth = require("node-steam-openid");
const { Op } = require("sequelize");
const escapeWildcards = (input) => input.replace(/[%_]/g, "\\$&");

const steam = new SteamAuth({
  realm: `http://localhost:${process.env.PORT || 5000}`,
  returnUrl: `http://localhost:${process.env.PORT || 5000}/api/users/steam/authenticate`,
  apiKey: process.env.STEAM_API_KEY
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, birthday, password } = req.body;
  const avatar_url = req.file ? `http://localhost:5000${req.file.path}` : null;

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
    avatar_url
  });

  if (user) {
    req.session.userId = user.id;
    res.status(201).json({
      id: user.id,
      name: user.username,
      email: user.email,
      birthday: user.birthday,
      avatar_url: user.avatar_url,
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
  const user = await User.findOne({ where: { email } });

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

  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ["password", "id"] },
  });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const games = await Game.findAll({
    where: { user_id: req.user.id },
    attributes: ['appid', 'name', 'playtime_2weeks', 'playtime_forever', 'img_icon_url', 'img_logo_url'],
  });

  const userWithGames = {
    ...user.toJSON(),
    games: games || [],
  };

  res.status(200).json(userWithGames);
});

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, birthday, password } = req.body;

    const userId = req.user.id;
    const user = await User.findByPk(userId);

    if (userId !== parseInt(id)) {
      return res
        .status(403)
        .json({ message: "Forbidden: Not allowed to update other users" });
    }

    if (!userId) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
    } else if (email === user.email) {
      return res
        .status(400)
        .json({ message: "You entered your current email" });
    }

    const updatedFields = {};

    if (username && username.trim()) updatedFields.username = username;
    if (email && email.trim()) updatedFields.email = email;
    if (birthday && birthday.trim()) updatedFields.birthday = birthday;

    if (password) {
      const isSamePassword = await bcrypt.compare(password, user.password);
      if (isSamePassword) {
        return res.status(400).json({
          message: "New password cannot be the same as the old password",
        });
      }
      const salt = await bcrypt.genSalt(10);
      updatedFields.password = await bcrypt.hash(password, salt);
    }

    if (Object.keys(updatedFields).length === 0) {
      return res.status(400).json({ message: "No new changes to update" });
    }

    await user.update(updatedFields);

    const { password: _, ...safeUserData } = user.get({ plain: true });

    return res.status(200).json({
      message: "User updated successfully",
      user: safeUserData,
    });
  } catch (error) {
    console.error("Error in updateUser:", error);
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
      message: "Unable to initiate Steam login. Please try again later.",
    });
  }
});

const allowedGames = [730, 570, 440]; // CS2, Dota 2, Team Fortress 2

const steamRedirect = asyncHandler(async (req, res) => {
  try {
    const steamUser = await steam.authenticate(req);
    const steamId = steamUser._json.steamid;
    const personaname = steamUser._json.personaname;
    const profileUrl = steamUser._json.profileurl;
    const avatarUrl = steamUser._json.avatarfull;
    const gameNowPlaying =
    steamUser._json.gameextrainfo || "No game currently playing";

    if (!personaname || !steamId) {
      throw new Error("Missing essential Steam user data");
    }

    let user;
    const steamUserAccount = await User.findOne({ where: { steamid: steamId } });

    if (req.user) {
      user = await User.findByPk(req.user.id);

      if (steamUserAccount) {
        
          await steamUserAccount.update({
            email: user.email,
            password: user.password,
          });

          await user.destroy();
	        user = steamUserAccount;

      } else {

         await user.update({
	       username: personaname,
         steamid: steamId,
         avatar_url: avatarUrl,
         game_now_playing: gameNowPlaying,
	      });
      
    }
    } else {

      user = steamUserAccount;

      if (!user) {
       user = await User.create({
          username: personaname,
          steamid: steamId,
          password: steamId, 
          profile_url: profileUrl,
          avatar_url: avatarUrl,
          game_now_playing: gameNowPlaying,
        });
      }
      
    }

    const apiKey = process.env.STEAM_API_KEY;
    let games = [];

    try {
      const ownedUrl = `http://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamId}&include_appinfo=true&include_free_games=true&format=json`;
      const ownedResponse = await axios.get(ownedUrl);
      games = ownedResponse.data.response.games || [];
    } catch (err) {
      console.warn("Failed to fetch owned games", err);
    }

    const missingAllowedGames = allowedGames.filter(
      appid => !games.some(game => game.appid === appid)
    );

    if (missingAllowedGames.length > 0) {
      try {
        const recentUrl = `http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${apiKey}&steamid=${steamId}&format=json`;
        const recentResponse = await axios.get(recentUrl);
        const recentGames = recentResponse.data.response.games || [];

        const newRecentGames = recentGames.filter(game =>
          missingAllowedGames.includes(game.appid)
        );
        games.push(...newRecentGames);
      } catch (err) {
        console.warn("Failed to fetch recently played games", err);
      }
    }

    const filteredGames = games.filter(game => allowedGames.includes(game.appid));

    for (const game of filteredGames) {
      const lastPlayed = game.rtime_last_played ? new Date(game.rtime_last_played * 1000) : null;
      const existingGame = await Game.findOne({
        where: { user_id: user.id, appid: game.appid },
      });

      if (existingGame) {
        await existingGame.update({
          playtime_forever: Math.floor(game.playtime_forever / 60),
          playtime_2weeks: Math.floor(game.playtime_2weeks / 60) || existingGame.playtime_2weeks,
          last_played: lastPlayed,
          img_icon_url: game.img_icon_url,
          img_logo_url: game.img_logo_url,
        });
      } else {
        await Game.create({
          appid: game.appid,
          name: game.name,
          playtime_forever: Math.floor(game.playtime_forever / 60),
          playtime_2weeks: Math.floor(game.playtime_2weeks / 60) || null,
          last_played: lastPlayed,
          img_icon_url: game.img_icon_url,
          img_logo_url: game.img_logo_url,
          user_id: user.id,
        });
      }
    }

    const token = generateToken(user.id);
    req.session.username = user.username;

    const redirectUrl = `http://localhost:3000/ChooseGamePage?token=${token}`;
    res.redirect(redirectUrl);

  } catch (error) {
    console.error("Error during Steam authentication:", error);
    res.status(500).json({
      message: "Steam authentication failed. Please try again later.",
    });
  }
});

const searchUsers = asyncHandler(async (req, res) => {
  try {
    const { query = "", page = 1, limit = 10, appid } = req.query;
    const loggedInUserId = req.user.id;

    if (typeof query !== "string" || query.length > 100) {
      return res.status(400).json({ error: "Invalid query parameter." });
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || pageNum <= 0 || isNaN(limitNum) || limitNum <= 0 || limitNum > 100) {
      return res.status(400).json({ error: "Invalid pagination parameters." });
    }

    const offset = (pageNum - 1) * limitNum;

    const where = {
      id: { [Op.ne]: loggedInUserId },
      role_id: { [Op.ne]: 1 }
    };

    if (query) {
      where.username = { [Op.like]: `${query}%` };
    }

    const include = [];

    if (appid) {
      include.push({
        model: Game,
        as: "Games", 
        where: { appid },
        attributes: ["appid", "playtime_forever", "playtime_2weeks", "last_played"],
        required: true,
      });
    }

    const users = await User.findAndCountAll({
      where,
      include,
      attributes: ["id", "username", "status", "avatar_url"],
      limit: limitNum,
      offset,
      distinct: true,
    });

    if (users.rows.length === 0) {
      return res.status(404).json({ message: "No users found." });
    }

    const formatted = users.rows.map(user => {
      const gameInfo = user.Games?.[0];
      return {
        id: user.id,
        username: user.username,
        status: user.status,
        avatar_url: user.avatar_url,
        playtime_forever: gameInfo?.playtime_forever || null,
        last_played: gameInfo?.last_played || null,
        playtime_2weeks: gameInfo?.playtime_2weeks || null,
      };
    });

    const totalPages = Math.ceil(users.count / limitNum);
    res.status(200).json({
      metadata: {
        query,
        appid,
        totalResults: users.count,
        totalPages,
        currentPage: pageNum,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1,
      },
      data: formatted,
    });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong", details: err.message });
  }
});


const updateAvatar = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (!req.file) {
    res.status(400);
    throw new Error("No file uploaded");
  }

  user.avatar_url = `http://localhost:5000${req.file.path}`;

  await user.save();

  res.status(200).json({
    message: "Avatar updated successfully",
    avatar_url: user.avatar_url,
  });
});

const getFriends = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const { count, rows: friendships } = await Friendship.findAndCountAll({
      where: { 
        [Op.or]: [
          { requester_id: userId, status: 'accepted' },
          { addressee_id: userId, status: 'accepted' },
        ]
      },
      include: [
        { model: User, as: 'requester', attributes: ['id', 'username', 'avatar_url'] },
        { model: User, as: 'addressee', attributes: ['id', 'username', 'avatar_url'] },
      ],
      limit,
      offset,
    });

    if (!friendships.length) {
      return res.status(200).json({ message: "No friends found", friends: [] });
    }

    const friends = friendships.map(f => 
      f.requester_id === userId ? f.addressee : f.requester
    );

    res.json({
      friends,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Error during getting friends", error });
  }
});

const getRequests = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const { count, rows: incomingRequests } = await Friendship.findAndCountAll({
      where: { addressee_id: req.user.id, status: 'pending' },
      include: [{ model: User, as: 'requester', attributes: ['id', 'username', 'avatar_url'] }],
      limit,
      offset,
    });

    if (!incomingRequests.length) {
      return res.status(200).json({ message: "No incoming friend requests", requests: [] });
    }

    res.status(200).json({
      requests: incomingRequests,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting incoming requests' });
  }
});

module.exports = {
  registerUser,
  loginUser,
  getLoggedInUser,
  updateUser,
  steamLogin,
  steamRedirect,
  searchUsers,
  updateAvatar,
  getFriends,
  getRequests
};
