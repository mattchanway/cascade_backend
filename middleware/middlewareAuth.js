

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

async function authenticateSessionAndCheckJwt(req, res, next) {
        if(!req.cookies.sessionId) return next()
        let sessionTokenPayload;
    try {   
            let split = req.cookies.sessionId.split(':.');
            // console.log('middleware SPLIT', split, 'cookies', req.cookies)
            let decryptObj = { iv: split[0], encryptedData: split[1] }
            let decrypted = decrypt(decryptObj)
           
            sessionTokenPayload = jwt.verify(decrypted, SECRET_KEY);
            const dbFetchEncrypted = await EmployeeManager.getJwt(sessionTokenPayload.employee_id);
            let splitJwt = dbFetchEncrypted.split(':.');
            let decryptObjJwt = { iv: splitJwt[0], encryptedData: splitJwt[1] }
            const dbFetch = decrypt(decryptObjJwt)
            const dbTokenPayload = jwt.verify(dbFetch, SECRET_KEY);
            res.locals.user = dbTokenPayload;
            console.log("NO ROTATION")
            return next();
        
    } catch (err) {
    
        if(sessionTokenPayload && err.name === 'TokenExpiredError') res.locals.rotate = sessionTokenPayload
      
        return next();
    }
}

// ** Middleware to rotate JWT if necessary

async function rotateJwt(req, res, next){

    try{
   
        if(res.locals.user) return next();
        
        else if(res.locals.rotate){
            console.log('new middleware rotation')
            const jwtToken = await EmployeeManager.rotateJwtToken(res.locals.rotate.employee_id, res.locals.rotate.position);
            res.locals.user = jwt.verify(jwtToken, SECRET_KEY);
            return next();
        }

        return next()
    }

    catch(e){
        return next(e)
    }

}


/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
    try {
   
        if (!res.locals.user) throw new Error("Unauthorized");
        
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
    
        if ((user.position !== 3 && user.employee_id !== +req.params.id)) {
            throw new Error("Unauthorized, must be manager or same user");
        }
        return next();
    } catch (err) {
        return next(err);
    }
}

function ensureCorrectUser(req, res, next) {
    try {
        const user = res.locals.user;
    
        if ((user.employee_id !== +req.params.id)) {
            throw new Error("Unauthorized, must be same user");
        }
        return next();
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    authenticateSessionAndCheckJwt,
    rotateJwt,
    ensureLoggedIn,
    ensureManager,
    ensureCorrectUserOrManager,
    ensureCorrectUser
};