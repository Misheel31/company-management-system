import axios from "axios";
import {
  BriefcaseBusiness,
  Building2,
  CalendarCheck,
  CalendarDays,
  Clock,
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
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Company Management System
          </h1>

          <p className="text-sm text-gray-500">Employee Portal</p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg"
        >
          <LogOut size={18} />
          Logout
        </button>
      </nav>

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

                  {/* Employee can update task progress */}
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
            description="View your attendance and check-in/check-out records."
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
        styles[status] || styles["To Do"]
      }`}
    >
      {status}
    </span>
  );
}

export default MyDashboard;
