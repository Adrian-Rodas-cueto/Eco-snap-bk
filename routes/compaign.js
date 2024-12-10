const express = require("express");
const router = express.Router();
const CampaignController = require("../controllers/compaign");
const authenticate = require("../middlewares/authenticate"); // Middleware for user authentication

// Create a campaign
router.post("/add", authenticate, CampaignController.createCampaign);

// Get a single campaign by ID
router.get("/get/:id", authenticate, CampaignController.getCampaign);

// Get all campaigns
router.get(
  "/get/all/:storeId",
  authenticate,
  CampaignController.getAllCampaigns
);

// Update a campaign
router.put("/edit/:id", authenticate, CampaignController.updateCampaign);

// Delete a campaign
router.delete("/delete/:id", authenticate, CampaignController.deleteCampaign);

// update Status
router.patch(
  "/update-status/:id",
  authenticate,
  CampaignController.changeStatus
);

module.exports = router;
