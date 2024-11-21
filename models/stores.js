const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    address: { type: String },
    contactInfo: { type: String },
    shippingPolicy: { type: String },
    returnPolicy: { type: String },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Store", storeSchema);
