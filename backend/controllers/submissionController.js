const Submission = require("../models/Submission");
const Task = require("../models/Task");
const Intern = require("../models/Intern");

// Submit Work for a Task (Intern only)
const submitWork = async (req, res) => {
  try {
    const { taskId, workLink } = req.body;
    const internId = req.user.id;

    // Verify task belongs to this intern
    const task = await Task.findOne({ _id: taskId, assignedTo: internId });
    if (!task) {
      return res.status(404).json({ message: "Task not found or not assigned to you" });
    }

    // Update task status to "Submitted"
    task.status = "Submitted";
    await task.save();

    // Check if submission already exists, otherwise create a new one
    let submission = await Submission.findOne({ taskId, internId });
    if (submission) {
      submission.workLink = workLink;
      submission.feedback = ""; // Reset feedback on re-submission
      await submission.save();
    } else {
      submission = await Submission.create({
        internId,
        taskId,
        workLink,
        feedback: ""
      });
    }

    res.status(201).json({ submission, task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Submissions (Admin gets all, Intern gets their own)
const getSubmissions = async (req, res) => {
  try {
    let submissions;
    if (req.user.role === "admin") {
      submissions = await Submission.find()
        .populate("internId", "name email department")
        .populate("taskId", "title description deadline status");
    } else {
      submissions = await Submission.find({ internId: req.user.id })
        .populate("taskId", "title description deadline status");
    }
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Review submission and provide feedback (Admin only)
const reviewSubmission = async (req, res) => {
  try {
    const { id } = req.params; // Submission ID
    const { feedback, status } = req.body; // status should be "Completed" (approved) or "Pending" (rejected)

    if (status !== "Completed" && status !== "Pending") {
      return res.status(400).json({ message: "Invalid status: must be 'Completed' or 'Pending'" });
    }

    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    submission.feedback = feedback || submission.feedback;
    await submission.save();

    // Update the task status
    const task = await Task.findById(submission.taskId);
    if (task) {
      task.status = status;
      await task.save();

      // Trigger recalculation of the Intern's progress
      const totalTasks = await Task.countDocuments({ assignedTo: submission.internId });
      const completedTasks = await Task.countDocuments({ assignedTo: submission.internId, status: "Completed" });
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      await Intern.findByIdAndUpdate(submission.internId, { progress });
    }

    res.json({ submission, taskStatus: status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  submitWork,
  getSubmissions,
  reviewSubmission
};
