require('dotenv').config();

const express = require('express');
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();

// requiring routes
const dashboardRoute = require("./routes/Dashboard/dashboard");
const departmentRoute = require("./routes/Department/department");
const hodRoute = require("./routes/Department/hod");
const unitRoute = require("./routes/Department/unit");
const enrollmentRoute = require("./routes/Enrollment/enrollment");
const findEmployeeRoute = require("./routes/Attendance/Record/confirmEmp");
const recordAttendanceRoute = require("./routes/Attendance/Record/recordAttendance");
const reportAttendanceRoute = require("./routes/Attendance/Report/attendanceReport");
const loansRoute = require("./routes/Loans/loans");
const leaveRoute = require("./routes/Leave/leave");
const payrollRoute = require("./routes/Payroll/payroll");
const employeeSalaryRoute = require("./routes/Payroll/Employee_Salary/employee_salary");
const adminLogRoute = require("./routes/Auth/logs");

// Environmental variables
const PORT = process.env.PORT;
const DB_URI = process.env.DB_URI;

// mongoDB connection
const connection = async () => {
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect(DB_URI, {useNewUrlParser: true});
        // console.log("Connected to database");
    } catch (error) {
        throw error;
    }
}
const DB = mongoose.connection;
DB.on("disconnected", (error) => {
    // console.log("MongoDB Disconnected!");
    throw error;
});
// DB.on("connected", () => {
//     console.log("MongoDB Connected!");
// });

var corsOptions = {
    origin: "http://localhost:3000",
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    credentials: true
}

// middlewares
app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.urlencoded({extended: true}));

// routes
app.use("/api/dashboard", dashboardRoute);
app.use("/api/department", departmentRoute);
app.use("/api/hod", hodRoute);
app.use("/api/unit", unitRoute);
app.use("/api/enrollment", enrollmentRoute);
app.use("/api/attendance/record_attendance", findEmployeeRoute);
app.use("/api/attendance/record_attendance", recordAttendanceRoute);
app.use("/api/attendance/attendance_report", reportAttendanceRoute);
app.use("/api/loans", loansRoute);
app.use("/api/leave", leaveRoute);
app.use("/api/payroll", payrollRoute);
app.use("/api/payroll", employeeSalaryRoute);
app.use("/api/log", adminLogRoute);

app.listen(PORT, () => {
    connection();
    // console.log(`Server running at port ${PORT}`);
});