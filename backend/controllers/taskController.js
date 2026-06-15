const Task = require("../models/Task");
const Intern = require("../models/Intern");

// Create and Assign a Task (Admin only)
const createTask = async (req, res) => {
  try {
    const { title, description, deadline, assignedTo } = req.body;

    const intern = await Intern.findById(assignedTo);
    if (!intern) {
      return res.status(404).json({ message: "Assigned intern not found" });
    }

    const task = await Task.create({
      title,
      description,
      deadline,
      assignedTo,
      status: "Pending"
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Tasks (Admin gets all, Intern gets their own)
const getTasks = async (req, res) => {
  try {
    let tasks;
    if (req.user.role === "admin") {
      tasks = await Task.find().populate("assignedTo", "name email department");
    } else {
      tasks = await Task.find({ assignedTo: req.user.id });
    }
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Task details (Admin only, except status updates which are controlled)
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, deadline, assignedTo, status } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Admins can update anything
    if (req.user.role === "admin") {
      if (assignedTo && assignedTo !== task.assignedTo.toString()) {
        const intern = await Intern.findById(assignedTo);
        if (!intern) {
          return res.status(404).json({ message: "Assigned intern not found" });
        }
        task.assignedTo = assignedTo;
      }
      task.title = title || task.title;
      task.description = description || task.description;
      task.deadline = deadline || task.deadline;
      task.status = status || task.status;
    } else {
      // Interns are not allowed to update tasks using this endpoint (they use the Submission endpoint)
      return res.status(403).json({ message: "Access Denied: Admins only" });
    }

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a Task (Admin only)
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await Task.findByIdAndDelete(id);
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask
};
