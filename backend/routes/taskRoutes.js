const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask
} = require("../controllers/taskController");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(authMiddleware);

router.get("/", getTasks); // Shared, logic inside controller decides what they see

// Admin-only routes
router.post("/", adminMiddleware, createTask);
router.put("/:id", adminMiddleware, updateTask);
router.delete("/:id", adminMiddleware, deleteTask);

module.exports = router;
