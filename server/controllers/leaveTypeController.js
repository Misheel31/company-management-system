import LeaveType from "../models/leaveTypeModel.js";

// Create leave type

export const createLeaveType = async (req, res) => {
  try {
    const { name, description, maxDays } = req.body;

    if (!name?.trim() || maxDays === undefined || maxDays === "") {
      return res.status(400).json({
        message: "Leave type name and maximum days are required",
      });
    }

    if (!Number.isInteger(Number(maxDays)) || Number(maxDays) < 1) {
      return res.status(400).json({
        message: "Maximum days must be a positive whole number",
      });
    }

    const existingLeaveType = await LeaveType.findOne({
      name: { $regex: `^${name.trim()}$`, $options: "i" },
    });

    if (existingLeaveType) {
      return res.status(409).json({
        message: "Leave type already exists",
      });
    }

    const leaveType = await LeaveType.create({
      name: name.trim(),
      description,
      maxDays: Number(maxDays),
    });

    res.status(201).json({
      message: "Leave type created successfully",
      leaveType,
    });
  } catch (error) {
    console.error("Create leave type error:", error);

    res.status(500).json({
      message: "Failed to create leave type",
      error: error.message,
    });
  }
};

// Get all leave types
export const getLeaveTypes = async (req, res) => {
  try {
    const leaveTypes = await LeaveType.find().sort({ createdAt: -1 });

    res.status(200).json({
      count: leaveTypes.length,
      leaveTypes,
    });
  } catch (error) {
    console.error("Get leave types error:", error);

    res.status(500).json({
      message: "Failed to fetch leave types",
      error: error.message,
    });
  }
};

// Get single leave type
export const getLeaveTypeById = async (req, res) => {
  try {
    const leaveType = await LeaveType.findById(req.params.id);

    if (!leaveType) {
      return res.status(404).json({
        message: "Leave type not found",
      });
    }

    res.status(200).json({
      leaveType,
    });
  } catch (error) {
    console.error("Get leave type error:", error);

    res.status(500).json({
      message: "Failed to fetch leave type",
      error: error.message,
    });
  }
};

// Update leave type
export const updateLeaveType = async (req, res) => {
  try {
    const leaveType = await LeaveType.findById(req.params.id);

    if (!leaveType) {
      return res.status(404).json({
        message: "Leave type not found",
      });
    }

    const { name, description, maxDays, isActive } = req.body;

    // Check duplicate name
    if (name && name !== leaveType.name) {
      const existingLeaveType = await LeaveType.findOne({
        name,
        _id: { $ne: req.params.id },
      });

      if (existingLeaveType) {
        return res.status(409).json({
          message: "Leave type already exists",
        });
      }
    }

    leaveType.name = name ?? leaveType.name;
    leaveType.description = description ?? leaveType.description;
    leaveType.maxDays = maxDays ?? leaveType.maxDays;
    leaveType.isActive = isActive ?? leaveType.isActive;

    const updatedLeaveType = await leaveType.save();

    res.status(200).json({
      message: "Leave type updated successfully",
      leaveType: updatedLeaveType,
    });
  } catch (error) {
    console.error("Update leave type error:", error);

    res.status(500).json({
      message: "Failed to update leave type",
      error: error.message,
    });
  }
};

// Delete leave type
export const deleteLeaveType = async (req, res) => {
  try {
    const leaveType = await LeaveType.findById(req.params.id);

    if (!leaveType) {
      return res.status(404).json({
        message: "Leave type not found",
      });
    }

    await LeaveType.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Leave type deleted successfully",
    });
  } catch (error) {
    console.error("Delete leave type error:", error);

    res.status(500).json({
      message: "Failed to delete leave type",
      error: error.message,
    });
  }
};
