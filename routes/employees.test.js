"use strict"

const request = require("supertest");

const app = require("../app");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    getEmployeeId
} = require("./_testCommon");

async function authenticateEmployeeAndGetSessionCookie(name, userPassword) {
    let idStr = await getEmployeeId(name);
    let authResp = await request(app).post("/api/auth").send({
        id: idStr,
        password: userPassword
    })
    let sessionIdHeader = authResp.header['set-cookie'][0].slice(10)
    let jwtHeader = authResp.header['set-cookie'][1].slice(4);
    let sessionSplit = sessionIdHeader.split(';')
    let jwtSplit = jwtHeader.split(';')
    
    let session = decodeURIComponent(sessionSplit[0]);
    let jwt = decodeURIComponent(jwtSplit[0]);
    return {session, jwt}
}

// async function getPositionsAndCerts(){

//     let resp = await request(app).get("/api/employees/params");
//     let c =resp.body.certifications[0].certification_id

//     let managerId = -1;

//     for(let z = 0; z < resp.body.positions.length ; z++){

//         let curr = resp.body.positions[z];

//         if(curr.position_name === 'Manager') managerId = curr.position_id
//     }

//     return {manager: managerId, cert: c}

// }



beforeAll(commonBeforeAll)
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("Employees", function () {

    test("Manager creating a new labourer, labourer CANNOT access his manager's profile, manager CAN access labourer", async function () {


        let {session, jwt} = await authenticateEmployeeAndGetSessionCookie('Shawn', 'password1');


        let addNewEmpResp = await request(app).post("/api/employees").set("Cookie", [`sessionId=${session}`, `jwt=${jwt}`]).send({
            first_name: 'Matt', last_name: 'Chanway', email: 'notmattchanway@gmail.com', position: 1, certification: 1, start_date: '2023-01-01'
        })

        expect(addNewEmpResp.body).toEqual({
            employee_id: expect.any(Number),
            first_name: "Matt",
            last_name: "Chanway"
            
        })
        let shawnId = await getEmployeeId('Shawn')
        let mattId = await getEmployeeId('Matt');
        let mattSession = await authenticateEmployeeAndGetSessionCookie('Matt', 'Chanway123');
        let mattSessionId = mattSession.session;
        let mattJwt = mattSession.jwt

        let mattUnauthView = await request(app).get(`/api/employees/${shawnId}`).set("Cookie", [`sessionId=${mattSessionId}`, `jwt=${mattJwt}`])

        expect(mattUnauthView.body).toEqual({
            message: "Unauthorized, must be manager or same user"
        })

        let shawnAuthView = await request(app).get(`/api/employees/${mattId}`).set("Cookie", [`sessionId=${session}`, `jwt=${jwt}`]);
        expect(shawnAuthView.body).toEqual({
            timecardsData: expect.any(Array),
            userData: {
                certification_name: "None",
                certification: 1,
                email: "notmattchanway@gmail.com",
                position: 1,
                employee_id: mattId,
                first_name: "Matt",
                last_name: "Chanway",
                position_name: "Welder",
                start_date: expect.any(String)
            }
        })

        let mattSelfView = await request(app).get(`/api/employees/${mattId}`).set("Cookie", [`sessionId=${mattSessionId}`, `jwt=${mattJwt}`]);

        expect(mattSelfView.body).toEqual({
            timecardsData: expect.any(Array),
            userData: {
                certification_name: "None",
                certification: 1,
                email: "notmattchanway@gmail.com",
                position:1,
                employee_id: mattId,
                first_name: "Matt",
                last_name: "Chanway",
                position_name: "Welder",
                start_date: expect.any(String)
            }
        })



    })

    test("Manager can edit employee", async function () {

        let {session, jwt} = await authenticateEmployeeAndGetSessionCookie('Shawn', 'password1');
        await request(app).post("/api/employees").set("Cookie", [`sessionId=${session}`, `jwt=${jwt}`]).send({
            first_name: 'Matt', last_name: 'Chanway', email: 'notmattchanway@gmail.com', position: 1, certification: 1, start_date: '2023-01-01'
        })
        let mattId = await getEmployeeId('Matt')
        let editResp = await request(app).put(`/api/employees/${mattId}`).set("Cookie", [`sessionId=${session}`, `jwt=${jwt}`]).send(
            { first_name: 'Mark', last_name: 'Johnson', email: 'markjohnson@gmail.com', position: 1, certification: 1, start_date: '2023-01-01' }
        )
        expect(editResp.body).toEqual(
            {
                employee_id: mattId,
                first_name: "Mark",
                last_name: "Johnson",
                email: "markjohnson@gmail.com",
                position: 1,
                certification: 1,
                start_date: expect.any(String),
        
                first_login: true


            }
        )

    })

    test("Employee cannot edit", async function () {

        let {session, jwt} = await authenticateEmployeeAndGetSessionCookie('Shawn', 'password1');
        await request(app).post("/api/employees").set("Cookie", [`sessionId=${session}`, `jwt=${jwt}`]).send({
            first_name: 'Matt', last_name: 'Chanway', email: 'notmattchanway@gmail.com', position: 1, certification: 1, start_date: '2023-01-01'
        })
        let mattId = await getEmployeeId('Matt')
        let sessionMatt = await authenticateEmployeeAndGetSessionCookie('Matt', 'Chanway123')
        let sessionIdMatt = sessionMatt.session
        let mattJwt = sessionMatt.jwt

        let editResp = await request(app).put(`/api/employees/${mattId}`).set("Cookie", [`sessionId=${sessionIdMatt}`, `jwt=${mattJwt}`]).send(
            { first_name: 'Mark', last_name: 'Johnson', email: 'markjohnson@gmail.com', position: 1, certification: 1, start_date: '2023-01-01' }
        )
        expect(editResp.body).toEqual(
            {
                message: "Unauthorized"
            }
        )
    })

    test("Employee can update password, both on first login and afterwards", async function () {

        let {session} = await authenticateEmployeeAndGetSessionCookie('Shawn', 'password1');
        let create = await request(app).post("/api/employees").set("Cookie", `sessionId=${session}`).send({
            first_name: 'Matt', last_name: 'Chanway', email: 'notmattchanway@gmail.com', position: 1, certification: 1, start_date: '2023-01-01'
        })
        let mattId = await getEmployeeId('Matt')
        let sessionIdMatt = await authenticateEmployeeAndGetSessionCookie('Matt', 'Chanway123')
        console.debug('HERRE', sessionIdMatt)
        let editResp = await request(app).patch(`/api/employees/${mattId}`).set("Cookie", `sessionId=${sessionIdMatt.session}`).send(
            { password: 'gonzaga', firstLogin: true }
        )
        expect(editResp.body).toEqual(
            {
                employee_id: mattId,
                first_name: "Matt",
                last_name: "Chanway",
                email: "notmattchanway@gmail.com",
                position: 1,
                certification: 1,
                start_date: expect.any(String),
              
                first_login: false
            }
        )
        let secondEditResp = await request(app).patch(`/api/employees/${mattId}`).set("Cookie", `sessionId=${sessionIdMatt.session}`).send(
            { password: 'gonzagaz', firstLogin: false }
        )

        expect(secondEditResp.body).toEqual(
            {
                employee_id: mattId,
                first_name: "Matt",
                last_name: "Chanway",
                email: "notmattchanway@gmail.com",
                position: 1,
                certification: 1,
                start_date: expect.any(String),
              
                first_login: false
            }
        )

    })

    test("Manager cannot update another employee's password", async function () {

        let {session, jwt} = await authenticateEmployeeAndGetSessionCookie('Shawn', 'password1');
        await request(app).post("/api/employees").set("Cookie", `sessionId=${session}`).send({
            first_name: 'Matt', last_name: 'Chanway', email: 'notmattchanway@gmail.com', position: 1, certification: 1, start_date: '2023-01-01'
        })
        let mattId = await getEmployeeId('Matt')
        let editResp = await request(app).patch(`/api/employees/${mattId}`).set("Cookie", `sessionId=${session}`).send(
            { password: 'gonzaga', firstLogin: true }
        )
        expect(editResp.body).toEqual(
            {
                message:"Unauthorized, must be same user"
            }
        )
      

    })






})