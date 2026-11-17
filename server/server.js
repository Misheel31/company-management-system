import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import attendanceRoutes from "./routes/attendanceRoute.js";
import authRoute from "./routes/authRoute.js";
import dashboardRoutes from "./routes/dashboardRoute.js";
import employeeRoutes from "./routes/employeeRoute.js";
import leaveRequestRoutes from "./routes/leaveRequestRoutes.js";
import leaveRoutes from "./routes/leaveRoute.js";
import taskRoutes from "./routes/taskRoutes.js";

dotenv.config();

console.log("MongoDB URI loaded:", Boolean(process.env.MONGO_URI));
console.log("JWT_SECRET loaded:", Boolean(process.env.JWT_SECRET));

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    message: "Company Management System API is running",
  });
});

app.use("/api/employees", employeeRoutes);
app.use("/api/attendances", attendanceRoutes);
app.use("/api/leave-types", leaveRoutes);
app.use("/api/leave-requests", leaveRequestRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/auth", authRoute);
app.use("/api/tasks", taskRoutes);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("CMS MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });
