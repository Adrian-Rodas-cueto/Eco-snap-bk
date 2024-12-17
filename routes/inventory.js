const express = require("express");
const InventoryController = require("../controllers/inventory");

const router = express.Router();

router.post("/add", InventoryController.addInventory);
router.get("/get/:id", InventoryController.getInventory);
router.get("/get/all/:storeId", InventoryController.getAllInventoryByStore);
router.put("/edit/:id", InventoryController.updateInventory);
router.delete("/delete/:id", InventoryController.deleteInventory);
router.get("/alerts/monitor", InventoryController.monitorInventory); // Route for monitoring alerts
router.get("/get", InventoryController.getInventoryStatistics);

module.exports = router;
