const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    supplier: { type: String }, // Supplier details or external API reference
    stock: { type: Number, default: 0 },
    category: { type: String },
    thumbnail: { type: String }, // URL to the product image
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
