const db = require("../db");
const bcrypt = require("bcrypt");


class JobsManager {

    static async getAllJobs() {
        try {
            const result = await db.query(`
        SELECT * from jobs WHERE active = true ORDER BY job_name ASC`);

            return result.rows;
        }
        catch (e) {
            throw e;
        }
    }

    static async getJob(id) {
        try {
            const result = await db.query(`
        SELECT * from jobs WHERE job_id = $1`, [id]);

            if(!result.rows.length) return false

            return result.rows[0];
        }
        catch (e) {
            throw e;
        }
    }

    static async addJob(data) {

        try {

            const { job_id, job_name, job_address_street_line1, job_address_street_unit, job_address_street_city, job_description, shop_docs_link } = data;
            if(!job_id || !job_name || !job_address_street_line1 || !job_address_street_city) throw new Error('Key details are missing.')

            const result = await db.query(`INSERT INTO jobs (job_id , job_name, job_address_street_line1, job_address_street_unit, job_address_street_city, job_description, shop_docs_link) 
            VALUES($1, $2, $3, $4, $5,$6,$7 ) returning *`, [job_id, job_name, job_address_street_line1, job_address_street_unit, job_address_street_city, job_description, shop_docs_link]);

            return result.rows[0];
        }
        catch (e) {

            throw e;
        }
    }

    static async editJob(data, jobId) {

        try {

            const { job_name, job_address_street_line1, job_address_street_unit, job_address_street_city, job_description, shop_docs_link } = data;
            const result = await db.query(`
        UPDATE jobs SET job_name = $1, job_address_street_line1 = $2, job_address_street_unit = $3, job_address_street_city = $4,
        job_description = $5, shop_docs_link = $7 WHERE job_id = $6 RETURNING *`, [job_name, job_address_street_line1, job_address_street_unit, job_address_street_city, job_description, jobId, shop_docs_link]);
        if(!result.rows.length) throw new Error('Job not found');
            return result.rows[0];


        }
        catch (e) {

            throw e;
        }
    }

    static async updateJobStatus(id, status) {

        try {
            if (status !== true && status !== false) throw new Error("Status must be true or false.");
            const result = await db.query(`
        UPDATE jobs SET active = $2 WHERE job_id = $1 returning *`, [id, status]);
            if (result.rows.length === 0) throw new Error("Job not found.");
            return result.rows[0];

        }
        catch (e) {

            throw e;
        }
    }

    static async deleteJob(jobId) {

        try {

            const result = await db.query(`
        DELETE from jobs WHERE job_id = $1`, [jobId]);
            return result.rows;
        }
        catch (e) {

            throw e;
        }
    }



}

module.exports = JobsManager;