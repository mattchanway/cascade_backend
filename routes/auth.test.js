"use strict"

const request = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../app");
const db = require("../db");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    getEmployeeId
} = require("./_testCommon");
const { JsonWebTokenError } = require("jsonwebtoken");
const { getJwt } = require("../models/EmployeeManager");

async function authenticateEmployeeAndGetSessionId(name, userPassword) {
    let idStr = await getEmployeeId(name);

    let authResp = await request(app).post("/api/auth").send({
        id: idStr,
        password: userPassword
    })
    let sessionId = authResp.header['set-cookie'][0].slice(10)
    console.log('in FN', sessionId, 'header', authResp.header)
    return sessionId
   
}

jest.useFakeTimers()


beforeAll(commonBeforeAll)
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

// *********************************************************

// Test that
// 1) Login/authentication works. 2) Logout works. 3)Logged in user can post a timecard. 4) User with sessionId but expired JWT gets 
// token rotated and can still make a new timecard. 5) User can change their password, get their token and post a timecard
// 6) User can have their sessionId expire and their token will not work. 7) Test that only manager can do admin functions

describe("POST /auth", function () {
    test("authentication, setting cookie on res object, and logging out removes cookie", async function () {

        let shawnIdStr = await getEmployeeId('Shawn');
        let shawnId = shawnIdStr

        const resp = await request(app).post("/api/auth").send({
            id: shawnId,
            password: "password1"
        })

        //  DATE IS TECHNICALLY NOT CORRECT
        expect(resp.body).toEqual({
            employee_id: expect.any(Number),
            first_name: "Shawn",
            last_name: "Rostas",
            email: "matthewchanway@gmail.com",
            position: expect.any(Number),
            certification: expect.any(Number),
            start_date: expect.any(String),
            first_login: true,
            active: true,
            jwt_token: expect.any(String),
            password_reset_token: null,
            session_id: expect.any(String)
        })
        expect(resp.header['set-cookie'][0].slice(0, 9)).toEqual('sessionId')

        const logoutResp = request(app).get("/api/auth/logout").set("Cookie", "sessionId=abc");
        expect(logoutResp.header["set-cookie"]).toBeUndefined();

    })

    test("authentication denies access with bad password", async function () {

        let shawnIdStr = await getEmployeeId('Shawn');
        let shawnId = shawnIdStr
        const resp = await request(app).post("/api/auth").send({
            id: shawnId,
            password: "password47"
        })
        expect(resp.body).toEqual(false)
    })

    test("authentication denies access with non-existent user", async function () {

        const resp = await request(app).post("/api/auth").send({
            id: 0,
            password: "password47"
        })
        expect(resp.body).toEqual(false)
    })



    // test("whoamI does not work with a bad sessionId", async function () {

    // THIS ONLY TESTS THAT A FAKE/GARBLED SESSION ID WILL RETURN AN ERROR. IT HAS BEEN MANUALLY TESTED AND SHOWN TO WORK


    //     const resp = await request(app).get("/api/auth/whoami").set("Cookie", "sessionId=abc");
    //     console.debug(resp)

    //     expect(resp.body).toEqual({ message: "Session error" })

      
     
    // })

    test("whoamI works with a valid sessionId", async function () {


        let shawnIdStr = await getEmployeeId('Shawn');
        let shawnId = shawnIdStr

        const loginResp = await request(app).post("/api/auth").send({
            id: shawnId,
            password: "password1"
        })
      

        let encryptedCookie = (loginResp.header['set-cookie'][0].split(';')[0].slice(10))

        const whoAmIResp = await request(app).get("/api/auth/whoami").set("Cookie", `sessionId=${encryptedCookie}`);

        expect(whoAmIResp.body).toEqual({
            employee_id: expect.any(Number),
            first_name: "Shawn",
            last_name: "Rostas",
            email: "matthewchanway@gmail.com",
            position: expect.any(Number),
            certification: expect.any(Number),
            start_date: expect.any(String),
            first_login: true
        })

    })

    test("create forgot password token works with valid employee ID", async function () {
        let shawnIdStr = await getEmployeeId('Shawn');

        const passwordResp = await request(app).post(`/api/auth/password-token/${shawnIdStr}`);
        expect(passwordResp.body).toEqual({
            passwordToken: expect.any(String),
            email: expect.any(String)
        })
    })

    test("create forgot password token does not work with invalid employee ID", async function () {

        const passwordResp = await request(app).post(`/api/auth/password-token/0`);
        expect(passwordResp.body).toEqual({
            userNotFound: "User Not Found"
        })
    })

    test("valid token updates password, and user can login with this password", async function () {

        let shawnIdStr = await getEmployeeId('Shawn');

        let tokenResp = await request(app).post(`/api/auth/password-token/${shawnIdStr}`);
        let token = tokenResp.body.passwordToken;

        let updatePasswordResp = await request(app).post(`/api/auth/password-forgotten-update/${token}`).send({ password: "newPassword25" });

        expect(updatePasswordResp.body).toEqual({
            employee_id: expect.any(Number),
            first_name: "Shawn",
            last_name: "Rostas",
            email: "matthewchanway@gmail.com",
            position: expect.any(Number),
            certification: expect.any(Number),
            start_date: expect.any(String),
            first_login: true
            
        })
        expect(updatePasswordResp.header['set-cookie'][0].slice(0, 9)).toEqual('sessionId')
        let sessionId = updatePasswordResp.header['set-cookie'][0].slice(10)

        request(app).get("/api/auth/logout").set("Cookie", `sessionId=${sessionId}`);

        const newLoginResp = await request(app).post("/api/auth").send({
            id: shawnIdStr,
            password: "newPassword25"
        })

     
        expect(newLoginResp.body).toEqual({
            employee_id: expect.any(Number),
            first_name: "Shawn",
            last_name: "Rostas",
            email: "matthewchanway@gmail.com",
            position: expect.any(Number),
            certification: expect.any(Number),
            start_date: expect.any(String),
        
            first_login: true,
            active: true,
            jwt_token: expect.any(String),
            password_reset_token: null,
            session_id: expect.any(String)
        })


        let tokenRespTwo = await request(app).post(`/api/auth/password-token/${shawnIdStr}`);

        await request(app).post(`/api/auth/password-forgotten-update/${tokenRespTwo.body.passwordToken}`).send({ password: "password1" });




    })

    test("invalid token does not update a password", async function () {

        let shawnIdStr = await getEmployeeId('Shawn');

        let updatePasswordResp = await request(app).post(`/api/auth/password-forgotten-update/abc123`).send({ password: "newPassword25" });

        expect(updatePasswordResp.body).toEqual({
            message: "jwt malformed"
        })

    

    })

    // COOKIE TIMEOUT TESTS BELOW

    test("forgot password token invalid after 10 minutes", async function () {

        let shawnIdStr = await getEmployeeId('Shawn');

        const passwordResp = await request(app).post(`/api/auth/password-token/${shawnIdStr}`);
        expect(passwordResp.body).toEqual({
            passwordToken: expect.any(String),
            email: expect.any(String)
        })

        
        let token = passwordResp.body.passwordToken;

         setTimeout( async ()=>{
            let updatePasswordResp = await request(app).post(`/api/auth/password-forgotten-update/${token}`).send({ password: "newPassword25" });
            expect(updatePasswordResp.body).toEqual({message: "jwt expired"})
        }, ((1000*60)*11))

        jest.advanceTimersByTime((1000*60)*11)
    
    })

    test("rotate jwt is called after 15 minutes", async function () {
        let shawnId = await getEmployeeId('Shawn')
        let shawnSession = await authenticateEmployeeAndGetSessionId('Shawn','password1')
        let test = await db.query(`SELECT * from employees where employee_id = $1`,[shawnId])
        console.debug(test.rows[0])
        console.debug('here', shawnSession)
        let initShawnJwt = await getJwt(shawnSession)
        
        setTimeout(async ()=>{

            let initResp = await request(app).get('/api/employees').set("Cookie", `sessionId=${shawnSession}`);
        expect(initResp.body).toEqual([{"certification": 1, "email": "matthewchanway@gmail.com", "employee_id": expect.any(Number), "first_login": true, 
        "first_name": "Shawn", "last_name": "Rostas", "position": 3, "start_date": expect.any(String)},
         {"certification": 1, "email": "joetest@not.com", "employee_id": expect.any(Number), "first_login": true, "first_name": "Joe", "last_name": "Test", 
         "position": 1, "start_date": expect.any(String)}])
        let secondJwt = await getJwt(shawnSession);
        expect(secondJwt).not.toEqual(initShawnJwt)


        },(1000*60)*16)
        jest.advanceTimersByTime((1000*60)*16)
    
    })

    test("session expires after x hours", async function () {

        let shawnSession = await authenticateEmployeeAndGetSessionId('Shawn','password1');
        let initResp = await request(app).get('/api/employees').set("Cookie", `sessionId=${shawnSession}`);
        expect(initResp.body).toEqual([{"certification": 1, "email": "matthewchanway@gmail.com", "employee_id": expect.any(Number), "first_login": true, 
        "first_name": "Shawn", "last_name": "Rostas", "position": 3, "start_date": expect.any(String)},
         {"certification": 1, "email": "joetest@not.com", "employee_id": expect.any(Number), "first_login": true, "first_name": "Joe", "last_name": "Test", 
         "position": 1, "start_date": expect.any(String)}])

        setTimeout( async()=>{
            let resp = await request(app).get('/api/employees').set("Cookie", `sessionId=${shawnSession}`);
            expect(resp.body).toEqual({message: "Unauthorized"})

        }, ((1000*60*60)*8))

        jest.advanceTimersByTime((1000*60*60)*8)

    
    })





}
)
