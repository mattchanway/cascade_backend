const request = require("supertest");

const app = require("../app");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    getEmployeeId
} = require("./_testCommon");

beforeAll(commonBeforeAll)
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

async function authenticateEmployeeAndGetSessionId(name, userPassword) {
    let idStr = await getEmployeeId(name);

    let authResp = await request(app).post("/api/auth").send({
        id: idStr,
        password: userPassword
    })
    let sessionId = authResp.header['set-cookie'][0].slice(10)
    return sessionId;
}

describe("Timecards", function () {

    test("Manager can see list of all timecards", async function () {

        let shawnSession = await authenticateEmployeeAndGetSessionId('Shawn', 'password1');
        let resp = await request(app).get(`/api/timecards`).set("Cookie", `sessionId=${shawnSession}`);
        expect(resp.body).toEqual([{"employee_id": expect.any(Number), "expenses": 0, "job_id": "400-22044", "location_submitted": null, "notes": null, "overtime": 0, "reg_time": 8, "time_submitted": expect.any(String), "timecard_date": "2023-03-09T08:00:00.000Z", "timecard_id": expect.any(Number)}, {"employee_id": expect.any(Number), "expenses": 0, "job_id": "400-22045", "location_submitted": null, "notes": null, "overtime": 0, "reg_time": 8, "time_submitted": expect.any(String), "timecard_date": "2023-03-10T08:00:00.000Z", "timecard_id": expect.any(Number)}, {"employee_id": expect.any(Number), "expenses": 0, "job_id": "400-22045", "location_submitted": null, "notes": null, "overtime": 0, "reg_time": 8, "time_submitted": expect.any(String), "timecard_date": "2023-03-09T08:00:00.000Z", "timecard_id": expect.any(Number)}, {"employee_id": expect.any(Number), "expenses": 0, "job_id": "400-22044", "location_submitted": null, "notes": null, "overtime": 0, "reg_time": 8, "time_submitted": expect.any(String), "timecard_date": "2023-03-10T08:00:00.000Z", "timecard_id": expect.any(Number)}])

    })

    test("Employee cannot view list of time cards", async function(){
        let joeSession = await authenticateEmployeeAndGetSessionId('Joe', 'password1');
        let resp = await request(app).get(`/api/timecards`).set("Cookie", `sessionId=${joeSession}`);
        expect(resp.body).toEqual({message: "Unauthorized"})
    })

    test("Employee can create a timecard", async function(){
        let joeSession = await authenticateEmployeeAndGetSessionId('Joe', 'password1');
        let job_id = '400-22044';
        let employee_id = await getEmployeeId('Joe');
        let timecard_date = '2023-03-11';
        let reg_time = 8;
        let overtime = 1;
        let expenses = 0;
        let notes = null

        let resp = await request(app).post(`/api/timecards`).set("Cookie", `sessionId=${joeSession}`).send({
            job_id, employee_id, timecard_date, reg_time, overtime, expenses, notes
        });
        expect(resp.body).toEqual([{
            job_id, employee_id, timecard_date: expect.any(String), reg_time, overtime, expenses, notes,
            location_submitted: null, time_submitted: expect.any(String), timecard_id: expect.any(Number)

        }])

    })

    test("Invalid session cannot create a timecard", async function(){
       
        let job_id = '400-22044';
        let employee_id = await getEmployeeId('Joe');
        let timecard_date = '2023-03-11';
        let reg_time = 8;
        let overtime = 1;
        let expenses = 0;
        let notes = null
        let resp = await request(app).post(`/api/timecards`).set("Cookie", `sessionId=abc123`).send({
            job_id, employee_id, timecard_date, reg_time, overtime, expenses, notes
        });
        expect(resp.body).toEqual({message: "Unauthorized"})

    })

    test("Manager can edit a timecard", async function(){
        let joeSession = await authenticateEmployeeAndGetSessionId('Joe', 'password1');
        let job_id = '400-22044';
        let employee_id = await getEmployeeId('Joe');
        let timecard_date = '2023-03-11';
        let reg_time = 8;
        let overtime = 1;
        let expenses = 0;
        let notes = null

        let resp = await request(app).post(`/api/timecards`).set("Cookie", `sessionId=${joeSession}`).send({
            job_id, employee_id, timecard_date, reg_time, overtime, expenses, notes
        });

        let timecardId = resp.body[0].timecard_id;
        let shawnSession = await authenticateEmployeeAndGetSessionId('Shawn', 'password1');
        let edit = await request(app).put(`/api/timecards/${timecardId}`).set("Cookie", `sessionId=${shawnSession}`).send({
            job_id, employee_id, timecard_date, reg_time: 6, overtime :0, expenses, notes
        });

        expect(edit.body).toEqual([{
            job_id, employee_id, timecard_date: expect.any(String), reg_time :6, overtime:0, expenses, notes,
            location_submitted: null, time_submitted: expect.any(String), timecard_id: timecardId

        }])

    })

    test("Employee cannot edit a timecard", async function(){
        let joeSession = await authenticateEmployeeAndGetSessionId('Joe', 'password1');
        let job_id = '400-22044';
        let employee_id = await getEmployeeId('Joe');
        let timecard_date = '2023-03-11';
        let reg_time = 8;
        let overtime = 1;
        let expenses = 0;
        let notes = null

        let resp = await request(app).post(`/api/timecards`).set("Cookie", `sessionId=${joeSession}`).send({
            job_id, employee_id, timecard_date, reg_time, overtime, expenses, notes
        });

        let timecardId = resp.body[0].timecard_id;
        let edit = await request(app).put(`/api/timecards/${timecardId}`).set("Cookie", `sessionId=${joeSession}`).send({
            job_id, employee_id, timecard_date, reg_time: 6, overtime :0, expenses, notes
        });

        expect(edit.body).toEqual({
           message: "Unauthorized"

        })  

    })

    // NEXT IS TESTING THE FILTER REPORT

    test("Filter report, all jobs, all employees", async function(){

        let shawnSession = await authenticateEmployeeAndGetSessionId('Shawn', 'password1');
        let edit = await request(app).get(`/api/timecards/filter?fromDate=2023-01-01&toDate=2023-04-01`).set("Cookie", `sessionId=${shawnSession}`);

        expect(edit.body).toEqual({
            table: [
              {
                timecard_id: expect.any(Number),
                job_id: '400-22044',
                employee_id: expect.any(Number),
                timecard_date: '2023-03-09T08:00:00.000Z',
                reg_time: 8,
                overtime: 0,
                expenses: 0,
                time_submitted:expect.any(String),
                location_submitted: null,
                notes: null,
                job_name: 'Dr. Oonchi',
                first_name: 'Shawn',
                last_name: 'Rostas'
              },
              {
                timecard_id: expect.any(Number),
                job_id: '400-22045',
                employee_id: expect.any(Number),
                timecard_date: '2023-03-10T08:00:00.000Z',
                reg_time: 8,
                overtime: 0,
                expenses: 0,
                time_submitted: expect.any(String),
                location_submitted: null,
                notes: null,
                job_name: 'IQ Dental',
                first_name: 'Shawn',
                last_name: 'Rostas'
              },
              {
                timecard_id: expect.any(Number),
                job_id: '400-22045',
                employee_id: expect.any(Number),
                timecard_date: '2023-03-09T08:00:00.000Z',
                reg_time: 8,
                overtime: 0,
                expenses: 0,
                time_submitted: expect.any(String),
                location_submitted: null,
                notes: null,
                job_name: 'IQ Dental',
                first_name: 'Joe',
                last_name: 'Test'
              },
              {
                timecard_id: expect.any(Number),
                job_id: '400-22044',
                employee_id: expect.any(Number),
                timecard_date: '2023-03-10T08:00:00.000Z',
                reg_time: 8,
                overtime: 0,
                expenses: 0,
                time_submitted: expect.any(String),
                location_submitted: null,
                notes: null,
                job_name: 'Dr. Oonchi',
                first_name: 'Joe',
                last_name: 'Test'
              }
            ],
            summary: { totalOT: 0, totalReg: 32, totalExp: 0 }
          })

    })

    test("Filter report, all jobs, one employee", async function(){
        let joeId = await getEmployeeId('Joe')
        let shawnSession = await authenticateEmployeeAndGetSessionId('Shawn', 'password1');
        let edit = await request(app).get(`/api/timecards/filter?fromDate=2023-01-01&toDate=2023-04-01&employeeId=${joeId}`).set("Cookie", `sessionId=${shawnSession}`);
 

        expect(edit.body).toEqual({
            table: [
              {
                timecard_id: expect.any(Number),
                job_id: '400-22045',
                employee_id: expect.any(Number),
                timecard_date: '2023-03-09T08:00:00.000Z',
                reg_time: 8,
                overtime: 0,
                expenses: 0,
                time_submitted: expect.any(String),
                location_submitted: null,
                notes: null,
                job_name: 'IQ Dental',
                first_name: 'Joe',
                last_name: 'Test'
              },
              {
                timecard_id: expect.any(Number),
                job_id: '400-22044',
                employee_id: expect.any(Number),
                timecard_date: '2023-03-10T08:00:00.000Z',
                reg_time: 8,
                overtime: 0,
                expenses: 0,
                time_submitted: expect.any(String),
                location_submitted: null,
                notes: null,
                job_name: 'Dr. Oonchi',
                first_name: 'Joe',
                last_name: 'Test'
              }
            ],
            summary: { totalOT: 0, totalReg: 16, totalExp: 0 }
          })


        
    })

    test("Filter report, one job, all employees", async function(){

        let shawnSession = await authenticateEmployeeAndGetSessionId('Shawn', 'password1');
        let edit = await request(app).get(`/api/timecards/filter?fromDate=2023-01-01&toDate=2023-04-01&jobId=400-22044`).set("Cookie", `sessionId=${shawnSession}`);

        expect(edit.body).toEqual({
            table: [
              {
                timecard_id: expect.any(Number),
                job_id: '400-22044',
                employee_id: expect.any(Number),
                timecard_date: '2023-03-09T08:00:00.000Z',
                reg_time: 8,
                overtime: 0,
                expenses: 0,
                time_submitted:expect.any(String),
                location_submitted: null,
                notes: null,
                job_name: 'Dr. Oonchi',
                first_name: 'Shawn',
                last_name: 'Rostas'
              },
              {
                timecard_id: expect.any(Number),
                job_id: '400-22044',
                employee_id: expect.any(Number),
                timecard_date: '2023-03-10T08:00:00.000Z',
                reg_time: 8,
                overtime: 0,
                expenses: 0,
                time_submitted: expect.any(String),
                location_submitted: null,
                notes: null,
                job_name: 'Dr. Oonchi',
                first_name: 'Joe',
                last_name: 'Test'
              }
            ],
            summary: { totalOT: 0, totalReg: 16, totalExp: 0 }
          })


        
    })

    test("Filter report, does not work for non-manager", async function(){

        let joeSession = await authenticateEmployeeAndGetSessionId('Joe', 'password1');
        let edit = await request(app).get(`/api/timecards/filter?fromDate=2023-01-01&toDate=2023-04-01`).set("Cookie", `sessionId=${joeSession}`);

        expect(edit.body).toEqual({
            message: "Unauthorized"
        })
        
    })

    




})