const request = require("supertest");

const app = require("../app");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    getEmployeeId
} = require("./_testCommon");

beforeAll(commonBeforeAll)
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

async function authenticateEmployeeAndGetSessionCookie(name, userPassword) {
    let idStr = await getEmployeeId(name);

    let authResp = await request(app).post("/api/auth").send({
        id: idStr,
        password: userPassword
    })
    let sessionId = authResp.header['set-cookie'][0].slice(10)
    console.log('in FN', sessionId, 'header', authResp.header)
    let r = sessionId.split(';')
    return r[0]
    return sessionId
   
}


describe("Jobs", function () {

    test("Regular employee can get jobs list", async function () {

        let joeSession = await authenticateEmployeeAndGetSessionCookie('Joe', 'password1');
        console.log('sess passed to test for resp', joeSession)
        let resp = await request(app).get(`/api/jobs`).set("Cookie", `sessionId=${joeSession}`);

        expect(resp.body).toEqual([
            {
                active: true,
                job_address_street_city: "West Vancouver",
                job_address_street_line1: "1845 Marine Drive",
                job_address_street_unit: null,
                job_description: "Doctors office",
                job_id: "400-22044",
                job_name: "Dr. Oonchi",
                shop_docs_link: "https://www.dropbox.com/sh/diwnsimhvkiy7hs/AADn3VkGDe8H4YwKqYqzJXj7a?dl=0"

            },
            {
                active: true,
                job_address_street_city: "Surrey",
                job_address_street_line1: "123 152nd St",
                job_address_street_unit: "#5",
                job_description: "Dentist office",
                job_id: "400-22045",
                job_name: "IQ Dental",
                shop_docs_link: null


            }
        ])


    })

    test("Request with invalid session ID cannot get jobs list", async function () {


        let resp = await request(app).get(`/api/jobs`).set("Cookie", `sessionId=abc123`);

        expect(resp.body).toEqual(
            {
                message: "Unauthorized"
            }
        )


    })

    test("Regular employee can get job detail", async function () {

        let jobId = '400-22044'
        let joeSession = await authenticateEmployeeAndGetSessionCookie('Joe', 'password1');
        let resp = await request(app).get(`/api/jobs/${jobId}`).set("Cookie", `sessionId=${joeSession}`);

        expect(resp.body).toEqual(
            {
                active: true,
                job_address_street_city: "West Vancouver",
                job_address_street_line1: "1845 Marine Drive",
                job_address_street_unit: null,
                job_description: "Doctors office",
                job_id: "400-22044",
                job_name: "Dr. Oonchi",
                shop_docs_link: "https://www.dropbox.com/sh/diwnsimhvkiy7hs/AADn3VkGDe8H4YwKqYqzJXj7a?dl=0"

            }
            
        )
    })

    test("Invalid session cannot get job detail", async function () {

        let jobId = '400-22044'

        let resp = await request(app).get(`/api/jobs/${jobId}`).set("Cookie", `sessionId=123abc`);

        expect(resp.body).toEqual(
            {
                message: "Unauthorized"

            }
        )
    })

    test("Manager can create job", async function () {

        let shawnSession = await authenticateEmployeeAndGetSessionCookie('Shawn', 'password1');

        let job_id = '123';
        let job_name = 'Test Job';
        let job_address_street_line1 = '123 Fake St';
        let job_address_street_city = 'Surrey';
        let job_address_street_unit = null;
        let job_description = 'A test job';
        let shop_docs_link = 'nba.com';

        let resp = await request(app).post(`/api/jobs`).set("Cookie", `sessionId=${shawnSession}`).send({
            job_id, job_name, job_address_street_line1, job_address_street_unit, job_address_street_city, job_description, shop_docs_link

        })
        expect(resp.body).toEqual(
            {
                active: true,
                job_id: '123',
                job_name: 'Test Job',
                job_address_street_line1: '123 Fake St',
                job_address_street_city: 'Surrey',
                job_address_street_unit: null,
                job_description: 'A test job',
                shop_docs_link: 'nba.com'

            }
        )

    })

    test("Employee cannot create job", async function () {

        let joeSession = await authenticateEmployeeAndGetSessionCookie('Joe', 'password1');

        let job_id = '123';
        let job_name = 'Test Job';
        let job_address_street_line1 = '123 Fake St';
        let job_address_street_city = 'Surrey';
        let job_address_street_unit = null;
        let job_description = 'A test job';
        let shop_docs_link = 'nba.com';

        let resp = await request(app).post(`/api/jobs`).set("Cookie", `sessionId=${joeSession}`).send({
            job_id, job_name, job_address_street_line1, job_address_street_unit, job_address_street_city, job_description, shop_docs_link

        })
        expect(resp.body).toEqual(
            {
            message: "Unauthorized"
            }
        )
    })

    test("Manager can edit job details or make job inactive", async function () {

        let shawnSession = await authenticateEmployeeAndGetSessionCookie('Shawn', 'password1');
        let jobId = '400-22044'
        let job_name = 'Test Job';
        let job_address_street_line1 = '123 Fake St';
        let job_address_street_city = 'Surrey';
        let job_address_street_unit = null;
        let job_description = 'A test job';
        let shop_docs_link = 'nba.com';

        let resp = await request(app).put(`/api/jobs/${jobId}`).set("Cookie", `sessionId=${shawnSession}`).send({
            job_name, job_address_street_line1, job_address_street_unit, job_address_street_city, job_description, shop_docs_link
        })
            expect(resp.body).toEqual(
                {
                    active: true,
                    job_id: jobId,
                    job_name: 'Test Job',
                    job_address_street_line1: '123 Fake St',
                    job_address_street_city: 'Surrey',
                    job_address_street_unit: null,
                    job_description: 'A test job',
                    shop_docs_link: 'nba.com'
    
                }
            )
        
            let statusResp = await request(app).patch(`/api/jobs/${jobId}`).set("Cookie", `sessionId=${shawnSession}`).send({
                status: false
            })

            expect(statusResp.body).toEqual(
                {
                    active: false,
                    job_id: jobId,
                    job_name: 'Test Job',
                    job_address_street_line1: '123 Fake St',
                    job_address_street_city: 'Surrey',
                    job_address_street_unit: null,
                    job_description: 'A test job',
                    shop_docs_link: 'nba.com'
    
                }
            )





    })

    test("Employee cannot edit job or make job inactive", async function () {

        let joeSession = await authenticateEmployeeAndGetSessionCookie('Joe', 'password1');
        let jobId = '400-22044'
        let job_name = 'Test Job';
        let job_address_street_line1 = '123 Fake St';
        let job_address_street_city = 'Surrey';
        let job_address_street_unit = null;
        let job_description = 'A test job';
        let shop_docs_link = 'nba.com';

        let resp = await request(app).put(`/api/jobs/${jobId}`).set("Cookie", `sessionId=${joeSession}`).send({
            job_name, job_address_street_line1, job_address_street_unit, job_address_street_city, job_description, shop_docs_link
        })
            expect(resp.body).toEqual(
                {
                    message: "Unauthorized"
                }
            )
        
            let statusResp = await request(app).patch(`/api/jobs/${jobId}`).set("Cookie", `sessionId=${joeSession}`).send({
                status: false
            })

            expect(statusResp.body).toEqual(
                {
                    message: "Unauthorized"
    
                }
            )

    })

})
