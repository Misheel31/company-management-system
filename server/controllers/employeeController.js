import Employee from "../models/employeeModel.js";
import User from "../models/userModel.js";
// Create employee
export const createEmployee = async (req, res) => {
  try {
    const {
      employeeId,
      firstName,
      lastName,
      email,
      phone,
      address,
      department,
      joiningDate,
    } = req.body;

    // Validate required fields
    if (!employeeId || !firstName || !lastName || !email || !joiningDate) {
      return res.status(400).json({
        message:
          "Employee ID, first name, last name, email and joining date are required",
      });
    }

    // Check duplicate employee ID
    const existingEmployeeId = await Employee.findOne({ employeeId });

    if (existingEmployeeId) {
      return res.status(409).json({
        message: "Employee ID already exists",
      });
    }

    // Check duplicate email
    const existingEmail = await Employee.findOne({ email });

    if (existingEmail) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    const employee = await Employee.create({
      employeeId,
      firstName,
      lastName,
      email,
      phone,
      address,
      department,
      joiningDate,
    });

    res.status(201).json({
      message: "Employee created successfully",
      employee,
    });
  } catch (error) {
    console.error("Create employee error:", error);

    res.status(500).json({
      message: "Failed to create employee",
      error: error.message,
    });
  }
};

// Get all employees

// Get all employees (exclude Admin accounts)
export const getEmployees = async (req, res) => {
  try {
    // Find all Admin accounts and their linked Employee IDs
    const adminUsers = await User.find({ role: "Admin" }).select("employeeId");

    const adminEmployeeIds = adminUsers.map((user) => user.employeeId);

    // Exclude employee records linked to Admin accounts
    const employees = await Employee.find({
      _id: { $nin: adminEmployeeIds },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      count: employees.length,
      employees,
    });
  } catch (error) {
    console.error("Get employees error:", error);

    res.status(500).json({
      message: "Failed to fetch employees",
      error: error.message,
    });
  }
};

// Get single employee
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    res.status(200).json({
      employee,
    });
  } catch (error) {
    console.error("Get employee error:", error);

    res.status(500).json({
      message: "Failed to fetch employee",
      error: error.message,
    });
  }
};

// Update employee
export const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    const {
      employeeId,
      firstName,
      lastName,
      email,
      phone,
      address,
      department,
      joiningDate,
    } = req.body;

    // Check duplicate employee ID
    if (employeeId && employeeId !== employee.employeeId) {
      const existingEmployeeId = await Employee.findOne({
        employeeId,
        _id: { $ne: req.params.id },
      });

      if (existingEmployeeId) {
        return res.status(409).json({
          message: "Employee ID already exists",
        });
      }
    }

    // Check duplicate email
    if (email && email !== employee.email) {
      const existingEmail = await Employee.findOne({
        email,
        _id: { $ne: req.params.id },
      });

      if (existingEmail) {
        return res.status(409).json({
          message: "Email already exists",
        });
      }
    }

    employee.employeeId = employeeId ?? employee.employeeId;
    employee.firstName = firstName ?? employee.firstName;
    employee.lastName = lastName ?? employee.lastName;
    employee.email = email ?? employee.email;
    employee.phone = phone ?? employee.phone;
    employee.address = address ?? employee.address;
    employee.department = department ?? employee.department;
    employee.joiningDate = joiningDate ?? employee.joiningDate;

    const updatedEmployee = await employee.save();

    res.status(200).json({
      message: "Employee updated successfully",
      employee: updatedEmployee,
    });
  } catch (error) {
    console.error("Update employee error:", error);

    res.status(500).json({
      message: "Failed to update employee",
      error: error.message,
    });
  }
};

// Delete employee
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    await Employee.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Employee deleted successfully",
    });
  } catch (error) {
    console.error("Delete employee error:", error);

    res.status(500).json({
      message: "Failed to delete employee",
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

    const leaveTypes = await LeaveType.find().sort({ name: 1 });

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

          // Count both the start date and end date
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

    res.status(200).json({
      balances,
    });
  } catch (error) {
    console.error("Get leave balance error:", error);

    res.status(500).json({
      message: "Failed to calculate leave balance",
      error: error.message,
    });
  }
};
