const express = require("express");
const ProductController = require("../controllers/products");
const authenticate = require("../middlewares/authenticate"); // Middleware for authentication
const upload = require("../middlewares/upload");

const router = express.Router();

router.post("/add", authenticate, ProductController.addProduct);
router.post(
  "/add/csv",
  upload.single("file"),
  ProductController.addProductsFromCSV
);
router.get("/get/:id", ProductController.getProduct);
router.get(
  "/get/all/:storeId",
  authenticate,
  ProductController.getAllProductsByStore
);
router.put("/edit/:id", authenticate, ProductController.updateProduct);
router.delete("/delete/:id", authenticate, ProductController.deleteProduct);

module.exports = router;
