const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require('mongoose');



dotenv.config();
const app = express();

//routes
const authRoutes = require("./routes/authRoutes");
const internRoutes = require("./routes/internRoutes");
const taskRoutes = require("./routes/taskRoutes");
const submissionRoutes = require("./routes/submissionRoutes");

//db connection
mongoose.connect(process.env.MONGO_URI).then(()=>{
  console.log("mongodb connected");
}).catch((err)=>{
  console.log("error connecting");
})



//middle wares
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/interns", internRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/submissions", submissionRoutes);


app.listen(process.env.PORT, () => {
    console.log("Server Running");
});