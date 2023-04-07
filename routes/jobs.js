const express = require("express");
const router = express.Router();
const JobsManager = require("../models/JobsManager");
const { authenticateSessionAndCheckJwt, rotateSessionAndJwt, ensureLoggedIn, ensureCorrectUserOrManager, ensureManager } = require("../middleware/middlewareAuth");


// GET / get all jobs

router.get("/",authenticateSessionAndCheckJwt, rotateSessionAndJwt, ensureLoggedIn,  async function (req, res, next) {

    try {
        if(!req.cookies.sessionId) return res.json({noUser:'No User'});
        let result = await JobsManager.getAllJobs();
        return res.json(result);
    }
    catch (err) {
        console.log(err)
        return next(err);
    }
});

router.get("/:id",authenticateSessionAndCheckJwt, rotateSessionAndJwt, ensureLoggedIn, async function (req, res, next) {

    try {
        
        let id = req.params.id;

        let result = await JobsManager.getJob(id);

        return res.json(result);
    }
    catch (err) {

        return next(err);
    }
});

router.post("/", authenticateSessionAndCheckJwt, rotateSessionAndJwt, ensureManager, async function (req, res, next) {

    try {
        console.log(res.locals)
        let result = await JobsManager.addJob(req.body);
        return res.json(result);
    }
    catch (err) {

        return next(err);
    }
});

router.put("/:id", authenticateSessionAndCheckJwt, rotateSessionAndJwt, ensureManager, async function (req, res, next) {

    try {
        let id = req.params.id;
        let result = await JobsManager.editJob(req.body, id);

        return res.json(result);
    }
    catch (err) {

        return next(err);
    }
});

router.patch("/:id", authenticateSessionAndCheckJwt, rotateSessionAndJwt, ensureManager, async function (req, res, next) {

    try {
        
        let id = req.params.id;
        let result = await JobsManager.updateJobStatus(id, req.body.status);

        return res.json(result);
    }
    catch (err) {

        return next(err);
    }
});

router.delete("/:id", authenticateSessionAndCheckJwt, rotateSessionAndJwt, ensureManager, async function (req, res, next) {

    // should only be used if a job was created by mistake

    try {
        let id = req.params.id;
        await JobsManager.deleteEmployee(id);

        return res.json({ message: "job deleted" });
    }
    catch (err) {

        return next(err);
    }
});

module.exports = router;