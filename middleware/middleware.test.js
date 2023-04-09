"use strict"

const request = require("supertest");

const app = require("../app");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    getEmployeeId
} = require("../routes/_testCommon");

const { authenticateSessionAndCheckJwt,
    rotateSessionAndJwt,
    ensureLoggedIn, ensureManager, ensureCorrectUserOrManager, ensureCorrectUser } = require("./middleware");

async function authenticateEmployeeAndGetSessionCookie(name, userPassword) {
    let idStr = await getEmployeeId(name);
    let authResp = await request(app).post("/api/auth").send({
        id: idStr,
        password: userPassword
    })
    if (!authResp.header['set-cookie']) console.debug('INSIDE TROUBLE FN', authResp, name, userPassword)
    let sessionIdHeader = authResp.header['set-cookie'][0].slice(10)
    let jwtHeader = authResp.header['set-cookie'][1].slice(4);
    let sessionSplit = sessionIdHeader.split(';')
    let jwtSplit = jwtHeader.split(';')

    let session = decodeURIComponent(sessionSplit[0]);
    let jwt = decodeURIComponent(jwtSplit[0]);
    return { session, jwt }
}



beforeAll(commonBeforeAll)
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("Middleware", function () {






    test("authenticateSessionAndCheckJwt - valid jwt", async function () {
        expect.assertions(3)

        let { jwt, session } = await authenticateEmployeeAndGetSessionCookie('Shawn', 'password1')
        let res = {
            locals: {

            }
        }
        let next = jest.fn()

        const req = {
            cookies: {
                sessionId: session,
                jwt: jwt
            }
        }

        await authenticateSessionAndCheckJwt(req, res, next);
        expect(next).toHaveBeenCalled()
        expect(res.locals.user.employee_id).not.toEqual(undefined)
        expect(res.locals.user.position).not.toEqual(undefined)
    })


    test("authenticateSessionAndCheckJwt - no JWT, valid session", async function () {
        expect.assertions(2)
        let { jwt, session } = await authenticateEmployeeAndGetSessionCookie('Shawn', 'password1')
        let res = {
            locals: {

            }
        }
        let next = jest.fn()

        const req = {
            cookies: {
                sessionId: session

            }
        }

        await authenticateSessionAndCheckJwt(req, res, next);
        expect(next).toHaveBeenCalled()
        expect(res.locals.user).toEqual(undefined)
    })



    test("authenticateSessionAndCheckJwt - no JWT, no sessionID", async function () {

        expect.assertions(2)

        let res = {
            locals: {


            }
        }
        let next = jest.fn()

        const req = {

        }

        await authenticateSessionAndCheckJwt(req, res, next);
        expect(next).toHaveBeenCalled()
        expect(res.locals.user).toEqual(undefined)



    })

    test("rotateSessionAndJwt - valid JWT already present", async function () {
        expect.assertions(2)
        let res = {
            locals: {
                user: {
                    employee_id: 1,
                    position: 1
                }

            }
        }
        let next = jest.fn()
        const req = {
            cookies: {
                sessionId: 'abc123'

            }
        }

        await rotateSessionAndJwt(req, res, next);
        expect(next).toHaveBeenCalled()
        expect(res.cookies).toEqual(undefined)
    })





    test("rotateSessionAndJwt - only sessionId present", async function () {

        expect.assertions(4)
        let { jwt, session } = await authenticateEmployeeAndGetSessionCookie('Shawn', 'password1')
        let res = {
            locals: {
            }
        }
        let next = jest.fn()
        const req = {
            cookies: {
                sessionId: session

            }
        }
        res.cookie = jest.fn((opt1, opt2, moreOptions) => {

            if ('cookies' in res) {
                res.cookies[opt1] = opt2
            }
            else {
                res.cookies = {}
                res.cookies[opt1] = opt2
            }
        })
        await rotateSessionAndJwt(req, res, next)

        expect(res.locals.user).not.toEqual(undefined);
        expect(res.cookies.sessionId).not.toEqual(undefined)
        expect(res.cookies.jwt).not.toEqual(undefined)
        expect(res.cookies.sessionId).not.toEqual(session)

    })

    test("rotateSessionAndJwt - no JWT, corrupted sessionID", async function () {

        let next = jest.fn()

        const req = {
            cookies: {
                sessionId: 'abc123'

            }
        }
        let res = {
            locals: {
            }
        }

        await rotateSessionAndJwt(req, res, next);
        expect(next).toBeCalledWith(new Error('The first argument must be of type string or an instance of Buffer, ArrayBuffer, or Array or an Array-like Object. Received undefined'))
        expect(res.locals.user).toEqual(undefined)

    })

    test("rotateSessionAndJwt - no JWT or sessionID", async function () {
        expect.assertions(3)
        let next = jest.fn()

        const req = {

        }
        let res = {
            locals: {
            }
        }

        await rotateSessionAndJwt(req, res, next);

        expect(next).toHaveBeenCalled()
        expect(next).toHaveBeenCalledWith()
        expect(res.locals.user).toEqual(undefined)




    })

    test("ensureLoggedIn - res.locals", async function () {

        expect.assertions(2)
        let next = jest.fn()

        const req = {

        }
        let res = {
            locals: {
                user: {
                    employee_id: 1,
                    position: 3
                }
            }
        }

        await ensureLoggedIn(req, res, next);

        expect(next).toHaveBeenCalled()
        expect(next).toHaveBeenCalledWith()

    })

    test("ensureLoggedIn - no res.locals", async function () {

        expect.assertions(1)
        let next = jest.fn()

        const req = {
            locals: {}
        }
        let res = {
            locals: {

            }
        }
        await ensureLoggedIn(req, res, next);
        expect(next).toHaveBeenCalledWith(new Error("Unauthorized"))

    })

    test("ensureManager - pass", async function () {

        expect.assertions(2)
        let next = jest.fn()

        const req = {

        }
        let res = {
            locals: {
                user: {
                    employee_id: 1,
                    position: 3
                }
            }
        }
        await ensureManager(req, res, next);

        expect(next).toHaveBeenCalled()
        expect(next).toHaveBeenCalledWith()

    })

    test("ensureManager - fail", async function () {

        expect.assertions(1)
        let next = jest.fn()

        const req = {

        }
        let res = {
            locals: {
                user: {
                    employee_id: 1,
                    position: 1
                }
            }
        }
        await ensureManager(req, res, next);

        expect(next).toHaveBeenCalledWith(new Error("Unauthorized"))

    })

    test("ensureSameUser - pass", async function () {

        expect.assertions(2)
        let next = jest.fn()

        const req = {
            params: { id: 1 }

        }
        let res = {
            locals: {
                user: {
                    employee_id: 1,
                    position: 2
                }
            }
        }
        await ensureCorrectUser(req, res, next);

        expect(next).toHaveBeenCalled()
        expect(next).toHaveBeenCalledWith()

    })

    test("ensureSameUser - fail", async function () {

        expect.assertions(1)
        let next = jest.fn()

        const req = {
            params: { id: 1 }

        }
        let res = {
            locals: {
                user: {
                    employee_id: 2,
                    position: 2
                }
            }
        }
        await ensureCorrectUser(req, res, next);

        expect(next).toHaveBeenCalledWith(new Error("Unauthorized, must be same user"))

    })

    test("ensureSameUserOrManager - pass", async function () {

        expect.assertions(2)
        let next = jest.fn()

        const req = {
            params: { id: 1 }

        }
        let res = {
            locals: {
                user: {
                    employee_id: 2,
                    position: 3
                }
            }
        }
        await ensureCorrectUserOrManager(req, res, next);

        expect(next).toHaveBeenCalled()
        expect(next).toHaveBeenCalledWith()

    })









})
