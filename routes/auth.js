const express = require("express");
const router = express.Router();
const EmployeeManager = require("../models/EmployeeManager");
const jwt = require("jsonwebtoken");
const { authenticateJWT, ensureLoggedIn } = require("../middleware/middlewareAuth");
const { SECRET_KEY } = require("../config");
const { encrypt, decrypt } = require('../encryption');
const DOMAIN_URL = process.env.NODE_ENV === 'production' ? '.cascademetaldesign.work' : 'localhost'


// POST / LOGIN

router.post("/", async function (req, res, next) {

    try {
        // JWT and SESSION are stored in database, session is sent to HTTP ONLY COOKIE
        // on every API request, the database must check the JWT
        // the whoAmI API route can check the session, if it's not expired, say 1 hour, browsing can continue
        
        const { id, password } = req.body;
      
        let result = await EmployeeManager.authenticate(id, password);

        if (result !== false) {
            let encrypted = encrypt(result.session_id);
            
            res.cookie('sessionId', encrypted, { maxAge: ((1000 * 60) * 420), domain:DOMAIN_URL, secure: true, httpOnly: true });

        }

        return res.json(result);
    }
    catch (err) {

        return next(err);
    }
});

// POST / LOGOUT

router.post("/logout", async function (req, res, next) {

    try {
        // JWT and SESSION are stored in database, session is sent to HTTP ONLY COOKIE
        // on every API request, the database must check the JWT
        // the whoAmI API route can check the session, if it's not expired, say 1 hour, browsing can continue
        res.clearCookie("sessionId",{ domain: DOMAIN_URL, secure: true, httpOnly: true });
        return res.end();
    }
    catch (err) {

        return next(err);
    }
});


// Create a forgot-password token for a user ID
router.post("/password-token/:id", async function (req, res, next) {

    try {
        const id = req.params.id;
        let passwordToken = await EmployeeManager.createPasswordToken(id);
        return res.json(passwordToken);

    }

    catch (e) {

        return next(e);
    }


})

// Use the token to update a forgotten password

router.post("/password-forgotten-update/:token", async function (req, res, next) {

    try {
        let token = req.params.token;

        let { password } = req.body;

        let result = await EmployeeManager.updateForgottenPassword(token, password);
       console.log('typeof result',typeof(result))
      
        
        let encrypted = encrypt(result.session);
        res.cookie('sessionId', encrypted, { maxAge: ((1000 * 60) * 420), domain:DOMAIN_URL, secure: true, httpOnly: true });
        

        return res.json(result.user);

    }
    catch (e) {
        console.log('ROUTE CATCH BLOCK')
        return next(e);
    }
})




router.get("/whoami", async function (req, res, next) {

    try {

        if (req.cookies.sessionId) {

            let sessionId = req.cookies.sessionId;
            let split = sessionId.split(':.');
            let decryptObj = { iv: split[0], encryptedData: split[1] }
            let decrypted = decrypt(decryptObj)
            let userResult = await EmployeeManager.whoAmI(decrypted);
           
            return res.json(userResult);
        }
        return res.json({ noUser: "unable to auth" });
    }
    catch (err) {

        return next(err);
    }
});


module.exports = router;