"use strict";

const db = require("../db.js");

const TimecardsManager = require("./TimecardsManager.js");

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


    test("Filter search - dates only", async function () {


        let data = { fromDate: '2023-03-08', toDate: '2023-03-12' }
        let allTimecards = await TimecardsManager.filterSearch(data);
        


        expect(allTimecards).toEqual({
            table: [
                {
                    first_name:'Shawn', last_name: 'Rostas', job_name: 'Dr. Oonchi',
                    timecard_id: expect.any(Number), job_id: '400-22044', location_submitted: null,
                    time_submitted: expect.any(Date),
                    employee_id: expect.any(Number), timecard_date: expect.any(Date), reg_time: 8, overtime: 0, expenses: 0, notes: null
                },
                {
                    first_name:'Shawn', last_name: 'Rostas', job_name: 'IQ Dental',
                    timecard_id: expect.any(Number), job_id: '400-22045', location_submitted: null,
                    time_submitted: expect.any(Date),
                    employee_id: expect.any(Number), timecard_date: expect.any(Date), reg_time: 8, overtime: 0, expenses: 0, notes: null
                },
                {
                    first_name:'Joe', last_name: 'Test', job_name: 'IQ Dental',
                    timecard_id: expect.any(Number), job_id: '400-22045', location_submitted: null,
                    time_submitted: expect.any(Date),
                    employee_id: expect.any(Number), timecard_date: expect.any(Date), reg_time: 8, overtime: 0, expenses: 0, notes: null
                },
                {
                    first_name:'Joe', last_name: 'Test', job_name: 'Dr. Oonchi',
                    timecard_id: expect.any(Number), job_id: '400-22044', location_submitted: null,
                    time_submitted: expect.any(Date),
                    employee_id: expect.any(Number), timecard_date: expect.any(Date), reg_time: 8, overtime: 0, expenses: 0, notes: null
                }

            ],
            summary: {
                totalOT: 0,
                totalReg: 32,
                totalExp: 0
            }
        }
        )

    })

    test("Filter search - dates and job only", async function () {


        
        let data = { fromDate: '2023-03-08', toDate: '2023-03-12', jobId: '400-22044' }
        let allTimecards = await TimecardsManager.filterSearch(data);
        
        


        expect(allTimecards).toEqual({
            table: [
                {
                    first_name:'Shawn', last_name: 'Rostas', job_name: 'Dr. Oonchi',
                    timecard_id: expect.any(Number), job_id: '400-22044', location_submitted: null,
                    time_submitted: expect.any(Date),
                    employee_id: expect.any(Number), timecard_date: expect.any(Date), reg_time: 8, overtime: 0, expenses: 0, notes: null
                },
              
                {
                    first_name:'Joe', last_name: 'Test', job_name: 'Dr. Oonchi',
                    timecard_id: expect.any(Number), job_id: '400-22044', location_submitted: null,
                    time_submitted: expect.any(Date),
                    employee_id: expect.any(Number), timecard_date: expect.any(Date), reg_time: 8, overtime: 0, expenses: 0, notes: null
                }

            ],
            summary: {
                totalOT: 0,
                totalReg: 16,
                totalExp: 0
            }
        }
        )




    })

    test("Filter search - dates, employee and job", async function () {

        let shawnId = await getEmployeeId('Shawn');
        let data = { fromDate: '2023-03-08', toDate: '2023-03-12', jobId: '400-22044', employeeId: +shawnId }
        let allTimecards = await TimecardsManager.filterSearch(data);
        


        expect(allTimecards).toEqual({
            table: [
                {
                    first_name:'Shawn', last_name: 'Rostas', job_name: 'Dr. Oonchi',
                    timecard_id: expect.any(Number), job_id: '400-22044', location_submitted: null,
                    time_submitted: expect.any(Date),
                    employee_id: expect.any(Number), timecard_date: expect.any(Date), reg_time: 8, overtime: 0, expenses: 0, notes: null
                }

            ],
            summary: {
                totalOT: 0,
                totalReg: 8,
                totalExp: 0
            }
        }
        )
    

    })

    test("Add timecard", async function () {

        let joeId = await getEmployeeId('Joe');
        let timecardOne = { job_id: '400-22044', employee_id: +joeId, timecard_date: '2023-03-28', reg_time: 8, overtime: 1, expenses: 3.50, notes: 'some notes here' }
        let timeResp = await TimecardsManager.addTimecard(timecardOne);
        expect(timeResp).toEqual([{
            timecard_id: expect.any(Number), job_id: '400-22044', location_submitted: null,
            time_submitted: expect.any(Date),
            employee_id: joeId, timecard_date: expect.any(Date), reg_time: 8, overtime: 1, expenses: 3.50, notes: 'some notes here'
        }])

    })

    test("Add timecard with null reg time", async function () {

        let joeId = await getEmployeeId('Joe');
        let timecardOne = { job_id: '400-22044', employee_id: +joeId, timecard_date: '2023-03-28', reg_time: null, overtime: 1, expenses: 3.50, notes: 'some notes here' }
        let timeResp = await TimecardsManager.addTimecard(timecardOne);

        expect(timeResp).toBeInstanceOf(Error)
    })

    test("Add multi-timecard", async function () {

        let joeId = await getEmployeeId('Joe');
        let timecardOne = { job_id: '400-22044', employee_id: +joeId, timecard_date: '2023-03-28', reg_time: 4, overtime: 0, expenses: 3.50, location_submitted: null, notes: 'some notes here' }
        let timecardTwo = { job_id: '400-22045', employee_id: +joeId, timecard_date: '2023-03-28', reg_time: 4, overtime: 1, expenses: 5.50, location_submitted: null, notes: 'site 2 notes' }
        let rows = [timecardOne, timecardTwo]

        let timeResp = await TimecardsManager.addMultiTimecard({ rows: rows });
        expect(timeResp).toEqual([
            {
                timecard_id: expect.any(Number), job_id: '400-22044', location_submitted: null,
                time_submitted: expect.any(Date),
                employee_id: joeId, timecard_date: expect.any(Date), reg_time: 4, overtime: 0, expenses: 3.50, notes: 'some notes here'
            },
            {
                timecard_id: expect.any(Number), job_id: '400-22045', location_submitted: null,
                time_submitted: expect.any(Date),
                employee_id: joeId, timecard_date: expect.any(Date), reg_time: 4, overtime: 1, expenses: 5.50, notes: 'site 2 notes'
            }
        ])

    })

    test("Edit a timecard", async function () {

        let joeId = await getEmployeeId('Joe');
        let allTimecards = await TimecardsManager.getAllTimecards();
        let sample = allTimecards[0]
        let id = sample.timecard_id
        let timecardOne = { job_id: '400-22044', employee_id: +joeId, timecard_date: '2023-03-28', reg_time: 4, overtime: 0, expenses: 3.51, location_submitted: null, notes: 'edited this one' }

        let timeResp = await TimecardsManager.editTimecard(timecardOne, id);
        expect(timeResp).toEqual([
            {
                timecard_id: expect.any(Number), job_id: '400-22044', location_submitted: null,
                time_submitted: expect.any(Date),
                employee_id: joeId, timecard_date: expect.any(Date), reg_time: 4, overtime: 0, expenses: 3.51, notes: 'edited this one'
            }
        ])

    })

    test("Delete a timecard", async function () {

        let joeId = await getEmployeeId('Joe');
        let allTimecards = await TimecardsManager.getAllTimecards();
        let sample = allTimecards[0]
        let id = sample.timecard_id

        await TimecardsManager.deleteTimecard(id);
        let test = await TimecardsManager.getTimecard(id)

        expect(test).toEqual(undefined
        )

    })


})