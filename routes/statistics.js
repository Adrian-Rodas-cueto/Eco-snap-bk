const express = require("express");
const StatisticsController = require("../controllers/statistics");
const authenticate = require("../middlewares/authenticate"); // Middleware for user authentication

const router = express.Router();

router.get("/get/home", authenticate, StatisticsController.homeStatistics);

module.exports = router;
