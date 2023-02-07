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

// beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

// *********************************************************

// Test that
// 1) Login/authentication works. 2) Logout works. 3)Logged in user can post a timecard. 4) User with sessionId but expired JWT gets 
// token rotated and can still make a new timecard. 5) User can change their password, get their token and post a timecard
// 6) User can have their sessionId expire and their token will not work. 7) Test that only manager can do admin functions

describe("POST /auth", function() {
    test("authentication works", async function(){

    let shawnIdStr = getShawnId();
    let shawnId = shawnIdStr 
    console.log('HHHWWEEEEEEEEEERE', shawnId)       

 const resp = await request(app).post("/auth/").send({
    id: shawnId,
    password: "password2"
 })
    expect(resp.body).toEqual({
        employee_id: 2,
        first_name: "Shawn",
        last_name: "Rostas",
        email: "testEmail2@gmail.com",
        position: 3,
        certification: 3,
        start_date: '2008-01-01',
        address: expect.any(String),
        photo: expect.any(String),
        jwt_token: expect.any(String),
        session_id: expect.any(String),
        password_reset_token: null,
        first_login: true


    })

    })
}
)
