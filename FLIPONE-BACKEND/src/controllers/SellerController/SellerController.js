import Seller from '../../models/Seller.js';
import generateToken from '../../utils/generateToken.js';
import { generateUniqueLicenseID } from '../../services/idGenerator.js';
import logger from "../../services/logger.js";

const sellerControllerLogger = logger.child({ label: '/controllers/AdminController/AdminController.js' });


// Seller Signup
export const sellerSignup = async (req, res) => {
    try {
      const {  name, email, password } = req.body;
  
      sellerControllerLogger.info(`Seller signup attempt: ${email}`);
  
      
      // Double-check lowercase conversion
      const processedEmail = email.toLowerCase();
  
      // Manual duplicate check for race conditions
      const existingSeller = await Seller.findOne({
        $or: [
          { name },
          { email: processedEmail }
        ]
      });
  
      if (existingSeller) {
        return res.status(409).json({
          success: false,
          message: existingSeller.name === name 
            ? 'Business name already exists' 
            : 'Email already registered'
        });
      }
  
      const licenseID = await generateUniqueLicenseID();
      const seller = await Seller.create({ licenseID, name, email:processedEmail, password });
  
      sellerControllerLogger.info(`Seller created successfully: ${seller._id}`);
  
      res.status(201).json({
        success: true,
        // token: generateToken(seller._id, seller.role),
        seller: {
          id: seller._id,
          name: seller.name,
          email: processedEmail,
          licenseID: seller.licenseID,
        }
      });
    } catch (error) {
      sellerControllerLogger.error(`Seller registration error: ${error.message}`, {
        stack: error.stack,
        body: req.body
      });
      const message = error.message.includes('licenseID') 
        ? 'Could not generate unique seller ID. Please try again.'
        : 'Seller registration failed';
  
      res.status(500).json({
        success: false,
        message
      });
    }
  };
  
  // Seller Login
  export const sellerLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const processedEmail = email.toLowerCase();
  
  
      sellerControllerLogger.info(`Seller login attempt: ${email}`);
  
      const seller = await Seller.findOne({ email: processedEmail });
      if (seller && (await seller.comparePassword(password))) {
        if (!seller.isActive) {
          sellerControllerLogger.warn(`Seller login blocked: ${processedEmail} is disabled`);
          return res.status(403).json({
            success: false,
            message: 'Your seller account has been disabled. Please contact admin.'
          });
        }
  
        sellerControllerLogger.info(`Seller logged in successfully: ${seller._id}`);
  
        res.json({
          success: true,
          seller: {
            id: seller._id,
            name: seller.name,
            email: seller.email,
            licenseID: seller.licenseID,
            token: generateToken(seller._id, seller.role),
          }
        });
      } else {
        sellerControllerLogger.warn(`Seller login failed: Invalid credentials for ${email}`);
        res.status(401).json({ message: 'Failed!, please check the email & password again' });
      }
    } catch (error) {
      sellerControllerLogger.error(`Seller login error: ${error.message}`, {
        stack: error.stack,
        body: req.body
      });
      res.status(500).json({
        success: false,
        message: 'Seller login failed'
      });
    }
  };
  