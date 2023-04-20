const express = require("express");
const router = express.Router();
const { authenticateSessionAndCheckJwt, rotateSessionAndJwt, ensureLoggedIn, ensureCorrectUserOrManager, ensureManager, ensureCorrectUser } = require("../middleware/middleware");
const EmployeeManager = require("../models/EmployeeManager");


// GET / get all employees

router.get("/", authenticateSessionAndCheckJwt, rotateSessionAndJwt, ensureLoggedIn, ensureManager, async function (req, res, next) {

    try {

        let result = await EmployeeManager.getAllEmployees();
        return res.json(result);
    }
    catch (err) {
        console.log(err)
        return next(err);
    }
});



router.get("/params", async function (req, res, next) {

    try {
        let result = await EmployeeManager.getPositionsAndCertifications();
        return res.json(result);
    }
    catch (err) {

        return next(err);
    }
});

router.get("/:id", authenticateSessionAndCheckJwt, rotateSessionAndJwt, ensureLoggedIn, ensureManager, async function (req, res, next) {

    try {
        let id = req.params.id;

        let result = await EmployeeManager.getEmployee(id);

        return res.json(result);

    }
    catch (err) {

        return next(err);
    }
});

router.post("/", authenticateSessionAndCheckJwt, rotateSessionAndJwt, ensureLoggedIn, ensureManager, async function (req, res, next) {

    try {

        let result = await EmployeeManager.addEmployee(req.body);
        return res.json(result);
    }
    catch (err) {

        return next(err);
    }
});

router.put("/:id", authenticateSessionAndCheckJwt, rotateSessionAndJwt, ensureManager, async function (req, res, next) {

    try {
        console.log('route', req.params)
        let id = req.params.id;
        let result = await EmployeeManager.editEmployee(req.body, id);

        return res.json(result);
    }
    catch (err) {

        return next(err);
    }
});

router.patch("/:id", authenticateSessionAndCheckJwt, rotateSessionAndJwt, ensureLoggedIn, ensureCorrectUser, async function (req, res, next) {

    try {

        let id = req.params.id;

        let result = await EmployeeManager.updateInternalPassword(id, req.body.password, req.body.firstLogin);

        return res.json(result);
    }
    catch (err) {

        return next(err);
    }
});

router.patch("/status/:id", authenticateSessionAndCheckJwt, rotateSessionAndJwt, ensureLoggedIn, ensureManager, async function (req, res, next) {

    try {

        let id = req.params.id;

        let result = await EmployeeManager.updateEmployeeStatus(id, req.body.status);
        console.log(result)
        return res.json(result);

    }
    catch (err) {
        console.log(err)
        return next(err);
    }
});

router.delete("/:id", authenticateSessionAndCheckJwt, rotateSessionAndJwt, ensureManager, async function (req, res, next) {

    try {
        let id = req.params.id;
        await EmployeeManager.deleteEmployee(id);

        return res.json({ message: "employee deleted" });
    }
    catch (err) {

        return next(err);
    }
});

module.exports = router;