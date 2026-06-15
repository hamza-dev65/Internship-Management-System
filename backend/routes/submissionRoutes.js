const express = require("express");
const router = express.Router();
const {
  submitWork,
  getSubmissions,
  reviewSubmission
} = require("../controllers/submissionController");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(authMiddleware);

router.get("/", getSubmissions); // Shared, logic inside controller decides what they see
router.post("/", submitWork); // Intern only (handled inside controller)

// Admin-only routes
router.put("/:id/feedback", adminMiddleware, reviewSubmission);

module.exports = router;
