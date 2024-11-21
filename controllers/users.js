const bcrypt = require("bcrypt");
const { User, Store, Product } = require("../models");
const JwtUtil = require("../utils/jwtUtil.js"); // Adjust the path as necessary

class UserController {
  // Add a new user (Registration)
  async addUser(req, res) {
    try {
      const { firstName, lastName, email, password, role } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }

      // Check if the email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ success: false, message: "Email is already registered" });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create the user
      const newUser = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: role || "seller", // Default to 'seller' if role is not provided
      });

      await newUser.save();

      // Generate JWT token
      const token = JwtUtil.generateToken(
        { userId: newUser._id, email: newUser.email },
        process.env.JWT_SECRET,
        "1h" // 1 hour expiration
      );

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: newUser,
        token,
      });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // Login user
  async loginUser(req, res) {
    try {
      const { email, password } = req.body;

      // Check if the user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "Invalid email or password" });
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = JwtUtil.generateToken(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        "1h" // 1 hour expiration
      );

      res.status(200).json({
        success: true,
        message: "Login successful",
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // Get a user by ID
  async getUser(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findById(id).select(
        "firstName lastName email role createdAt updatedAt"
      );

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      res.status(200).json({ success: true, user });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // Edit a user's details
  async editUser(req, res) {
    try {
      const { id } = req.params;
      const { firstName, lastName, email, role } = req.body;

      const user = await User.findById(id);

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Update user details
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.email = email || user.email;
      user.role = role || user.role;

      await user.save();

      res.status(200).json({
        success: true,
        message: "User updated successfully",
        user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // Handle forget password
  async forgetPassword(req, res) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Generate JWT reset token
      const resetToken = JwtUtil.generateToken(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        "1h" // 1 hour expiration
      );

      // Save the token (or send it via email, depending on your flow)
      // For Mongoose, you'd need to add fields like resetToken and resetTokenExpire to the User schema
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpire = new Date(Date.now() + 3600000); // 1 hour from now
      await user.save();

      res.status(200).json({
        success: true,
        message: "Password reset token sent to email",
        resetToken,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // Change user password
  async changePassword(req, res) {
    try {
      const { id } = req.params;
      const { currentPassword, newPassword, confirmPassword } = req.body;

      // Validate that newPassword and confirmPassword are the same
      if (newPassword !== confirmPassword) {
        return res
          .status(400)
          .json({ success: false, message: "New passwords do not match" });
      }

      const user = await User.findById(id);

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ success: false, message: "Current password is incorrect" });
      }

      // Hash new password and update
      const salt = await bcrypt.genSalt(10);
      const hashedNewPassword = await bcrypt.hash(newPassword, salt);
      user.password = hashedNewPassword;
      await user.save();

      res.status(200).json({
        success: true,
        message: "Password changed successfully",
        user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}

module.exports = new UserController();
