import express from "express";

import {
  checkInEmployee,
  checkOutEmployee,
  createAttendance,
  deleteAttendance,
  getAttendanceById,
  getAttendances,
  getEmployeeAttendance,
  updateAttendance,
} from "../controllers/attendanceController.js";

import {
  allowOwnAttendance,
  protect,
  requireAdmin,
  requireEmployee,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Employee check-in: employees only
router.post(
  "/check-in/:employeeId",
  protect,
  requireEmployee,
  allowOwnAttendance,
  checkInEmployee,
);

// Employee check-out: employees only
router.put(
  "/check-out/:employeeId",
  protect,
  requireEmployee,
  allowOwnAttendance,
  checkOutEmployee,
);

// Admin manually creates attendance
router.post("/", protect, requireAdmin, createAttendance);

// Admin gets all attendance records
router.get("/", protect, requireAdmin, getAttendances);

// Employee views their own attendance; admin can view a specific employee's history
router.get(
  "/employee/:employeeId",
  protect,
  allowOwnAttendance,
  getEmployeeAttendance,
);

// Admin gets a single attendance record
router.get("/:id", protect, requireAdmin, getAttendanceById);

// Admin updates attendance
router.put("/:id", protect, requireAdmin, updateAttendance);

// Admin deletes attendance
router.delete("/:id", protect, requireAdmin, deleteAttendance);

export default router;
