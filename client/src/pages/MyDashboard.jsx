import axios from "axios";
import {
  BriefcaseBusiness,
  Building2,
  CalendarCheck,
  CalendarDays,
  Clock,
  KeyRound,
  ListTodo,
  LoaderCircle,
  LogOut,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const TASK_API_URL = `${API_URL}/api/tasks`;

function MyDashboard() {
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [error, setError] = useState("");

  // Change password states
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Fetch assigned tasks
  const fetchMyTasks = useCallback(async () => {
    try {
      setTasksLoading(true);

      const response = await axios.get(TASK_API_URL, {
        withCredentials: true,
      });

      setMyTasks(response.data.tasks || []);
    } catch (err) {
      console.error("Task loading error:", err);
      setMyTasks([]);
    } finally {
      setTasksLoading(false);
    }
  }, []);

  // Fetch employee profile
  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/auth/me`, {
          withCredentials: true,
        });

        setEmployee(response.data.user.employee);
      } catch (err) {
        console.error("Profile loading error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load your profile. Please log in again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMyProfile();
    fetchMyTasks();
  }, [fetchMyTasks]);

  // Handle password input
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setPasswordMessage("");
    setPasswordError("");
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setPasswordError("Please fill in all password fields.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      setPasswordLoading(true);

      const response = await axios.post(
        `${API_URL}/api/auth/change-password`,
        passwordData,
        { withCredentials: true },
      );

      setPasswordMessage(
        response.data.message || "Password changed successfully.",
      );

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Change password error:", err);

      setPasswordError(
        err.response?.data?.message ||
          "Unable to change password. Please try again.",
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await axios.post(
        `${API_URL}/api/auth/logout`,
        {},
        { withCredentials: true },
      );
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    }
  };

  // Update task status
  const handleStatusChange = async (taskId, status) => {
    try {
      await axios.put(
        `${TASK_API_URL}/${taskId}`,
        { status },
        { withCredentials: true },
      );

      await fetchMyTasks();
    } catch (err) {
      alert(err.response?.data?.message || "Unable to update task status.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderCircle className="animate-spin" size={32} />
        <p className="ml-3">Loading your dashboard...</p>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <p className="text-red-600 mb-4">
          {error || "Employee profile not found."}
        </p>

        <button
          onClick={handleLogout}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg"
        >
          Back to Login
        </button>
      </div>
    );
  }

  const fullName = `${employee.firstName} ${employee.lastName}`;

  const todoCount = myTasks.filter((task) => task.status === "Pending").length;

  const progressCount = myTasks.filter(
    (task) => task.status === "In Progress",
  ).length;

  const completedCount = myTasks.filter(
    (task) => task.status === "Completed",
  ).length;

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "No due date";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}

      {/* Navbar */}
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Company Management System
          </h1>
          <p className="text-sm text-gray-500">Employee Portal</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Profile Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProfileMenu((prev) => !prev)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
              title="Profile menu"
            >
              <UserRound size={21} />
            </button>

            {showProfileMenu && (
              <>
                <button
                  type="button"
                  aria-label="Close profile menu"
                  className="fixed inset-0 z-10 cursor-default"
                  onClick={() => setShowProfileMenu(false)}
                />

                <div className="absolute right-0 top-12 z-20 w-56 bg-white border rounded-xl shadow-lg py-2">
                  <div className="px-4 py-3 border-b">
                    <p className="font-semibold text-gray-800">{fullName}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {employee.email}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      setPasswordMessage("");
                      setPasswordError("");
                      setShowChangePassword(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <KeyRound size={17} />
                    Change Password
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </nav>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
                  <KeyRound size={22} />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Change Password
                  </h3>
                  <p className="text-sm text-gray-500">
                    Update your account password.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowChangePassword(false)}
                className="text-gray-400 hover:text-gray-700 text-2xl"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  autoComplete="current-password"
                  placeholder="Enter current password"
                  className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  autoComplete="new-password"
                  placeholder="Enter new password"
                  className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  minLength={6}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  At least 6 characters.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  autoComplete="new-password"
                  placeholder="Confirm new password"
                  className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {passwordError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                  {passwordError}
                </div>
              )}

              {passwordMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm">
                  {passwordMessage}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangePassword(false)}
                  className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg"
                >
                  {passwordLoading ? (
                    <>
                      <LoaderCircle size={17} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Password"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto p-6">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome back, {employee.firstName}!
          </h2>

          <p className="text-gray-500 mt-1">
            Here is your personal employee dashboard.
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-blue-100 text-blue-600 p-4 rounded-full">
              <UserRound size={32} />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                {fullName}
              </h3>

              <p className="text-gray-500">
                Employee ID: {employee.employeeId}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProfileItem icon={<Mail />} label="Email" value={employee.email} />

            <ProfileItem
              icon={<Phone />}
              label="Phone"
              value={employee.phone}
            />

            <ProfileItem
              icon={<Building2 />}
              label="Department"
              value={employee.department}
            />

            <ProfileItem
              icon={<MapPin />}
              label="Address"
              value={employee.address}
            />

            <ProfileItem
              icon={<BriefcaseBusiness />}
              label="Joining Date"
              value={
                employee.joiningDate
                  ? new Date(employee.joiningDate).toLocaleDateString()
                  : "Not provided"
              }
            />
          </div>
        </div>

        {/* Assigned Tasks */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <ListTodo className="text-blue-600" size={24} />

                <h3 className="text-xl font-semibold text-gray-800">
                  My Assigned Tasks
                </h3>
              </div>

              <p className="text-sm text-gray-500 mt-1">
                Work assigned to you by the Admin.
              </p>
            </div>

            <Link
              to="/workspace"
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Open Workspace →
            </Link>
          </div>

          {/* Task Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <TaskSummary title="Pending" count={todoCount} color="gray" />

            <TaskSummary
              title="In Progress"
              count={progressCount}
              color="blue"
            />

            <TaskSummary
              title="Completed"
              count={completedCount}
              color="green"
            />
          </div>

          {/* Task List */}
          {tasksLoading ? (
            <div className="flex justify-center items-center py-10">
              <LoaderCircle className="animate-spin text-blue-600" size={28} />
              <span className="ml-3 text-gray-500">Loading your tasks...</span>
            </div>
          ) : myTasks.length === 0 ? (
            <div className="rounded-lg bg-gray-50 py-12 text-center">
              <ListTodo className="mx-auto mb-3 text-gray-400" size={40} />

              <h4 className="font-semibold text-gray-700">
                No tasks assigned yet
              </h4>

              <p className="text-sm text-gray-500 mt-1">
                Your assigned tasks will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myTasks.map((task) => (
                <div
                  key={task._id}
                  className="rounded-lg border p-4 hover:shadow-sm transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {task.title}
                      </h4>

                      <p className="text-sm text-gray-500 mt-1 whitespace-pre-wrap">
                        {task.description || "No description provided."}
                      </p>
                    </div>

                    <TaskStatusBadge status={task.status} />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
                    <span>Priority: {task.priority}</span>
                    <span>Due: {formatDate(task.dueDate)}</span>
                  </div>

                  <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <label className="text-sm text-gray-600 font-medium">
                      Update Progress
                    </label>

                    <select
                      value={task.status}
                      onChange={(e) =>
                        handleStatusChange(task._id, e.target.value)
                      }
                      className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dashboard Modules */}
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          My Activities
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <DashboardCard
            icon={<CalendarCheck size={26} />}
            title="My Attendance"
            description="View your attendance and attendance records."
            link="/my-attendance"
          />

          <DashboardCard
            icon={<CalendarDays size={26} />}
            title="My Leave"
            description="Submit leave requests and check their status."
            link="/my-leaves"
          />

          <DashboardCard
            icon={<Clock size={26} />}
            title="Leave Balance"
            description="View your available and used leave."
            link="/my-leave-balance"
          />
        </div>
      </main>
    </div>
  );
}

// Profile information
function ProfileItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-blue-600 mt-1">{icon}</div>

      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium text-gray-800">{value || "Not provided"}</p>
      </div>
    </div>
  );
}

// Dashboard module card
function DashboardCard({ icon, title, description, link }) {
  return (
    <Link
      to={link}
      className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition"
    >
      <div className="text-blue-600 mb-4">{icon}</div>
      <h4 className="font-semibold text-gray-800 mb-2">{title}</h4>
      <p className="text-sm text-gray-500">{description}</p>
    </Link>
  );
}

// Task summary card
function TaskSummary({ title, count, color }) {
  const colors = {
    gray: "bg-gray-100 text-gray-700",
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
  };

  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`mt-2 text-2xl font-bold ${colors[color]}`}>{count}</p>
    </div>
  );
}

// Task status badge
function TaskStatusBadge({ status }) {
  const styles = {
    Pending: "bg-gray-100 text-gray-700",
    "In Progress": "bg-blue-100 text-blue-700",
    Completed: "bg-green-100 text-green-700",
  };

  return (
    <span
      className={`w-fit whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
        styles[status] || styles.Pending
      }`}
    >
      {status}
    </span>
  );
}

export default MyDashboard;
