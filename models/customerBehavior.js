const mongoose = require("mongoose");

const customerBehaviorSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    activity: {
      type: String,
      enum: ["browsing", "added_to_cart", "purchased", "abandoned_cart"],
      required: true,
    },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CustomerBehavior", customerBehaviorSchema);
