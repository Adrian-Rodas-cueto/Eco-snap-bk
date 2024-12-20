const { Campaign } = require("../models");

class StatisticsController {
  async homeStatistics(req, res) {
    try {
      const { timeframe } = req.query; // Get the timeframe from query params
      const now = new Date();
      let startDate;

      // Determine the start date based on the timeframe
      if (timeframe === "weekly") {
        startDate = new Date();
        startDate.setDate(now.getDate() - 7); // Start date: 7 days ago
      } else if (timeframe === "monthly") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Start of the current month
      } else if (timeframe === "yearly") {
        startDate = new Date(now.getFullYear(), 0, 1); // Start of the current year
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid timeframe. Use 'weekly', 'monthly', or 'yearly'.",
        });
      }

      // Query to count active campaigns based on the timeframe
      const activeCampaignCount = await Campaign.countDocuments({
        status: "active",
        createdAt: { $gte: startDate, $lte: now }, // Filter campaigns within the timeframe
      });

      // Respond with the active campaign count
      res.status(200).json({
        success: true,
        message: `Active campaign count for ${timeframe} timeframe fetched successfully.`,
        count: activeCampaignCount,
      });
    } catch (error) {
      console.error("Error fetching active campaign count:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error.",
      });
    }
  }
}

module.exports = new StatisticsController();
