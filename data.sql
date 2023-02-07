DROP DATABASE IF EXISTS "cascade";

CREATE DATABASE "cascade";

\c "cascade";

CREATE TABLE jobs (
    job_id TEXT PRIMARY KEY,
    job_name TEXT NOT NULL,
    job_address_street_line1 TEXT NOT NULL,
    job_address_street_unit TEXT,
    job_address_street_city TEXT NOT NULL,
    job_description TEXT,
    shop_docs_link TEXT,
    active BOOLEAN default true);

CREATE TABLE positions(
    position_id SERIAL PRIMARY KEY,
    position_name TEXT NOT NULL,
    position_base_pay FLOAT
);

CREATE TABLE certifications(
    certification_id SERIAL PRIMARY KEY,
    certification_name TEXT NOT NULL,
    certification_pay FLOAT
);



CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY,
    password VARCHAR(200) NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    position int NOT NULL references positions,
    certification int NOT NULL references certifications,
    start_date DATE NOT NULL,
    jwt_token VARCHAR,
    session_id VARCHAR,
    password_reset_token VARCHAR,
    first_login BOOLEAN default true);

CREATE TABLE timecards (
    timecard_id SERIAL PRIMARY KEY,
    job_id TEXT NOT NULL references jobs,
    employee_id int NOT NULL references employees,
    timecard_date DATE NOT NULL,
    reg_time FLOAT NOT NULL,
    CHECK (reg_time <= 8.0),
    overtime FLOAT NOT NULL DEFAULT 0.0,
    expenses FLOAT NOT NULL DEFAULT 0.0,
    time_submitted TIMESTAMP default CURRENT_TIMESTAMP,
    location_submitted TEXT,
    notes TEXT);

INSERT INTO positions(position_name, position_base_pay) VALUES('Employee', 0.00), ('Labourer', 0.00), ('Manager', 0.00);

INSERT INTO certifications(certification_name, certification_pay) VALUES ('None', 0.00), ('Apprentice', 5.00), ('Journeyman', 15.00);

INSERT INTO employees(password,first_name, last_name, email,position, certification, start_date, jwt_token, session_id, password_reset_token, first_login) 
VALUES('password','Matt','Chanway', 'matthewchanway@gmail.com',3,1,'2022-12-01',null,null,null,true),

('password','Zakk','Wylde', 'testEmail3@gmail.com',1,3,'2022-01-02',null,null,null,false);

INSERT INTO jobs(job_id, job_name, job_address_street_line1, job_address_street_unit, job_address_street_city, job_description, shop_docs_link)
VALUES('400-22044', 'Dr. Oonchi', '1845 Marine Drive', null, 'West Vancouver', 'Doctors office','https://www.dropbox.com/sh/diwnsimhvkiy7hs/AADn3VkGDe8H4YwKqYqzJXj7a?dl=0'),
('19-005', 'Centra', '13682 - 101 Street', null, 'Surrey', '167 Unit concrete','https://www.dropbox.com/sh/37sk1jb5ul71ioa/AAAmanJkN1-2v8N6AWKD6mQLa?dl=0'),
('400-21020', 'Elements Massage', '6233 200th St', '#4','Langley',null,'https://www.dropbox.com/sh/37sk1jb5ul71ioa/AAAmanJkN1-2v8N6AWKD6mQLa?dl=0'),
('22-004', 'Richards & Drake', '550 Drake St','', 'Vancouver', '187 Unit concrete','https://www.dropbox.com/sh/37sk1jb5ul71ioa/AAAmanJkN1-2v8N6AWKD6mQLa?dl=0');


INSERT INTO timecards(job_id, employee_id, timecard_date, reg_time, overtime, expenses, time_submitted, location_submitted, notes)
VALUES('400-22044',2,'2023-02-01', 8.0, 0.0, 3452.53, CURRENT_TIMESTAMP, null, 'bought new les paul'),
('400-22044',2,'2023-02-02', 8.0, 1.0, 4612.21, CURRENT_TIMESTAMP, null,'bought new marshall 800'),
('400-22044',2,'2023-02-03', 0.0, 0.0, 10342.54, CURRENT_TIMESTAMP, null,'went to rehab'),
('19-005',1,'2022-12-26', 8.0, 0.0, 0, CURRENT_TIMESTAMP, null,null),
('19-005',1,'2022-12-27', 8.0, 1.0, 0, CURRENT_TIMESTAMP, null,null),
('19-005',1,'2022-12-28', 8.0, 2.0, 0, CURRENT_TIMESTAMP, null,null);










