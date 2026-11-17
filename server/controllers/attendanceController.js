import Attendance from "../models/attendanceModel.js";
import Employee from "../models/employeeModel.js";

export const checkInEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const now = new Date();

    // Start of today
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    // End of today
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // check if employee already has attendance today
    const existingAttendance = await Attendance.findOne({
      employeeId: employeeId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    if (existingAttendance) {
      return res.status(409).json({
        message: "Employee has already checked in today",
        attendance: existingAttendance,
      });
    }

    const checkInTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const attendance = await Attendance.create({
      employeeId: employeeId,
      date: now,
      checkIn: checkInTime,
      status: "Present",
    });

    return res.status(201).json({
      message: "Employee checked in successfully",
      attendance,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to check in employee",
      error: error.message,
    });
  }
};

export const checkOutEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const now = new Date();

    // Start of today
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const attendance = await Attendance.findOne({
      employeeId: employeeId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    if (!attendance) {
      return res
        .status(404)
        .json({ message: "Attendance record not found for today" });
    }

    if (attendance.checkOut) {
      return res
        .status(409)
        .json({ message: "Employee has already checked out today" });
    }

    const checkOutTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    attendance.checkOut = checkOutTime;

    const updatedAttendance = await attendance.save();

    return res.status(200).json({
      message: "Employee checked out successfully",
      attendance: updatedAttendance,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to check out employee",
      error: error.message,
    });
  }
};

//create attendance manually

export const createAttendance = async (req, res) => {
  try {
    const { employeeId, date, checkIn, checkOut, status, notes } = req.body;

    if (!employeeId || !date || !status) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const existingAttendance = await Attendance.findOne({
      employeeId,
      date,
    });

    if (existingAttendance) {
      return res.status(409).json({
        message: "Attendance record already exists for this employee and date",
      });
    }

    const attendance = await Attendance.create({
      employeeId,
      date,
      checkIn,
      checkOut,
      status,
      notes,
    });

    return res.status(201).json({
      message: "Attendance record created successfully",
      attendance,
    });
  } catch (error) {
    console.error("Create attendance error:", error);
    return res.status(500).json({
      message: "Failed to create attendance record",
      error: error.message,
    });
  }
};

// Get all attendance records
export const getAttendances = async (req, res) => {
  try {
    const attendances = await Attendance.find()
      .populate("employeeId", "firstName lastName employeeId department")
      .sort({ date: -1 });

    return res.status(200).json({
      count: attendances.length,
      attendances,
    });
  } catch (error) {
    console.error("Get attendances error:", error);

    return res.status(500).json({
      message: "Failed to retrieve attendance records",
      error: error.message,
    });
  }
};

//Get attendance by ID
export const getAttendanceById = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id).populate(
      "employeeId",
      "firstName lastName employeeId",
    );
    if (!attendance) {
      return res.status(404).json({
        message: "Attendance record not found",
      });
    }
    res.status(200).json(attendance);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to retrieve attendance record",
      error: error.message,
    });
  }
};

//Get attendance records for a specific employee
export const getEmployeeAttendance = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.employeeId);
    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }
    const attendances = await Attendance.find({
      employeeId: req.params.employeeId,
    }).sort({ date: -1 });
    return res.status(200).json({
      count: attendances.length,
      attendances,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to retrieve employee attendance records",
      error: error.message,
    });
  }
};

// Update attendance
export const updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        message: "Attendance record not found",
      });
    }

    const { employeeId, date, checkIn, checkOut, status, notes } = req.body;

    // Check employee if employeeId is changed
    if (employeeId && employeeId !== attendance.employeeId.toString()) {
      const existingEmployee = await Employee.findById(employeeId);

      if (!existingEmployee) {
        return res.status(404).json({
          message: "Employee not found",
        });
      }

      attendance.employeeId = employeeId;
    }

    // Update only provided fields
    if (date !== undefined) {
      attendance.date = date;
    }

    if (checkIn !== undefined) {
      attendance.checkIn = checkIn;
    }

    if (checkOut !== undefined) {
      attendance.checkOut = checkOut;
    }

    if (status !== undefined) {
      attendance.status = status;
    }

    if (notes !== undefined) {
      attendance.notes = notes;
    }

    const updatedAttendance = await attendance.save();

    res.status(200).json({
      message: "Attendance updated successfully",
      attendance: updatedAttendance,
    });
  } catch (error) {
    console.error("Update attendance error:", error);

    res.status(500).json({
      message: "Failed to update attendance",
      error: error.message,
    });
  }
};

// Delete attendance
export const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        message: "Attendance record not found",
      });
    }

    await Attendance.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Attendance deleted successfully",
    });
  } catch (error) {
    console.error("Delete attendance error:", error);

    res.status(500).json({
      message: "Failed to delete attendance",
      error: error.message,
    });
  }
};
