const express = require("express");


const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());
const ORIGIN_URL = process.env.NODE_ENV === 'production' ? 'https://cascademetaldesign.work' : 'http://localhost:3000' 
const employeesRoutes = require("./routes/employees");
const timecardsRoutes = require("./routes/timecards");
const jobsRoutes = require("./routes/jobs");
const authRoutes = require("./routes/auth");
app.use(bodyParser.json())


app.use(morgan("tiny"));
app.use(express.json());
// app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
app.use(cors({ credentials: true, origin: ORIGIN_URL }));
app.use("/api/employees", employeesRoutes);
app.use("/api/timecards", timecardsRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/auth", authRoutes);

// 404 Not Found handler * //





app.use(function (req, res, next) {
    const err = new Error("Not Found");
    err.status = 404;
   return next(err);
});

// Generic error handler. *//

app.use(function (err, req, res, next) {
   console.log('GENERIC ERROR HANDLE')
   return res.status(err.status || 500).json({
        message: err.message
    });

});

module.exports = app;

