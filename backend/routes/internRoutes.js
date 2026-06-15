const express = require("express");
const router = express.Router();
const {
  onboardIntern,
  getAllInterns,
  getInternById,
  updateIntern,
  deleteIntern
} = require("../controllers/internController");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(authMiddleware);

// Admin-only routes
router.post("/", adminMiddleware, onboardIntern);
router.get("/", adminMiddleware, getAllInterns);
router.put("/:id", adminMiddleware, updateIntern);
router.delete("/:id", adminMiddleware, deleteIntern);

// Combined routes (Admin or Intern themselves check inside controller)
router.get("/:id", getInternById);

module.exports = router;
