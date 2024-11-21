const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 },
    trustLevel: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    negotiationHistory: [
      {
        date: { type: Date, default: Date.now },
        details: { type: String },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Supplier", supplierSchema);
