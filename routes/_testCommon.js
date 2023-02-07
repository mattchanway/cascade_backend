// import bcrypt from "bcrypt";
const db = require("../db.js");
const axios = require

async function commonBeforeAll(){

    

    await db.query("DELETE FROM employees");
    await db.query("DELETE FROM jobs");
    await db.query("DELETE FROM timecards");
    await db.query("DELETE FROM certifications");
    await db.query("DELETE FROM positions");

    await db.query(`INSERT INTO positions(position_name, position_base_pay) VALUES('Welder', 50.00), ('Labourer', 30.00), ('Manager', 75.00)`);

    await db.query(`INSERT INTO certifications(certification_name, certification_pay) VALUES ('None', 0.00), ('Apprentice', 5.00), ('Journeyman', 15.00)`);

    await db.query(`INSERT INTO employees(password,first_name, last_name, email,position, certification, start_date, address, photo, jwt_token, session_id, password_reset_token, first_login) 
    VALUES('$1','Matt','Chanway', 'matthewchanway@gmail.com',2,1,'2022-12-01','1000 24th Ave, Surrey BC V4X YYY','https://i.ibb.co/yXZVP97/headshot.jpg',null,null,null,false),
    ('$2','Shawn','Rostas', 'testEmail2@gmail.com',3,3,'2008-01-01','345 72nd Ave, Surrey BC V4X YYY', default,null,null,null,false),
    ('$3','Zakk','Wylde', 'testEmail3@gmail.com',1,3,'2022-01-02','123 Fake St, Hollywood CA 43684','https://assets.blabbermouth.net/media/zakkwyldeschecter3_638_2.jpg',null,null,null,false)`,
    'password1', 'password2', 'password3');

    await db.query(`INSERT INTO jobs(job_id, job_name, job_address_street_line1, job_address_street_unit, job_address_street_city, job_description, shop_docs_link)
    VALUES('400-22044', 'Dr. Oonchi', '1845 Marine Drive', null, 'West Vancouver', 'Doctors office','https://www.dropbox.com/sh/diwnsimhvkiy7hs/AADn3VkGDe8H4YwKqYqzJXj7a?dl=0'),
    ('19-005', 'Centra', '13682 - 101 Street', null, 'Surrey', '167 Unit concrete','https://www.dropbox.com/sh/37sk1jb5ul71ioa/AAAmanJkN1-2v8N6AWKD6mQLa?dl=0'),
    ('400-21020', 'Elements Massage', '6233 200th St', '#4','Langley',null,'https://www.dropbox.com/sh/37sk1jb5ul71ioa/AAAmanJkN1-2v8N6AWKD6mQLa?dl=0'),
    ('22-004', 'Richards & Drake', '550 Drake St','', 'Vancouver', '187 Unit concrete','https://www.dropbox.com/sh/37sk1jb5ul71ioa/AAAmanJkN1-2v8N6AWKD6mQLa?dl=0')`);
}
    async function getShawnId(){
      const shawnQuery = await db.query(`SELECT * FROM employees WHERE first_name = 'Shawn'`);
        let shawnId = shawnQuery.rows[0].employee_id
        console.log(shawnQuery.rows[0])
        return shawnId;
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
        getShawnId
      };

