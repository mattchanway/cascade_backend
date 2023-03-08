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

async function authenticateEmployeeAndGetSessionId(name, userPassword){
    let idStr = await getEmployeeId(name);

    let authResp = await request(app).post("/api/auth").send({
        id: idStr,
        password: userPassword
    })
    let sessionId = authResp.header['set-cookie'][0].slice(10)
    return sessionId;
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

describe("Employees", function(){

    test("Manager creating a new labourer, labourer CANNOT access his manager's profile, manager CAN access labourer", async function () {


        let sessionIdShawn = await authenticateEmployeeAndGetSessionId('Shawn', 'password1');
    
        
        let addNewEmpResp = await request(app).post("/api/employees").set("Cookie", `sessionId=${sessionIdShawn}`).send({
            first_name: 'Matt', last_name: 'Chanway', email: 'notmattchanway@gmail.com', position : 1, certification: 1, start_date :'2023-01-01' 
        })

        expect(addNewEmpResp.body).toEqual({
            employee_id: expect.any(Number),
            first_name: "Matt",
            last_name: "Chanway",
            email: "notmattchanway@gmail.com",
            position: 1,
            certification: 1,
            start_date: expect.any(String),
            jwt_token: null,
            session_id: null,
            password_reset_token: null,
            first_login: true
        })
        let shawnId = await getEmployeeId('Shawn')
        let mattId = await getEmployeeId('Matt');
        let mattSession = await authenticateEmployeeAndGetSessionId('Matt', 'Chanway123');
        let mattUnauthView = await request(app).get(`/api/employees/${shawnId}`).set("Cookie", `sessionId=${mattSession}`)

        expect(mattUnauthView.body).toEqual({
            message: "Unauthorized, must be manager or same user"
        })

        let shawnAuthView = await request(app).get(`/api/employees/${mattId}`).set("Cookie", `sessionId=${sessionIdShawn}`);
        expect(shawnAuthView.body).toEqual({
            timecardsData: expect.any(Array),
            userData: {
                certification_name: "None",
                employee_id: mattId,
                first_name: "Matt",
                last_name: "Chanway",
                position_name: "Welder",
                start_date: expect.any(String)
            }
        })
      
        let mattSelfView = await request(app).get(`/api/employees/${mattId}`).set("Cookie", `sessionId=${mattSession}`);
        
        expect(mattSelfView.body).toEqual({
            timecardsData: expect.any(Array),
            userData: {
                certification_name: "None",
                employee_id: mattId,
                first_name: "Matt",
                last_name: "Chanway",
                position_name: "Welder",
                start_date: expect.any(String)
            }
        })

    

    })

    test("Manager can edit employee", async function () {

        let sessionIdShawn = await authenticateEmployeeAndGetSessionId('Shawn', 'password1');
        let mattId = getEmployeeId('Matt')
        
        await request(app).post("/api/employees").set("Cookie", `sessionId=${sessionIdShawn}`).send({
            first_name: 'Matt', last_name: 'Chanway', email: 'notmattchanway@gmail.com', position : 1, certification: 1, start_date :'2023-01-01' 
        })

        let editResp = await request(app).put(`/api/employees/${mattId}`).set("Cookie", `sessionId=${sessionIdShawn}`).send(
            {first_name: 'Mark', last_name: 'Johnson', email: 'markjohnson@gmail.com', position : 1, certification: 1, start_date :'2023-01-01' }
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
            jwt_token: null,
            session_id: null,
            password_reset_token: null,
            first_login: true


            }
        )


    })


})