"use strict";

const db = require("../db.js");

const EmployeeManager = require("./EmployeeManager.js");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    getEmployeeId
} = require("../routes/_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);



//********************************* */

describe("Job Manager", function () {

    let newJob = {
        job_id: 'abc123', job_name: 'athletics store', job_address_street_line1: '456 Real St',
        job_address_street_unit: '#2', job_address_street_city: 'Vancouver', job_description: 'big job'
    }

    let invJob = {
        job_id: '', job_name: 'athletics store', job_address_street_line1: '456 Real St',
        job_address_street_unit: '#2', job_address_street_city: 'Vancouver', job_description: 'big job'
    }


    test("get all employees", async function () {

        let shawnId = await getEmployeeId('Shawn')
        let allEmployees = await EmployeeManager.getAllEmployees();

        expect(allEmployees).toEqual([{
            "certification": 1, "email": "matthewchanway@gmail.com", "employee_id": expect.any(Number),
            "first_login": true, "first_name": "Shawn", "last_name": "Rostas", "position": 3, "start_date": expect.any(Date)
        },
        {
            "certification": 1, "email": "joetest@not.com", "employee_id": expect.any(Number), "first_login": true, "first_name": "Joe",
            "last_name": "Test", "position": 1, "start_date": expect.any(Date)
        }])


    })

    test("get an employee - valid ID", async function () {

        let shawnId = await getEmployeeId('Shawn')
        let employee = await EmployeeManager.getEmployee(+shawnId);

        expect(employee).toEqual({
            userData: {
                "certification": 1, "email": "matthewchanway@gmail.com", "employee_id": shawnId,
                "first_name": "Shawn", "last_name": "Rostas", "position": 3, "start_date": expect.any(Date),
                certification_name: 'None', position_name: 'Manager'
            },
            timecardsData: [
                {
                    job_id: '400-22045',

                    timecard_date: expect.any(Date),
                    reg_time: 8,
                    overtime: 0,
                    expenses: 0,
                    notes: null,
                    time_submitted: expect.any(Date),
                    timecard_id: expect.any(Number),
                    location_submitted: null,
                    job_name: 'IQ Dental'
                },
                {
                    job_id: '400-22044',

                    timecard_date: expect.any(Date),
                    reg_time: 8,
                    overtime: 0,
                    expenses: 0,
                    notes: null,
                    time_submitted: expect.any(Date),
                    timecard_id: expect.any(Number),
                    location_submitted: null,
                    job_name: 'Dr. Oonchi'
                }
            ]
        })
    })

    test("get an employee - invalid ID", async function () {


        let employee = await EmployeeManager.getEmployee(0);

        expect(employee).toEqual(false)

    })

    test("add an employee - valid data", async function () {


        let data = { first_name: 'Gord', last_name: 'Jones', email: 'gj@gmail.com', position: 1, certification: 1, start_date: '2023-01-01' }
        let newEmp = await EmployeeManager.addEmployee(data);

        expect(newEmp).toEqual({ "employee_id": expect.any(Number), "first_name": "Gord", "last_name": "Jones" })

    })

    test("add an employee - invalid data", async function () {

        let data = { first_name: null, last_name: 'Jones', email: 'gj@gmail.com', position: 1, certification: 1, start_date: '2023-01-01' }
        let newEmp = EmployeeManager.addEmployee(data);

        expect((newEmp)).rejects.toThrow(new Error())

    })

    test("authenticate an employee, createTokens, updateTokens - valid data", async function () {
        await commonBeforeAll()

        let shawnId = await getEmployeeId('Shawn');

        let initShawn = await db.query(`select * from employees where employee_id = $1`, [+shawnId]);
        expect(initShawn.rows[0].jwt_token).toEqual(null)
        expect(initShawn.rows[0].session_id).toEqual(null)
        await EmployeeManager.authenticate(shawnId, 'password1')
        let secondShawn = await db.query(`select * from employees where employee_id = $1`, [+shawnId]);
        expect(secondShawn.rows[0].jwt_token).toEqual(expect.any(String))
        expect(secondShawn.rows[0].session_id).toEqual(expect.any(String))
    })

    test("authenticate an employee - invalid data", async function () {

        let res = await EmployeeManager.authenticate(0, 'password1')
        expect(res).toEqual(false)

    })

    test("rotateJwtTokens - valid data", async function () {

        let shawnId = await getEmployeeId('Shawn');
        await EmployeeManager.authenticate(+shawnId, 'password1')
        let initQuery = await db.query(`select * from employees where employee_id = $1`, [+shawnId]);
        let initToken = initQuery.rows[0].jwt_token;
        await EmployeeManager.rotateJwtToken(+shawnId, 3);

        let secondQuery = await db.query(`select * from employees where employee_id = $1`, [+shawnId]);
        let secondToken = secondQuery.rows[0].jwt_token;
        expect(typeof (initToken)).toEqual('string')
        expect(typeof (secondToken)).toEqual('string')
        expect(initToken).not.toEqual(secondToken)

    })

    test("rotateJwtTokens - invalid data", async function () {

        let res = await EmployeeManager.rotateJwtToken(0, 3);
        expect(res).toBeInstanceOf(Error)

    })

    test("createPasswordToken - valid data", async function () {

        let shawnId = await getEmployeeId('Shawn');
        let res = await EmployeeManager.createPasswordToken(+shawnId, 3);

        expect(res).toEqual({
            passwordToken: expect.any(String),
            email: 'matthewchanway@gmail.com'

        })

    })

    test("createPasswordToken - invalid data", async function () {


        let res = await EmployeeManager.createPasswordToken(0, 3);

        expect(res).toEqual({
            userNotFound: "User Not Found"

        })

    })

    test("whoAmI - valid data", async function () {


        let query = await db.query(`UPDATE employees SET session_id = $2 WHERE first_name = $1 returning session_id`, ['Shawn', 'abc'])
        let sessionId = query.rows[0].session_id
        let resp = await EmployeeManager.whoAmI(sessionId);
        expect(resp).toEqual({
            "certification": 1, "email": "matthewchanway@gmail.com", "employee_id": expect.any(Number), "first_login": true,
            "first_name": "Shawn", "last_name": "Rostas", "position": 3, "start_date": expect.any(Date)
        })

    })
    test("whoAmI - invalid data", async function () {

        let resp = await EmployeeManager.whoAmI(0);
        expect(resp).toEqual({ noUser: "unable to auth" })
    })

    test("getJwt - valid data", async function () {
        await db.query(`UPDATE employees SET session_id = $2, jwt_token =$3 WHERE first_name = $1 returning session_id`, ['Shawn', 'abc', '123'])
        let resp = await EmployeeManager.getJwt('abc')
        expect(resp).toEqual('123')


    })

    test("getJwt - invalid data", async function () {


        await db.query(`UPDATE employees SET session_id = $2, jwt_token =$3 WHERE first_name = $1 returning session_id`, ['Shawn', 'abc', '123'])
        let resp = await EmployeeManager.getJwt('0')
        expect(resp).toBeInstanceOf(Error)

    })

    test("updateForgottenPassword - valid data", async function () {


        let query = await db.query(`UPDATE employees SET password_reset_token =$2 WHERE first_name = $1 returning password_reset_token`, ['Shawn', 'abc'])
        let token = query.rows[0].password_reset_token

        let resp = await EmployeeManager.updateForgottenPassword(token, 'brandnewpassword')
        expect(resp).toEqual({
            "session": expect.any(String),
            "user": { "certification": 1, "email": "matthewchanway@gmail.com", "employee_id": expect.any(Number), "first_login": true, "first_name": "Shawn", "last_name": "Rostas", "position": 3, "start_date": expect.any(Date) }
        })

    })

    test("updateForgottenPassword - invalid data", async function () {

        let query = await db.query(`UPDATE employees SET password_reset_token =$2 WHERE first_name = $1 returning password_reset_token`, ['Shawn', 'abc'])

        let resp = await EmployeeManager.updateForgottenPassword('blah', 'newpassword')
        expect(resp).toEqual(false)

    })


    test("updateInternalPassword - valid data", async function () {

        let shawnId = await getEmployeeId('Shawn');

        let resp = await EmployeeManager.updateInternalPassword(+shawnId, 'newpassword22', true);

        expect(resp).toEqual({"certification": 1, "email": "matthewchanway@gmail.com", "employee_id": expect.any(Number), "first_login": false, 
        "first_name": "Shawn", "last_name": "Rostas", "position": 3, "start_date": expect.any(Date)})

        let authTest = await EmployeeManager.authenticate(shawnId, 'newpassword22')
        expect(authTest).toEqual({"certification": 1, "email": "matthewchanway@gmail.com", "employee_id": expect.any(Number), "first_login": false, 
        "first_name": "Shawn", "last_name": "Rostas", "position": 3, "start_date": expect.any(Date),
        active: true, jwt_token: expect.any(String), password_reset_token: null, session_id: expect.any(String)})

        // await EmployeeManager.updateInternalPassword(+shawnId, 'password1', true);

    })

    test("updateInternalPassword - invalid data", async function () {

        let resp = await EmployeeManager.updateInternalPassword(0, 'newpassword22', true);
        
        expect(resp).toBeInstanceOf(Error)
    })

    test("editEmployee - valid data", async function () {

        let joeId = await getEmployeeId('Joe')
        let data = { first_name: 'Joeedited', last_name:'Testedit', position:1, certification:1, start_date:'2023-01-02', email:'joenewemail@gmail.com' }

        let resp = await EmployeeManager.editEmployee(data, +joeId);
        
        expect(resp).toEqual({"certification": 1, "email": "joenewemail@gmail.com", "employee_id": expect.any(Number), "first_login": true, "first_name": "Joeedited", "last_name": "Testedit", "position": 1, "start_date": expect.any(Date)})

    })

    test("editEmployee - invalid data", async function () {

        let joeId = await getEmployeeId('Joe')
        let data = { first_name: '', last_name:'Testedit', position:1, certification:1, start_date:'2023-01-02', email:'joenewemail@gmail.com' }

        let resp = await EmployeeManager.editEmployee(data, +joeId);
        
        expect(resp).toBeInstanceOf(Error)
    

    })

    test("updateEmployeeStatus - valid data", async function () {

        let joeId = await getEmployeeId('Joe')
        let data = { first_name: 'Joeedited', last_name:'Testedit', position:1, certification:1, start_date:'2023-01-02', email:'joenewemail@gmail.com' }

        let resp = await EmployeeManager.updateEmployeeStatus(+joeId, false);
        
        expect(resp).toEqual({employee_id: expect.any(Number),
            "first_name": "Joe", "last_name": "Test", active: false})

    })

    test("get positions and certifications", async function () {

        let resp = await EmployeeManager.getPositionsAndCertifications();

        expect(resp).toEqual({"certifications": [{"certification_id": expect.any(Number), "certification_name": "Apprentice", "certification_pay": 5}, 
        {"certification_id": expect.any(Number), "certification_name": "Journeyman", "certification_pay": 15}, 
        {"certification_id": 1, "certification_name": "None", "certification_pay": 0}], 
        "positions": [{"position_base_pay": 30, "position_id": expect.any(Number), "position_name": "Labourer"}, 
        {"position_base_pay": 75, "position_id": 3, "position_name": "Manager"}, 
        {"position_base_pay": 50, "position_id": 1, "position_name": "Welder"}]})

    })



})