import express from "express";
 import {
  loginUser,
  registerUser,
  updateUserAddress,
  updateUserPassword,
  adminLogin,
  getUserAddress,
  getUserProfile,
  directPasswordReset,
  verifyEmailOrPhone,
  requestPasswordReset, // Import new controller
  resetPassword // Import new controller
 } from "../controllers/userController.js";
 import authUser from "../middleware/auth.js";

 const userRouter = express.Router();

 // Public Routes
 userRouter.post("/register", registerUser);
 userRouter.post("/login", loginUser);
 userRouter.post("/admin", adminLogin);
 userRouter.post("/direct-password-reset", directPasswordReset);
 userRouter.post("/verify-email-phone", verifyEmailOrPhone);
 userRouter.post("/request-password-reset", requestPasswordReset); // New route for requesting reset link
 userRouter.post("/reset-password", resetPassword); // New route for resetting password

 // Protected Routes (Require Authentication)
 userRouter.get("/address", authUser, getUserAddress);
 userRouter.put("/address", authUser, updateUserAddress);
 userRouter.get("/profile", authUser, getUserProfile);
 userRouter.put("/profile/password", authUser, updateUserPassword);

 export default userRouter;