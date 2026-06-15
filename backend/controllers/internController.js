const Intern = require("../models/Intern");
const Task = require("../models/Task");
const Submission = require("../models/Submission");
const bcrypt = require("bcryptjs");

// Onboard a new intern (Admin only)
const onboardIntern = async (req, res) => {
  try {
    const { name, email, password, department, joiningDate } = req.body;

    const existingIntern = await Intern.findOne({ email });
    if (existingIntern) {
      return res.status(400).json({ message: "Intern already exists with this email" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const intern = await Intern.create({
      name,
      email,
      password: hashedPassword,
      department,
      joiningDate: joiningDate || new Date(),
      progress: 0
    });

    res.status(201).json({
      id: intern._id,
      name: intern.name,
      email: intern.email,
      department: intern.department,
      joiningDate: intern.joiningDate,
      role: "intern"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all interns with their dynamically calculated progress (Admin only)
const getAllInterns = async (req, res) => {
  try {
    const interns = await Intern.find().select("-password");
    
    // Dynamically calculate progress for each intern based on their assigned tasks
    const internsWithProgress = await Promise.all(
      interns.map(async (intern) => {
        const totalTasks = await Task.countDocuments({ assignedTo: intern._id });
        const completedTasks = await Task.countDocuments({ assignedTo: intern._id, status: "Completed" });
        
        let progress = 0;
        if (totalTasks > 0) {
          progress = Math.round((completedTasks / totalTasks) * 100);
          
          // Update the database progress so it is stored correctly as well
          if (intern.progress !== progress) {
            intern.progress = progress;
            await intern.save();
          }
        } else if (intern.progress !== 0) {
          intern.progress = 0;
          await intern.save();
        }

        return {
          ...intern.toObject(),
          totalTasks,
          completedTasks,
          progress
        };
      })
    );

    res.json(internsWithProgress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single intern by ID (Admin or the Intern themselves)
const getInternById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Only allow Admin or the Intern themselves
    if (req.user.role !== "admin" && req.user.id !== id) {
      return res.status(403).json({ message: "Access Denied" });
    }

    const intern = await Intern.findById(id).select("-password");
    if (!intern) {
      return res.status(404).json({ message: "Intern not found" });
    }

    const tasks = await Task.find({ assignedTo: id });
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "Completed").length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.json({
      intern,
      tasks,
      stats: {
        totalTasks,
        completedTasks,
        progress
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update intern details (Admin only)
const updateIntern = async (req, res) => {
  try {
    const { name, email, department, joiningDate } = req.body;
    const { id } = req.params;

    const intern = await Intern.findById(id);
    if (!intern) {
      return res.status(404).json({ message: "Intern not found" });
    }

    intern.name = name || intern.name;
    intern.email = email || intern.email;
    intern.department = department || intern.department;
    intern.joiningDate = joiningDate || intern.joiningDate;

    await intern.save();

    res.json({
      id: intern._id,
      name: intern.name,
      email: intern.email,
      department: intern.department,
      joiningDate: intern.joiningDate
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete intern (Admin only)
const deleteIntern = async (req, res) => {
  try {
    const { id } = req.params;
    const intern = await Intern.findById(id);
    if (!intern) {
      return res.status(404).json({ message: "Intern not found" });
    }

    // Delete associated tasks and submissions
    await Task.deleteMany({ assignedTo: id });
    await Submission.deleteMany({ internId: id });
    await Intern.findByIdAndDelete(id);

    res.json({ message: "Intern and all associated data deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  onboardIntern,
  getAllInterns,
  getInternById,
  updateIntern,
  deleteIntern
};
