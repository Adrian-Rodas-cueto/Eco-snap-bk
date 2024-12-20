const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, required: true },
    storageCost: { type: Number, default: 0 },
    lastMovement: { type: Date, default: Date.now },
    alerts: {
      lowStock: { type: Boolean, default: false },
      highTimeWithoutMovement: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inventory", inventorySchema);
