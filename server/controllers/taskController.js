import Employee from "../models/employeeModel.js";
import Task from "../models/taskModel.js";

export const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, employeeId } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        message: "Task title is required",
      });
    }

    // Admin can assign a task to any employee.
    // Employees can only create tasks for themselves.
    const assignedEmployeeId =
      req.user.role === "Admin" ? employeeId : req.user.employeeId?._id;

    if (!assignedEmployeeId) {
      return res.status(400).json({
        message: "Please select an employee to assign this task.",
      });
    }

    const employee = await Employee.findById(assignedEmployeeId);

    if (!employee) {
      return res.status(404).json({
        message: "Assigned employee not found",
      });
    }

    const task = await Task.create({
      employeeId: assignedEmployeeId,
      title: title.trim(),
      description,
      priority,
      dueDate: dueDate || null,
    });

    const populatedTask = await task.populate(
      "employeeId",
      "employeeId firstName lastName email department",
    );

    res.status(201).json({
      message: "Task created successfully",
      task: populatedTask,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get tasks: employees see their own; admins see all
export const getTasks = async (req, res) => {
  try {
    const filter =
      req.user.role === "Admin" ? {} : { employeeId: req.user.employeeId?._id };

    const tasks = await Task.find(filter)
      .populate("employeeId", "employeeId firstName lastName email department")
      .sort({ createdAt: -1 });

    res.status(200).json({ tasks });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update a task
export const updateTask = async (req, res) => {
  try {
    const { title, description, priority, status, dueDate } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }

    // Employees can update only their own tasks
    if (
      req.user.role !== "Admin" &&
      task.employeeId.toString() !== req.user.employeeId?._id?.toString()
    ) {
      return res.status(403).json({
        message: "You cannot update another employee's task.",
      });
    }

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          message: "Task title cannot be empty.",
        });
      }
      task.title = title.trim();
    }

    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate || null;

    if (status !== undefined) {
      if (!["To Do", "In Progress", "Completed"].includes(status)) {
        return res.status(400).json({
          message: "Invalid task status.",
        });
      }

      task.status = status;
      task.completedAt = status === "Completed" ? new Date() : null;
    }

    await task.save();

    res.status(200).json({
      message: "Task updated successfully.",
      task,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update task.",
      error: error.message,
    });
  }
};

// Delete a task: admin only
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }

    res.status(200).json({
      message: "Task deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete task.",
      error: error.message,
    });
  }
};
