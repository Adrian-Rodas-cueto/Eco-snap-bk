const express = require("express");
const ProductController = require("../controllers/products");
const authenticate = require("../middlewares/authenticate"); // Middleware for authentication

const router = express.Router();

router.post("/add", authenticate, ProductController.addProduct);
router.get("/get/:id", ProductController.getProduct);
router.get("/get", ProductController.getAllProducts);
router.put("/edit/:id", authenticate, ProductController.updateProduct);
router.delete("/delete/:id", authenticate, ProductController.deleteProduct);

module.exports = router;
