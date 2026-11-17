import express from "express";

import {
  createLeaveRequest,
  deleteLeaveRequest,
  getEmployeeLeaveRequests,
  getLeaveRequestById,
  getLeaveRequests,
  getMyLeaveBalance,
  getMyLeaveRequests,
  updateLeaveRequest,
} from "../controllers/leaveRequestController.js";

import {
  protect,
  requireAdmin,
  requireEmployee,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// IMPORTANT: Static routes must come before /:id

// Employee leave balance
router.get("/my-balance", protect, requireEmployee, getMyLeaveBalance);

// Employee: view their own leave requests
router.get("/my-requests", protect, requireEmployee, getMyLeaveRequests);

// Get all leave requests (Admin)
router.get("/", protect, requireAdmin, getLeaveRequests);

// Get leave requests for a specific employee
router.get("/employee/:employeeId", protect, getEmployeeLeaveRequests);

// Create leave request
router.post("/", protect, createLeaveRequest);

// Get a single leave request
router.get("/:id", protect, getLeaveRequestById);

// Update leave request
router.put("/:id", protect, requireAdmin, updateLeaveRequest);

// Delete leave request
router.delete("/:id", protect, requireAdmin, deleteLeaveRequest);

export default router;
