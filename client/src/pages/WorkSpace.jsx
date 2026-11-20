import axios from "axios";
import {
  CheckCircle,
  Clock,
  ListTodo,
  Pencil,
  Plus,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Navbar from "./Navbar";

const BASE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const API_URL = `${BASE_API_URL}/api/tasks`;
const EMPLOYEE_API_URL = `${BASE_API_URL}/api/employees`;

const emptyForm = {
  title: "",
  description: "",
  priority: "Medium",
  dueDate: "",
  employeeId: "",
};

function WorkSpace() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role === "Admin";

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_URL, {
        withCredentials: true,
      });

      setTasks(response.data.tasks || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch employees for Admin assignment dropdown
  const fetchEmployees = useCallback(async () => {
    try {
      const response = await axios.get(EMPLOYEE_API_URL, {
        withCredentials: true,
      });

      setEmployees(response.data.employees || []);
    } catch (err) {
      console.error(
        "Error fetching employees:",
        err.response?.data || err.message,
      );
    }
  }, []);

  useEffect(() => {
    fetchTasks();

    if (isAdmin) {
      fetchEmployees();
    }
  }, [fetchTasks, fetchEmployees, isAdmin]);

  // Handle form changes
  const handleChange = (e) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  // Create or update task
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        title: form.title,
        description: form.description,
        priority: form.priority,
        dueDate: form.dueDate || null,
      };

      // Only Admin can assign or reassign employees
      if (isAdmin) {
        if (!form.employeeId) {
          alert("Please select an employee.");
          return;
        }

        payload.employeeId = form.employeeId;
      }

      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, payload, {
          withCredentials: true,
        });

        alert("Task updated successfully.");
      } else {
        await axios.post(API_URL, payload, {
          withCredentials: true,
        });

        alert("Task created successfully.");
      }

      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);

      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || "Unable to save task.");
    }
  };

  // Edit task
  const handleEdit = (task) => {
    setForm({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "Medium",
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : "",
      employeeId: task.employeeId?._id || task.employeeId || "",
    });

    setEditingId(task._id);
    setShowForm(true);
  };

  // Update task status
  const handleStatusChange = async (taskId, status) => {
    try {
      await axios.put(
        `${API_URL}/${taskId}`,
        { status },
        { withCredentials: true },
      );

      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || "Unable to update status.");
    }
  };

  // Delete task
  const handleDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/${taskId}`, {
        withCredentials: true,
      });

      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || "Unable to delete task.");
    }
  };

  // Filter tasks
  const filteredTasks =
    filter === "All" ? tasks : tasks.filter((task) => task.status === filter);

  // Task counts
  const todoCount = tasks.filter((task) => task.status === "Pending").length;

  const progressCount = tasks.filter(
    (task) => task.status === "In Progress",
  ).length;

  const completedCount = tasks.filter(
    (task) => task.status === "Completed",
  ).length;

  // Date formatting
  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "No due date";

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Page heading */}
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {isAdmin ? "Team WorkSpace" : "My WorkSpace"}
              </h1>

              <p className="mt-2 text-gray-500">
                Manage your daily work and track task progress.
              </p>
            </div>

            <button
              onClick={() => {
                setForm(emptyForm);
                setEditingId(null);
                setShowForm(true);
              }}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
            >
              <Plus size={19} />
              Add New Task
            </button>
          </div>

          {/* Task summary */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryCard
              title="Pending"
              count={todoCount}
              icon={<ListTodo />}
            />

            <SummaryCard
              title="In Progress"
              count={progressCount}
              icon={<Clock />}
            />

            <SummaryCard
              title="Completed"
              count={completedCount}
              icon={<CheckCircle />}
            />
          </div>

          {/* Add/Edit form */}
          {showForm && (
            <div className="mb-8 rounded-xl border bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">
                  {editingId ? "Edit Task" : "Add New Task"}
                </h2>

                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                  className="text-gray-500 hover:text-red-500"
                >
                  <X />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Task title */}
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Task Title *
                  </label>

                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    placeholder="What are you working on?"
                    className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Describe your task..."
                    className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
                  />
                </div>

                {/* Assign employee - Admin only */}
                {isAdmin && (
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Assign To *
                    </label>

                    <select
                      name="employeeId"
                      value={form.employeeId}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
                    >
                      <option value="">Select Employee</option>

                      {employees.map((employee) => (
                        <option key={employee._id} value={employee._id}>
                          {employee.firstName} {employee.lastName} (
                          {employee.employeeId})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Priority and due date */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Priority
                    </label>

                    <select
                      name="priority"
                      value={form.priority}
                      onChange={handleChange}
                      className="w-full rounded-lg border p-3"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Due Date
                    </label>

                    <input
                      type="date"
                      name="dueDate"
                      value={form.dueDate}
                      onChange={handleChange}
                      className="w-full rounded-lg border p-3"
                    />
                  </div>
                </div>

                {/* Form buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
                  >
                    {editingId ? "Save Changes" : "Create Task"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      setForm(emptyForm);
                    }}
                    className="rounded-lg border px-6 py-3 text-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-2">
            {["All", "Pending", "In Progress", "Completed"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  filter === status
                    ? "bg-blue-600 text-white"
                    : "border bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Task list */}
          {loading ? (
            <p className="py-10 text-center text-gray-500">Loading tasks...</p>
          ) : error ? (
            <p className="py-10 text-center text-red-500">{error}</p>
          ) : filteredTasks.length === 0 ? (
            <div className="rounded-xl border bg-white py-16 text-center">
              <ListTodo className="mx-auto mb-3 text-gray-400" size={40} />

              <h3 className="text-lg font-semibold text-gray-700">
                No tasks found
              </h3>

              <p className="mt-1 text-gray-500">
                Add a task to start tracking your work.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredTasks.map((task) => (
                <div
                  key={task._id}
                  className="rounded-xl border bg-white p-5 shadow-sm"
                >
                  {/* Task heading */}
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {task.title}
                      </h3>

                      {/* Assigned employee */}
                      {task.employeeId && (
                        <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                          <UserRound size={15} />
                          Assigned to: {task.employeeId.firstName}{" "}
                          {task.employeeId.lastName}
                        </p>
                      )}
                    </div>

                    <StatusBadge status={task.status} />
                  </div>

                  {/* Description */}
                  <p className="mb-4 whitespace-pre-wrap text-sm text-gray-600">
                    {task.description || "No description provided."}
                  </p>

                  {/* Priority and due date */}
                  <div className="mb-4 flex flex-wrap gap-3 text-xs text-gray-500">
                    <span>Priority: {task.priority}</span>

                    <span>Due: {formatDate(task.dueDate)}</span>
                  </div>

                  {/* Task actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                    <select
                      value={task.status}
                      onChange={(e) =>
                        handleStatusChange(task._id, e.target.value)
                      }
                      className="rounded-lg border p-2 text-sm"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(task)}
                        title="Edit task"
                        className="rounded-lg border p-2 text-blue-600 hover:bg-blue-50"
                      >
                        <Pencil size={17} />
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(task._id)}
                          title="Delete task"
                          className="rounded-lg border p-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={17} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Summary card component
function SummaryCard({ title, count, icon }) {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-white p-5 shadow-sm">
      <div>
        <p className="text-sm text-gray-500">{title}</p>

        <p className="mt-2 text-2xl font-bold text-gray-800">{count}</p>
      </div>

      <div className="rounded-lg bg-blue-50 p-3 text-blue-600">{icon}</div>
    </div>
  );
}

// Task status badge
function StatusBadge({ status }) {
  const styles = {
    "To Do": "bg-gray-100 text-gray-700",
    "In Progress": "bg-blue-100 text-blue-700",
    Completed: "bg-green-100 text-green-700",
  };

  return (
    <span
      className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
        styles[status] || styles["To Do"]
      }`}
    >
      {status}
    </span>
  );
}

export default WorkSpace;
