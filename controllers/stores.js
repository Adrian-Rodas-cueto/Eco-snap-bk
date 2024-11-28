const { Store } = require("../models");

class StoreController {
  // Add a new store
  async addStore(req, res) {
    try {
      const {
        name,
        description,
        category,
        address,
        contactInfo,
        shippingPolicy,
        returnPolicy,
      } = req.body;

      const owner = req.user.userId; // Assuming `req.user` contains the authenticated user's details

      console.log("owner: ", req.user);

      if (!name || !category) {
        return res.status(400).json({
          success: false,
          message: "Name and category are required.",
        });
      }

      const newStore = new Store({
        owner,
        name,
        description,
        category,
        address,
        contactInfo,
        shippingPolicy,
        returnPolicy,
      });

      const store = await newStore.save();

      res.status(201).json({
        success: true,
        message: "Store created successfully.",
        store,
      });
    } catch (error) {
      console.error("Error adding store:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get a single store by ID
  async getStore(req, res) {
    try {
      const { id } = req.params;

      const store = await Store.findById(id).populate(
        "owner",
        "firstName lastName email"
      );
      if (!store) {
        return res.status(404).json({
          success: false,
          message: "Store not found.",
        });
      }

      res.status(200).json({ success: true, store });
    } catch (error) {
      console.error("Error fetching store:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get all stores
  async getAllStores(req, res) {
    try {
      const stores = await Store.find().populate(
        "owner",
        "firstName lastName email"
      );

      res.status(200).json({
        success: true,
        stores,
      });
    } catch (error) {
      console.error("Error fetching stores:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Update a store
  async updateStore(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const store = await Store.findById(id);
      if (!store) {
        return res.status(404).json({
          success: false,
          message: "Store not found.",
        });
      }

      // Check if the user is the owner of the store
      if (store.owner.toString() !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to update this store.",
        });
      }

      Object.assign(store, updates);
      await store.save();

      res.status(200).json({
        success: true,
        message: "Store updated successfully.",
        store,
      });
    } catch (error) {
      console.error("Error updating store:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Delete a store
  async deleteStore(req, res) {
    try {
      const { id } = req.params;

      const store = await Store.findById(id);
      if (!store) {
        return res.status(404).json({
          success: false,
          message: "Store not found.",
        });
      }

      // Check if the user is the owner of the store
      if (store.owner.toString() !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to delete this store.",
        });
      }

      await store.deleteOne();

      res.status(200).json({
        success: true,
        message: "Store deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting store:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new StoreController();
