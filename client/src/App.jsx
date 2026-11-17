import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import "./App.css";

import ProtectedRoute from "./components/ProtectedRoute";
import Attendance from "./pages/Attendance";
import Dashboard from "./pages/Dashboard";
import EmployeeDetails from "./pages/EmployeeDetail";
import Employees from "./pages/Employees";
import LeaveTypes from "./pages/LeaveType";
import Login from "./pages/Login";
import MyAttendance from "./pages/MyAttendance";
import MyDashboard from "./pages/MyDashboard";
import MyLeaves from "./pages/MyLeave";
import MyLeaveBalance from "./pages/MyLeaveBalance";
import Register from "./pages/Register";
import WorkSpace from "./pages/WorkSpace";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/employees/:id" element={<EmployeeDetails />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/workspace" element={<WorkSpace />} />
          <Route path="/leave-types" element={<LeaveTypes />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["Employee"]} />}>
          <Route path="/my-dashboard" element={<MyDashboard />} />
          <Route path="/my-attendance" element={<MyAttendance />} />
          <Route path="/workspace" element={<WorkSpace />} />
          <Route path="/my-leave-balance" element={<MyLeaveBalance />} />
          <Route path="/my-leaves" element={<MyLeaves />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
