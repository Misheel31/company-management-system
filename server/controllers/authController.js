import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

import Employee from "../models/employeeModel.js";
import User from "../models/userModel.js";

dotenv.config();

// Email transporter
const createMailTransporter = () => {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASSWORD
  ) {
    throw new Error("SMTP configuration is missing");
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

// ======================================
// REGISTER USER
// ======================================

export const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Work email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    const employee = await Employee.findOne({
      email: normalizedEmail,
    });

    if (!employee) {
      return res.status(404).json({
        message: "Employee profile not found. Please contact your Admin.",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ employeeId: employee._id }, { email: normalizedEmail }],
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account already exists for this employee or email.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      employeeId: employee._id,
      email: normalizedEmail,
      password: hashedPassword,
      role: "Employee",
    });

    return res.status(201).json({
      message: "Registration successful. You can now log in.",
      user: {
        id: user._id,
        employeeId: employee.employeeId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register user error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account already exists for this employee or email.",
      });
    }

    return res.status(500).json({
      message: "Registration failed",
    });
  }
};

// ======================================
// LOGIN USER
// ======================================

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "Server authentication configuration error",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    }).populate("employeeId", "employeeId firstName lastName email department");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Your account is inactive",
      });
    }

    if (!user.employeeId) {
      return res.status(404).json({
        message: "No employee profile is linked to this account",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        employeeId: user.employeeId._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        employeeId: user.employeeId,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Login failed",
    });
  }
};

// ======================================
// LOGOUT USER
// ======================================

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);

    return res.status(500).json({
      message: "Logout failed",
    });
  }
};

// ======================================
// GET CURRENT USER
// ======================================

export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user.employeeId) {
      return res.status(404).json({
        message: "No employee profile is linked to this account",
      });
    }

    return res.status(200).json({
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        employee: req.user.employeeId,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      message: "Failed to load your profile",
    });
  }
};

// ======================================
// FORGOT PASSWORD
// ======================================

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Please enter your company email.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
      isActive: true,
    });

    // Avoid revealing whether an account exists.
    const genericMessage =
      "If an account exists with this email, a password reset link will be sent.";

    if (!user) {
      return res.status(200).json({
        message: genericMessage,
      });
    }

    // Generate a secure random token.
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store only the hashed token.
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    const frontendUrl = process.env.FRONTEND_URL;

    if (!frontendUrl) {
      throw new Error("FRONTEND_URL is missing");
    }

    const resetUrl = `${frontendUrl.replace(/\/$/, "")}/reset-password/${resetToken}`;

    try {
      const transporter = createMailTransporter();

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to: user.email,
        subject: "Reset Your Company Management System Password",

        text: `
You requested a password reset.

Open this link to create a new password:

${resetUrl}

This link expires in 15 minutes.

If you did not request this, ignore this email.
        `,

        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;color:#333;">
            <h2 style="color:#2563eb;">Password Reset Request</h2>

            <p>Hello,</p>

            <p>
              We received a request to reset your Company Management System password.
            </p>

            <p style="margin:30px 0;">
              <a
                href="${resetUrl}"
                style="background:#2563eb;color:white;padding:14px 24px;text-decoration:none;border-radius:8px;font-weight:bold;"
              >
                Reset My Password
              </a>
            </p>

            <p>This link expires in <strong>15 minutes</strong>.</p>

            <p>If you did not request this, you can safely ignore this email.</p>

            <p style="color:#777;font-size:12px;">
              Company Management System
            </p>
          </div>
        `,
      });
    } catch (mailError) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await user.save();

      console.error("Password reset email error:", mailError);

      return res.status(500).json({
        message: "Unable to send the reset email. Please try again later.",
      });
    }

    return res.status(200).json({
      message: genericMessage,
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      message: "Something went wrong. Please try again.",
    });
  }
};

// ======================================
// RESET PASSWORD
// ======================================

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!token) {
      return res.status(400).json({
        message: "Password reset token is required.",
      });
    }

    if (!password || !confirmPassword) {
      return res.status(400).json({
        message: "Please enter and confirm your new password.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must contain at least 6 characters.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match.",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
      isActive: true,
    });

    if (!user) {
      return res.status(400).json({
        message: "This password reset link is invalid or has expired.",
      });
    }

    user.password = await bcrypt.hash(password, 10);

    // Invalidate the token after successful use.
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({
      message: "Password reset successful. You can now log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      message: "Unable to reset password. Please try again.",
    });
  }
};
