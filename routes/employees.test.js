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



beforeAll(commonBeforeAll)
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("Employees", function () {

    test("Manager creating a new labourer, labourer CANNOT profile, manager CAN access labourer", async function () {


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

        let mattUnauthView = await request(app).get(`/api/employees/${shawnId}`).set("Cookie", [`sessionId=${mattSessionId}`, `jwt=${mattJwt}`].join(";"))

        expect(mattUnauthView.body).toEqual({
            message: "Unauthorized"
        })

        let shawnAuthView = await request(app).get(`/api/employees/${mattId}`).set("Cookie", [`sessionId=${session}`, `jwt=${jwt}`]);
        expect(shawnAuthView.body).toEqual({
            timecardsData: expect.any(Array),
            userData: {
                certification_name: "None",
                certification: 1,
                active:true,
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
            message: "Unauthorized"   
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
       let r = await request(app).post("/api/employees").set("Cookie", [`sessionId=${session}`, `jwt=${jwt}`]).send({
            first_name: 'Matt', last_name: 'Chanway', email: 'notmattchanway@gmail.com', position: 1, certification: 1, start_date: '2023-01-01'
        })
        console.debug('looking at headers', jwt, 'r',r.header)

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

    test("Non-manager cannot create employee", async function () {


        let {session, jwt} = await authenticateEmployeeAndGetSessionCookie('Joe', 'password1');


        let addNewEmpResp = await request(app).post("/api/employees").set("Cookie", [`sessionId=${session}`, `jwt=${jwt}`]).send({
            first_name: 'Cant', last_name: 'Create', email: 'notmattchanway@gmail.com', position: 1, certification: 1, start_date: '2023-01-01'
        })

        expect(addNewEmpResp.body).toEqual({
            message: 'Unauthorized'
            
        })
        

    })

    test("Manager can update employee status", async function () {


        let {session, jwt} = await authenticateEmployeeAndGetSessionCookie('Shawn', 'password1');
        let joeId = await getEmployeeId('Joe')

        let addNewEmpResp = await request(app).patch(`/api/employees/status/${joeId}`).set("Cookie", [`sessionId=${session}`, `jwt=${jwt}`]).send({
            status: false
        })
        expect(addNewEmpResp.body).toEqual({
            active: false,
            employee_id: expect.any(Number),
            first_name: 'Joe',
            last_name: 'Test'
            
        })
        
    })

    test("Manager cannot update non-existing employee status", async function () {


        let {session, jwt} = await authenticateEmployeeAndGetSessionCookie('Shawn', 'password1');
      

        let addNewEmpResp = await request(app).patch(`/api/employees/status/0`).set("Cookie", [`sessionId=${session}`, `jwt=${jwt}`]).send({
            status: false
        })
        expect(addNewEmpResp.body).toEqual({
           message: 'Employee not found'
            
        })
        
    })

    test("Non-manager cannot update employee status", async function () {


        let {session, jwt} = await authenticateEmployeeAndGetSessionCookie('Joe', 'password1');
        let joeId = await getEmployeeId('Joe')

        let addNewEmpResp = await request(app).patch(`/api/employees/status/${joeId}`).set("Cookie", [`sessionId=${session}`, `jwt=${jwt}`]).send({
            status: false
        })
        expect(addNewEmpResp.body).toEqual({
            message: 'Unauthorized'
            
        })
        
    })






})