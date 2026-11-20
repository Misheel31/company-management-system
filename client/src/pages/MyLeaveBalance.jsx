import axios from "axios";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle,
  Clock,
  LoaderCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/leave-requests`;

function MyLeaveBalance() {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeaveBalance = async () => {
      try {
        const response = await axios.get(`${API_URL}/my-balance`, {
          withCredentials: true,
        });

        setBalances(response.data.balances || []);
      } catch (err) {
        console.error("Leave balance error:", err);

        setError(
          err.response?.data?.message || "Unable to load your leave balance.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveBalance();
  }, []);

  const totalAllowed = balances.reduce(
    (total, item) => total + item.totalDays,
    0,
  );

  const totalUsed = balances.reduce((total, item) => total + item.usedDays, 0);

  const totalRemaining = balances.reduce(
    (total, item) => total + item.remainingDays,
    0,
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderCircle className="animate-spin text-blue-600" size={30} />
        <span className="ml-3 text-gray-600">Loading leave balance...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Link to="/" className="text-gray-600 hover:text-blue-600">
            <ArrowLeft size={21} />
          </Link>

          <div>
            <h1 className="text-xl font-bold text-gray-800">
              My Leave Balance
            </h1>
            <p className="text-sm text-gray-500">Employee Portal</p>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Leave Overview</h2>
          <p className="text-gray-500 mt-1">
            Check your total, used and remaining leave days.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <SummaryCard
            title="Total Allowed"
            value={totalAllowed}
            icon={<CalendarDays size={24} />}
            color="blue"
          />

          <SummaryCard
            title="Used Leave"
            value={totalUsed}
            icon={<Clock size={24} />}
            color="orange"
          />

          <SummaryCard
            title="Remaining Leave"
            value={totalRemaining}
            icon={<CheckCircle size={24} />}
            color="green"
          />
        </div>

        {/* Leave Types */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-5">
            Leave Breakdown
          </h3>

          {balances.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDays size={40} className="mx-auto text-gray-400 mb-3" />
              <p className="font-medium text-gray-700">
                No leave types available
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Contact your administrator for more information.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {balances.map((item) => {
                const percentage =
                  item.totalDays > 0
                    ? Math.min((item.usedDays / item.totalDays) * 100, 100)
                    : 0;

                return (
                  <div
                    key={item.leaveTypeId}
                    className="border-b last:border-0 pb-5 last:pb-0"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {item.leaveType}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {item.usedDays} of {item.totalDays} days used
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-2xl font-bold text-green-600">
                          {item.remainingDays}
                        </p>
                        <p className="text-xs text-gray-500">Days remaining</p>
                      </div>
                    </div>

                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-blue-500 h-3 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Used: {percentage.toFixed(0)}%</span>
                      <span>Available: {item.remainingDays} days</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6">
          <Link
            to="/my-leaves"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium"
          >
            View My Leave Requests
          </Link>
        </div>
      </main>
    </div>
  );
}

function SummaryCard({ title, value, icon, color }) {
  const styles = {
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-green-50 text-green-600",
  };

  return (
    <div className="bg-white border rounded-xl p-5 shadow-sm">
      <div
        className={`w-11 h-11 rounded-lg flex items-center justify-center ${styles[color]}`}
      >
        {icon}
      </div>

      <p className="text-sm text-gray-500 mt-4">{title}</p>
      <p className="text-3xl font-bold text-gray-800 mt-1">
        {value}
        <span className="text-sm font-normal text-gray-500 ml-2">days</span>
      </p>
    </div>
  );
}

export default MyLeaveBalance;
