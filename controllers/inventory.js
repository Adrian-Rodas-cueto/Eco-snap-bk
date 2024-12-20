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

      await inventory.deleteOne();

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

  async getInventoryStatistics(req, res) {
    try {
      console.log("====== START OF STATISTICS API ======");
      const { timeframe } = req.query; // weekly, monthly, yearly
      console.log("Query Parameter - Timeframe:", timeframe);

      if (!timeframe) {
        console.log("ERROR: Missing 'timeframe' query parameter.");
        return res.status(400).json({
          success: false,
          message:
            "Timeframe query parameter is required (weekly, monthly, yearly).",
        });
      }

      const today = new Date();
      let matchStage = {};
      let groupStage = {};
      let timeLabels = [];

      console.log("Current Date:", today);

      // Dynamic query based on timeframe
      if (timeframe === "weekly") {
        // Calculate start of the week (Monday) at 00:00:00 UTC
        const dayOfWeek = today.getUTCDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
        const startOfWeek = new Date(today);
        startOfWeek.setUTCDate(today.getUTCDate() - dayOfWeek + 1); // Move to Monday
        startOfWeek.setUTCHours(0, 0, 0, 0); // Set to midnight

        console.log("Weekly Time Range - Start:", startOfWeek, "End:", today);

        matchStage = {
          createdAt: { $gte: startOfWeek, $lte: today },
        };

        groupStage = {
          _id: { $dateToString: { format: "%w", date: "$createdAt" } }, // Group by day number
          totalQuantity: { $sum: "$quantity" },
          totalStorageCost: { $sum: "$storageCost" },
        };

        timeLabels = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
      } else if (timeframe === "monthly") {
        console.log("Monthly Time Range - From Jan 1st of the Current Year");

        matchStage = {
          createdAt: { $gte: new Date(today.getFullYear(), 0, 1) }, // From Jan 1st of the current year
        };

        groupStage = {
          _id: { $dateToString: { format: "%m", date: "$createdAt" } }, // Group by month number
          totalQuantity: { $sum: "$quantity" },
          totalStorageCost: { $sum: "$storageCost" },
        };

        timeLabels = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];
      } else if (timeframe === "yearly") {
        console.log("Yearly Time Range - Last 6 Years");

        const startYear = today.getFullYear() - 5; // From Jan 1st, 6 years ago
        const years = Array.from(
          { length: 6 },
          (_, index) => startYear + index
        ); // Last 6 years

        matchStage = {
          createdAt: { $gte: new Date(startYear, 0, 1) }, // From Jan 1st, 6 years ago
        };

        groupStage = {
          _id: { $dateToString: { format: "%Y", date: "$createdAt" } }, // Group by year
          totalQuantity: { $sum: "$quantity" },
          totalStorageCost: { $sum: "$storageCost" },
        };

        // Add the years to the timeLabels
        timeLabels = years.map((year) => year.toString());
      } else {
        console.log("ERROR: Invalid timeframe provided:", timeframe);
        return res.status(400).json({
          success: false,
          message: "Invalid timeframe. Use 'weekly', 'monthly', or 'yearly'.",
        });
      }

      console.log("Match Stage:", matchStage);
      console.log("Group Stage:", groupStage);

      // Aggregate pipeline
      const statistics = await Inventory.aggregate([
        { $match: matchStage },
        { $group: groupStage },
        { $sort: { _id: 1 } },
        ...(timeframe === "weekly"
          ? [
              {
                $addFields: {
                  weekName: {
                    $switch: {
                      branches: [
                        { case: { $eq: ["$_id", "0"] }, then: "Sunday" },
                        { case: { $eq: ["$_id", "1"] }, then: "Monday" },
                        { case: { $eq: ["$_id", "2"] }, then: "Tuesday" },
                        { case: { $eq: ["$_id", "3"] }, then: "Wednesday" },
                        { case: { $eq: ["$_id", "4"] }, then: "Thursday" },
                        { case: { $eq: ["$_id", "5"] }, then: "Friday" },
                        { case: { $eq: ["$_id", "6"] }, then: "Saturday" },
                      ],
                      default: "Unknown",
                    },
                  },
                },
              },
            ]
          : timeframe === "monthly"
          ? [
              {
                $addFields: {
                  monthName: {
                    $arrayElemAt: [
                      [
                        "January",
                        "February",
                        "March",
                        "April",
                        "May",
                        "June",
                        "July",
                        "August",
                        "September",
                        "October",
                        "November",
                        "December",
                      ],
                      { $subtract: [{ $toInt: "$_id" }, 1] },
                    ],
                  },
                },
              },
            ]
          : []),
      ]);

      console.log(
        "Raw Aggregated Statistics:",
        JSON.stringify(statistics, null, 2)
      );

      // If it's yearly, fill in missing years
      if (timeframe === "yearly") {
        const statisticsMap = statistics.reduce((acc, stat) => {
          acc[stat._id] = stat;
          return acc;
        }, {});

        // Add missing years with 0 data
        const filledStatistics = timeLabels.map((year) => {
          return (
            statisticsMap[year] || {
              _id: year,
              totalQuantity: 0,
              totalStorageCost: 0,
              yearName: year,
            }
          );
        });

        res.status(200).json({
          success: true,
          timeframe,
          statistics: filledStatistics,
        });
      } else if (timeframe === "monthly") {
        // Fill in missing months with 0 data
        const statisticsMap = statistics.reduce((acc, stat) => {
          acc[stat._id] = stat;
          return acc;
        }, {});

        const filledStatistics = timeLabels.map((month, index) => {
          return (
            statisticsMap[(index + 1).toString()] || {
              _id: (index + 1).toString(),
              totalQuantity: 0,
              totalStorageCost: 0,
              monthName: month,
            }
          );
        });

        res.status(200).json({
          success: true,
          timeframe,
          statistics: filledStatistics,
        });
      } else if (timeframe === "weekly") {
        // Fill in missing weeks with 0 data
        const statisticsMap = statistics.reduce((acc, stat) => {
          acc[stat._id] = stat;
          return acc;
        }, {});

        const filledStatistics = timeLabels.map((day, index) => {
          return (
            statisticsMap[index.toString()] || {
              _id: index.toString(),
              totalQuantity: 0,
              totalStorageCost: 0,
              weekName: day,
            }
          );
        });

        res.status(200).json({
          success: true,
          timeframe,
          statistics: filledStatistics,
        });
      }

      console.log("====== END OF STATISTICS API ======");
    } catch (error) {
      console.error("ERROR OCCURRED:", error.message);
      console.error("STACK TRACE:", error.stack);

      res.status(500).json({
        success: false,
        message: "Internal server error.",
        error: error.message,
      });
    }
  }
}

module.exports = new InventoryController();
