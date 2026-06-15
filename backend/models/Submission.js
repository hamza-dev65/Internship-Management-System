const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
    internId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Intern"
    },
    taskId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Task"
    },
    workLink:String,
    feedback:String
});

module.exports = mongoose.model("Submission", submissionSchema);