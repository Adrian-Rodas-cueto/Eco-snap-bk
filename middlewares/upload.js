const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadDir;

    // Check the file type and determine the destination directory
    const fileType = file.mimetype;

    if (fileType.startsWith("image/")) {
      uploadDir = path.join(__dirname, "../Public/pictures");
    } else if (fileType === "text/csv") {
      uploadDir = path.join(__dirname, "../Public/files");
    } else {
      return cb(new Error("Unsupported file type"), false);
    }

    // Ensure the directory exists
    fs.mkdirSync(uploadDir, { recursive: true });

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Rename the file to include the current timestamp for uniqueness
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);

    cb(null, `${baseName}-${timestamp}${ext}`);
  },
});

// Filter to allow only specific file types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "text/csv"];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images and CSV files are allowed"), false);
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
  },
});

module.exports = upload;
