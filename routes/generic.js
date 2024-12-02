const express = require("express");
const GenericController = require("../controllers/generic"); // Adjust the path to your UserController
const upload = require("../middlewares/upload");

const router = express.Router();

router.post("/upload", upload.single("file"), GenericController.uploadFile);

module.exports = router;
