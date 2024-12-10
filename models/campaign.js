const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    budget: { type: Number, required: true },
    duration: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
    },
    durationInDays: {
      type: Number, // Duration in days
    },
    status: {
      type: String,
      enum: ["active", "completed", "paused", "drafts"],
      default: "drafts", // Default status is 'drafts'
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", // Assuming you have a Product model
      },
    ],
    targetAudience: {
      gender: [
        {
          type: String,
          enum: ["male", "female", "other"], // Adjust as needed
        },
      ],
      age: [
        {
          type: String, // Age groups like "18-24", "25-34", etc.
          enum: ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"], // Possible age ranges
        },
      ],
    },
    targetLocation: [
      {
        type: String, // You can store location as a string, or if needed, reference to a Location model
      },
    ],
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
  },
  { timestamps: true }
);

// Middleware to calculate durationInDays
campaignSchema.pre("save", function (next) {
  if (this.duration.startDate && this.duration.endDate) {
    const start = new Date(this.duration.startDate);
    const end = new Date(this.duration.endDate);
    const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)); // Convert ms to days
    this.durationInDays = duration > 0 ? duration : 0; // Ensure non-negative
  } else {
    this.durationInDays = 0; // Default if dates are invalid or missing
  }
  next();
});

module.exports = mongoose.model("Campaign", campaignSchema);
