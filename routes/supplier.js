const express = require("express");
const router = express.Router();
const SupplierController = require("../controllers/supplier");
const upload = require("../middlewares/upload");

// CRUD routes
router.post("/add", SupplierController.addSupplier);
router.get("/get/:id", SupplierController.getSupplier);
router.get("/get/all/:storeId", SupplierController.getAllSuppliersByStore);
router.put("/edit/:id", SupplierController.updateSupplier);
router.delete("/delete/:id", SupplierController.deleteSupplier);

// Route to add suppliers from CSV
router.post(
  "/upload/:storeId",
  upload.single("file"),
  SupplierController.addSuppliersFromCSV
);

module.exports = router;
