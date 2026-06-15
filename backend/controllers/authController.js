const Admin = require("../models/Admin");
const Intern = require("../models/Intern");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register Admin
const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        message: "Admin already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: "admin"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Unified Login for Admin and Intern
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Search in Admin collection
    let user = await Admin.findOne({ email });
    let role = "admin";

    // 2. Search in Intern collection if not an Admin
    if (!user) {
      user = await Intern.findOne({ email });
      role = "intern";
    }

    // 3. User not found
    if (!user) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    // 4. Match password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    // 5. Generate token
    const token = jwt.sign(
      {
        id: user._id,
        role: role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: role,
        department: user.department || null
      },
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  registerAdmin,
  login
};