import axios from "axios";
import {
  CalendarDays,
  CheckCircle,
  Edit,
  Plus,
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Navbar from "./Navbar";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/leave-types`;

const emptyForm = {
  name: "",
  description: "",
  maxDays: "",
};

function LeaveTypes() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role === "Admin";

  // Fetch leave types
  const fetchLeaveTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_URL, {
        withCredentials: true,
      });

      setLeaveTypes(response.data.leaveTypes || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch leave types.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaveTypes();
  }, [fetchLeaveTypes]);

  // Handle form changes
  const handleChange = (e) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  // Open create form
  const handleAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  // Open edit form
  const handleEdit = (leaveType) => {
    setForm({
      name: leaveType.name,
      description: leaveType.description || "",
      maxDays: String(leaveType.maxDays),
    });

    setEditingId(leaveType._id);
    setShowForm(true);
  };

  // Create or update leave type
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        maxDays: Number(form.maxDays),
      };

      if (
        !payload.name ||
        !Number.isInteger(payload.maxDays) ||
        payload.maxDays < 1
      ) {
        alert("Enter a valid name and maximum number of days.");
        return;
      }

      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, payload, {
          withCredentials: true,
        });

        alert("Leave type updated successfully.");
      } else {
        await axios.post(API_URL, payload, {
          withCredentials: true,
        });

        alert("Leave type created successfully.");
      }

      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);

      fetchLeaveTypes();
    } catch (err) {
      alert(err.response?.data?.message || "Unable to save leave type.");
    }
  };

  // Activate / deactivate
  const handleToggleStatus = async (leaveType) => {
    try {
      await axios.put(
        `${API_URL}/${leaveType._id}`,
        { isActive: !leaveType.isActive },
        { withCredentials: true },
      );

      fetchLeaveTypes();
    } catch (err) {
      alert(err.response?.data?.message || "Unable to update leave type.");
    }
  };

  // Delete leave type
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this leave type?",
    );

    if (!confirmed) return;

    try {
      await axios.delete(`${API_URL}/${id}`, {
        withCredentials: true,
      });

      fetchLeaveTypes();
    } catch (err) {
      alert(err.response?.data?.message || "Unable to delete leave type.");
    }
  };

  // Search
  const filteredLeaveTypes = leaveTypes.filter((leaveType) =>
    `${leaveType.name} ${leaveType.description || ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const activeCount = leaveTypes.filter((item) => item.isActive).length;

  const inactiveCount = leaveTypes.length - activeCount;

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Leave Types</h1>

              <p className="mt-2 text-gray-500">
                Manage company leave categories and allowed days.
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={handleAdd}
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
              >
                <Plus size={19} />
                Add Leave Type
              </button>
            )}
          </div>

          {/* Summary */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryCard
              title="Total Leave Types"
              count={leaveTypes.length}
              icon={<CalendarDays />}
            />

            <SummaryCard
              title="Active"
              count={activeCount}
              icon={<CheckCircle />}
            />

            <SummaryCard
              title="Inactive"
              count={inactiveCount}
              icon={<XCircle />}
            />
          </div>

          {/* Form */}
          {showForm && (
            <div className="mb-8 rounded-xl border bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">
                  {editingId ? "Edit Leave Type" : "Add Leave Type"}
                </h2>

                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <X />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Leave Type Name *
                  </label>

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Sick Leave"
                    className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Describe this leave type..."
                    className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Maximum Days *
                  </label>

                  <input
                    type="number"
                    name="maxDays"
                    value={form.maxDays}
                    onChange={handleChange}
                    min="1"
                    step="1"
                    required
                    placeholder="Enter maximum allowed days"
                    className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
                  >
                    {editingId ? "Save Changes" : "Create Leave Type"}
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

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search leave types..."
                className="w-full rounded-lg border bg-white py-3 pl-10 pr-4 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Leave type list */}
          {loading ? (
            <p className="py-10 text-center text-gray-500">
              Loading leave types...
            </p>
          ) : error ? (
            <p className="py-10 text-center text-red-500">{error}</p>
          ) : filteredLeaveTypes.length === 0 ? (
            <div className="rounded-xl border bg-white py-16 text-center">
              <CalendarDays size={40} className="mx-auto mb-3 text-gray-400" />

              <h3 className="text-lg font-semibold text-gray-700">
                No leave types found
              </h3>

              <p className="mt-1 text-gray-500">
                {search
                  ? "Try a different search."
                  : "Create your first leave type to get started."}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left">
                  <thead className="bg-gray-100 text-sm text-gray-600">
                    <tr>
                      <th className="px-6 py-4">Leave Type</th>
                      <th className="px-6 py-4">Description</th>
                      <th className="px-6 py-4">Maximum Days</th>
                      <th className="px-6 py-4">Status</th>
                      {isAdmin && <th className="px-6 py-4">Actions</th>}
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {filteredLeaveTypes.map((leaveType) => (
                      <tr key={leaveType._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-800">
                          {leaveType.name}
                        </td>

                        <td className="max-w-xs px-6 py-4 text-sm text-gray-500">
                          {leaveType.description || "No description"}
                        </td>

                        <td className="px-6 py-4 text-gray-700">
                          {leaveType.maxDays} days
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              leaveType.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {leaveType.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        {isAdmin && (
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(leaveType)}
                                title="Edit"
                                className="rounded-lg border p-2 text-blue-600 hover:bg-blue-50"
                              >
                                <Edit size={17} />
                              </button>

                              <button
                                onClick={() => handleToggleStatus(leaveType)}
                                title={
                                  leaveType.isActive ? "Deactivate" : "Activate"
                                }
                                className="rounded-lg border p-2 text-amber-600 hover:bg-amber-50"
                              >
                                {leaveType.isActive ? (
                                  <XCircle size={17} />
                                ) : (
                                  <CheckCircle size={17} />
                                )}
                              </button>

                              <button
                                onClick={() => handleDelete(leaveType._id)}
                                title="Delete"
                                className="rounded-lg border p-2 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 size={17} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Summary card
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

export default LeaveTypes;
