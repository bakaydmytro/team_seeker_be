const express = require("express");
const app = express();
// const port = process.env.API_PORT || 5001;
const port = process.env.API_PORT || 5000;
const { errorHandler } = require("./src/middleware/errorMiddleware");
const { sequelize, User, Chat, Message } = require("./models");
const cors = require("cors");
const session = require("express-session");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./src/swagger");
const swaggerDocs = require("./src/swagger");
const { Server } = require("socket.io");
const http = require("http");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const path = require("path");


const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.use(
  session({
    secret: process.env.SECRET_KEY || "secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/users", require("./src/routes/userRoutes"));
app.use("/api/chats", require("./src/routes/chatRoutes"));
app.use("/api/friends", require("./src/routes/friendRoutes"));
app.use("/api/admins", require("./src/routes/adminRoutes"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(errorHandler);
swaggerDocs(app);

app.get("/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({ status: "error", error: "Database connection failed" });
  }
});

io.use((socket, next) => {
  const token = socket.handshake.query.token;

  if (!token) {
    return next(new Error("Authentication error: Token is missing"));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error("Authentication error: Invalid token"));
    }

    socket.user = decoded;
    next();
  });
});

io.on("connection", async (socket) => {

  const userId = socket.user.id;

   if (!userId) {
      console.log("User ID is missing in connection query.");
      return;
    }

  console.log(`User ${userId} connected`);

  await User.update({ status: "online" }, { where: { id: userId } });

  io.emit("userStatusChanged", { userId, status: "online" });

  socket.on("joinChat", async ({ chat_id }) => {
    const chat = await Chat.findByPk(chat_id, {
      include: {
        model: User,
        where: { id: userId },
        through: { attributes: [] },
      },
    });

    if (!chat) {
      socket.emit("chatError", "Chat not found or access denied.");
      return;
    }

    socket.join(`chat_${chat_id}`);
    socket.to(`chat_${chat_id}`).emit("userJoined", { userId });
  });

  socket.on("sendMessage", async ({ chat_id, content }) => {

    if (!chat_id || !content) {
      socket.emit("messageError", "Chat ID and content are required.");
      return;
    }

    const currentTime = Date.now();
    const oneMinuteAgo = currentTime - 60000;

    const recentMessages = await Message.count({
      where: {
        sender_id: userId,
        chat_id,
        createdAt: { [Op.gte]: new Date(oneMinuteAgo) },
      },
    });

    if (recentMessages >= 20) {
      socket.emit(
        "messageError",
        "You are sending messages too quickly. Please slow down."
      );
      return;
    }

    const repeatedWordPattern = /\b(\w+)\b(?:.*\b\1\b){6,}/;
    const maxMessageLength = 500;

    if (
      repeatedWordPattern.test(content) ||
      content.length > maxMessageLength
    ) {
      socket.emit(
        "messageError",
        "Your message looks like spam or is too long."
      );
      return;
    }

    const chat = await Chat.findByPk(chat_id, {
      include: {
        model: User,
        where: { id: userId },
        through: { attributes: [] },
      },
    });

    if (!chat) {
      socket.emit("chatError", "Chat not found or access denied.");
      return;
    }

    const message = await Message.create({
      chat_id,
      sender_id: userId,
      content,
    });

    io.to(`chat_${chat_id}`).emit("newMessage", {
      id: message.id,
      sender_id: message.sender_id,
      content: message.content,
      createdAt: message.createdAt,
      chat_id: Number(message.chat_id)
    });
  });

  socket.on("messageDelivered", async ({ message_id }) => {
    try {
        if (!message_id || isNaN(message_id)) {
            console.log("[Error] messageId Not a Number:", message_id);
            return;
        }

        const message = await Message.findByPk(message_id, {
            include: [
                {
                    model: Chat,
                    include: {
                        model: User,
                        where: { id: userId },
                        through: { attributes: [] },
                    },
                },
            ],
        });

        if (!message) {
            socket.emit("messageError", "Message not found or access denied.");
            return;
        }

        await message.update({ status: "delivered" });

        socket.to(`chat_${message.chat_id}`).emit("messageStatusUpdated", {
            message_id,
            status: "delivered",
        });

    } catch (error) {
        console.error("[Error] messageDelivered:", error);
        socket.emit("serverError", "An error occurred while updating message status.");
    }
});


  socket.on('leaveChat', async ({ chat_id }) => {
    const chat = await Chat.findByPk(chat_id, {
      include: {
        model: User,
        where: { id: userId },
        through: { attributes: [] },
      },
    });

    if (!chat) {
      socket.emit("chatError", "Chat not found or access denied.");
      return;
    }
    socket.leave(`chat_${chat_id}`);
    socket.to(`chat_${chat_id}`).emit("userLeft", { userId });
  });

  socket.on("disconnect", async () => {
    console.log(`User ${userId} disconnected`);

    await User.update({ status: "offline" }, { where: { id: userId } });

    io.emit("userStatusChanged", { userId, status: "offline" });
  });
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected successfully.");
    server.listen(port, () => {
      console.log(`Server started on port ${port}`);
      console.log(
        `Swagger UI is available at ${process.env.BACK_URL}/api-docs`
      );
    });
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });
