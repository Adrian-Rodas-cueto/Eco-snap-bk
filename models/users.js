const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "seller"],
      default: "seller",
    },
    image: {
      type: String, // URL or file path of the user's image
    },
  },
  {
    timestamps: true, // Automatically add `createdAt` and `updatedAt`
  }
);

// Pre 'remove' middleware to delete related stores and products when a user is deleted
userSchema.pre("remove", async function (next) {
  try {
    // Delete all stores that belong to this user
    const stores = await mongoose.model("Store").find({ owner: this._id });

    // Delete products related to each store
    await mongoose
      .model("Product")
      .deleteMany({ store: { $in: stores.map((store) => store._id) } });

    // Delete all stores that belong to this user
    await mongoose.model("Store").deleteMany({ owner: this._id });

    next();
  } catch (error) {
    next(error); // Pass the error to the next middleware or handler
  }
});

module.exports = mongoose.model("User", userSchema);
