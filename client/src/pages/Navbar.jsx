import axios from "axios";
import {
  CalendarDays,
  ClipboardCheck,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Menu,
  PlusCircle,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

const Navbar = () => {
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [formMessage, setFormMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: "",
    leaveTypeId: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  // Fetch employees and leave types
  const fetchLeaveFormData = async () => {
    try {
      const [employeesResponse, leaveTypesResponse] = await Promise.all([
        axios.get(`${API_URL}/employees/`, {
          withCredentials: true,
        }),
        axios.get(`${API_URL}/leave-types/`, {
          withCredentials: true,
        }),
      ]);

      setEmployees(
        employeesResponse.data.employees || employeesResponse.data || [],
      );

      setLeaveTypes(
        leaveTypesResponse.data.leaveTypes || leaveTypesResponse.data || [],
      );

      return true;
    } catch (error) {
      console.error("Failed to load leave form data:", error);

      setFormMessage(
        error.response?.data?.message ||
          "Failed to load employees and leave types.",
      );

      return false;
    }
  };

  // Open leave request modal
  const handleOpenLeaveForm = async () => {
    setFormMessage("");
    setMobileMenuOpen(false);

    const loaded = await fetchLeaveFormData();

    if (loaded) {
      setShowLeaveForm(true);
    }
  };

  // Handle form inputs
  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Submit leave request
  const handleLeaveSubmit = async (event) => {
    event.preventDefault();

    setSubmitting(true);
    setFormMessage("");

    try {
      await axios.post(`${API_URL}/leave-requests/`, formData, {
        withCredentials: true,
      });

      setFormMessage("Leave request submitted successfully.");

      setFormData({
        employeeId: "",
        leaveTypeId: "",
        startDate: "",
        endDate: "",
        reason: "",
      });

      setTimeout(() => {
        setShowLeaveForm(false);
        setFormMessage("");
      }, 1200);
    } catch (error) {
      console.error("Leave request error:", error);

      setFormMessage(
        error.response?.data?.message || "Failed to submit leave request.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Close leave request modal
  const handleCloseLeaveForm = () => {
    setShowLeaveForm(false);
    setFormMessage("");
  };

  // Logout
  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setMobileMenuOpen(false);
      navigate("/login", { replace: true });
    }
  };

  // Navigation items
  const navItems = [
    {
      label: "Dashboard",
      to: "/",
      icon: LayoutDashboard,
    },
    {
      label: "Employees",
      to: "/employees",
      icon: Users,
    },
    {
      label: "Attendance",
      to: "/attendance",
      icon: ClipboardCheck,
    },
    {
      label: "Leave Types",
      to: "/leave-types",
      icon: CalendarDays,
    },
    {
      label: "Workspace",
      to: "/workspace",
      icon: ListTodo,
    },
  ];

  // Navigation links
  const renderNavLinks = (mobile = false) => (
    <>
      {navItems.map(({ label, to, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          onClick={() => setMobileMenuOpen(false)}
          className={({ isActive }) =>
            `flex flex-row items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? "bg-blue-100 text-blue-700"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            } ${mobile ? "w-full justify-start" : "shrink-0"}`
          }
        >
          <Icon size={20} className="shrink-0" />
          <span>{label}</span>
        </NavLink>
      ))}

      {/* Request Leave */}
      <button
        type="button"
        onClick={handleOpenLeaveForm}
        className={`flex flex-row items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 ${
          mobile ? "w-full justify-start" : "shrink-0"
        }`}
      >
        <PlusCircle size={20} className="shrink-0" />
        <span>Request Leave</span>
      </button>

      {/* Logout */}
      <button
        type="button"
        onClick={handleLogout}
        className={`flex flex-row items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 ${
          mobile ? "w-full justify-start" : "shrink-0"
        }`}
      >
        <LogOut size={20} className="shrink-0" />
        <span>Logout</span>
      </button>
    </>
  );

  return (
    <>
      {/* Navbar */}
      <nav className="relative z-40 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-20 items-center justify-between gap-4 py-3">
            {/* Company Name */}
            <NavLink
              to="/"
              className="min-w-0 shrink-0 text-lg font-bold leading-tight text-gray-800 sm:text-xl lg:text-2xl"
            >
              Company Management System
            </NavLink>

            {/* Desktop Navigation */}
            <div className="hidden flex-row items-center justify-end gap-1 xl:flex">
              {renderNavLinks()}
            </div>

            {/* Mobile / Tablet Menu Button */}
            <button
              type="button"
              aria-label={
                mobileMenuOpen ? "Close navigation" : "Open navigation"
              }
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((previous) => !previous)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-700 transition hover:bg-gray-100 xl:hidden"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Mobile / Tablet Dropdown */}
          {mobileMenuOpen && (
            <div className="border-t border-gray-100 py-4 xl:hidden">
              <div className="flex flex-col gap-2">{renderNavLinks(true)}</div>
            </div>
          )}
        </div>
      </nav>

      {/* Request Leave Modal */}
      {showLeaveForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-3 sm:p-6">
          <div className="my-auto max-h-[95dvh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-4 shadow-xl sm:p-6">
            {/* Modal Header */}
            <div className="mb-5 flex items-start justify-between gap-3 sm:mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">
                  Request Leave
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Submit your leave request for approval.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close leave request form"
                onClick={handleCloseLeaveForm}
                className="shrink-0 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={22} />
              </button>
            </div>

            {/* Leave Form */}
            <form onSubmit={handleLeaveSubmit} className="space-y-4">
              {/* Employee */}
              <div>
                <label
                  htmlFor="leave-employee"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Employee
                </label>

                <select
                  id="leave-employee"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  required
                  className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select employee</option>

                  {employees.map((employee) => (
                    <option key={employee._id} value={employee._id}>
                      {employee.firstName} {employee.lastName} (
                      {employee.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              {/* Leave Type */}
              <div>
                <label
                  htmlFor="leave-type"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Leave Type
                </label>

                <select
                  id="leave-type"
                  name="leaveTypeId"
                  value={formData.leaveTypeId}
                  onChange={handleInputChange}
                  required
                  className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select leave type</option>

                  {leaveTypes
                    .filter((leaveType) => leaveType.isActive)
                    .map((leaveType) => (
                      <option key={leaveType._id} value={leaveType._id}>
                        {leaveType.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="min-w-0">
                  <label
                    htmlFor="leave-start-date"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Start Date
                  </label>

                  <input
                    id="leave-start-date"
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                    className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="min-w-0">
                  <label
                    htmlFor="leave-end-date"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    End Date
                  </label>

                  <input
                    id="leave-end-date"
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    min={formData.startDate || undefined}
                    required
                    className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label
                  htmlFor="leave-reason"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Reason
                </label>

                <textarea
                  id="leave-reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Enter reason for leave..."
                  className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Message */}
              {formMessage && (
                <div
                  role="status"
                  className={`break-words rounded-lg p-3 text-sm ${
                    formMessage.includes("successfully")
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {formMessage}
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCloseLeaveForm}
                  className="w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
