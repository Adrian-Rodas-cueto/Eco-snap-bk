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

// Pre 'remove' middleware to delete related products automatically
storeSchema.pre("remove", async function (next) {
  try {
    // Delete all products that belong to this store
    await mongoose.model("Product").deleteMany({ store: this._id });
    next();
  } catch (error) {
    next(error); // Pass the error to the next middleware or handler
  }
});

module.exports = mongoose.model("Store", storeSchema);
