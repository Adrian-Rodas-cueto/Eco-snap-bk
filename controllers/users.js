const bcrypt = require("bcrypt");
const { User } = require("../models");
const JwtUtil = require("../utils/jwtUtil.js"); // Adjust the path as necessary

class UserController {
  // Add a new user (Registration)
  async addUser(req, res) {
    try {
      const { firstName, lastName, email, password, role, image } = req.body;

      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ success: false, message: "Email is already registered" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: role || "seller",
        image,
      });

      await newUser.save();

      const token = JwtUtil.generateToken(
        { userId: newUser._id, email: newUser.email },
        process.env.JWT_SECRET,
        "1h"
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

      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "Invalid email or password" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid email or password" });
      }

      const token = JwtUtil.generateToken(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        "1h"
      );

      res.status(200).json({
        success: true,
        message: "Login successful",
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          image: user.image,
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
        "firstName lastName email role image createdAt updatedAt"
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

  // Get all users
  async getAllUsers(req, res) {
    try {
      // Retrieve all users
      const users = await User.find();

      // If no users are found, return a 404 response
      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No users found",
        });
      }

      // Return the list of users
      res.status(200).json({
        success: true,
        users,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
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
      const { firstName, lastName, email, role, image } = req.body;

      const user = await User.findById(id);

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.email = email || user.email;
      user.role = role || user.role;
      user.image = image || user.image;

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

  // Delete a user
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByIdAndDelete(id);

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // Handle forgot password
  async forgetPassword(req, res) {
    try {
      const { email } = req.body;

      // Check if the user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Generate a JWT token for password reset
      const resetToken = JwtUtil.generateToken(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        "1h"
      );

      // Construct the password reset URL
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      // Send the reset link via email (mocked here; replace with actual email logic)
      console.log(`Password reset link: ${resetUrl}`); // Replace with email service like Nodemailer

      res.status(200).json({
        success: true,
        message: "Password reset link sent to email",
      });
    } catch (error) {
      console.error("Error sending password reset email:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // Reset password
  async resetPassword(req, res) {
    try {
      const { token } = req.query; // Token from the reset link
      const { newPassword, confirmPassword } = req.body;

      // Validate password match
      if (newPassword !== confirmPassword) {
        return res
          .status(400)
          .json({ success: false, message: "Passwords do not match" });
      }

      // Verify the JWT token
      const decoded = JwtUtil.verifyToken(token, process.env.JWT_SECRET);
      if (!decoded) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired token" });
      }

      // Find the user by ID from the token
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update the user's password
      user.password = hashedPassword;
      await user.save();

      res.status(200).json({
        success: true,
        message: "Password reset successfully",
      });
    } catch (error) {
      console.error("Error resetting password:", error);
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

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ success: false, message: "Current password is incorrect" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedNewPassword = await bcrypt.hash(newPassword, salt);
      user.password = hashedNewPassword;
      await user.save();

      res.status(200).json({
        success: true,
        message: "Password changed successfully",
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
