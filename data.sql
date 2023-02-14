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

INSERT INTO jobs(job_id, job_name, job_address_street_line1, job_address_street_unit, job_address_street_city, job_description, shop_docs_link)
VALUES('400-22044', 'Dr. Oonchi', '1845 Marine Drive', null, 'West Vancouver', 'Doctors office','https://www.dropbox.com/sh/diwnsimhvkiy7hs/AADn3VkGDe8H4YwKqYqzJXj7a?dl=0')













