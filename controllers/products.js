const { Product, Store, Category } = require("../models");
const path = require("path");
const fs = require("fs");
const csvParser = require("csv-parser");

class ProductController {
  // Add a new product
  async addProduct(req, res) {
    try {
      const { products } = req.body;

      if (!products || (Array.isArray(products) && products.length === 0)) {
        return res.status(400).json({
          success: false,
          message: "No product data provided.",
        });
      }

      const validateAndProcessProduct = async (product) => {
        const { store, name, price, stock, category, thumbnail } = product;

        if (!store || !name || !price || !stock || !category) {
          throw new Error("Missing required product fields.");
        }

        const storeExists = await Store.findById(store);
        if (!storeExists) {
          throw new Error(`Store with ID ${store} not found.`);
        }

        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
          throw new Error(`Category with ID ${category} not found.`);
        }

        if (storeExists.owner.toString() !== req.user.userId) {
          throw new Error(
            `Unauthorized to add products to store with ID ${store}.`
          );
        }

        const duplicateProduct = await Product.findOne({ store, name });
        if (duplicateProduct) {
          throw new Error(
            `Product with name "${name}" already exists in the store.`
          );
        }

        return { store, name, price, stock, category, thumbnail };
      };

      if (Array.isArray(products)) {
        const processedProducts = [];
        for (const product of products) {
          processedProducts.push(await validateAndProcessProduct(product));
        }

        const createdProducts = await Product.insertMany(processedProducts, {
          ordered: false,
        });

        return res.status(201).json({
          success: true,
          message: `${createdProducts.length} products created successfully.`,
          products: createdProducts,
        });
      } else {
        const processedProduct = await validateAndProcessProduct(products);
        const createdProduct = await Product.create(processedProduct);

        return res.status(201).json({
          success: true,
          message: "Product created successfully.",
          product: createdProduct,
        });
      }
    } catch (error) {
      console.error("Error adding product(s):", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error.",
      });
    }
  }

  // Add products in bulk from CSV
  async addProductsFromCSV(req, res) {
    try {
      // Extract store ID from params
      const { storeId } = req.params;

      if (!storeId) {
        return res.status(400).json({
          success: false,
          message: "Store ID is required as a parameter.",
        });
      }

      // Check if the store exists
      const storeExists = await Store.findById(storeId);
      if (!storeExists) {
        return res.status(404).json({
          success: false,
          message: `Store with ID ${storeId} not found.`,
        });
      }

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
      const products = [];
      const duplicateProducts = [];

      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", (row) => {
          products.push({
            store: storeId, // Set the store ID from params
            name: row.name,
            price: parseFloat(row.price),
            stock: parseInt(row.stock, 10),
            category: row.category,
            thumbnail: row.thumbnail,
          });
        })
        .on("end", async () => {
          try {
            const bulkProducts = [];
            for (const product of products) {
              const { name, category } = product;

              if (!name || !category) {
                throw new Error(
                  `Missing required fields for product: ${JSON.stringify(
                    product
                  )}`
                );
              }

              // Check if the category exists
              const categoryExists = await Category.findById(category);
              if (!categoryExists) {
                throw new Error(`Category with ID ${category} not found.`);
              }

              // Check for duplicate products
              const duplicateProduct = await Product.findOne({
                store: storeId,
                name,
              });
              if (duplicateProduct) {
                duplicateProducts.push({
                  name,
                  reason: "Duplicate product in the same store.",
                });
                continue;
              }

              bulkProducts.push(product);
            }

            if (bulkProducts.length === 0 && duplicateProducts.length === 0) {
              throw new Error("No valid products to insert.");
            }

            // Insert all valid products in bulk
            const insertedProducts = bulkProducts.length
              ? await Product.insertMany(bulkProducts, {
                  ordered: false, // Continue inserting even if some fail
                })
              : [];

            // Clean up uploaded file
            fs.unlinkSync(filePath);

            res.status(201).json({
              success: true,
              message: `${insertedProducts.length} products added successfully. ${duplicateProducts.length} duplicates found.`,
              products: insertedProducts,
              duplicates: duplicateProducts,
            });
          } catch (error) {
            console.error("Error processing CSV:", error);
            fs.unlinkSync(filePath);
            res.status(500).json({
              success: false,
              message: error.message || "Internal server error.",
            });
          }
        });
    } catch (error) {
      console.error("Error adding products from CSV:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error.",
      });
    }
  }

  // Get a single product by ID
  async getProduct(req, res) {
    try {
      const { id } = req.params;

      const product = await Product.findById(id)
        .populate("store", "name")
        .populate("category", "name description");
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found.",
        });
      }

      res.status(200).json({ success: true, product });
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error.",
      });
    }
  }

  // Get all products for a specific store
  async getAllProductsByStore(req, res) {
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

      // Fetch products associated with the store
      const products = await Product.find({ store: storeId })
        .populate("store", "name") // Populate store name
        .populate("category", "name description"); // Populate category details

      // Respond with the fetched products
      res.status(200).json({
        success: true,
        products,
      });
    } catch (error) {
      console.error("Error fetching products by storeId:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error.",
      });
    }
  }

  // Update a product
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Find the product by ID
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found.",
        });
      }

      // Check if the store exists
      const store = await Store.findById(product.store);
      if (!store) {
        return res.status(404).json({
          success: false,
          message: "Store associated with the product not found.",
        });
      }

      // Validate the new category if updated
      if (updates.category) {
        const categoryExists = await Category.findById(updates.category);
        if (!categoryExists) {
          return res.status(404).json({
            success: false,
            message: "Category not found.",
          });
        }
      }

      // Update the product with the provided data
      Object.assign(product, updates);
      await product.save();

      res.status(200).json({
        success: true,
        message: "Product updated successfully.",
        product,
      });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error.",
      });
    }
  }

  // Delete a product
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;

      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found.",
        });
      }

      await product.deleteOne();

      res.status(200).json({
        success: true,
        message: "Product deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error.",
      });
    }
  }
}

module.exports = new ProductController();
