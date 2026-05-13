require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/authRouter");
const userRouter = require("./routes/userRoute");
const adminRouter = require("./routes/adminRoutes");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get("/health",(req,res)=>{
    res.status(200).json({
        success : true,
        message : "Api is working properly"
    })
});
app.use("/auth",authRouter);
app.use("/user",userRouter);
app.use("/admin",adminRouter);

module.exports = app;

