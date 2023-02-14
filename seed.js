const { Client } = require('pg');
const {createJobsQuery,
    createEmployeesQuery,
    positionsQuery,
    certificationsQuery,
    timecardsQuery,
    addInitialPositionsQuery,
    addInitialCertificationsQuery,
    testEmp,
    testJob} = require('./seedScripts');

const client = new Client({
    host: process.env.RDS_HOSTNAME,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    database: process.env.RDS_DB_NAME,
    port: process.env.RDS_PORT,
});

client.connect();

const seed = async () => {
    try {
        // Write your seed data here
        // const query = 'INSERT INTO my_table (column1, column2) VALUES ($1, $2)';
        // const values = ['value1', 'value2'];

        // await client.query(query, values);
        await client.query(createJobsQuery);
        await client.query(certificationsQuery)
        await client.query(positionsQuery)
        await client.query(createEmployeesQuery);
        await client.query(timecardsQuery);
        await client.query(addInitialPositionsQuery,['Employee',0,'Labourer',0,'Manager',0]);
        await client.query(addInitialCertificationsQuery, ['None',0,'Apprentice',0,'Journeyman',0]);
        await client.query(testEmp,['password','Matt','Chanway', 'matthewchanway@gmail.com',3,1,'2022-12-01',null,null,null,true]);
        await client.query(testJob, ['400-22044', 'Dr. Oonchi', '1845 Marine Drive', null, 
        'West Vancouver', 'Doctors office','https://www.dropbox.com/sh/diwnsimhvkiy7hs/AADn3VkGDe8H4YwKqYqzJXj7a?dl=0'])

        console.log('Seed data successfully inserted into the database');
    } catch (error) {
        console.error('Error inserting seed data: ', error);
    } finally {
        client.end();
    }
};

seed();