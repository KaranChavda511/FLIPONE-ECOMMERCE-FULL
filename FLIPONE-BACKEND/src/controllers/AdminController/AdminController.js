import Admin from '../../models/Admin.js';
import generateToken from '../../utils/generateToken.js';
import logger from "../../services/logger.js";

const adminControllerLogger = logger.child({ label: '/controllers/AdminController/AdminController.js' });



// Admin Login
export const adminLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Find admin by email
      const admin = await Admin.findOne({ email }); 
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found',
        });
      }
  
      // Check password
      const isMatch = await admin.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'password is incorrect',
        });
      }
  
      // Generate token
      const token = generateToken(admin._id, admin.role);
  
      // Send response
      res.status(200).json({
        success: true,
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
        },
      });
    } catch (error) {
    //   console.error('Admin Login Error:', error);
    adminControllerLogger.error(`Admin login error: ${error.message}`, {
        stack: error.stack,
        email: req.body.email
      });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };
  
  
  export const adminSignup = async (req, res) => {
    try {
      const { name, email, password } = req.body;
  
      adminControllerLogger.info(`admin signup attempt: ${email}`);
  
    //   const adminExists = await User.findOne({ email });
      const adminExists = await Admin.findOne({ email });

      if (adminExists) {
        adminControllerLogger.warn(`admin already exists: ${email}`);
        return res.status(409).json({
          success: false,
          message: 'admin already exists with this email'
        });
      }
  
      const admin = await Admin.create({ name, email, password });
      const token = generateToken(admin._id, admin.role);

  
      adminControllerLogger.info(`admin created successfully: ${admin._id}`);
  
      res.status(201).json({
        success: true,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          token
        }
      });
    } catch (error) {
      adminControllerLogger.error(`admin registration error: ${error.message}`, {
        stack: error.stack,
        body: req.body
      });
      res.status(500).json({
        success: false,
        message: 'Registration failed. Please try again.',
        error
      });
    }
  };
  

  // Admin Password Change
export const changeAdminPassword = async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      const admin = await Admin.findById(req.admin.id);
  
      if (!admin) { 
        return res.status(404).json({
          success: false,
          message: 'Admin not found',
        });
      }
  
      // Verify old password
      const isMatch = await admin.comparePassword(oldPassword);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Old password is incorrect',
        });
      }
  
      // Update password
      admin.password = newPassword;
      await admin.save();
  
      // Generate new token (optional)
      const token = generateToken(admin._id, admin.role);
  
      adminControllerLogger.info(`Password changed for admin: ${admin._id}`);
  
      res.status(200).json({
        success: true,
        message: 'Password updated successfully',
        token // Optional: Return new token
      });
  
    } catch (error) {
      adminControllerLogger.error(`Password change error: ${error.message}`, {
        stack: error.stack,
        adminId: req.admin?.id
      });
      res.status(500).json({
        success: false,
        message: 'Password change failed',
        error
      });
    }
  };