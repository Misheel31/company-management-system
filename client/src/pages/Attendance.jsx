import axios from "axios";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  Search,
  UserCheck,
  UserX,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";

function Attendance() {
  const [attendances, setAttendances] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  // Fetch attendance
  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://localhost:5000/api/attendances/",
        {
          withCredentials: true,
        },
      );

      setAttendances(response.data.attendances || []);
    } catch (error) {
      console.error("Failed to fetch attendance:", error);

      setError(error.response?.data?.message || "Failed to load attendance.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/employees/", {
        withCredentials: true,
      });

      setEmployees(response.data.employees || response.data || []);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    }
  };

  useEffect(() => {
    fetchAttendance();
    fetchEmployees();
  }, []);

  // Check whether attendance belongs to selected date
  const isSameDate = (attendanceDate, selectedDate) => {
    const date = new Date(attendanceDate);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}` === selectedDate;
  };

  // Attendance for selected date
  const selectedDateAttendance = useMemo(() => {
    return attendances.filter((attendance) =>
      isSameDate(attendance.date, selectedDate),
    );
  }, [attendances, selectedDate]);

  // Calculate summary
  const totalEmployees = employees.length;

  const presentCount = selectedDateAttendance.filter(
    (attendance) => attendance.status === "Present",
  ).length;

  const onLeaveCount = selectedDateAttendance.filter(
    (attendance) => attendance.status === "On Leave",
  ).length;

  const absentCount = Math.max(totalEmployees - presentCount - onLeaveCount, 0);

  // Search attendance
  const filteredAttendance = selectedDateAttendance.filter((attendance) => {
    const employee = attendance.employeeId;

    const employeeName = employee
      ? `${employee.firstName || ""} ${employee.lastName || ""}`
      : "";

    const employeeId = employee?.employeeId || "";
    const department = employee?.department || "";

    const search = searchTerm.toLowerCase();

    return (
      employeeName.toLowerCase().includes(search) ||
      employeeId.toLowerCase().includes(search) ||
      department.toLowerCase().includes(search)
    );
  });

  // Format date
  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage and monitor employee attendance.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 shadow-sm">
            <CalendarDays size={18} className="text-gray-500" />

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-sm font-medium text-gray-700 outline-none"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Employees */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Employees
                </p>

                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {totalEmployees}
                </h2>
              </div>

              <div className="rounded-lg bg-blue-50 p-3">
                <UserCheck size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          {/* Present */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Present</p>

                <h2 className="mt-2 text-3xl font-bold text-green-600">
                  {presentCount}
                </h2>
              </div>

              <div className="rounded-lg bg-green-50 p-3">
                <CheckCircle2 size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          {/* Absent */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Absent</p>

                <h2 className="mt-2 text-3xl font-bold text-red-600">
                  {absentCount}
                </h2>
              </div>

              <div className="rounded-lg bg-red-50 p-3">
                <UserX size={24} className="text-red-600" />
              </div>
            </div>
          </div>

          {/* On Leave */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">On Leave</p>

                <h2 className="mt-2 text-3xl font-bold text-orange-600">
                  {onLeaveCount}
                </h2>
              </div>

              <div className="rounded-lg bg-orange-50 p-3">
                <Clock3 size={24} className="text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* Table Header */}
          <div className="border-b border-gray-200 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Attendance Records
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {formatDate(selectedDate)}
                </p>
              </div>

              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search employee..."
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center px-6 py-16">
              <div className="text-sm text-gray-500">Loading attendance...</div>
            </div>
          ) : filteredAttendance.length === 0 ? (
            /* Empty State */
            <div className="px-6 py-16 text-center">
              <ClipboardEmpty />

              <h3 className="mt-4 text-lg font-semibold text-gray-800">
                No attendance records
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                No attendance records were found for this date.
              </p>
            </div>
          ) : (
            /* Table */
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Employee
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Department
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Date
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAttendance.map((attendance) => {
                    const employee = attendance.employeeId;

                    return (
                      <tr
                        key={attendance._id}
                        className="border-b border-gray-100 transition hover:bg-gray-50"
                      >
                        {/* Employee */}
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {employee?.firstName} {employee?.lastName}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {employee?.employeeId || "-"}
                            </p>
                          </div>
                        </td>

                        {/* Department */}
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {employee?.department || "-"}
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(attendance.date)}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <StatusBadge status={attendance.status} />
                        </td>

                        {/* Action */}
                        <td className="px-6 py-4">
                          {employee?._id ? (
                            <Link
                              to={`/employees/${employee._id}`}
                              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                            >
                              <Eye size={16} />
                              View
                            </Link>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Status badge
function StatusBadge({ status }) {
  const styles = {
    Present: "bg-green-50 text-green-700 border-green-200",
    Absent: "bg-red-50 text-red-700 border-red-200",
    "On Leave": "bg-orange-50 text-orange-700 border-orange-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[status] || "bg-gray-50 text-gray-700 border-gray-200"
      }`}
    >
      {status || "Unknown"}
    </span>
  );
}

// Empty state icon
function ClipboardEmpty() {
  return (
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
      <Clock3 size={24} className="text-gray-400" />
    </div>
  );
}

export default Attendance;
