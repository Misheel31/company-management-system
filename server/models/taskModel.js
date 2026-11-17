import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },

    dueDate: {
      type: Date,
      default: null,
    },

    completeAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Task", taskSchema);
