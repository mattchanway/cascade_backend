"use strict"

const request = require("supertest");

const app = require("../app");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    getShawnId
} = require("./_testCommon");



beforeAll(commonBeforeAll)
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

// *********************************************************

// Test that
// 1) Login/authentication works. 2) Logout works. 3)Logged in user can post a timecard. 4) User with sessionId but expired JWT gets 
// token rotated and can still make a new timecard. 5) User can change their password, get their token and post a timecard
// 6) User can have their sessionId expire and their token will not work. 7) Test that only manager can do admin functions

describe("POST /auth", function() {
    test("authentication  and sets a cookie on the res object", async function(){

    let shawnIdStr = await getShawnId();
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
        jwt_token: expect.any(String),
        session_id: expect.any(String),
        password_reset_token: null,
        first_login: true
    })
    expect(resp.header['set-cookie'][0].slice(0,9)).toEqual('sessionId')

    const logoutResp = request(app).get("/api/auth/logout").set("sessionId", "abc");
    expect(logoutResp.header["set-cookie"]).toBeUndefined();

    })

    test("authentication denies access with bad password", async function(){

        let shawnIdStr = await getShawnId();
        let shawnId = shawnIdStr   
     const resp = await request(app).post("/api/auth").send({
        id: shawnId,
        password: "password47"
     })
        expect(resp.body).toEqual(false)
        })

    test("whoamI does not work with a bad sessionId", async function(){

        const resp = await request(app).get("/api/auth/whoami").set("sessionId", "abc");
        expect(resp.body).toEqual({noUser: "unable to auth"})
    })

    test("whoamI works with a valid sessionId", async function(){


        let shawnIdStr = await getShawnId();
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
    jwt_token: expect.any(String),
    session_id: expect.any(String),
    password_reset_token: null,
    first_login: true
})
       
    })



}
)
