const express = require("express");
const router = express.Router();
const CategoryController = require("../controllers/Category");

// Category routes
router.post("/add", CategoryController.addCategory);
router.get("/get", CategoryController.getAllCategories);
router.get("/get/:id", CategoryController.getCategory);
router.put("/edit/:id", CategoryController.updateCategory);
router.delete("/delete/:id", CategoryController.deleteCategory);

module.exports = router;
