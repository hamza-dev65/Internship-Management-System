const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title:String,
    description:String,
    deadline:Date,
    assignedTo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Intern"
    },
    status:{
        type:String,
        default:"Pending"
    }
});

module.exports = mongoose.model("Task", taskSchema);