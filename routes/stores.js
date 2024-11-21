const express = require("express");
const StoreController = require("../controllers/stores");
const authenticate = require("../middlewares/authenticate"); // Middleware for user authentication

const router = express.Router();

router.post("/add", authenticate, StoreController.addStore);
router.get("/get/:id", StoreController.getStore);
router.get("/get", StoreController.getAllStores);
router.put("/edit/:id", authenticate, StoreController.updateStore);
router.delete("/delete/:id", authenticate, StoreController.deleteStore);

module.exports = router;