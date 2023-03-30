DROP DATABASE IF EXISTS "cascade-test";

CREATE DATABASE "cascade-test";

\c "cascade-test";

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
    active BOOLEAN default true,
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
