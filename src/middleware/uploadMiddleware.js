const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const avatarDir = path.join(__dirname, "../../uploads/avatars");
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPG, PNG are allowed."), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, 
  fileFilter,
});

const processAvatar = async (req, res, next) => {
  if (!req.file) return next(); 

  try {
    const uniqueFilename = `${Date.now()}-${Math.floor(Math.random() * 100000)}.jpg`;
    const filePath = path.join(avatarDir, uniqueFilename);

    await sharp(req.file.buffer)
      .resize(300, 300) 
      .toFormat("jpeg")
      .toFile(filePath);

    req.file.path = `/uploads/avatars/${uniqueFilename}`;

    next(); 
  } catch (error) {
    console.error("Error processing avatar:", error);
    res.status(500).json({ error: "Error processing avatar" });
  }
};

module.exports = { upload, processAvatar };