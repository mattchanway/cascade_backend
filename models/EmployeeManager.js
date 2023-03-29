const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");


class EmployeeManager {

    static async getAllEmployees() {
        try {
            const result = await db.query(`
        SELECT certification, email, employee_id, first_login,
        first_name, last_name, position, start_date from employees ORDER BY last_name asc`);

            return result.rows;
        }
        catch (e) {
            return e;
        }
    }

    static async getEmployee(id) {
        try {
            const date = new Date();
            date.setDate(date.getDate() - 30);
            let formattedDate = date.toLocaleDateString();
        

            const result = await db.query(`
        SELECT t.job_id, t.reg_time, t.overtime, t.expenses, t.notes, t.location_submitted, t.timecard_date,
        t.time_submitted, t.timecard_id, e.employee_id, e.email, e.first_name, e.last_name, e.start_date, e.position, e.certification,
        j.job_name, p.position_name, c.certification_name from timecards t 
        join employees e on t.employee_id = e.employee_id
        join jobs j on t.job_id = j.job_id
         join  positions p on p.position_id = e.position
         join certifications c on c.certification_id = e.certification
        WHERE t.employee_id = $1 AND t.timecard_date > $2
        ORDER BY t.timecard_date DESC
        `, [id, formattedDate]);

            if (!result.rows.length) {

                let newResult = await db.query(`SELECT e.employee_id, e.email, e.first_name, e.last_name, e.start_date, e.position, e.email,
                e.certification, p.position_name, c.certification_name from employees e 
                 join  positions p on p.position_id = e.position
                 join certifications c on c.certification_id = e.certification
                WHERE e.employee_id = $1`, [id]);
                if(!newResult.rows.length) return false;
                let userData = newResult.rows[0];
                return { userData: userData, timecardsData: [] };
            }

            let row1 = result.rows[0]
            let userData = {
                first_name: row1.first_name, last_name: row1.last_name, certification_name: row1.certification_name,
                email: row1.email, position: row1.position, certification: row1.certification,
                position_name: row1.position_name, start_date: row1.start_date, employee_id: row1.employee_id
            }
            let timecardsData = result.rows.map(r => ({
                job_id: r.job_id, reg_time: r.reg_time, overtime: r.overtime, notes: r.notes,
                location_submitted: r.location_submitted, timecard_date: r.timecard_date,
                expenses: r.expenses,
                time_submitted: r.time_submitted, timecard_id: r.timecard_id, job_name: r.job_name
            }))

            return { userData, timecardsData }
        }
        catch (e) {
            return e;
        }
    }

    static async addEmployee(data) {

        try {

            const { first_name, last_name, email, position, certification, start_date } = data;
            const INIT_PASSWORD = await bcrypt.hash(`${last_name}123`, 10);
            const result = await db.query(`INSERT INTO employees (password,first_name, last_name, 
                email, position, certification, start_date) 
            VALUES($1, $2, $3, $4, $5, $6,$7) returning employee_id, first_name, last_name`, [INIT_PASSWORD, first_name,
                last_name, email, position, certification, start_date]);

            let newUser = result.rows[0];
            delete newUser.password;
            return newUser
        }
        catch (e) {

            return e;
        }
    }

    static async authenticate(id, password) {

        try {

            const result = await db.query(`SELECT * FROM employees WHERE employee_id = $1`, [id]);
            const user = result.rows[0];
            

            if (user) {
                const isValid = await bcrypt.compare(password, user.password);
                
                if (isValid) {
                    let { jwtToken, session } = await this.createNewTokens(id, user.position);
                    let fin = await this.updateDatabaseTokens(id, jwtToken, session);
                    return fin;
                }
            }
            return false;
        }
        catch (e) {

            return e;
        }
    }

    static async updateDatabaseTokens(id, jwt, session) {

        try {
            const res2 = await db.query(`UPDATE employees SET jwt_token =$1, session_id = $2 WHERE employee_id =$3 returning *`, [jwt, session, id]);
            const loggedInUser = res2.rows[0]
           
            delete loggedInUser.password;
            return loggedInUser;
        }

        catch (e) {
            return e;
        }

    }

    static async rotateJwtToken(employee_id, position){

        try {

            let jwtPayload = {
                employee_id: employee_id,
                position: position,
                exp: Date.now() + ((1000 * 60) * 15)
            };
            let jwtToken = jwt.sign(jwtPayload, SECRET_KEY);
            const res2 = await db.query(`UPDATE employees SET jwt_token =$1  WHERE employee_id =$2 returning jwt_token`, [jwtToken, employee_id]);
            if(!res2.rows.length) throw new Error('No user found to for JWT rotation.')
            return res2.rows[0].jwt_token

        }

        catch(e){

            return e;
        }



    }

    static async createNewTokens(employee_id, position) {

        try {
            let jwtPayload = {
                employee_id: employee_id,
                position: position,
                exp: Date.now() + ((1000 * 60) * 15)
            };
            let sessionPayload = {
                employee_id: employee_id,
                position: position,
                exp: Date.now() + ((1000 * 60) * 480)
            };

            let jwtToken = jwt.sign(jwtPayload, SECRET_KEY);
            let session = jwt.sign(sessionPayload, SECRET_KEY);
            return { jwtToken, session }
        }
        catch (e) {
            return e;
        }
    }

    static async createPasswordToken(employee_id) {

        try {
            let passwordPayload = {
                employee_id: employee_id,
                exp: Date.now() + ((1000 * 60) * 15)
            };
          
            let passwordToken = jwt.sign(passwordPayload, SECRET_KEY);

            let insertQuery = await db.query(`UPDATE employees set password_reset_token = $1 WHERE
            employee_id = $2 returning password_reset_token, email`, [passwordToken, employee_id]);
            if (insertQuery.rows.length === 0) return({userNotFound: "User Not Found"})

            return { passwordToken: insertQuery.rows[0].password_reset_token, email: insertQuery.rows[0].email }
        }
        catch (e) {
            return e;
        }


    }


    static async whoAmI(sessionId) {

        try {
            let res = await db.query(`SELECT * FROM employees WHERE session_id = $1`, [sessionId]);
            if(!res.rows.length) return {noUser: "unable to auth" }
            const user = res.rows[0];
            delete user.password;



            return user;
        }
        catch (e) {

            return e;
        }
    }

    static async getJwt(sessionId) {

        try {
            let res = await db.query(`SELECT jwt_token FROM employees WHERE session_id = $1`, [sessionId]);
            const user = res.rows[0];
           

            return user.jwt_token;
        }
        catch (e) {

            return e;
        }
    }

    static async verifyPasswordToken(employee_id, token) {

        try {

            let queryRes = await db.query(`SELECT password_reset_token FROM employees WHERE employee_id = $1`, [employee_id]);
            let storedToken = queryRes.rows[0].password_reset_token;
            if (token === storedToken) return true;
            return false;
        }
        catch (e) {
            return e;

        }

    }

    static async getUserFromPasswordToken(token) {

        try {

            let queryRes = await db.query(`SELECT * FROM employees WHERE password_reset_token = $1`, [token]);
            if (queryRes.rows.length === 0) return null;
            const user = queryRes.rows[0];
            delete user.password;
            return user;

        }
        catch (e) {
            return e;

        }

    }


    static async updateForgottenPassword(token, newPassword) {

        try {

            let verifiedUser = await this.getUserFromPasswordToken(token);

            if (!verifiedUser) return false;

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const id = verifiedUser.employee_id;

            let userQuery = await db.query(`UPDATE employees SET password = $1, password_reset_token = $2 WHERE employee_id = $3 returning *`, [hashedPassword, null, id]);

            let user = userQuery.rows[0]
            let { jwtToken, session } = await this.createNewTokens(user.employee_id, user.position)
            let updateUser = await this.updateDatabaseTokens(user.employee_id, jwtToken, session);
            delete user.password;
            return { user, session };
        }

        catch (e) {

            return e;
        }

    }

    static async updateInternalPassword(id, newPassword, firstLogin) {

        try {

            // let auth = await this.authenticate(id, oldPassword);
            // if (!auth) return false;
       
            const query = `UPDATE employees SET password = $1 ${firstLogin === true ? ' ,first_login = false' : ''}
            WHERE employee_id = $2 returning *`;
            
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            let userQuery = await db.query(query, [hashedPassword, id]);
            let user = userQuery.rows[0]
            delete user.password;
            return user;


        }
        catch (e) {
            return e;

        }

    }

    static async editEmployee(data, employeeId) {

        try {
            console.log(data)
            const { first_name, last_name, position, certification, start_date, email } = data;
            const result = await db.query(`
        UPDATE employees SET first_name = $1, last_name = $2, position = $3, certification = $4,
        start_date = $5, email = $6
        WHERE employee_id = $7 RETURNING *`, [first_name, last_name, position, certification, start_date, email, +employeeId]);
            let user = result.rows[0];
            delete user.password;
            return user;
        }
        catch (e) {
            console.log(e)
            return e;
        }
    }

    static async deleteEmployee(employeeId) {

        try {

            const result = await db.query(`
        DELETE from employees WHERE employee_id = $1`, [employeeId]);
            return result.rows;
        }
        catch (e) {

            return e;
        }
    }

    static async updateEmployeeStatus(employeeId, status) {

        try {

            const result = await db.query(`
        UPDATE employees set active = $1 WHERE employee_id = $2`, [status, employeeId]);
            return result.rows;
        }
        catch (e) {

            return e;
        }
    }





    static async getPositionsAndCertifications() {

        try {

            const positionsQuery = db.query(`SELECT * FROM positions`);
            const certificationsQuery = db.query(`SELECT * FROM certifications`);
            const positionResult = await positionsQuery;
            const certificationsResult = await certificationsQuery;
            return { positions: positionResult.rows, certifications: certificationsResult.rows };

        }
        catch (e) {

            return e;
        }
    }



}

module.exports = EmployeeManager;