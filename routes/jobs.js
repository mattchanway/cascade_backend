const express = require("express");
const router = express.Router();
const JobsManager = require("../models/JobsManager");
const { authenticateSessionAndCheckJwt, rotateJwt, ensureLoggedIn, ensureCorrectUserOrManager, ensureManager } = require("../middleware/middlewareAuth");


// GET / get all jobs

router.get("/",authenticateSessionAndCheckJwt, rotateJwt, ensureLoggedIn,  async function (req, res, next) {

    try {
        if(!req.cookies.sessionId) return res.json({noUser:'No User'});
        let result = await JobsManager.getAllJobs();
        return res.json(result);
    }
    catch (err) {

        return next(err);
    }
});

router.get("/:id",authenticateSessionAndCheckJwt, rotateJwt, ensureLoggedIn, async function (req, res, next) {

    try {
        
        let id = req.params.id;

        let result = await JobsManager.getJob(id);

        return res.json(result);
    }
    catch (err) {

        return next(err);
    }
});

router.post("/", authenticateSessionAndCheckJwt, rotateJwt, ensureManager, async function (req, res, next) {

    try {
       
        let result = await JobsManager.addJob(req.body);
        return res.json(result);
    }
    catch (err) {

        return next(err);
    }
});

router.put("/:id", authenticateSessionAndCheckJwt, rotateJwt, ensureManager, async function (req, res, next) {

    try {
        let id = req.params.id;
        let result = await JobsManager.editJob(req.body, id);

        return res.json(result);
    }
    catch (err) {

        return next(err);
    }
});

router.patch("/:id", authenticateSessionAndCheckJwt, rotateJwt, ensureManager, async function (req, res, next) {

    try {
        
        let id = req.params.id;
        let result = await JobsManager.updateJobStatus(id, req.body.status);

        return res.json(result);
    }
    catch (err) {

        return next(err);
    }
});

router.delete("/:id", authenticateSessionAndCheckJwt, rotateJwt, ensureManager, async function (req, res, next) {

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