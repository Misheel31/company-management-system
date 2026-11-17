import axios from "axios";
import { ArrowLeft, CalendarCheck, Clock, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API = "http://localhost:5000/api/attendances";

function MyAttendance() {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const storedUser = JSON.parse(localStorage.getItem("user") || "null");

  const employeeId =
    typeof storedUser?.employeeId === "object"
      ? storedUser?.employeeId?._id
      : storedUser?.employeeId;

  // Fetch attendance history
  const fetchAttendance = useCallback(async () => {
    if (!employeeId) {
      setError("Employee information not found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setError("");

      const response = await axios.get(`${API}/employee/${employeeId}`, {
        withCredentials: true,
      });

      setAttendances(response.data.attendances || []);
    } catch (err) {
      console.error("Attendance fetch error:", err);

      setError(
        err.response?.data?.message || "Unable to load attendance history.",
      );
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // Check today's attendance
  const today = new Date();

  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date(today);
  endOfToday.setHours(23, 59, 59, 999);

  const todayAttendance = attendances.find((record) => {
    const recordDate = new Date(record.date);

    return recordDate >= startOfToday && recordDate <= endOfToday;
  });

  // Mark Present
  const handleMarkPresent = async () => {
    try {
      setProcessing(true);
      setError("");
      setMessage("");

      await axios.post(
        `${API}/check-in/${employeeId}`,
        {},
        {
          withCredentials: true,
        },
      );

      setMessage("Your attendance has been marked Present.");

      await fetchAttendance();
    } catch (err) {
      console.error("Mark attendance error:", err);

      setError(err.response?.data?.message || "Unable to mark attendance.");
    } finally {
      setProcessing(false);
    }
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading attendance history...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b px-6 py-4">
        <Link
          to="/my-dashboard"
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        {/* Page Title */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Attendance</h1>

            <p className="text-gray-500 mt-1">
              Mark your daily attendance and view your attendance history.
            </p>
          </div>

          <button
            onClick={fetchAttendance}
            className="flex items-center gap-2 border bg-white px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        {/* Success Message */}
        {message && (
          <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-5">
            {message}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-5">
            {error}
          </div>
        )}

        {/* Today's Attendance */}
        <section className="bg-white border rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center gap-3 mb-5">
            <CalendarCheck className="text-blue-600" size={25} />

            <h2 className="text-lg font-semibold text-gray-800">
              Today's Attendance
            </h2>
          </div>

          <p className="text-gray-500 text-sm mb-5">{today.toDateString()}</p>

          {todayAttendance ? (
            <div className="flex items-center gap-2 text-green-700 font-semibold">
              <CalendarCheck size={20} />
              You are marked Present today.
            </div>
          ) : (
            <button
              onClick={handleMarkPresent}
              disabled={processing}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              <CalendarCheck size={18} />

              {processing ? "Processing..." : "Mark Present"}
            </button>
          )}
        </section>

        {/* Attendance History */}
        <section className="bg-white border rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <Clock className="text-blue-600" size={23} />

            <h2 className="text-lg font-semibold text-gray-800">
              Attendance History
            </h2>
          </div>

          {attendances.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CalendarCheck size={35} className="mx-auto mb-3" />

              <p>No attendance records found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="p-4">Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Notes</th>
                  </tr>
                </thead>

                <tbody>
                  {attendances.map((record) => (
                    <tr key={record._id} className="border-t hover:bg-gray-50">
                      <td className="p-4">{formatDate(record.date)}</td>

                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            record.status === "Present"
                              ? "bg-green-100 text-green-700"
                              : record.status === "Absent"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>

                      <td className="p-4">{record.notes || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default MyAttendance;
