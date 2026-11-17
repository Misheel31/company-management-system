import axios from "axios";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const email = formData.email.trim().toLowerCase();

    if (!email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/api/auth/register`,
        {
          email,
          password: formData.password,
        },
        { withCredentials: true },
      );

      navigate("/login", {
        state: {
          message:
            response.data.message ||
            "Registration successful! You can now log in.",
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-700">
            <UserPlus size={28} />
          </div>

          <h1 className="text-2xl font-bold text-gray-800">
            Create Your Account
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Register using your company email address.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Company Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your registered company email"
              className={inputClass}
              autoComplete="email"
              required
            />

            <p className="mt-1 text-xs text-gray-500">
              Use the email address registered by your Admin.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                className={`${inputClass} pr-12`}
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Confirm Password
            </label>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className={`${inputClass} pr-12`}
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
