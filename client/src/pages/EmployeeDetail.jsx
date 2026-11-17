import axios from "axios";
import {
  ArrowLeft,
  CalendarCheck,
  Clock,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "./Navbar";

function EmployeeDetails() {
  const { id } = useParams();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(true);

  // FETCH EMPLOYEE
  const fetchEmployee = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `http://localhost:5000/api/employees/${id}`,
      );

      setEmployee(response.data.employee);
    } catch (error) {
      console.error("Employee details error:", error);
      setError(error.response?.data?.message || "Failed to load employee.");
    } finally {
      setLoading(false);
    }
  };

  // FETCH ATTENDANCE HISTORY
  const fetchAttendanceHistory = async () => {
    try {
      setAttendanceLoading(true);

      const response = await axios.get(
        `http://localhost:5000/api/attendances/employee/${id}`,
      );

      setAttendanceHistory(response.data.attendances || []);
    } catch (error) {
      console.error("Attendance history error:", error);
      setAttendanceHistory([]);
    } finally {
      setAttendanceLoading(false);
    }
  };

  // INITIAL LOAD
  useEffect(() => {
    fetchEmployee();
    fetchAttendanceHistory();
  }, [id]);

  // FIND TODAY'S ATTENDANCE
  const today = new Date();

  const todayAttendance = attendanceHistory.find((attendance) => {
    const attendanceDate = new Date(attendance.date);

    return (
      attendanceDate.getFullYear() === today.getFullYear() &&
      attendanceDate.getMonth() === today.getMonth() &&
      attendanceDate.getDate() === today.getDate()
    );
  });

  // LOADING
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-gray-600">
        <div className="text-sm font-medium">Loading employee...</div>
      </div>
    );
  }

  // ERROR
  if (error) {
    return (
      <div className="min-h-screen bg-white p-8 text-center">
        <p className="text-red-600">{error}</p>

        <Link
          to="/employees"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft size={16} />
          Back to Employees
        </Link>
      </div>
    );
  }

  // EMPLOYEE NOT FOUND
  if (!employee) {
    return (
      <div className="min-h-screen bg-white p-8 text-center">
        <p className="text-gray-600">Employee not found.</p>

        <Link
          to="/employees"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft size={16} />
          Back to Employees
        </Link>
      </div>
    );
  }

  // PAGE
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />

      {/* HEADER */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <Link
            to="/employees"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-blue-600"
          >
            <ArrowLeft size={16} />
            Back to Employees
          </Link>
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* EMPLOYEE PROFILE */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-blue-600">
              <UserRound size={42} />
            </div>

            <div>
              <p className="text-sm font-semibold text-blue-600">
                {employee.employeeId}
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
                {employee.firstName} {employee.lastName}
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                {employee.department || "No department assigned"}
              </p>
            </div>
          </div>
        </section>

        {/* EMPLOYEE INFORMATION + TODAY'S ATTENDANCE */}
        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* EMPLOYEE INFORMATION */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Employee Information
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Personal and employment details
                </p>
              </div>

              <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
                <UserRound size={20} />
              </div>
            </div>

            <div className="mt-6 divide-y divide-gray-100">
              <InfoRow
                icon={<Mail size={18} />}
                label="Email"
                value={employee.email || "Not provided"}
              />

              <InfoRow
                icon={<Phone size={18} />}
                label="Phone"
                value={employee.phone || "Not provided"}
              />

              <InfoRow
                icon={<MapPin size={18} />}
                label="Address"
                value={employee.address || "Not provided"}
              />

              <InfoRow
                icon={<CalendarCheck size={18} />}
                label="Joining Date"
                value={
                  employee.joiningDate
                    ? new Date(employee.joiningDate).toLocaleDateString()
                    : "Not provided"
                }
              />
            </div>
          </div>

          {/* TODAY'S ATTENDANCE */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Today's Attendance
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                <CalendarCheck size={22} className="text-blue-600" />
              </div>
            </div>

            {/* ATTENDANCE STATUS */}
            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-gray-600">
                  Attendance Status
                </span>

                {todayAttendance ? (
                  <StatusBadge status={todayAttendance.status} />
                ) : (
                  <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-600">
                    Not Marked
                  </span>
                )}
              </div>

              {!todayAttendance && (
                <p className="mt-4 text-xs leading-5 text-gray-500">
                  No attendance has been recorded for this employee today.
                </p>
              )}

              {todayAttendance && (
                <p className="mt-4 text-sm text-gray-600">
                  Attendance has been recorded for today.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ATTENDANCE HISTORY */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* HISTORY HEADER */}
          <div className="flex flex-col gap-3 border-b border-gray-200 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Attendance History
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Employee attendance records
              </p>
            </div>

            <span className="inline-flex w-fit items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {attendanceHistory.length}{" "}
              {attendanceHistory.length === 1 ? "Record" : "Records"}
            </span>
          </div>

          {/* HISTORY TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[450px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 font-semibold text-gray-600">
                    Date
                  </th>

                  <th className="px-6 py-4 font-semibold text-gray-600">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {attendanceLoading ? (
                  <tr>
                    <td
                      colSpan="2"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      Loading attendance records...
                    </td>
                  </tr>
                ) : attendanceHistory.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="px-6 py-12 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                        <Clock size={22} className="text-gray-400" />
                      </div>

                      <p className="mt-3 font-medium text-gray-700">
                        No attendance records
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Attendance history will appear here once records are
                        created.
                      </p>
                    </td>
                  </tr>
                ) : (
                  attendanceHistory.map((attendance) => (
                    <tr
                      key={attendance._id}
                      className="border-b border-gray-100 transition last:border-b-0 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 font-medium text-gray-700">
                        {new Date(attendance.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={attendance.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

// INFO ROW COMPONENT
function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-gray-500">{label}</p>

        <p className="mt-1 break-words text-sm font-medium text-gray-900">
          {value}
        </p>
      </div>
    </div>
  );
}

// ATTENDANCE STATUS BADGE
function StatusBadge({ status }) {
  const styles = {
    Present: "border-green-200 bg-green-50 text-green-700",
    Absent: "border-red-200 bg-red-50 text-red-700",
    "On Leave": "border-orange-200 bg-orange-50 text-orange-700",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[status] || "border-gray-200 bg-gray-50 text-gray-600"
      }`}
    >
      {status || "Unknown"}
    </span>
  );
}

export default EmployeeDetails;
