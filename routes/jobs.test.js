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
    let sessionIdHeader = authResp.headers['set-cookie'][0].slice(10)
    let jwtHeader = authResp.headers['set-cookie'][1].slice(4);
    let sessionSplit = sessionIdHeader.split(';')
    let jwtSplit = jwtHeader.split(';')
    
    let session = decodeURIComponent(sessionSplit[0]);
    let jwt = decodeURIComponent(jwtSplit[0]);
    return {session, jwt}
}

function getJwtHeader(authResp){
    console.debug('in fn', authResp.header)
    let cookies = authResp.header['set-cookie'][0].split(';')
    // let jwtHeader = authResp.header['set-cookie'][1].slice(4);
    let jwtHeader = cookies[1].slice(4)
    
    let jwtSplit = jwtHeader.split(';')
    return decodeURIComponent(jwtSplit[0]);
}


describe("Jobs", function () {

    // test("Regular employee can get jobs list", async function () {

    //     expect.assertions(2);

    //     let {session, jwt} = await authenticateEmployeeAndGetSessionCookie('Joe', 'password1');
    
    //     let resp = await request(app).get(`/api/jobs`).set("Cookie", `sessionId=${session}`);
    //     let returnedJwt = getJwtHeader(resp)

    //     expect(jwt).not.toEqual(returnedJwt)

    //     expect(resp.body).toEqual([
    //         {
    //             active: true,
    //             job_address_street_city: "West Vancouver",
    //             job_address_street_line1: "1845 Marine Drive",
    //             job_address_street_unit: null,
    //             job_description: "Doctors office",
    //             job_id: "400-22044",
    //             job_name: "Dr. Oonchi",
    //             shop_docs_link: "https://www.dropbox.com/sh/diwnsimhvkiy7hs/AADn3VkGDe8H4YwKqYqzJXj7a?dl=0"

    //         },
    //         {
    //             active: true,
    //             job_address_street_city: "Surrey",
    //             job_address_street_line1: "123 152nd St",
    //             job_address_street_unit: "#5",
    //             job_description: "Dentist office",
    //             job_id: "400-22045",
    //             job_name: "IQ Dental",
    //             shop_docs_link: null


    //         }
    //     ])


    // })

    // test("Request with invalid session ID cannot get jobs list", async function () {


    //     let resp = await request(app).get(`/api/jobs`).set("Cookie", `sessionId=abc123`);

    //     expect(resp.body).toEqual(
    //         {
    //             message: "Unauthorized"
    //         }
    //     )


    // })

    // test("Regular employee can get job detail", async function () {

    //     expect.assertions(2)
    //     let jobId = '400-22044'
    //     let {session, jwt} = await authenticateEmployeeAndGetSessionCookie('Joe', 'password1');
    //     let resp = await request(app).get(`/api/jobs/${jobId}`).set("Cookie", `sessionId=${session}`);
    //     let returnedJwt = getJwtHeader(resp)
    //     expect(jwt).not.toEqual(returnedJwt)

    //     expect(resp.body).toEqual(
    //         {
    //             active: true,
    //             job_address_street_city: "West Vancouver",
    //             job_address_street_line1: "1845 Marine Drive",
    //             job_address_street_unit: null,
    //             job_description: "Doctors office",
    //             job_id: "400-22044",
    //             job_name: "Dr. Oonchi",
    //             shop_docs_link: "https://www.dropbox.com/sh/diwnsimhvkiy7hs/AADn3VkGDe8H4YwKqYqzJXj7a?dl=0"

    //         }
            
    //     )
    // })

    // test("Invalid session cannot get job detail", async function () {

    //     let jobId = '400-22044'

    //     let resp = await request(app).get(`/api/jobs/${jobId}`).set("Cookie", `sessionId=123abc`);

    //     expect(resp.body).toEqual(
    //         {
    //             message: "Unauthorized"

    //         }
    //     )
    // })

    test("Manager can create job", async function () {

        let {session, jwt} = await authenticateEmployeeAndGetSessionCookie('Shawn', 'password1');

       

        let job_id = '123';
        let job_name = 'Test Job';
        let job_address_street_line1 = '123 Fake St';
        let job_address_street_city = 'Surrey';
        let job_address_street_unit = null;
        let job_description = 'A test job';
        let shop_docs_link = 'nba.com';

       

        let resp = await request(app).post(`/api/jobs`).set("Cookie", [`sessionId=${session}`, `jwt=${jwt}`]).send({
            job_id, job_name, job_address_street_line1, job_address_street_unit, job_address_street_city, job_description, shop_docs_link

        })

        console.debug('in the main test',resp.res)
        // let returnedJwt = getJwtHeader(resp)

        // expect(returnedJwt).toEqual(jwt)

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

    // test("Employee cannot create job", async function () {

    //     let {session, jwt} = await authenticateEmployeeAndGetSessionCookie('Joe', 'password1');

    //     let job_id = '123';
    //     let job_name = 'Test Job';
    //     let job_address_street_line1 = '123 Fake St';
    //     let job_address_street_city = 'Surrey';
    //     let job_address_street_unit = null;
    //     let job_description = 'A test job';
    //     let shop_docs_link = 'nba.com';

    //     let resp = await request(app).post(`/api/jobs`).set("Cookie", `sessionId=${session}`).send({
    //         job_id, job_name, job_address_street_line1, job_address_street_unit, job_address_street_city, job_description, shop_docs_link

    //     })
    //     expect(resp.body).toEqual(
    //         {
    //         message: "Unauthorized"
    //         }
    //     )
    // })

    // test("Manager can edit job details or make job inactive", async function () {

    //     let {session, jwt} = await authenticateEmployeeAndGetSessionCookie('Shawn', 'password1');
    //     let jobId = '400-22044'
    //     let job_name = 'Test Job';
    //     let job_address_street_line1 = '123 Fake St';
    //     let job_address_street_city = 'Surrey';
    //     let job_address_street_unit = null;
    //     let job_description = 'A test job';
    //     let shop_docs_link = 'nba.com';

    //     let resp = await request(app).put(`/api/jobs/${jobId}`).set("Cookie", `sessionId=${session}`).send({
    //         job_name, job_address_street_line1, job_address_street_unit, job_address_street_city, job_description, shop_docs_link
    //     })
    //         expect(resp.body).toEqual(
    //             {
    //                 active: true,
    //                 job_id: jobId,
    //                 job_name: 'Test Job',
    //                 job_address_street_line1: '123 Fake St',
    //                 job_address_street_city: 'Surrey',
    //                 job_address_street_unit: null,
    //                 job_description: 'A test job',
    //                 shop_docs_link: 'nba.com'
    
    //             }
    //         )
        
    //         let statusResp = await request(app).patch(`/api/jobs/${jobId}`).set("Cookie", `sessionId=${session}`).send({
    //             status: false
    //         })

    //         expect(statusResp.body).toEqual(
    //             {
    //                 active: false,
    //                 job_id: jobId,
    //                 job_name: 'Test Job',
    //                 job_address_street_line1: '123 Fake St',
    //                 job_address_street_city: 'Surrey',
    //                 job_address_street_unit: null,
    //                 job_description: 'A test job',
    //                 shop_docs_link: 'nba.com'
    
    //             }
    //         )





    // })

    // test("Employee cannot edit job or make job inactive", async function () {

    //     let {session, jwt} = await authenticateEmployeeAndGetSessionCookie('Joe', 'password1');
    //     let jobId = '400-22044'
    //     let job_name = 'Test Job';
    //     let job_address_street_line1 = '123 Fake St';
    //     let job_address_street_city = 'Surrey';
    //     let job_address_street_unit = null;
    //     let job_description = 'A test job';
    //     let shop_docs_link = 'nba.com';

    //     let resp = await request(app).put(`/api/jobs/${jobId}`).set("Cookie", `sessionId=${session}`).send({
    //         job_name, job_address_street_line1, job_address_street_unit, job_address_street_city, job_description, shop_docs_link
    //     })
    //         expect(resp.body).toEqual(
    //             {
    //                 message: "Unauthorized"
    //             }
    //         )
        
    //         let statusResp = await request(app).patch(`/api/jobs/${jobId}`).set("Cookie", `sessionId=${session}`).send({
    //             status: false
    //         })

    //         expect(statusResp.body).toEqual(
    //             {
    //                 message: "Unauthorized"
    
    //             }
    //         )

    // })

})
