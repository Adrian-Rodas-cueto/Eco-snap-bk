const express = require("express");
const router = express.Router();
const CampaignController = require("../controllers/compaign");

// Create a campaign
router.post("/add", CampaignController.createCampaign);

// Get a single campaign by ID
router.get("/get/:id", CampaignController.getCampaign);

// Get all campaigns
router.get("/get", CampaignController.getAllCampaigns);

// Update a campaign
router.put("/edit/:id", CampaignController.updateCampaign);

// Delete a campaign
router.delete("/delete/:id", CampaignController.deleteCampaign);

module.exports = router;
