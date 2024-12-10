const { Inventory, Product, Store } = require("../models");

class InventoryController {
  // Add a new inventory record
  async addInventory(req, res) {
    try {
      const { product, quantity, storageCost, alerts } = req.body;

      // Check if the product exists
      const productExists = await Product.findById(product);
      if (!productExists) {
        return res.status(404).json({
          success: false,
          message: "Product not found.",
        });
      }

      const newInventory = new Inventory({
        product,
        quantity,
        storageCost,
        alerts,
      });

      const inventory = await newInventory.save();

      res.status(201).json({
        success: true,
        message: "Inventory record created successfully.",
        inventory,
      });
    } catch (error) {
      console.error("Error adding inventory:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error.",
      });
    }
  }

  // Get a single inventory record by ID
  async getInventory(req, res) {
    try {
      const { id } = req.params;

      const inventory = await Inventory.findById(id).populate(
        "product",
        "name price category"
      );
      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: "Inventory record not found.",
        });
      }

      res.status(200).json({
        success: true,
        inventory,
      });
    } catch (error) {
      console.error("Error fetching inventory record:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error.",
      });
    }
  }

  // Get all inventory records
  async getAllInventoryByStore(req, res) {
    try {
      const { storeId } = req.params; // Extract storeId from params

      // Check if the store exists
      const storeExists = await Store.findById(storeId);
      if (!storeExists) {
        return res.status(404).json({
          success: false,
          message: "Store not found.",
        });
      }

      // Find inventory records where the product belongs to the given storeId
      const inventoryRecords = await Inventory.find().populate({
        path: "product", // Populate the 'product' field
        select: "name", // Select product id and name
        match: { store: storeId }, // Filter products by storeId
        populate: {
          path: "category", // Populate the 'category' field inside 'product'
          select: "name description", // Select category details like name and description
        },
      });

      res.status(200).json({
        success: true,
        inventoryRecords,
      });
    } catch (error) {
      console.error("Error fetching inventory records:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error.",
      });
    }
  }

  // Update an inventory record
  async updateInventory(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const inventory = await Inventory.findById(id);
      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: "Inventory record not found.",
        });
      }

      Object.assign(inventory, updates);
      inventory.lastMovement = new Date(); // Update the last movement timestamp
      await inventory.save();

      res.status(200).json({
        success: true,
        message: "Inventory record updated successfully.",
        inventory,
      });
    } catch (error) {
      console.error("Error updating inventory record:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error.",
      });
    }
  }

  // Delete an inventory record
  async deleteInventory(req, res) {
    try {
      const { id } = req.params;

      const inventory = await Inventory.findById(id);
      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: "Inventory record not found.",
        });
      }

      await inventory.remove();

      res.status(200).json({
        success: true,
        message: "Inventory record deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting inventory record:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error.",
      });
    }
  }

  // Monitor inventory alerts
  async monitorInventory(req, res) {
    try {
      const lowStockThreshold = req.query.lowStockThreshold || 5; // Default threshold
      const highTimeWithoutMovement = req.query.highTimeWithoutMovement || 30; // Default days

      const today = new Date();
      const thresholdDate = new Date(
        today.setDate(today.getDate() - highTimeWithoutMovement)
      );

      const inventoryAlerts = await Inventory.find({
        $or: [
          { "alerts.lowStock": true, quantity: { $lt: lowStockThreshold } },
          {
            "alerts.highTimeWithoutMovement": true,
            lastMovement: { $lt: thresholdDate },
          },
        ],
      }).populate("product", "name price category");

      res.status(200).json({
        success: true,
        inventoryAlerts,
      });
    } catch (error) {
      console.error("Error monitoring inventory alerts:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error.",
      });
    }
  }
}

module.exports = new InventoryController();
