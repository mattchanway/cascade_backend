

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const EmployeeManager = require("../models/EmployeeManager");
const { decrypt, encrypt } = require("../encryption");

/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

async function authenticateJWT(req, res, next) {
    try {
        if (req.cookies.sessionId) {

            let split = req.cookies.sessionId.split(':.');
            let decryptObj = { iv: split[0], encryptedData: split[1] }
            let decrypted = decrypt(decryptObj)
            const sessionTokenPayload = jwt.verify(decrypted, SECRET_KEY);
            const dbFetch = await EmployeeManager.getJwt(decrypted);
            const dbTokenPayload = jwt.verify(dbFetch, SECRET_KEY);
            if (dbTokenPayload && Date.now() >= dbTokenPayload.exp) {
                // console.log('ROTATING TOKEN')
                const jwtToken = await EmployeeManager.rotateJwtToken(sessionTokenPayload.employee_id, sessionTokenPayload.position)
                res.locals.user = jwt.verify(jwtToken, SECRET_KEY);
                return next();
            }


            res.locals.user = dbTokenPayload;
            // console.log("NO ROTATION")
            return next();
        }
       
        return next();
    } catch (err) {
        
        // console.log(err)
        return next();
    }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
    try {
        if (!res.locals.user) throw new Error("Unauthorized");
        // console.log("ENSURELOGGEDIN", res.locals.user)
        return next();
    } catch (err) {
        return next(err);
    }
}


/** Middleware to use when they be logged in as an admin user.
 *
 *  If not, raises Unauthorized.
 */

function ensureManager(req, res, next) {
    try {
        if (!res.locals.user || res.locals.user.position !== 3) {
            // console.log('ENSURE MANAGER')
            throw new Error("Unauthorized");
        }
        return next();
    } catch (err) {
        return next(err);
    }
}

function ensureCorrectUserOrManager(req, res, next) {
    try {
        const user = res.locals.user;
        // console.log('ENSURE CORRECT USER OR MANAGER', user)
        if ((user.position !== 3 && user.employee_id !== req.params.id)) {
            throw new Error("Unauthorized, must be manager or same user");
        }
        return next();
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    authenticateJWT,
    ensureLoggedIn,
    ensureManager,
    ensureCorrectUserOrManager
};