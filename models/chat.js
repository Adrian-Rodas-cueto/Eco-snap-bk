const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    productInfo: { type: Object, required: true },
    storeOwnerMessage: { type: String, required: true },
    botResponse: { type: String, required: true },
    scamPercentage: { type: Number, required: true }, // New field to store scam percentage
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
