const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    title: { type: String, required: true },
    budget: { type: Number, required: true },
    duration: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
    },
    durationInDays: {
      type: Number, // Duration in days
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
