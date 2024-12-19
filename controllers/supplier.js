const { Supplier, Store } = require("../models");
const path = require("path");
const fs = require("fs");
const csvParser = require("csv-parser");

class SupplierController {
  // Add a new supplier
  async addSupplier(req, res) {
    try {
      const { name, rating, products, totalBusiness, store } = req.body;

      // Validate the store ID
      const storeExists = await Store.findById(store);
      if (!storeExists) {
        return res.status(404).json({
          success: false,
          message: "Store not found.",
        });
      }

      // Create a new supplier
      const supplier = new Supplier({
        name,
        rating,
        products,
        totalBusiness,
        store,
      });

      await supplier.save();

      res.status(201).json({
        success: true,
        message: "Supplier added successfully.",
        supplier,
      });
    } catch (error) {
      console.error("Error adding supplier:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  }

  // Get all suppliers
  async getAllSuppliersByStore(req, res) {
    const { storeId } = req.params;

    try {
      // Validate if the store exists
      const store = await Store.findById(storeId);
      if (!store) {
        return res.status(404).json({
          success: false,
          message: "Store not found.",
        });
      }

      // Fetch suppliers associated with the store
      const suppliers = await Supplier.find({ store: storeId }).populate(
        "store",
        "name"
      );

      res.status(200).json({
        success: true,
        suppliers,
      });
    } catch (error) {
      console.error("Error fetching suppliers by storeId:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error.",
      });
    }
  }

  // Get a single supplier by ID
  async getSupplier(req, res) {
    try {
      const { id } = req.params;

      const supplier = await Supplier.findById(id).populate("store", "name");
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: "Supplier not found.",
        });
      }

      res.status(200).json({
        success: true,
        supplier,
      });
    } catch (error) {
      console.error("Error fetching supplier:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  }

  // Update a supplier
  async updateSupplier(req, res) {
    try {
      const { id } = req.params;
      const { store, ...updates } = req.body;

      // Validate the store ID if it is being updated
      if (store) {
        const storeExists = await Store.findById(store);
        if (!storeExists) {
          return res.status(404).json({
            success: false,
            message: "Store not found.",
          });
        }
        updates.store = store;
      }

      const supplier = await Supplier.findByIdAndUpdate(id, updates, {
        new: true,
      }).populate("store", "name");

      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: "Supplier not found.",
        });
      }

      res.status(200).json({
        success: true,
        message: "Supplier updated successfully.",
        supplier,
      });
    } catch (error) {
      console.error("Error updating supplier:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  }

  // Delete a supplier
  async deleteSupplier(req, res) {
    try {
      const { id } = req.params;

      const supplier = await Supplier.findById(id);
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: "Supplier not found.",
        });
      }

      await supplier.deleteOne();

      res.status(200).json({
        success: true,
        message: "Supplier deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting supplier:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  }

  // Add suppliers in bulk from CSV
  async addSuppliersFromCSV(req, res) {
    try {
      // Extract store ID from params
      const { storeId } = req.params;

      if (!storeId) {
        return res.status(400).json({
          success: false,
          message: "Store ID is required as a parameter.",
        });
      }

      // Validate the store ID
      const storeExists = await Store.findById(storeId);
      if (!storeExists) {
        return res.status(404).json({
          success: false,
          message: `Store with ID ${storeId} not found.`,
        });
      }

      // Check if a file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please upload a CSV file.",
        });
      }

      const filePath = path.join(
        __dirname,
        "../Public/files",
        req.file.filename
      );
      const suppliers = [];
      const duplicateSuppliers = [];

      // Parse the CSV file
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", (row) => {
          suppliers.push({
            store: storeId, // Set the store ID from params
            name: row.name,
            rating: parseFloat(row.rating),
            products: parseInt(row.products, 10),
            totalBusiness: parseFloat(row.totalBusiness),
          });
        })
        .on("end", async () => {
          try {
            const bulkSuppliers = [];
            for (const supplier of suppliers) {
              const { name, rating, products, totalBusiness } = supplier;

              // Validate required fields
              if (!name || !rating || !products || !totalBusiness) {
                throw new Error(
                  `Missing required fields for supplier: ${JSON.stringify(
                    supplier
                  )}`
                );
              }

              // Check for duplicate supplier
              const duplicateSupplier = await Supplier.findOne({
                store: storeId,
                name,
              });
              if (duplicateSupplier) {
                duplicateSuppliers.push({
                  name,
                  reason: "Duplicate supplier for the same store.",
                });
                continue;
              }

              bulkSuppliers.push(supplier);
            }

            // Validate if there are valid suppliers to insert
            if (bulkSuppliers.length === 0 && duplicateSuppliers.length === 0) {
              throw new Error("No valid suppliers to insert.");
            }

            // Insert suppliers into the database
            const insertedSuppliers = bulkSuppliers.length
              ? await Supplier.insertMany(bulkSuppliers, {
                  ordered: false, // Continue inserting even if some fail
                })
              : [];

            fs.unlinkSync(filePath); // Clean up uploaded file

            res.status(201).json({
              success: true,
              message: `${insertedSuppliers.length} suppliers added successfully. ${duplicateSuppliers.length} duplicates found.`,
              suppliers: insertedSuppliers,
              duplicates: duplicateSuppliers,
            });
          } catch (error) {
            console.error("Error processing CSV:", error);
            fs.unlinkSync(filePath); // Clean up on error
            res.status(500).json({
              success: false,
              message: error.message || "Internal server error.",
            });
          }
        });
    } catch (error) {
      console.error("Error adding suppliers from CSV:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error.",
      });
    }
  }
}

module.exports = new SupplierController();
