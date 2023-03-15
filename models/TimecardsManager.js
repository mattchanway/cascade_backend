const { query } = require("express");
const db = require("../db");
const {toISOLocal } = require("../helpers");


class TimecardsManager {

    static async getAllTimecards() {
        try {
            const result = await db.query(`
        SELECT * from timecards`);

            return result.rows;
        }
        catch (e) {
            return e;
        }
    }

    static async getTimecard(id) {
        try {
            const result = await db.query(`
        SELECT * from timecards WHERE timecard_id = $1`, [id]);

            return result.rows[0];
        }
        catch (e) {
            return e;
        }
    }

    static async getTimecardsIndiv(employeeId){

        try{
            let dates = []
            let table = [null,null,null,null,null,null,null,null, null, null, 
                null, null,null,null]
                    
            for(let i = 13 ; i >= 0; i-- ){
                let today = new Date();
                today.setDate(today.getDate()-i);
        
                dates.push(toISOLocal(today))
            }
            console.log('dates',dates)

            let query = db.query(`SELECT * FROM timecards 
                JOIN jobs ON timecards.job_id = jobs.job_id
                WHERE employee_id = $11 AND
                (timecard_date = $1 OR timecard_date = $2 OR
                timecard_date = $3 OR timecard_date = $4 OR
                timecard_date = $5 OR timecard_date = $6 OR
                timecard_date = $7 OR timecard_date = $8 OR
                timecard_date = $9 OR timecard_date = $10 OR
                timecard_date = $11 OR timecard_date = $12 OR
                timecard_date = $13 OR timecard_date = $14 ) ORDER BY timecard_date ASC`, [...dates, employeeId])
            
                function datediff(first, second) {        
                    return Math.floor((second - first) / (1000 * 60 * 60 * 24));
                }

            let result = await query;
            let today = new Date();
            let todayInd = today.getDay()+7
            while(result.rows.length){
                let curr = result.rows.pop();
                let currDate = curr.timecard_date;
                let diff = datediff(currDate, today)
                table[todayInd-diff] = curr
            }
            console.log('heyyy',table)
       
            return table
        }
        catch(e){

            return e;
        }

    }

    static async addTimecard(data) {

        try {
            
            const { job_id, employee_id, timecard_date, reg_time, overtime, expenses, time_submitted, location_submitted, notes } = data;


            const result = await db.query(`INSERT INTO timecards (job_id, employee_id, timecard_date, 
                reg_time, overtime, expenses,location_submitted, notes) 
            VALUES($1, $2, $3, $4, $5, $6,$7,$8) returning *`, [job_id, employee_id, timecard_date, reg_time,
                overtime, expenses, location_submitted, notes]);

            return result.rows;
        }
        catch (e) {

            return e;
        }
    }

    static async editTimecard(data, timecardId) {

        try {

            const { job_id, employee_id, timecard_date, reg_time, overtime, expenses, location_submitted, notes } = data;
            const result = await db.query(`
        UPDATE timecards SET job_id = $2, employee_id = $3, timecard_date = $4,
        reg_time = $5, overtime = $6, expenses = $7, location_submitted = $8, notes = $9
        WHERE timecard_id = $1 RETURNING *`, [timecardId, job_id, employee_id, timecard_date, reg_time, overtime, expenses, location_submitted, notes]);
            return result.rows;
        }
        catch (e) {

            return e;
        }
    }

    static async deleteTimecard(timecardId) {

        try {

            const result = await db.query(`
        DELETE from timecards WHERE timecard_id = $1`, [timecardId]);
            return result.rows;
        }
        catch (e) {

            return e;
        }
    }

    static async getTimecardsByDate(date) {

        try {

            const result = await db.query(`SELECT * FROM timecards WHERE timecard_date = $1`, [date]);
            return result.rows;

        }

        catch (e) {

            return e;
        }


    }

    static async getTimecardsByEmployee(id) {

        try {
            const result = await db.query(`SELECT * FROM timecards WHERE employee_id = $1`, [id]);
            return result.rows;

        }
        catch (e) {

            return e;
        }
    }

    static async getTimecardsByJob(id) {

        try {
            const result = await db.query(`SELECT * FROM timecards WHERE job_id = $1`, [id]);
            return result.rows;

        }
        catch (e) {

            return e;
        }
    }

    static async filterSearch(data) {


        try {
            let { fromDate, toDate, employeeId, jobId, overtime } = data;
          
            let query = `SELECT timecards.timecard_id, timecards.job_id, timecards.employee_id, timecards.timecard_date, timecards.reg_time,
            timecards.overtime, timecards.expenses, timecards.time_submitted, timecards.location_submitted, timecards.notes, jobs.job_name, 
            employees.first_name, employees.last_name FROM timecards JOIN jobs ON timecards.job_id = jobs.job_id JOIN employees ON timecards.employee_id = employees.employee_id
            `;

            let whereExpressions = [];
            let queryValues = [];

            if (fromDate !== undefined && toDate !== undefined) {
                queryValues.push(fromDate, toDate);
                whereExpressions.push(`timecard_date >= $1 AND timecard_date <= $2`);
            }
            if (employeeId !== undefined) {
                queryValues.push(employeeId);
                whereExpressions.push(`timecards.employee_id = $${queryValues.length}`);
            }
            if (jobId !== undefined) {
                queryValues.push(jobId);
                whereExpressions.push(`timecards.job_id = $${queryValues.length}`);
            }
            if (overtime === true) {

                whereExpressions.push(`overtime > 0`)
            }

            if (whereExpressions.length > 0) {
                query += " WHERE " + whereExpressions.join(" AND ");

            }
            
            const result = await db.query(query, queryValues);
            let totalOT = 0;
            let totalReg = 0;
            let totalExp = 0;
            for(let i = 0 ; i < result.rows.length ;i++){
                let curr = result.rows[i];
                totalOT += curr.overtime;
                totalReg += curr.reg_time
                totalExp += curr.expenses
            }


            return {table :result.rows, summary: {totalOT, totalReg, totalExp}};
        }
        catch (e) {
            console.log(e)
            return e

        }
    }



}

module.exports = TimecardsManager;