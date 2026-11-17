import axios from "axios";
import { Eye, EyeOff, LockKeyhole, LogIn, Mail } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: email.trim().toLowerCase(),
          password,
        },
        {
          withCredentials: true,
        },
      );

      const user = response.data.user;

      if (!user || !["Admin", "Employee"].includes(user.role)) {
        setError("Unable to identify your account role.");
        return;
      }

      // Store basic user information, not the password or JWT.
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "Admin") {
        navigate("/", { replace: true });
      } else {
        navigate("/my-dashboard", { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to log in. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
            <LockKeyhole size={30} />
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-gray-900">
            Welcome Back
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Sign in to your Company Management System
          </p>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-xl shadow-blue-100/40 sm:p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Work Email
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50">
                <Mail size={19} className="shrink-0 text-gray-400" />

                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="w-full min-w-0 bg-transparent py-3.5 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Password
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50">
                <LockKeyhole size={19} className="shrink-0 text-gray-400" />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="w-full min-w-0 bg-transparent py-3.5 text-sm outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="shrink-0 text-gray-400 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogIn size={18} />
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-blue-600 hover:text-blue-800"
            >
              Register
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Secure access to your workplace information
        </p>
      </div>
    </div>
  );
}

export default Login;
