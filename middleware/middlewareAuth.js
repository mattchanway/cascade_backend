

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const EmployeeManager = require("../models/EmployeeManager");
const { decrypt, encrypt } = require("../encryption");
const DOMAIN_URL = process.env.NODE_ENV === 'production' ? '.cascademetaldesign.work' : 'localhost'

/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */



async function authenticateSessionAndCheckJwt(req, res, next) {
    if (!req.cookies.jwt) return next()
    try {
        let testDecode = decodeURIComponent(req.cookies.jwt);

        let encryptedJwtSplit = testDecode.split(':.');
        let jwtObj = { iv: encryptedJwtSplit[0], encryptedData: encryptedJwtSplit[1] }
        let decryptedJwt = decrypt(jwtObj)
        const dbTokenPayload = jwt.verify(decryptedJwt, SECRET_KEY);
        res.locals.user = dbTokenPayload;
        console.log("NO ROTATION")
        return next();

    } catch (err) {
        return next();
    }
}

// ** Middleware to rotate JWT if necessary

async function rotateSessionAndJwt(req, res, next) {

    if (!req.cookies.sessionId || res.locals.user) return next();
    try {
        console.log('ROTATING')
        let testDecode = decodeURIComponent(req.cookies.sessionId);
        let split = testDecode.split(':.');
        let decrypted = decrypt({ iv: split[0], encryptedData: split[1] })
        let { employee_id, position } = jwt.verify(decrypted, SECRET_KEY);
        let { jwtToken, session } = await EmployeeManager.createNewTokens(employee_id, position);
        await EmployeeManager.updateDatabaseTokens(employee_id, jwtToken, session);
        let encrypted = encrypt(session)
        let encryptedJwt = encrypt(jwtToken)
        res.cookie('sessionId', encrypted, { maxAge: ((1000 * 60) * 420), domain: DOMAIN_URL, secure: true, httpOnly: true });
        res.cookie('jwt', encryptedJwt, { maxAge: ((1000 * 60) * 15), domain: DOMAIN_URL, secure: true, httpOnly: true });
        let payload = jwt.verify(jwtToken, SECRET_KEY)
        res.locals.user = payload
        return next();

    }
    catch (e) {
        console.log('rotatin error', e)
        return next()
    }

}


// async function rotateJwt(req, res, next) {

//     try {

//         if (res.locals.user) return next();

//         else if (res.locals.rotate) {
//             console.log('new middleware rotation')
//             const jwtToken = await EmployeeManager.rotateJwtToken(res.locals.rotate.employee_id, res.locals.rotate.position);
//             res.locals.user = jwt.verify(jwtToken, SECRET_KEY);
//             return next();
//         }

//         return next()
//     }

//     catch (e) {
//         return next(e)
//     }

// }


/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
    try {
        console.log('req ENSURE LOGGED IN')
        if (!res.locals.user) throw new Error("Unauthorized");

        return next();
    } catch (err) {
        console.log('catch err', err)
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
    rotateSessionAndJwt,
    ensureLoggedIn,
    ensureManager,
    ensureCorrectUserOrManager,
    ensureCorrectUser
};