const mongoose = require("mongoose");

const internSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    department: String,
    joiningDate: Date,
    progress: {
        type: Number,
        default: 0
    },
    role: {
        type: String,
        default: "intern"
    }
});

module.exports = mongoose.model("Intern", internSchema);