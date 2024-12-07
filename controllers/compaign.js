const { Campaign, Store } = require("../models");

class CampaignController {
  // Create a new campaign
  async createCampaign(req, res) {
    try {
      const {
        store,
        title,
        budget,
        duration,
        status,
        products,
        targetAudience,
        targetLocation,
      } = req.body;

      // Verify that the store exists
      const storeExists = await Store.findById(store);
      if (!storeExists) {
        return res.status(404).json({
          success: false,
          message: "Store not found.",
        });
      }

      // Create a new campaign
      const campaign = new Campaign({
        store,
        title,
        budget,
        duration,
        status: status || "drafts", // Default status to "drafts" if not provided
        products,
        targetAudience,
        targetLocation, // Accept the targetLocation without validation
      });

      await campaign.save();

      res.status(201).json({
        success: true,
        message: "Campaign created successfully.",
        campaign,
      });
    } catch (error) {
      console.error("Error creating campaign:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  }

  // Get a single campaign by ID
  async getCampaign(req, res) {
    try {
      const { id } = req.params;

      const campaign = await Campaign.findById(id).populate("products", "name");
      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: "Campaign not found.",
        });
      }

      res.status(200).json({
        success: true,
        campaign,
      });
    } catch (error) {
      console.error("Error fetching campaign:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  }

  // Get all campaigns
  async getAllCampaigns(req, res) {
    try {
      const campaigns = await Campaign.find().populate("products", "name");

      res.status(200).json({
        success: true,
        campaigns,
      });
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  }

  // Update a campaign
  async updateCampaign(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const campaign = await Campaign.findById(id);
      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: "Campaign not found.",
        });
      }

      // Update fields
      Object.assign(campaign, updates);
      await campaign.save();

      res.status(200).json({
        success: true,
        message: "Campaign updated successfully.",
        campaign,
      });
    } catch (error) {
      console.error("Error updating campaign:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  }

  // Delete a campaign
  async deleteCampaign(req, res) {
    try {
      const { id } = req.params;

      const campaign = await Campaign.findById(id);
      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: "Campaign not found.",
        });
      }

      await campaign.deleteOne();

      res.status(200).json({
        success: true,
        message: "Campaign deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting campaign:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  }

  // Change campaign status
  async changeStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ["active", "completed", "paused", "drafts"];

      // Validate the new status
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Allowed statuses are: ${validStatuses.join(
            ", "
          )}.`,
        });
      }

      const campaign = await Campaign.findById(id);
      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: "Campaign not found.",
        });
      }

      // Update the status
      campaign.status = status;
      await campaign.save();

      res.status(200).json({
        success: true,
        message: "Campaign status updated successfully.",
        campaign,
      });
    } catch (error) {
      console.error("Error updating campaign status:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  }
}

module.exports = new CampaignController();
