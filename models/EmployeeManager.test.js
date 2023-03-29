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

        expect(allEmployees).toEqual([{"certification": 1, "email": "matthewchanway@gmail.com", "employee_id": expect.any(Number), 
        "first_login": true, "first_name": "Shawn", "last_name": "Rostas", "position": 3, "start_date": expect.any(Date)},
         {"certification": 1, "email": "joetest@not.com", "employee_id": expect.any(Number), "first_login": true, "first_name": "Joe", 
         "last_name": "Test", "position": 1, "start_date": expect.any(Date)}])
        
        
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
            timecardsData:[
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


        let data = { first_name: 'Gord', last_name: 'Jones', email:'gj@gmail.com', position:1, certification: 1, start_date:'2023-01-01' }
        let newEmp = await EmployeeManager.addEmployee(data);

        expect(newEmp).toEqual({"employee_id": expect.any(Number), "first_name": "Gord", "last_name": "Jones"})
        
    })

    test("add an employee - invalid data", async function () {

        let data = { first_name: null, last_name: 'Jones', email:'gj@gmail.com', position:1, certification: 1, start_date:'2023-01-01' }
        let newEmp = await EmployeeManager.addEmployee(data);

        expect((newEmp)).toBeInstanceOf(Error)
        
    })

    test("authenticate an employee, createTokens, updateTokens - valid data", async function () {
        await commonBeforeAll()

        let shawnId = await getEmployeeId('Shawn');

        let initShawn = await db.query(`select * from employees where employee_id = $1`,[+shawnId]);
        expect(initShawn.rows[0].jwt_token).toEqual(null)
        expect(initShawn.rows[0].session_id).toEqual(null)
        await EmployeeManager.authenticate(shawnId, 'password1')
        let secondShawn = await db.query(`select * from employees where employee_id = $1`,[+shawnId]);
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
        let initQuery = await db.query(`select * from employees where employee_id = $1`,[+shawnId]);
        let initToken = initQuery.rows[0].jwt_token;
        await EmployeeManager.rotateJwtToken(+shawnId, 3);

        let secondQuery = await db.query(`select * from employees where employee_id = $1`,[+shawnId]);
        let secondToken = secondQuery.rows[0].jwt_token;
        expect(typeof(initToken)).toEqual('string')
        expect(typeof(secondToken)).toEqual('string')
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

     // test("createPasswordToken - invalid data", async function () {


    //     let data = { fromDate: '2023-03-08', toDate: '2023-03-12' }
    //     let allTimecards = await TimecardsManager.filterSearch(data);
        
    // })

     // test("whoAmI - valid data", async function () {


    //     let data = { fromDate: '2023-03-08', toDate: '2023-03-12' }
    //     let allTimecards = await TimecardsManager.filterSearch(data);
        
    // })

     // test("whoAmI - invalid data", async function () {


    //     let data = { fromDate: '2023-03-08', toDate: '2023-03-12' }
    //     let allTimecards = await TimecardsManager.filterSearch(data);
        
    // })

     // test("getJwt - valid data", async function () {


    //     let data = { fromDate: '2023-03-08', toDate: '2023-03-12' }
    //     let allTimecards = await TimecardsManager.filterSearch(data);
        
    // })

     // test("getJwt - invalid data", async function () {


    //     let data = { fromDate: '2023-03-08', toDate: '2023-03-12' }
    //     let allTimecards = await TimecardsManager.filterSearch(data);
        
    // })

    // test("updateForgottenPassword - valid data", async function () {


    //     let data = { fromDate: '2023-03-08', toDate: '2023-03-12' }
    //     let allTimecards = await TimecardsManager.filterSearch(data);
        
    // })

     // test("updateForgottenPassword - invalid data", async function () {


    //     let data = { fromDate: '2023-03-08', toDate: '2023-03-12' }
    //     let allTimecards = await TimecardsManager.filterSearch(data);
        
    // })


     // test("updateInternalPassword - valid data", async function () {


    //     let data = { fromDate: '2023-03-08', toDate: '2023-03-12' }
    //     let allTimecards = await TimecardsManager.filterSearch(data);
        
    // })

     // test("updateInternalPassword - invalid data", async function () {


    //     let data = { fromDate: '2023-03-08', toDate: '2023-03-12' }
    //     let allTimecards = await TimecardsManager.filterSearch(data);
        
    // })

    // test("editEmployee - valid data", async function () {


    //     let data = { fromDate: '2023-03-08', toDate: '2023-03-12' }
    //     let allTimecards = await TimecardsManager.filterSearch(data);
        
    // })

     // test("editEmployee - invalid data", async function () {


    //     let data = { fromDate: '2023-03-08', toDate: '2023-03-12' }
    //     let allTimecards = await TimecardsManager.filterSearch(data);
        
    // })

     // test("get positions and certifications", async function () {


    //     let data = { fromDate: '2023-03-08', toDate: '2023-03-12' }
    //     let allTimecards = await TimecardsManager.filterSearch(data);
        
    // })
    


})