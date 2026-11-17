
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Employee from "./models/employeeModel.js";
import User from "./models/userModel.js";

dotenv.config();

const createAdmin = async () => {
  try {
    const employeeId = process.env.ADMIN_EMPLOYEE_ID;
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!employeeId || !email || !password) {
      throw new Error(
        "ADMIN_EMPLOYEE_ID, ADMIN_EMAIL and ADMIN_PASSWORD must be configured."
      );
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const employee = await Employee.findOne({ employeeId });

    if (!employee) {
      console.log("Admin employee record not found.");
      console.log("Create the employee record first.");
      return;
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { employeeId: employee._id }],
    });

    if (existingUser) {
      console.log("An account already exists for this admin.");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      employeeId: employee._id,
      email,
      password: hashedPassword,
      role: "Admin",
      isActive: true,
    });

    console.log("Admin account created successfully!");
    console.log("Email:", email);
  } catch (error) {
    console.error("Admin creation failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();
