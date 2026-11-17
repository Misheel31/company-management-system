import mongoose from "mongoose";
const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    date: { type: Date, required: true },
    checkIn: { type: String, required: true },
    checkOut: { type: String, default: null },
    status: {
      type: String,
      enum: ["Present", "Absent", "On Leave"],
      required: true,
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true },
);
const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;
