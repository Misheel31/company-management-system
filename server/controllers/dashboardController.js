// import Attendance from "../models/attendanceModel.js";
// import Employee from "../models/employeeModel.js";
// import LeaveRequest from "../models/leaveRequestModel.js";

// // Get dashboard summary
// export const getDashboard = async (req, res) => {
//   try {
//     // Get today's date
//     const today = new Date();

//     const startOfDay = new Date(today);
//     startOfDay.setHours(0, 0, 0, 0);

//     const endOfDay = new Date(today);
//     endOfDay.setHours(23, 59, 59, 999);

//     // Total employees
//     const totalEmployees = await Employee.countDocuments();

//     // Today's attendance
//     const presentToday = await Attendance.countDocuments({
//       date: {
//         $gte: startOfDay,
//         $lte: endOfDay,
//       },
//       status: "Present",
//     });

//     const absentToday = await Attendance.countDocuments({
//       date: {
//         $gte: startOfDay,
//         $lte: endOfDay,
//       },
//       status: "Absent",
//     });

//     const onLeaveToday = await Attendance.countDocuments({
//       date: {
//         $gte: startOfDay,
//         $lte: endOfDay,
//       },
//       status: "On Leave",
//     });

//     // Leave request counts
//     const pendingLeaveRequests = await LeaveRequest.countDocuments({
//       status: "Pending",
//     });

//     const approvedLeaveRequests = await LeaveRequest.countDocuments({
//       status: "Approved",
//     });

//     const rejectedLeaveRequests = await LeaveRequest.countDocuments({
//       status: "Rejected",
//     });

//     // Recent leave requests
//     const recentLeaveRequests = await LeaveRequest.find()
//       .populate("employeeId", "employeeId firstName lastName")
//       .populate("leaveTypeId", "name")
//       .sort({ createdAt: -1 })
//       .limit(5);

//     res.status(200).json({
//       totalEmployees,

//       attendanceToday: {
//         present: presentToday,
//         absent: absentToday,
//         onLeave: onLeaveToday,
//       },

//       leaveRequests: {
//         pending: pendingLeaveRequests,
//         approved: approvedLeaveRequests,
//         rejected: rejectedLeaveRequests,
//       },

//       recentLeaveRequests,
//     });
//   } catch (error) {
//     console.error("Get dashboard error:", error);

//     res.status(500).json({
//       message: "Failed to fetch dashboard data",
//       error: error.message,
//     });
//   }
// };

import Attendance from "../models/attendanceModel.js";
import Employee from "../models/employeeModel.js";
import LeaveRequest from "../models/leaveRequestModel.js";

// Get dashboard summary
export const getDashboard = async (req, res) => {
  try {
    // =========================
    // Today's Date
    // =========================

    const today = new Date();

    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // =========================
    // Total Employees
    // =========================

    const totalEmployees = await Employee.countDocuments();

    // Get all employees
    const employees = await Employee.find({}, "_id");

    // =========================
    // Today's Attendance
    // =========================

    const todayAttendance = await Attendance.find({
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    // =========================
    // Approved Leave Today
    // =========================

    // =========================
    // Approved Leave Today
    // =========================

    const approvedLeaveToday = await LeaveRequest.find({
      status: "Approved",
      startDate: {
        $lte: endOfDay,
      },
      endDate: {
        $gte: startOfDay,
      },
    });

    console.log("APPROVED LEAVE TODAY:", approvedLeaveToday);

    // Store employee IDs who are on approved leave today
    const employeesOnLeave = new Set(
      approvedLeaveToday.map((leave) => leave.employeeId.toString()),
    );

    // =========================
    // Present Today
    // =========================

    const presentEmployees = new Set();

    todayAttendance
      .filter((attendance) => attendance.status === "Present")
      .forEach((attendance) => {
        presentEmployees.add(attendance.employeeId.toString());
      });

    const presentToday = presentEmployees.size;

    const onLeaveToday = employeesOnLeave.size;

    const absentEmployees = new Set();

    // Explicitly absent employees
    todayAttendance
      .filter((attendance) => attendance.status === "Absent")
      .forEach((attendance) => {
        const employeeId = attendance.employeeId.toString();

        if (!employeesOnLeave.has(employeeId)) {
          absentEmployees.add(employeeId);
        }
      });

    // Employees who have no attendance record today
    const employeesWithAttendance = new Set(
      todayAttendance.map((attendance) => attendance.employeeId.toString()),
    );

    employees.forEach((employee) => {
      const employeeId = employee._id.toString();

      // No attendance + not on approved leave
      if (
        !employeesWithAttendance.has(employeeId) &&
        !employeesOnLeave.has(employeeId)
      ) {
        absentEmployees.add(employeeId);
      }
    });

    const absentToday = absentEmployees.size;

    // =========================
    // Leave Request Counts
    // =========================

    const pendingLeaveRequests = await LeaveRequest.countDocuments({
      status: "Pending",
    });

    const approvedLeaveRequests = await LeaveRequest.countDocuments({
      status: "Approved",
    });

    const rejectedLeaveRequests = await LeaveRequest.countDocuments({
      status: "Rejected",
    });

    // =========================
    // Recent Leave Requests
    // =========================

    const recentLeaveRequests = await LeaveRequest.find()
      .populate("employeeId", "employeeId firstName lastName")
      .populate("leaveTypeId", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    // =========================
    // Response
    // =========================

    res.status(200).json({
      totalEmployees,

      // These names match your Dashboard.jsx
      presentToday,
      absentToday,
      onLeaveToday,

      pendingLeaveRequests,
      approvedLeaveRequests,
      rejectedLeaveRequests,

      recentLeaveRequests,
    });
  } catch (error) {
    console.error("Get dashboard error:", error);

    res.status(500).json({
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
};
