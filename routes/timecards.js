const express = require("express");
const { authenticateJWT, ensureLoggedIn, ensureManager } = require("../middleware/middlewareAuth");
const EmployeeManager = require("../models/EmployeeManager");
const router = express.Router();
const TimecardsManager = require("../models/TimecardsManager");
const JobsManager = require("../models/JobsManager");


// GET / get all employees

router.get("/", authenticateJWT, ensureManager, async function (req, res, next) {

    try {

        let result = await TimecardsManager.getAllTimecards();
        return res.json(result);
    }
    catch (err) {

        return next(err);
    }
});

router.get("/reports/weekly/:id", authenticateJWT, async function (req, res, next) {

    try {

        let result = await TimecardsManager.getTimecardsIndiv(req.params.id);
        return res.json(result);
    }
    catch (err) {

        return next(err);
    }
});

// router.get("/indiv/:id", async function (req, res, next) {

//     try {
//         let id = req.params.id;

//         let result = await TimecardsManager.getTimecard(id);

//         return res.json(result);
//     }
//     catch (err) {

//         return next(err);
//     }
// });

router.post("/", authenticateJWT, ensureLoggedIn, async function (req, res, next) {

    try {

        let result = await TimecardsManager.addTimecard(req.body);
        return res.json(result);
    }
    catch (err) {

        return next(err);
    }
});

router.put("/:id", authenticateJWT, ensureManager, async function (req, res, next) {

    try {
        let id = req.params.id;
        let result = await TimecardsManager.editTimecard(req.body, id);

        return res.json(result);
    }
    catch (err) {

        return next(err);
    }
});

router.delete("/:id", async function (req, res, next) {

    try {
        let id = req.params.id;
        await TimecardsManager.deleteTimecard(id);

        return res.json({ message: "timecard deleted" });
    }
    catch (err) {

        return next(err);
    }
});

router.get("/date-report", async function (req, res, next) {

    try {

        let date = req.query.date;

        let result = await TimecardsManager.getTimecardsByDate(date);
        return res.json(result);
    }
    catch (err) {

        return next(err);
    }
});

router.get("/employee-report", async function (req, res, next) {

    try {

        let employee = req.query.employee;

        let result = await TimecardsManager.getTimecardsByEmployee(employee);
        return res.json(result);
    }
    catch (err) {

        return next(err);
    }
});

router.get("/jobs-report", async function (req, res, next) {

    try {
        console.log(req.query)
        let job = req.query.job;

        let result = await TimecardsManager.getTimecardsByJob(job);
        return res.json(result);
    }
    catch (err) {

        return next(err);
    }
});

router.get("/filter", authenticateJWT, ensureManager, async function (req, res, next) {

    try {
        console.log("initial req.params", req.query)
        let result = await TimecardsManager.filterSearch(req.query);
        return res.json(result);
    }
    catch (err) {

        return next(err);
    }
});

router.get("/form-populate", async function (req, res, next) {

    try {

        let jobs = await JobsManager.getAllJobs();
        let employees = await EmployeeManager.getAllEmployees();
        return res.json({ jobs, employees });
    }
    catch (err) {

        return next(err);
    }
});




module.exports = router;