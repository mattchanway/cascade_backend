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

async function authenticateShawnAndGetSessionId(name){
    let shawnIdStr = await getShawnId(name);
    let authResp = await request(app).post("/api/auth").send({
        id: shawnIdStr,
        password: "password1"
    })
    let sessionId = authResp.header['set-cookie'][0].slice(10)
    return sessionId;
}

async function getPositionsAndCerts(){

    let resp = await request(app).get("/api/employees/params");
    let c =resp.body.certifications[0].certification_id
    
    let managerId = -1;

    for(let z = 0; z < resp.body.positions.length ; z++){
       
        let curr = resp.body.positions[z];
       
        if(curr.position_name === 'Manager') managerId = curr.position_id
    }

    return {manager: managerId, cert: c}

}



beforeAll(commonBeforeAll)
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("Employees", function(){

    test("authenticating manager and creating a new labourer, labourer cannot access his manager's profile", async function () {


        let sessionIdShawn = await authenticateShawnAndGetSessionId('Shawn');
        let {manager, cert} = await getPositionsAndCerts();
        
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
        let shawnId = await getShawnId('Shawn')
        let MattId = addNewEmpResp.body.employee_id;
        let mattSession = authenticateShawnAndGetSessionId('Matt');
        let mattUnauthView = await request(app).get(`/api/employees/${shawnId}`).set("Cookie", `sessionId=${mattSession}`)

    

    })


})