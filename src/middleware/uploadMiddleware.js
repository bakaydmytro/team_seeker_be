const AWS = require("aws-sdk");
const sharp = require("sharp");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "eu-central-1",
});

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

    const buffer = await sharp(req.file.buffer)
      .resize(300, 300) 
      .toFormat("jpeg")
      .toBuffer();

      const filename = `${uuidv4()}.jpg`;

      const uploadResult = await s3
      .upload({
        Bucket: "teamseeker-avatars",
        Key: `avatars/${filename}`,
        Body: buffer,
        ContentType: "image/jpeg",
      })
      .promise();

    req.avatarUrl = uploadResult.Location;

    next(); 
  } catch (error) {
    console.error("Error processing avatar:", error);
    res.status(500).json({ error: "Error processing avatar" });
  }
};

module.exports = { upload, processAvatar };