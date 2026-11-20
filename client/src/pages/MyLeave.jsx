import axios from "axios";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle,
  Clock,
  FileText,
  LoaderCircle,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/leave-requests`;

function MyLeaves() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const fetchMyLeaves = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${API_URL}/my-requests`, {
        withCredentials: true,
      });

      setLeaveRequests(response.data.leaveRequests || []);
    } catch (err) {
      console.error("My leave loading error:", err);

      setError(
        err.response?.data?.message || "Unable to load your leave requests.",
      );
    } finally {
      setLoading(false);
    }
  };

  const getDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return Math.max(Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1, 0);
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const filteredLeaves =
    filter === "All"
      ? leaveRequests
      : leaveRequests.filter((leave) => leave.status === filter);

  const pendingCount = leaveRequests.filter(
    (leave) => leave.status === "Pending",
  ).length;

  const approvedCount = leaveRequests.filter(
    (leave) => leave.status === "Approved",
  ).length;

  const rejectedCount = leaveRequests.filter(
    (leave) => leave.status === "Rejected",
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Link to="/" className="text-gray-600 hover:text-blue-600">
            <ArrowLeft size={21} />
          </Link>

          <div>
            <h1 className="text-xl font-bold text-gray-800">My Leave</h1>
            <p className="text-sm text-gray-500">Employee Portal</p>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        {/* Introduction */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              My Leave Requests
            </h2>
            <p className="text-gray-500 mt-1">
              Track your leave applications and their approval status.
            </p>
          </div>

          <Link
            to="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium text-center"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <SummaryCard
            title="Pending"
            count={pendingCount}
            color="orange"
            icon={<Clock size={23} />}
          />

          <SummaryCard
            title="Approved"
            count={approvedCount}
            color="green"
            icon={<CheckCircle size={23} />}
          />

          <SummaryCard
            title="Rejected"
            count={rejectedCount}
            color="red"
            icon={<XCircle size={23} />}
          />
        </div>

        {/* Requests */}
        <div className="bg-white border rounded-xl shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800">
              Leave History
            </h3>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="All">All Requests</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoaderCircle className="animate-spin text-blue-600" size={28} />
              <span className="ml-3 text-gray-500">
                Loading your leave requests...
              </span>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 rounded-lg p-4">
              {error}
              <button
                onClick={fetchMyLeaves}
                className="block mt-3 font-medium underline"
              >
                Try again
              </button>
            </div>
          ) : filteredLeaves.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDays size={42} className="mx-auto text-gray-400 mb-3" />
              <h4 className="font-semibold text-gray-700">
                No leave requests found
              </h4>
              <p className="text-sm text-gray-500 mt-1">
                Your leave applications will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLeaves.map((leave) => (
                <div
                  key={leave._id}
                  className="border rounded-xl p-5 hover:shadow-sm transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-gray-800 text-lg">
                        {leave.leaveTypeId?.name || "Leave"}
                      </h4>

                      <p className="text-sm text-gray-500 mt-1">
                        Applied on: {formatDate(leave.createdAt)}
                      </p>
                    </div>

                    <StatusBadge status={leave.status} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
                    <Detail
                      icon={<CalendarDays size={18} />}
                      label="Start Date"
                      value={formatDate(leave.startDate)}
                    />

                    <Detail
                      icon={<CalendarDays size={18} />}
                      label="End Date"
                      value={formatDate(leave.endDate)}
                    />

                    <Detail
                      icon={<Clock size={18} />}
                      label="Duration"
                      value={`${getDays(leave.startDate, leave.endDate)} days`}
                    />
                  </div>

                  <div className="border-t mt-5 pt-4">
                    <div className="flex items-start gap-2">
                      <FileText size={18} className="text-gray-400 mt-0.5" />

                      <div>
                        <p className="text-sm text-gray-500">Reason</p>
                        <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">
                          {leave.reason || "No reason provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6">
          <Link
            to="/my-leave-balance"
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            View my remaining leave balance →
          </Link>
        </div>
      </main>
    </div>
  );
}

function SummaryCard({ title, count, color, icon }) {
  const styles = {
    orange: "bg-orange-50 text-orange-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="bg-white border rounded-xl p-5 shadow-sm">
      <div
        className={`w-11 h-11 rounded-lg flex items-center justify-center ${styles[color]}`}
      >
        {icon}
      </div>

      <p className="text-sm text-gray-500 mt-4">{title}</p>
      <p className="text-3xl font-bold text-gray-800 mt-1">{count}</p>
    </div>
  );
}

function Detail({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-blue-600 mt-1">{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-800 mt-1">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Pending: "bg-orange-100 text-orange-700",
    Approved: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
  };

  const icons = {
    Pending: <Clock size={14} />,
    Approved: <CheckCircle size={14} />,
    Rejected: <XCircle size={14} />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {icons[status] || <AlertCircle size={14} />}
      {status}
    </span>
  );
}

export default MyLeaves;
