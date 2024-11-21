const express = require("express");
const InventoryController = require("../controllers/inventory");

const router = express.Router();

router.post("/add", InventoryController.addInventory);
router.get("/get/:id", InventoryController.getInventory);
router.get("/get", InventoryController.getAllInventory);
router.put("/edit/:id", InventoryController.updateInventory);
router.delete("/delete/:id", InventoryController.deleteInventory);
router.get("/alerts/monitor", InventoryController.monitorInventory); // Route for monitoring alerts

module.exports = router;