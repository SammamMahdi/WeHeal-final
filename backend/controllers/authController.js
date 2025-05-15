import { User } from "../models/userModel.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
} from "../nodemailer/email.js";

export const signup = async (req, res) => {
  const { name, email, password, phone, role, doctorDetails, driverDetails } = req.body;

  try {
    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Additional validation for doctor role
    if (role === "Doctor" && (!doctorDetails || !doctorDetails.specialization || !doctorDetails.yearsOfExperience || !doctorDetails.consultationFee)) {
      return res.status(400).json({ message: "Doctor details are required" });
    }

    // Additional validation for driver role
    if (role === "Driver" && (!driverDetails || !driverDetails.vehicleType || !driverDetails.vehicleNumber)) {
      return res.status(400).json({ message: "Driver details are required" });
    }

    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const userData = {
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      verificationToken,
      verificationExpires: Date.now() + 24 * 3600000, // 1 hour
    };

    // Add doctor details if role is Doctor
    if (role === "Doctor") {
      userData.doctorDetails = {
        specialization: doctorDetails.specialization,
        yearsOfExperience: doctorDetails.yearsOfExperience,
        consultationFee: doctorDetails.consultationFee,
        education: doctorDetails.education || []
      };
    }

    // Add driver details if role is Driver
    if (role === "Driver") {
      userData.driverDetails = {
        vehicleType: driverDetails.vehicleType,
        vehicleNumber: driverDetails.vehicleNumber,
        licenseNumber: driverDetails.licenseNumber || '',
        yearsOfExperience: driverDetails.yearsOfExperience || 0,
        location: driverDetails.location || '',
        isAvailable: true,
        currentStatus: 'available'
      };
    }

    console.log('Creating user with data:', JSON.stringify(userData, null, 2));
    const user = await User.create(userData);
    await user.save();

    //jwt token generation
    generateTokenAndSetCookie(res, user._id);

    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (err) {
    console.error('Error in signup controller:', err);
    console.error('Error details:', err.stack);
    res.status(500).json({ 
      success: false,
      message: "Internal Server Error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
};

export const verifyEmail = async (req, res) => {
  const { code } = req.body;
  try {
    const user = await User.findOne({
      verificationToken: code,
      // verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("error in verifyEmail ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ success: false, message: "Please verify your email first" });
    }

    const token = generateTokenAndSetCookie(res, user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    // const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    await user.save();

    // send email
    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    );

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.log("Error in forgotPassword ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      // resetPasswordExpiresAt: { $lt: new Date() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });
    }
    // isSamePassword = await bcryptjs.compare(password, user.password);
    // if (isSamePassword) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "New password cannot be same as old password",
    //   });
    // }

    // update password
    const hashedPassword = await bcryptjs.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    await sendResetSuccessEmail(user.email);

    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.log("Error in resetPassword ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error in checkAuth ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};