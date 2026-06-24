const User = require("../models/User");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const ActivityLog = require("../models/ActivityLog");


const getOtpEmailTemplate = (name, otp) => {
  return `
    <div style="font-family: 'Outfit', 'Segoe UI', Arial, sans-serif; max-width: 550px; margin: auto; padding: 30px; border: 1px solid #eef2f5; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
      <div style="text-align: center; margin-bottom: 25px;">
        <h2 style="color: #3D1800; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: 0.5px;">FASHION STORE</h2>
        <div style="width: 50px; height: 3px; background-color: #C27B3A; margin: 8px auto 0 auto; border-radius: 2px;"></div>
      </div>
      <div style="padding: 10px 0;">
        <p style="font-size: 16px; font-weight: 600; color: #1a1a1a; margin-top: 0;">Hi ${name},</p>
        <p style="font-size: 15px; color: #4a4a4a; line-height: 1.6; margin-bottom: 20px;">
          Welcome to Fashion Store! To complete your registration and verify your email address, please enter the following 6-digit verification code:
        </p>
        <div style="text-align: center; margin: 35px 0;">
          <div style="display: inline-block; font-size: 38px; font-weight: 800; color: #3D1800; letter-spacing: 6px; padding: 12px 30px; background-color: #FDF5EE; border-radius: 12px; border: 1.5px dashed #C27B3A; box-shadow: inset 0 2px 4px rgba(61,24,0,0.02);">
            ${otp}
          </div>
        </div>
        <p style="font-size: 13px; color: #888888; line-height: 1.5;">
          This code is valid for 10 minutes and can only be used once. If you did not sign up for a Fashion Store account, you can safely ignore this email.
        </p>
      </div>
      <div style="border-top: 1px solid #f0f0f0; margin-top: 30px; padding-top: 20px; text-align: center;">
        <p style="font-size: 11px; color: #bbbbbb; margin: 0;">
          &copy; 2026 Fashion Store. All rights reserved.
        </p>
      </div>
    </div>
  `;
};



const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};




const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Please provide all fields" });
    }

    
    const userExists = await User.findOne({ email });

    if (userExists) {
      
      if (userExists.isVerified) {
        return res.status(400).json({ success: false, message: "Email already in use" });
      }
      
      
      userExists.name = name;
      userExists.password = password; 
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      userExists.otp = otp;
      userExists.otpExpires = new Date(Date.now() + 10 * 60 * 1000); 
      
      await userExists.save();
      console.log(`[Signup OTP for ${email}]: ${otp}`);

      
      try {
        await sendEmail({
          email: userExists.email,
          subject: `${otp} is your Fashion Store verification code`,
          html: getOtpEmailTemplate(userExists.name, otp),
        });
      } catch (err) {
        console.error("Nodemailer failed to send email during userExists signup retry:", err.message);
      }
      
      return res.status(200).json({
        success: true,
        message: "Signup successful. Please verify your email.",
        email: userExists.email,
        otp: process.env.NODE_ENV === "development" ? otp : undefined 
      });
    }

    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      name,
      email,
      password,
      otp,
      otpExpires,
      isVerified: false,
    });

    await ActivityLog.create({
      userId: user._id.toString(),
      userName: user.name,
      action: "Created account (Pending verification)",
      category: "Profile",
      status: "Success",
      ipAddress: req.ip || "127.0.0.1",
      device: req.headers["user-agent"] || "Mobile Application",
    });

    console.log(`[Signup OTP for ${email}]: ${otp}`);

    
    try {
      await sendEmail({
        email: user.email,
        subject: `${otp} is your Fashion Store verification code`,
        html: getOtpEmailTemplate(user.name, otp),
      });
    } catch (err) {
      console.error("Nodemailer failed to send email during signup:", err.message);
    }

    res.status(201).json({
      success: true,
      message: "Signup successful. Please verify your email.",
      email: user.email,
      otp: otp 
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ success: false, message: "Server error during registration" });
  }
};




const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Please provide email and verification code" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Email is already verified" });
    }

    
    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid verification code" });
    }

    if (new Date() > user.otpExpires) {
      return res.status(400).json({ success: false, message: "Verification code has expired. Please resend." });
    }

    
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully!",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        countryCode: user.countryCode,
        gender: user.gender,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ success: false, message: "Server error during verification" });
  }
};




const resendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ success: false, message: "Please provide email" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Email is already verified" });
    }

    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); 
    await user.save();

    console.log(`[Resend OTP for ${email}]: ${otp}`);

    
    try {
      await sendEmail({
        email: user.email,
        subject: `${otp} is your Fashion Store verification code`,
        html: getOtpEmailTemplate(user.name, otp),
      });
    } catch (err) {
      console.error("Nodemailer failed to send email during resendOtp:", err.message);
    }

    res.status(200).json({
      success: true,
      message: "A new verification code has been sent to your email",
      otp: otp 
    });
  } catch (error) {
    console.error("Resend OTP Error:", error);
    res.status(500).json({ success: false, message: "Server error while resending code" });
  }
};




const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password" });
    }

    
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      await ActivityLog.create({
        userId: user._id.toString(),
        userName: user.name,
        action: "Failed login attempt (Incorrect password)",
        category: "Auth",
        status: "Failed",
        ipAddress: req.ip || "127.0.0.1",
        device: req.headers["user-agent"] || "Mobile Application",
      });
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (user.isBlocked) {
      await ActivityLog.create({
        userId: user._id.toString(),
        userName: user.name,
        action: `Blocked login attempt: "${user.blockReason || 'Suspicious account activity'}"`,
        category: "Auth",
        status: "Failed",
        ipAddress: req.ip || "127.0.0.1",
        device: req.headers["user-agent"] || "Mobile Application",
      });
      return res.status(403).json({
        success: false,
        message: `Your account has been blocked: ${user.blockReason || 'Suspicious account activity'}`,
      });
    }

    
    if (!user.isVerified) {
      
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      console.log(`[Login Verification OTP for ${email}]: ${otp}`);

      
      try {
        await sendEmail({
          email: user.email,
          subject: `${otp} is your Fashion Store verification code`,
          html: getOtpEmailTemplate(user.name, otp),
        });
      } catch (err) {
        console.error("Nodemailer failed to send email during login unverified:", err.message);
      }

      return res.status(403).json({
        success: false,
        verified: false,
        message: "Please verify your email before logging in.",
        email: user.email,
        otp: otp
      });
    }

    
    // Log successful login
    await ActivityLog.create({
      userId: user._id.toString(),
      userName: user.name,
      action: "Logged in successfully",
      category: "Auth",
      status: "Success",
      ipAddress: req.ip || "127.0.0.1",
      device: req.headers["user-agent"] || "Mobile Application",
    });

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        countryCode: user.countryCode,
        gender: user.gender,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
};




const completeProfile = async (req, res) => {
  const { name, phone, countryCode, gender, avatar } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (countryCode) user.countryCode = countryCode;
    if (gender) user.gender = gender;
    if (avatar) user.avatar = avatar; 

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully!",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        countryCode: updatedUser.countryCode,
        gender: updatedUser.gender,
        avatar: updatedUser.avatar,
      },
    });
  } catch (error) {
    console.error("Complete Profile Error:", error);
    res.status(500).json({ success: false, message: "Server error during profile update" });
  }
};




const resetPassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and new password" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found with this email" });
    }

    
    user.password = password; 
    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully!",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ success: false, message: "Server error during password reset" });
  }
};

module.exports = {
  signup,
  verifyOtp,
  resendOtp,
  login,
  completeProfile,
  resetPassword,
};
