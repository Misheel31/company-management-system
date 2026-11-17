import express from "express";

import {
  createLeaveType,
  deleteLeaveType,
  getLeaveTypeById,
  getLeaveTypes,
  updateLeaveType,
} from "../controllers/leaveTypeController.js";

import { protect, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all leave types - logged-in users
router.get("/", protect, getLeaveTypes);

// Get single leave type - logged-in users
router.get("/:id", protect, getLeaveTypeById);

// Create leave type - Admin only
router.post("/", protect, requireAdmin, createLeaveType);

// Update leave type - Admin only
router.put("/:id", protect, requireAdmin, updateLeaveType);

// Delete leave type - Admin only
router.delete("/:id", protect, requireAdmin, deleteLeaveType);

export default router;
