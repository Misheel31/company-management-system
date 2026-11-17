import Employee from "../models/employeeModel.js";
import LeaveRequest from "../models/leaveRequestModel.js";
import LeaveType from "../models/leaveTypeModel.js";

// Create leave request
export const createLeaveRequest = async (req, res) => {
  try {
    const { employeeId, leaveTypeId, startDate, endDate, reason } = req.body;

    if (!employeeId || !leaveTypeId || !startDate || !endDate) {
      return res.status(400).json({
        message:
          "Employee ID, leave type ID, start date and end date are required",
      });
    }

    // Check employee exists
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    // Check leave type exists
    const leaveType = await LeaveType.findById(leaveTypeId);

    if (!leaveType) {
      return res.status(404).json({
        message: "Leave type not found",
      });
    }

    // Validate dates
    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        message: "End date cannot be before start date",
      });
    }

    const leaveRequest = await LeaveRequest.create({
      employeeId,
      leaveTypeId,
      startDate,
      endDate,
      reason,
    });

    res.status(201).json({
      message: "Leave request created successfully",
      leaveRequest,
    });
  } catch (error) {
    console.error("Create leave request error:", error);

    res.status(500).json({
      message: "Failed to create leave request",
      error: error.message,
    });
  }
};

// Get all leave requests
export const getLeaveRequests = async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find()
      .populate("employeeId", "employeeId firstName lastName email department")
      .populate("leaveTypeId", "name description maxDays")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: leaveRequests.length,
      leaveRequests,
    });
  } catch (error) {
    console.error("Get leave requests error:", error);

    res.status(500).json({
      message: "Failed to fetch leave requests",
      error: error.message,
    });
  }
};

// Get single leave request
export const getLeaveRequestById = async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id)
      .populate("employeeId", "employeeId firstName lastName email department")
      .populate("leaveTypeId", "name description maxDays");

    if (!leaveRequest) {
      return res.status(404).json({
        message: "Leave request not found",
      });
    }

    res.status(200).json({
      leaveRequest,
    });
  } catch (error) {
    console.error("Get leave request error:", error);

    res.status(500).json({
      message: "Failed to fetch leave request",
      error: error.message,
    });
  }
};

// Get leave requests for a specific employee
export const getEmployeeLeaveRequests = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.employeeId);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    const leaveRequests = await LeaveRequest.find({
      employeeId: req.params.employeeId,
    })
      .populate("leaveTypeId", "name description maxDays")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: leaveRequests.length,
      leaveRequests,
    });
  } catch (error) {
    console.error("Get employee leave requests error:", error);

    res.status(500).json({
      message: "Failed to fetch employee leave requests",
      error: error.message,
    });
  }
};

// Get leave balance for the logged-in employee
export const getMyLeaveBalance = async (req, res) => {
  try {
    const employeeId = req.user.employeeId?._id || req.user.employeeId;

    if (!employeeId) {
      return res.status(404).json({
        message: "Employee profile not found",
      });
    }

    // Get all active leave types
    const leaveTypes = await LeaveType.find({
      isActive: true,
    }).sort({ name: 1 });

    // Get approved leave requests for this employee
    const approvedRequests = await LeaveRequest.find({
      employeeId,
      status: "Approved",
    });

    const balances = leaveTypes.map((leaveType) => {
      const usedDays = approvedRequests
        .filter(
          (request) =>
            request.leaveTypeId.toString() === leaveType._id.toString(),
        )
        .reduce((total, request) => {
          const start = new Date(request.startDate);
          const end = new Date(request.endDate);

          const days = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

          return total + Math.max(days, 0);
        }, 0);

      return {
        leaveTypeId: leaveType._id,
        leaveType: leaveType.name,
        totalDays: leaveType.maxDays,
        usedDays,
        remainingDays: Math.max(leaveType.maxDays - usedDays, 0),
      };
    });

    return res.status(200).json({
      balances,
    });
  } catch (error) {
    console.error("Get leave balance error:", error);

    return res.status(500).json({
      message: "Failed to calculate leave balance",
      error: error.message,
    });
  }
};

export const getMyLeaveRequests = async (req, res) => {
  try {
    const employeeId = req.user.employeeId?._id || req.user.employeeId;

    if (!employeeId) {
      return res.status(404).json({
        message: "Employee profile not found",
      });
    }

    const leaveRequests = await LeaveRequest.find({ employeeId })
      .populate("leaveTypeId", "name description maxDays")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: leaveRequests.length,
      leaveRequests,
    });
  } catch (error) {
    console.error("Get my leave requests error:", error);

    res.status(500).json({
      message: "Failed to fetch your leave requests",
      error: error.message,
    });
  }
};

// Update leave request
export const updateLeaveRequest = async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id);

    if (!leaveRequest) {
      return res.status(404).json({
        message: "Leave request not found",
      });
    }

    const { employeeId, leaveTypeId, startDate, endDate, reason, status } =
      req.body;

    // Validate status
    if (status && !["Pending", "Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        message:
          "Invalid status. Status must be Pending, Approved or Rejected.",
      });
    }

    // Check employee if changed
    if (employeeId && employeeId !== leaveRequest.employeeId.toString()) {
      const employee = await Employee.findById(employeeId);

      if (!employee) {
        return res.status(404).json({
          message: "Employee not found",
        });
      }
    }

    // Check leave type if changed
    if (leaveTypeId && leaveTypeId !== leaveRequest.leaveTypeId.toString()) {
      const leaveType = await LeaveType.findById(leaveTypeId);

      if (!leaveType) {
        return res.status(404).json({
          message: "Leave type not found",
        });
      }
    }

    const newStartDate = startDate ?? leaveRequest.startDate;

    const newEndDate = endDate ?? leaveRequest.endDate;

    // Validate dates
    if (new Date(newEndDate) < new Date(newStartDate)) {
      return res.status(400).json({
        message: "End date cannot be before start date",
      });
    }

    // Update fields
    leaveRequest.employeeId = employeeId ?? leaveRequest.employeeId;

    leaveRequest.leaveTypeId = leaveTypeId ?? leaveRequest.leaveTypeId;

    leaveRequest.startDate = startDate ?? leaveRequest.startDate;

    leaveRequest.endDate = endDate ?? leaveRequest.endDate;

    leaveRequest.reason = reason ?? leaveRequest.reason;

    leaveRequest.status = status ?? leaveRequest.status;

    const updatedLeaveRequest = await leaveRequest.save();

    res.status(200).json({
      message: "Leave request updated successfully",
      leaveRequest: updatedLeaveRequest,
    });
  } catch (error) {
    console.error("Update leave request error:", error);

    res.status(500).json({
      message: "Failed to update leave request",
      error: error.message,
    });
  }
};

// Delete leave request
export const deleteLeaveRequest = async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id);

    if (!leaveRequest) {
      return res.status(404).json({
        message: "Leave request not found",
      });
    }

    await LeaveRequest.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Leave request deleted successfully",
    });
  } catch (error) {
    console.error("Delete leave request error:", error);

    res.status(500).json({
      message: "Failed to delete leave request",
      error: error.message,
    });
  }
};
