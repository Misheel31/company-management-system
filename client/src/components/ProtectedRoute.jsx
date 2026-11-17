import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute({ allowedRoles }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <Navigate to={user.role === "Admin" ? "/" : "/my-dashboard"} replace />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
