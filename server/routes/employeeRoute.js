import express from "express";

import {
  createEmployee,
  deleteEmployee,
  getEmployeeById,
  getEmployees,
  updateEmployee,
} from "../controllers/employeeController.js";

const router = express.Router();

// Create employee
router.post("/", createEmployee);

// Get all employees
router.get("/", getEmployees);

// Get single employee
router.get("/:id", getEmployeeById);

// Update employee
router.put("/:id", updateEmployee);

// Delete employee
router.delete("/:id", deleteEmployee);

export default router;
