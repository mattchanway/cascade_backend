const express = require("express");
const router = express.Router();
const { authenticateJWT, ensureLoggedIn, ensureCorrectUserOrManager, ensureManager } = require("../middleware/middlewareAuth");
const EmployeeManager = require("../models/EmployeeManager");


// GET / get all employees

router.get("/", async function (req, res, next) {

    try {
        
        let result = await EmployeeManager.getAllEmployees();
        return res.json(result);
    }
    catch (err) {

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

router.get("/:id", authenticateJWT, ensureLoggedIn, ensureCorrectUserOrManager, async function (req, res, next) {

    try {
        let id = req.params.id;

        let result = await EmployeeManager.getEmployee(id);

        return res.json(result);

    }
    catch (err) {

        return next(err);
    }
});

router.post("/", authenticateJWT, ensureManager, async function (req, res, next) {

    try {
        console.log('post /employees', req.body)
        let result = await EmployeeManager.addEmployee(req.body);
        return res.json(result);
    }
    catch (err) {

        return next(err);
    }
});

router.put("/:id", authenticateJWT, ensureManager, async function (req, res, next) {

    try {
        let id = req.params.id;
        let result = await EmployeeManager.editEmployee(req.body, id);

        return res.json(result);
    }
    catch (err) {

        return next(err);
    }
});

router.patch("/:id", authenticateJWT, ensureLoggedIn, async function (req, res, next) {

    try {

        let id = req.params.id;
        console.log(req.body)
        let result = await EmployeeManager.updateInternalPassword(id, req.body.password, req.body.firstLogin);

        return res.json(result);
    }
    catch (err) {

        return next(err);
    }
});

router.delete("/:id", authenticateJWT, ensureManager, async function (req, res, next) {

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