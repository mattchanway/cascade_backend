const bcrypt = require("bcrypt");
const db = require("../db.js");
const axios = require('axios');

async function getEmployeeId(name) {
  const query = await db.query(`SELECT * FROM employees WHERE first_name = $1`, [name]);

  let employeeId = query.rows[0].employee_id
  return employeeId;
}




async function commonBeforeAll() {


  const p1Hash = await bcrypt.hash(`password1`, 10);
  let initStr = '2008-01-01'
  let startDate = new Date('2008-01-01');
  let startDateStr = startDate.toISOString().slice(0, 10)
  const p2Hash = await bcrypt.hash(`password2`, 10);
  const p3Hash = await bcrypt.hash(`password3`, 10)

  await db.query("DELETE FROM timecards");
  await db.query("DELETE FROM employees");
  await db.query("DELETE FROM jobs");

  await db.query("DELETE FROM certifications");
  await db.query("DELETE FROM positions");

  await db.query(`INSERT INTO positions(position_name, position_base_pay) VALUES('Welder', 50.00), ('Labourer', 30.00), ('Manager', 75.00)`);
  await db.query(`INSERT INTO certifications(certification_name, certification_pay) VALUES ('None', 0.00), ('Apprentice', 5.00), ('Journeyman', 15.00)`);
  await db.query(`UPDATE positions SET position_id = 3 WHERE position_name = 'Manager'`)
  await db.query(`UPDATE positions SET position_id = 1 WHERE position_name = 'Welder' returning *`)
  await db.query(`UPDATE certifications SET certification_id = 1 WHERE certification_name = 'None'`)


  await db.query(`INSERT INTO employees(password,first_name, last_name, email,position, certification, start_date, jwt_token, session_id, password_reset_token, first_login) 
    VALUES($1,'Shawn','Rostas', 'matthewchanway@gmail.com',3, 1,$2,null,null,null,true)`, [p1Hash, initStr])

  await db.query(`INSERT INTO employees(password,first_name, last_name, email,position, certification, start_date, jwt_token, session_id, password_reset_token, first_login) 
    VALUES($1,'Joe','Test', 'joetest@not.com',1, 1,$2,null,null,null,true)`, [p1Hash, initStr])

  await db.query(`INSERT INTO jobs(job_id, job_name, job_address_street_line1, job_address_street_unit, job_address_street_city, job_description, shop_docs_link)
    VALUES('400-22044', 'Dr. Oonchi', '1845 Marine Drive', null, 'West Vancouver', 'Doctors office','https://www.dropbox.com/sh/diwnsimhvkiy7hs/AADn3VkGDe8H4YwKqYqzJXj7a?dl=0'),
    ('400-22045', 'IQ Dental', '123 152nd St', '#5', 'Surrey', 'Dentist office', null)`)

  let shawnId = await getEmployeeId('Shawn');
  let joeId = await getEmployeeId('Joe');


  await db.query(`INSERT INTO timecards(job_id, employee_id, timecard_date, reg_time, overtime, expenses, notes)VALUES
    ('400-22044', $1, '2023-03-09',8,0,0,null), ('400-22045', $1, '2023-03-10',8,0,0,null), ('400-22045', $2, '2023-03-09',8,0,0,null),
    ('400-22044', $2, '2023-03-10',8,0,0,null)`, [shawnId, joeId])




}






async function commonBeforeEach() {


  await db.query("BEGIN");
}

async function commonAfterEach() {

  await db.query("ROLLBACK");
}

async function commonAfterAll() {

  await db.end();
}


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  getEmployeeId
};

