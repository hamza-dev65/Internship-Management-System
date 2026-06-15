const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const Admin = require("./models/Admin");

dotenv.config();

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL;
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error("Error: DEFAULT_ADMIN_EMAIL and DEFAULT_ADMIN_PASSWORD must be set in the .env file.");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log(`Admin already exists in database with email: ${adminEmail}`);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    await Admin.create({
      name: "Administrator",
      email: adminEmail,
      password: hashedPassword,
    });

    console.log("---------------------------------------");
    console.log("Admin successfully seeded!");
    console.log(`Email: ${adminEmail}`);
    console.log("Password: (Hidden for Security - set in .env)");
    console.log("---------------------------------------");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error.message);
    process.exit(1);
  }
};

seedAdmin();
