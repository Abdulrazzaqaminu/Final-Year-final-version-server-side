require('dotenv').config();

const express = require('express');
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

// requiring routes
const departmentRoute = require("./routes/Department/department");
const unitRoute = require("./routes/Department/unit");
const enrollmentRoute = require("./routes/Enrollment/enrollment");
const findEmployeeRoute = require("./routes/Attendance/Record/confirmEmp");
const recordAttendanceRoute = require("./routes/Attendance/Record/recordAttendance");
const reportAttendanceRoute = require("./routes/Attendance/Report/attendanceReport");
const loansRoute = require("./routes/Loans/loans");
const payrollRoute = require("./routes/Payroll/payroll");

// Environmental variables
const PORT = process.env.PORT;
const DB_URI = process.env.DB_URI;

// mongoDB connection
const connection = async () =>{
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect(DB_URI, {useNewUrlParser: true})
        console.log("Connected to database");
    } catch (error) {
        throw error;
    }
}
const DB = mongoose.connection;
DB.on("disconnected", (error) =>{
    console.log("MongoDB Disconnected!");
    throw error;
})
DB.on("connected", () =>{
    console.log("MongoDB Connected!");
})

// middlewares
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cors());
app.use((req, res, next) =>{
    console.log(req.method, req.path);
    next();
})
// routes
app.use("/api/department", departmentRoute);
app.use("/api/unit", unitRoute);
app.use("/api/enrollment", enrollmentRoute);
app.use("/api/attendance/record_attendance", findEmployeeRoute);
app.use("/api/attendance/record_attendance", recordAttendanceRoute);
app.use("/api/attendance/attendance_report", reportAttendanceRoute);
app.use("/api/loans", loansRoute);
app.use("/api/payroll", payrollRoute);

app.listen(PORT, () =>{
    connection();
    console.log(`Server running at port ${PORT}`)
})