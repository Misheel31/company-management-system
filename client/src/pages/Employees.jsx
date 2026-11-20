import axios from "axios";
import { ArrowLeft, Plus, Search, UserRound, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    employeeId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    department: "",
    joiningDate: new Date().toISOString().slice(0, 10),
  });

  const handleAddEmployee = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      await axios.post(`${API_URL}/api/employees`, {
        ...form,
        employeeId: form.employeeId.trim().toUpperCase(),
        email: form.email.trim().toLowerCase(),
      });

      setShowAddForm(false);

      setForm({
        employeeId: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        department: "",
        joiningDate: new Date().toISOString().slice(0, 10),
      });

      await fetchEmployees();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create employee.");
    } finally {
      setSaving(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${API_URL}/api/employees`);

      setEmployees(
        response.data.employees ||
          (Array.isArray(response.data) ? response.data : []),
      );
    } catch (error) {
      console.error("Employees error:", error);

      setError(error.response?.data?.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter((employee) => {
    const searchText = search.toLowerCase();

    return (
      employee.employeeId?.toLowerCase().includes(searchText) ||
      employee.firstName?.toLowerCase().includes(searchText) ||
      employee.lastName?.toLowerCase().includes(searchText) ||
      employee.email?.toLowerCase().includes(searchText) ||
      employee.department?.toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Navbar />
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleAddEmployee}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Add New Employee
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Enter the employee's information.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                ["employeeId", "Employee ID", "EMP007"],
                ["firstName", "First Name", "Enter first name"],
                ["lastName", "Last Name", "Enter last name"],
                ["email", "Work Email", "employee@example.com"],
                ["phone", "Phone", "Enter phone number"],
                ["department", "Department", "Enter department"],
              ].map(([name, label, placeholder]) => (
                <label key={name} className="block">
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    {label}
                    {["employeeId", "firstName", "lastName", "email"].includes(
                      name,
                    )
                      ? " *"
                      : ""}
                  </span>

                  <input
                    name={name}
                    type={name === "email" ? "email" : "text"}
                    required={[
                      "employeeId",
                      "firstName",
                      "lastName",
                      "email",
                    ].includes(name)}
                    value={form[name]}
                    onChange={(event) =>
                      setForm({ ...form, [name]: event.target.value })
                    }
                    placeholder={placeholder}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              ))}

              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-gray-700">
                  Address
                </span>
                <textarea
                  value={form.address}
                  onChange={(event) =>
                    setForm({ ...form, address: event.target.value })
                  }
                  rows={2}
                  placeholder="Enter address"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-gray-700">
                  Joining Date *
                </span>
                <input
                  type="date"
                  required
                  value={form.joiningDate}
                  onChange={(event) =>
                    setForm({ ...form, joiningDate: event.target.value })
                  }
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="rounded-xl border border-gray-200 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Employee"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Page Header */}
      <header className="border-b border-blue-100 bg-gradient-to-r from-white to-blue-50/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="min-w-0">
            <Link
              to="/"
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-blue-600"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>

            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Employees
            </h1>

            <p className="mt-2 text-sm text-gray-500 sm:text-base">
              Manage employee information and attendance.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setError("");
              setShowAddForm(true);
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 md:w-auto"
          >
            <Plus size={18} />
            Add Employee
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Employee Summary */}
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users size={22} />
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">
                Employee Directory
              </h2>

              <p className="text-sm text-gray-500">
                Search and view your team members
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            {filteredEmployees.length}{" "}
            {filteredEmployees.length === 1 ? "employee" : "employees"}
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-blue-100 bg-white px-4 shadow-sm transition focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50">
          <Search size={20} className="shrink-0 text-blue-500" />

          <input
            type="text"
            placeholder="Search by employee ID, name, email or department..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="min-w-0 flex-1 bg-transparent py-3.5 text-sm text-gray-800 outline-none placeholder:text-gray-400"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="shrink-0 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Clear
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-blue-100 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

            <p className="mt-4 text-sm text-gray-500">Loading employees...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm text-red-700">{error}</p>

            <button
              type="button"
              onClick={fetchEmployees}
              className="mt-4 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredEmployees.length === 0 && (
          <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/30 px-5 py-12 text-center sm:py-16">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-white text-blue-500 shadow-sm">
              <UserRound size={28} />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              No employees found
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
              {search
                ? "Try another name, employee ID, email, or department."
                : "Your employee directory is empty."}
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-800"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Employee Cards */}
        {!loading && !error && filteredEmployees.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredEmployees.map((employee) => (
              <article
                key={employee._id}
                className="group flex min-w-0 flex-col rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md sm:p-6"
              >
                {/* Employee Profile */}
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 transition group-hover:bg-blue-100">
                    <UserRound size={24} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-semibold text-gray-900">
                      {employee.firstName} {employee.lastName}
                    </h2>

                    <p className="mt-1 text-sm font-medium text-blue-600">
                      {employee.employeeId}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="my-5 border-t border-blue-50" />

                {/* Employee Information */}
                <div className="flex-1 space-y-4 text-sm">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <span className="shrink-0 text-gray-500">Department</span>

                    <span className="break-words font-medium text-gray-800 sm:text-right">
                      {employee.department || "—"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <span className="shrink-0 text-gray-500">Email</span>

                    <span
                      title={employee.email}
                      className="min-w-0 break-all font-medium text-gray-700 sm:max-w-[65%] sm:text-right"
                    >
                      {employee.email || "—"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <span className="shrink-0 text-gray-500">Phone</span>

                    <span className="break-words font-medium text-gray-800 sm:text-right">
                      {employee.phone || "—"}
                    </span>
                  </div>
                </div>

                {/* View Employee Button */}
                <Link
                  to={`/employees/${employee._id}`}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-blue-200 bg-blue-50/60 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:border-blue-500 hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-100"
                >
                  View Employee
                  <ArrowLeft
                    size={16}
                    className="ml-2 rotate-180 transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Employees;
