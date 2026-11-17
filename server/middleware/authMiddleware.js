import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        message: "Please log in to access this resource",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId)
      .select("-password")
      .populate(
        "employeeId",
        "employeeId firstName lastName email phone address department joiningDate",
      );

    if (!user || !user.isActive) {
      return res.status(401).json({
        message: "Your account is invalid or inactive",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired session. Please log in again.",
    });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "Admin") {
    return res.status(403).json({
      message: "Access denied. Admin permission required.",
    });
  }

  next();
};

// Only employees can check in and check out
export const requireEmployee = (req, res, next) => {
  if (req.user?.role !== "Employee") {
    return res.status(403).json({
      message: "Only employees can check in and check out.",
    });
  }

  next();
};

// Employees can access only their own attendance.
// Admins can view any employee's attendance history.
export const allowOwnAttendance = (req, res, next) => {
  if (req.user?.role === "Admin") {
    return next();
  }

  if (req.user?.role !== "Employee") {
    return res.status(403).json({
      message: "Access denied.",
    });
  }

  const loggedInEmployeeId =
    req.user.employeeId?._id?.toString() || req.user.employeeId?.toString();

  if (loggedInEmployeeId !== req.params.employeeId) {
    return res.status(403).json({
      message: "You cannot access another employee's attendance.",
    });
  }

  next();
};
