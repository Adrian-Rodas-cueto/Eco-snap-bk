const { Campaign } = require("../models");

class StatisticsController {
  async homeStatistics(req, res) {
    try {
      // Count the number of active campaigns
      const activeCampaignCount = await Campaign.countDocuments({
        status: "active",
      });

      // Respond with the count
      res.status(200).json({
        success: true,
        message: "Active campaign count fetched successfully.",
        activeCampaignCount,
      });
    } catch (error) {
      console.error("Error counting active campaigns:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error.",
      });
    }
  }
}

module.exports = new StatisticsController();
