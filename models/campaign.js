const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    name: { type: String, required: true },
    budget: { type: Number, required: true },
    duration: { startDate: { type: Date }, endDate: { type: Date } },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    targetAudience: { type: String }, // e.g., demographics or location
    performance: {
      clicks: { type: Number, default: 0 },
      sales: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Campaign", campaignSchema);
