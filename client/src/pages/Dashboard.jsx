import { CalendarDays, CheckCircle, Clock, Users, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState("");

  const [updatingLeaveId, setUpdatingLeaveId] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const [formData, setFormData] = useState({
    employeeId: "",
    leaveTypeId: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  // =========================
  // Fetch Dashboard
  // =========================

  const fetchDashboard = async () => {
    try {
      const response = await fetch(`${API_URL}/api/dashboard/`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard");
      }

      const data = await response.json();

      setDashboard(data);
      setError("");
    } catch (error) {
      console.error("Dashboard error:", error);
      setError("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Fetch Employees
  // =========================

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_URL}/api/employees/`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch employees");
      }

      const data = await response.json();

      setEmployees(data.employees || data);
    } catch (error) {
      console.error("Employees error:", error);
    }
  };

  // =========================
  // Fetch Leave Types
  // =========================

  const fetchLeaveTypes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/leave-types/`);

      if (!response.ok) {
        throw new Error("Failed to fetch leave types");
      }

      const data = await response.json();

      setLeaveTypes(data.leaveTypes || data);
    } catch (error) {
      console.error("Leave types error:", error);
    }
  };

  // =========================
  // Initial Load
  // =========================

  useEffect(() => {
    fetchDashboard();
    fetchEmployees();
    fetchLeaveTypes();
  }, []);

  // =========================
  // Form Input
  // =========================

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // Submit Leave Request
  // =========================

  const handleLeaveSubmit = async (event) => {
    event.preventDefault();

    setSubmitting(true);
    setFormMessage("");

    try {
      const response = await fetch(`${API_URL}/api/leave-requests/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit leave request");
      }

      setFormMessage("Leave request submitted successfully.");

      setFormData({
        employeeId: "",
        leaveTypeId: "",
        startDate: "",
        endDate: "",
        reason: "",
      });

      await fetchDashboard();

      setTimeout(() => {
        setShowLeaveForm(false);
        setFormMessage("");
      }, 1200);
    } catch (error) {
      console.error("Leave request error:", error);

      setFormMessage(error.message || "Failed to submit leave request");
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // Approve / Reject Leave
  // =========================

  const handleLeaveStatusUpdate = async (leaveRequestId, status) => {
    try {
      setUpdatingLeaveId(leaveRequestId);
      setActionMessage("");

      const response = await fetch(
        `${API_URL}/api/leave-requests/${leaveRequestId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update leave request");
      }

      setActionMessage(`Leave request ${status.toLowerCase()} successfully.`);

      await fetchDashboard();

      setTimeout(() => {
        setActionMessage("");
      }, 2500);
    } catch (error) {
      console.error("Leave status update error:", error);

      setActionMessage(error.message || "Failed to update leave request");
    } finally {
      setUpdatingLeaveId("");
    }
  };

  // =========================
  // Loading
  // =========================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />

        <main className="p-6">
          <div className="flex min-h-[300px] items-center justify-center">
            <p className="text-gray-500">Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  // =========================
  // Error
  // =========================

  if (error || !dashboard) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />

        <main className="p-6">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-red-500">
              {error || "Failed to load dashboard"}
            </p>
          </div>
        </main>
      </div>
    );
  }

  // =========================
  // Dashboard
  // =========================

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="p-6">
        {/* Header */}

        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

            <p className="mt-1 text-sm text-gray-500">
              Overview of your company management system
            </p>
          </div>
        </div>

        {/* =========================
            Attendance Summary
        ========================= */}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Employees */}

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Employees</p>

                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {dashboard.totalEmployees ?? 0}
                </h2>
              </div>

              <div className="rounded-lg bg-blue-100 p-3">
                <Users size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          {/* Present */}

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Present Today</p>

                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {dashboard.presentToday ?? 0}
                </h2>
              </div>

              <div className="rounded-lg bg-green-100 p-3">
                <CheckCircle size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          {/* Absent */}

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Absent Today</p>

                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {dashboard.absentToday ?? 0}
                </h2>
              </div>

              <div className="rounded-lg bg-red-100 p-3">
                <XCircle size={24} className="text-red-600" />
              </div>
            </div>
          </div>

          {/* On Leave */}

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">On Leave Today</p>

                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {dashboard.onLeaveToday ?? 0}
                </h2>
              </div>

              <div className="rounded-lg bg-yellow-100 p-3">
                <CalendarDays size={24} className="text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* =========================
            Leave Request Summary
        ========================= */}

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* Pending */}

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-yellow-100 p-3">
                <Clock size={22} className="text-yellow-600" />
              </div>

              <div>
                <p className="text-sm text-gray-500">Pending Leave Requests</p>

                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {dashboard.pendingLeaveRequests ?? 0}
                </p>
              </div>
            </div>
          </div>

          {/* Approved */}

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-green-100 p-3">
                <CheckCircle size={22} className="text-green-600" />
              </div>

              <div>
                <p className="text-sm text-gray-500">Approved Leave Requests</p>

                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {dashboard.approvedLeaveRequests ?? 0}
                </p>
              </div>
            </div>
          </div>

          {/* Rejected */}

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-red-100 p-3">
                <XCircle size={22} className="text-red-600" />
              </div>

              <div>
                <p className="text-sm text-gray-500">Rejected Leave Requests</p>

                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {dashboard.rejectedLeaveRequests ?? 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =========================
            Recent Leave Requests
        ========================= */}

        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Recent Leave Requests
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Review and manage employee leave requests
              </p>
            </div>
          </div>

          {/* Action Message */}

          {actionMessage && (
            <div className="mb-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
              {actionMessage}
            </div>
          )}

          {dashboard.recentLeaveRequests?.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-gray-500">No leave requests found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b bg-gray-50 text-sm text-gray-500">
                    <th className="px-4 py-3">Employee</th>

                    <th className="px-4 py-3">Leave Type</th>

                    <th className="px-4 py-3">Start Date</th>

                    <th className="px-4 py-3">End Date</th>

                    <th className="px-4 py-3">Status</th>

                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {dashboard.recentLeaveRequests.map((request) => (
                    <tr
                      key={request._id}
                      className="border-b last:border-b-0 hover:bg-gray-50"
                    >
                      {/* Employee */}

                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-800">
                            {request.employeeId?.firstName}{" "}
                            {request.employeeId?.lastName}
                          </p>

                          <p className="text-xs text-gray-500">
                            {request.employeeId?.employeeId}
                          </p>
                        </div>
                      </td>

                      {/* Leave Type */}

                      <td className="px-4 py-4 text-sm text-gray-700">
                        {request.leaveTypeId?.name || "-"}
                      </td>

                      {/* Start Date */}

                      <td className="px-4 py-4 text-sm text-gray-700">
                        {new Date(request.startDate).toLocaleDateString()}
                      </td>

                      {/* End Date */}

                      <td className="px-4 py-4 text-sm text-gray-700">
                        {new Date(request.endDate).toLocaleDateString()}
                      </td>

                      {/* Status */}

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            request.status === "Approved"
                              ? "bg-green-100 text-green-700"
                              : request.status === "Rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {request.status}
                        </span>
                      </td>

                      {/* Action */}

                      <td className="px-4 py-4">
                        {request.status === "Pending" ? (
                          <div className="flex flex-wrap gap-2">
                            {/* Approve */}

                            <button
                              type="button"
                              onClick={() =>
                                handleLeaveStatusUpdate(request._id, "Approved")
                              }
                              disabled={updatingLeaveId === request._id}
                              className="rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {updatingLeaveId === request._id
                                ? "Updating..."
                                : "Approve"}
                            </button>

                            {/* Reject */}

                            <button
                              type="button"
                              onClick={() =>
                                handleLeaveStatusUpdate(request._id, "Rejected")
                              }
                              disabled={updatingLeaveId === request._id}
                              className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">
                            No action
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {showLeaveForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            {/* Modal Header */}

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Request Leave
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Submit a leave request for an employee
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowLeaveForm(false);
                  setFormMessage("");
                }}
                className="text-2xl text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            {/* Form */}

            <form onSubmit={handleLeaveSubmit} className="space-y-4">
              {/* Employee */}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Employee
                </label>

                <select
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select employee</option>

                  {employees.map((employee) => (
                    <option key={employee._id} value={employee._id}>
                      {employee.employeeId} - {employee.firstName}{" "}
                      {employee.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Leave Type */}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Leave Type
                </label>

                <select
                  name="leaveTypeId"
                  value={formData.leaveTypeId}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select leave type</option>

                  {leaveTypes
                    .filter((leaveType) => leaveType.isActive !== false)
                    .map((leaveType) => (
                      <option key={leaveType._id} value={leaveType._id}>
                        {leaveType.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Dates */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Start Date
                  </label>

                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    End Date
                  </label>

                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Reason */}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Reason
                </label>

                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Enter reason for leave..."
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Form Message */}

              {formMessage && (
                <div
                  className={`rounded-lg px-4 py-3 text-sm ${
                    formMessage.includes("successfully")
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {formMessage}
                </div>
              )}

              {/* Buttons */}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowLeaveForm(false);
                    setFormMessage("");
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
