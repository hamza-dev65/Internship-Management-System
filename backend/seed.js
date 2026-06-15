const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const Admin = require("./models/Admin");

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    const existingAdmin = await Admin.findOne({ email: "admin@company.com" });
    if (existingAdmin) {
      console.log("Admin already exists in database with email: admin@company.com");
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("adminpassword", salt);

    await Admin.create({
      name: "Administrator",
      email: "admin@company.com",
      password: hashedPassword,
    });

    console.log("---------------------------------------");
    console.log("Admin successfully seeded!");
    console.log("Email: admin@company.com");
    console.log("Password: adminpassword");
    console.log("---------------------------------------");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error.message);
    process.exit(1);
  }
};

seedAdmin();
