const { Category } = require("../models");

class CategoryController {
  // Add a new category
  async addCategory(req, res) {
    try {
      const { name, description } = req.body;

      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "Category with this name already exists.",
        });
      }

      const category = new Category({ name, description });
      await category.save();

      res.status(201).json({
        success: true,
        message: "Category created successfully.",
        category,
      });
    } catch (error) {
      console.error("Error adding category:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error.",
      });
    }
  }

  // Get all categories
  async getAllCategories(req, res) {
    try {
      const categories = await Category.find();
      res.status(200).json({
        success: true,
        categories,
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error.",
      });
    }
  }

  // Get a category by ID
  async getCategory(req, res) {
    try {
      const { id } = req.params;

      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found.",
        });
      }

      res.status(200).json({
        success: true,
        category,
      });
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error.",
      });
    }
  }

  // Update a category
  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const category = await Category.findByIdAndUpdate(id, updates, {
        new: true, // Return the updated document
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found.",
        });
      }

      res.status(200).json({
        success: true,
        message: "Category updated successfully.",
        category,
      });
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error.",
      });
    }
  }

  // Delete a category
  async deleteCategory(req, res) {
    try {
      const { id } = req.params;

      const category = await Category.findByIdAndDelete(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found.",
        });
      }

      res.status(200).json({
        success: true,
        message: "Category deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error.",
      });
    }
  }
}

module.exports = new CategoryController();
