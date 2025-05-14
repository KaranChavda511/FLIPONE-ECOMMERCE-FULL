// Profile Management (for logged in users)
// getUserProfile, updateProfile, updateprofilePic
// Implement email immutability check

import User from "../../models/User.js";
import Product from "../../models/Product.js";
import generateToken from "../../utils/generateToken.js";
import fs from "fs/promises";
import path from "path";
import { uploadsDir } from "../../utils/FileUploads.js";
import logger from "../../services/logger.js";

const userControllerLogger = logger.child({
  label: ".controllers/UserController/UserController.js",
});

// User Signup
export const userSignup = async (req, res) => {
  try {
    const { name, email, password, mobile, address } = req.body;

    userControllerLogger.info(`User signup attempt: ${email}`);

    const userExists = await User.findOne({ email });
    if (userExists) {
      userControllerLogger.warn(`User already exists: ${email}`);
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const user = await User.create({ name, email, password, mobile, address });

    userControllerLogger.info(`User created successfully: ${user._id}`);

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id, user.role),
      },
    });
  } catch (error) {
    userControllerLogger.error(`User registration error: ${error.message}`, {
      stack: error.stack,
      body: req.body,
    });
    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  }
};

// signup/register







// User Login
export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    userControllerLogger.info(`User login attempt: ${email}`);

    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      if (user.isActive === false) {
        userControllerLogger.warn(`User login blocked: ${email} is disabled`);
        return res.status(403).json({ message: "User is disabled" });
      }

      userControllerLogger.info(`User logged in successfully: ${user._id}`);

      res.json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id, user.role),
        },
      });
    } else {
      userControllerLogger.warn(
        `User login failed: Invalid credentials for ${email}`
      );
      res.status(401).json({
        success: false,
        message: "Failed!, please check the email & password again",
      });
    }
  } catch (error) {
    userControllerLogger.error(`User login error: ${error.message}`, {
      stack: error.stack,
      body: req.body,
    });
    res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
};

// Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.account;

    userControllerLogger.info(`Fetching profile for user: ${id}`);

    const user = await User.findById(id);

    if (!user) {
      userControllerLogger.warn(`User not found: ${id}`);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    userControllerLogger.info(`Profile fetched successfully for user: ${id}`);

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    userControllerLogger.error(`Get Profile Error: ${error.message}`, {
      stack: error.stack,
      userId: req.account.id,
    });
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};

// Update Profile
export const updateProfile = async (req, res) => {
  try {
    const { id } = req.account;
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "mobile", "address"];
    const invalidUpdates = updates.filter(
      (update) => !allowedUpdates.includes(update)
    );

    userControllerLogger.info(`Updating profile for user: ${id}`, {
      updates,
    });

    if (invalidUpdates.length > 0) {
      userControllerLogger.warn(`Invalid updates for user: ${id}`, {
        invalidUpdates,
      });
      return res.status(400).json({
        success: false,
        message: `Invalid fields: ${invalidUpdates.join(", ")}`,
      });
    }

    const user = await User.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    userControllerLogger.info(`Profile updated successfully for user: ${id}`);

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    userControllerLogger.error(`Update Profile Error: ${error.message}`, {
      stack: error.stack,
      userId: req.account.id,
      body: req.body,
    });
    res.status(500).json({
      success: false,
      message: "Profile update failed",
    });
  }
};

// Update Profile Picture
export const updateprofilePic = async (req, res) => {
  try {
    const { id } = req.account;

    userControllerLogger.info(`Updating profile picture for user: ${id}`);

    if (!req.file) {
      userControllerLogger.warn(`No image file provided for user: ${id}`);
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    // Get user from database
    const user = await User.findById(id);

    // Delete old picture if exists
    if (user.profilePic) {
      const oldFilename = user.profilePic.split("/").pop();
      const oldPath = path.join(uploadsDir, oldFilename);

      try {
        await fs.access(oldPath);
        await fs.unlink(oldPath);
      } catch (err) {
        if (err.code !== "ENOENT") {
          // Ignore "file not found" errors
          console.error("Error deleting old profile picture:", err);
        }
      }
    }

    // Create accessible URL
    const baseUrl = process.env.BASE_URL || "http://localhost:5000";
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

    // Update user with new picture path
    user.profilePic = imageUrl;
    await user.save();

    userControllerLogger.info(
      `Profile picture updated successfully for user: ${id}`
    );

    res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      imageUrl: imageUrl,
      //  viewUrl: imageUrl
    });
  } catch (error) {
    userControllerLogger.error(`Profile Picture Error: ${error.message}`, {
      stack: error.stack,
      userId: req.account.id,
    });
    res.status(500).json({
      success: false,
      message: "Server error updating profile picture",
      error: error.message,
    });
  }
};

// change Password
export const changePassword = async (req, res) => {
  const { id } = req.user;
  const { oldPassword, newPassword } = req.body;

  userControllerLogger.info(`Password change requested for user: ${id}`);
  try {
    const user = await User.findById(id);
    if (!user) {
      userControllerLogger.warn(`User not found for password change: ${id}`);
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      userControllerLogger.warn(`Incorrect old password for user: ${id}`);
      return res
        .status(400)
        .json({ success: false, message: "Old password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    userControllerLogger.info(`Password changed successfully for user: ${id}`);
    return res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    userControllerLogger.error(
      `Change Password Error for user ${id}: ${error.message}`,
      {
        stack: error.stack,
      }
    );
    return res
      .status(500)
      .json({ success: false, message: "Failed to update password" });
  }
};

// Like or Unlike a Product
export const likeProduct = async (req, res) => {
  try {
    const userId = req.account.id;
    const { productId } = req.params;

    const user = await User.findById(userId);
    const index = user.likedProducts.indexOf(productId);

    let action;

    if (index === -1) {
      user.likedProducts.push(productId);
      action = "liked";
    } else {
      user.likedProducts.splice(index, 1);
      action = "unliked";
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `Product ${action} successfully`,
    });
  } catch (error) {
    console.error("Like product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to like/unlike product",
    });
  }
};

// Get All Liked Products
export const getLikedProducts = async (req, res) => {
  try {
    const user = await User.findById(req.account.id).populate({
      path: "likedProducts",
      populate: { path: "seller", select: "name" },
    });

    res.status(200).json({
      success: true,
      products: user.likedProducts,
    });
  } catch (error) {
    console.error("Fetch liked products error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch liked products",
    });
  }
};
