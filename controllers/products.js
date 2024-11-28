const { Product, Store, Category } = require("../models");

class ProductController {
  // Add a new product
  async addProduct(req, res) {
    try {
      const { store, name, price, stock, category, thumbnail } = req.body;

      // Check if the store exists
      const storeExists = await Store.findById(store);
      if (!storeExists) {
        return res.status(404).json({
          success: false,
          message: "Store not found.",
        });
      }

      // Check if the category exists
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: "Category not found.",
        });
      }

      // Ensure the authenticated user is the owner of the store
      if (storeExists.owner.toString() !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to add products to this store.",
        });
      }

      const newProduct = new Product({
        store,
        name,
        price,
        stock,
        category,
        thumbnail,
      });

      const product = await newProduct.save();

      res.status(201).json({
        success: true,
        message: "Product created successfully.",
        product,
      });
    } catch (error) {
      console.error("Error adding product:", error);
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

  // Get all products
  async getAllProducts(req, res) {
    try {
      const products = await Product.find()
        .populate("store", "name")
        .populate("category", "name description");

      res.status(200).json({
        success: true,
        products,
      });
    } catch (error) {
      console.error("Error fetching products:", error);
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

      // Ensure the authenticated user is the owner of the store
      if (store.owner.toString() !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to update this product.",
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

      // Check if the authenticated user is the owner of the store where the product belongs
      const store = await Store.findById(product.store);
      if (store.owner.toString() !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to delete this product.",
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
