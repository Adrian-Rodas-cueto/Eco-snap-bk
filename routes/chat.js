const express = require("express");
const ChatController = require("../controllers/chat");

const router = express.Router();

// Create and handle supplier query
router.post("/create", ChatController.handleSupplierQuery);

// Read all chats
router.get("/get/:storeId", ChatController.getChatsByStoreId);

// Read a specific chat by ID
router.get("/get/:id", ChatController.getChatById);

// Update a chat by ID
router.put("/edit/:id", ChatController.updateChat);

// Delete a chat by ID
router.delete("/delete/:id", ChatController.deleteChat);

module.exports = router;
