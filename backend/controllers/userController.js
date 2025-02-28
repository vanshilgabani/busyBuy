import validator from "validator";
 import bcrypt from "bcrypt";
 import jwt from "jsonwebtoken";
 import userModel from "../models/userModel.js";
 import sgMail from '@sendgrid/mail'; // Import SendGrid

 sgMail.setApiKey(process.env.SENDGRID_API_KEY); // Set SendGrid API Key

 const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour
 };


 const getUserProfile = async (req, res) => {
  try {
   const user = await userModel.findById(req.body.userId).select('-password'); // Exclude password
   if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
   }
   res.status(200).json({ success: true, user });
  } catch (error) {
   console.error("Error getting user profile:", error);
   res.status(500).json({ success: false, message: "Server error" });
  }
 };

 // Route for user login
 const loginUser = async (req, res) => {
  try {
   const { emailOrPhone, password } = req.body;

   const user = await userModel.findOne({$or: [{email: emailOrPhone}, {"address.phone": emailOrPhone}]
   });

   if (!user) {
    return res.json({ success: false, message: "User doesn't exist" });
   }

   const isMatch = await bcrypt.compare(password, user.password);

   if (isMatch) {
    const token = createToken(user._id);
    res.json({ success: true, token, user });
   } else {
    res.json({ success: false, message: "Invalid credentials" });
   }
  } catch (error) {
   console.log(error);
   res.json({ success: false, message: error.message });
  }
 };

 // Route for user registration
 const registerUser = async (req, res) => {
  try {
   const { first_name,last_name, email, password, address } = req.body;

   // Check if user already exists
   const exists = await userModel.findOne({ email });
   if (exists) {
    return res.json({ success: false, message: "User already exists" });
   }

   // Validate email format & strong password
   if (!validator.isEmail(email)) {
    return res.json({ success: false, message: "Please enter a valid email" });
   }
   if (password.length < 8) {
    return res.json({ success: false, message: "Please enter a strong password" });
   }

   // Hash user password
   const salt = await bcrypt.genSalt(10);
   const hashedPassword = await bcrypt.hash(password, salt);

   const newUser = new userModel({
    first_name,
    last_name,
    email,
    password: hashedPassword,
    address,
   });

   const user = await newUser.save();

   const token = createToken(user._id);

   res.json({ success: true, token, user });
  } catch (error) {
   console.log(error);
   res.json({ success: false, message: error.message });
  }
 };

 const getUserAddress = async (req, res) => {
  try {
   const user = await userModel.findById(req.body.userId);

   if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
   }

   if (!user.address) {
    return res.status(200).json({ success: true, address: {} }); // Return empty object if no address is set
   }

   res.status(200).json({ success: true, address: user.address });

  } catch (error) {
   console.error("Error fetching address:", error);
   res.status(500).json({ success: false, message: "Internal Server Error" });
  }
 };

 const updateUserPassword = async (req, res) => {
  try {
   const { currentPassword, newPassword } = req.body;
   const userId = req.body.userId;

   if (!currentPassword ||!newPassword) {
    return res.json({ success: false, message: "Please provide both current and new passwords." });
   }

   if (newPassword.length < 8) {
    return res.json({ success: false, message: "New password should be at least 8 characters long." });
   }

   const user = await userModel.findById(userId);
   if (!user) {
    return res.json({ success: false, message: "User not found." });
   }

   const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
   if (!isPasswordMatch) {
    return res.json({ success: false, message: "Incorrect current password." });
   }

   const salt = await bcrypt.genSalt(10);
   const hashedPassword = await bcrypt.hash(newPassword, salt);

   user.password = hashedPassword;
   await user.save();

   res.json({ success: true, message: "Password updated successfully." });

  } catch (error) {
   console.error("Error updating password:", error);
   res.json({ success: false, message: "Failed to update password.", error: error.message });
  }
 };

 // Route for updating user address
 const updateUserAddress = async (req, res) => {
  try {
   const { userId, first_name, last_name, email, address } = req.body;

   const user = await userModel.findById(userId);
   if (!user) {
    return res.json({ success: false, message: "User not found" });
   }

   user.first_name = first_name;
   user.last_name = last_name;
   user.email = email;
   user.address = address;

   await user.save();

   res.json({ success: true, message: "Profile updated successfully", user }); // More accurate message
  } catch (error) {
   console.log(error);
   res.json({ success: false, message: error.message });
  }
 };

 // Route for admin login
 const adminLogin = async (req, res) => {
  try {
   const { email, password } = req.body;

   if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign(email + password, process.env.JWT_SECRET);
    res.json({ success: true, token });
   } else {
    res.json({ success: false, message: "Invalid credentials" });
   }
  } catch (error) {
   console.log(error);
   res.json({ success: false, message: error.message });
  }
 };

// Route to initiate password reset
const requestPasswordReset = async (req, res) => {
   const { emailOrPhone } = req.body;
 
   try {
     const user = await userModel.findOne({ $or: [{ email: emailOrPhone }, { "address.phone": emailOrPhone }] });
     if (!user) {
       return res.status(404).json({ success: false, message: "User not found with provided email or phone." });
     }
 
     // Check if a reset password token is already active and not expired
     if (user.resetPasswordToken && user.resetPasswordExpires > Date.now()) {
       const timeRemaining = Math.ceil((user.resetPasswordExpires - Date.now()) / 60000); // in minutes
       return res.status(400).json({
         success: false,
         message: `A password reset link has already been sent to your email. Please check your inbox (and spam folder). You can request a new link after ${timeRemaining} minutes.`,
       });
     }
 
     const resetToken = createToken(user._id); // Token valid for 1 hour
     user.resetPasswordToken = resetToken;
     user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
     await user.save();
 
     const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`; // Construct reset link
 
     const msg = {
       to: user.email, // User's email
       from: process.env.SENDGRID_VERIFIED_EMAIL, // Your SendGrid verified email
       subject: 'Password Reset Request',
       text: `Please click on the following link to reset your password: ${resetLink} This link will expire in 1 hour.`,
       html: `<p>Please click on the following link to reset your password:</p><a href="${resetLink}">${resetLink}</a><p>This link will expire in 1 hour.</p>`,
     };
 
     await sgMail.send(msg);
 
     res.json({ success: true, message: "Password reset link sent to your email." });
 
   } catch (error) {
     console.error("Password reset request error:", error);
     res.status(500).json({ success: false, message: "Could not send password reset email." });
   }
 };
 // Route to verify password reset token and update password
 const resetPassword = async (req, res) => {
     const { token, newPassword } = req.body;
    
     if (!token ||!newPassword) {
       return res.status(400).json({ success: false, message: "Token and new password are required." });
     }
    
     try {
       const decoded = jwt.verify(token, process.env.JWT_SECRET);
       const user = await userModel.findOne({
        _id: decoded.id,
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() } // Token should not be expired
       });
    
       if (!user) {
        return res.status(400).json({ success: false, message: "Invalid or expired password reset token." });
       }
    
       if (newPassword.length < 8) {
        return res.json({ success: false, message: "New password should be at least 8 characters long." });
       }
    
       const salt = await bcrypt.genSalt(10);
       const hashedPassword = await bcrypt.hash(newPassword, salt);
    
       user.password = hashedPassword;
       user.resetPasswordToken = undefined; // Invalidate token
       user.resetPasswordExpires = undefined; // Clear expiry
       await user.save();
    
       res.json({ success: true, message: "Password reset successfully!!, You can now login with the updated password." });
    
      } catch (error) {
       console.error("Password reset error:", error);
       res.status(400).json({ success: false, message: "Invalid or expired password reset token." }); // For JWT verification failures or expired tokens
      }
     };

 const directPasswordReset = async (req, res) => {
  const { emailOrPhone, newPassword } = req.body;

  if (!newPassword) {
   return res.status(400).json({ success: false, message: "New password is required." });
  }

  try {
   const user = await userModel.findOne({ $or: [{ email: emailOrPhone }, { "address.phone": emailOrPhone }] });

   if (!user) {
    return res.status(404).json({ success: false, message: "User not found with provided email or phone." });
   }

   // Hash the new password
   const salt = await bcrypt.genSalt(10);
   const hashedPassword = await bcrypt.hash(newPassword, salt);

   // Update user's password directly
   user.password = hashedPassword;
   await user.save();

   res.json({ success: true, message: "Password updated successfully." });

  } catch (error) {
   console.error("Direct password reset error:", error);
   res.status(500).json({ success: false, message: "Could not update password." });
  }
 };

 const verifyEmailOrPhone = async (req, res) => {
  console.log("verifyEmailOrPhone controller function was hit!");
  const { emailOrPhone } = req.body;

  try {
   const user = await userModel.findOne({ $or: [{ email: emailOrPhone }, { "address.phone": emailOrPhone }] });

   if (!user) {
    return res.status(404).json({ success: false, message: "Email or Phone not found in our records." });
   }

   res.json({ success: true, message: "User verified." }); // User found - verification successful

  } catch (error) {
   console.error("Error verifying email/phone:", error);
   res.status(500).json({ success: false, message: "Error verifying email/phone." });
  }
 };
 export { loginUser, registerUser, updateUserAddress, updateUserPassword, adminLogin, getUserAddress, getUserProfile, directPasswordReset, verifyEmailOrPhone, requestPasswordReset, resetPassword };