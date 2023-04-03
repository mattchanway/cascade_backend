"use strict";

const db = require("../db.js");

const JobsManager = require("./JobsManager.js");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("../routes/_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

//********************************* */

describe("Job Manager", function(){

    let newJob = { job_id:'abc123', job_name:'athletics store', job_address_street_line1:'456 Real St',
  job_address_street_unit:'#2', job_address_street_city:'Vancouver', job_description:'big job'}

  let invJob = { job_id:'', job_name:'athletics store', job_address_street_line1:'456 Real St',
  job_address_street_unit:'#2', job_address_street_city:'Vancouver', job_description:'big job'}

    test("Get all jobs", async function(){

      let allJobs = await JobsManager.getAllJobs();
      
      expect(allJobs).toEqual([{"active": true, "job_address_street_city": "West Vancouver", "job_address_street_line1": "1845 Marine Drive", "job_address_street_unit": null, "job_description": "Doctors office", "job_id": "400-22044", "job_name": "Dr. Oonchi", "shop_docs_link": "https://www.dropbox.com/sh/diwnsimhvkiy7hs/AADn3VkGDe8H4YwKqYqzJXj7a?dl=0"}, 
      {"active": true, "job_address_street_city": "Surrey", "job_address_street_line1": "123 152nd St", "job_address_street_unit": "#5", "job_description": "Dentist office", "job_id": "400-22045", "job_name": "IQ Dental", "shop_docs_link": null}])

    })

    

    test("Get by job ID - valid ID", async function(){

      let allJobs = await JobsManager.getJob("400-22044");
      
      expect(allJobs).toEqual({"active": true, "job_address_street_city": "West Vancouver", "job_address_street_line1": "1845 Marine Drive", "job_address_street_unit": null, "job_description": "Doctors office", "job_id": "400-22044", "job_name": "Dr. Oonchi", "shop_docs_link": "https://www.dropbox.com/sh/diwnsimhvkiy7hs/AADn3VkGDe8H4YwKqYqzJXj7a?dl=0"}, 
     )

    })

    test("Get by job ID - invalid ID", async function(){

      let allJobs = await JobsManager.getJob("0");
      
      expect(allJobs).toEqual(false 
     )


    })

    test("Add valid job", async function(){

      let newJobRes = await JobsManager.addJob(newJob);
      expect(newJobRes).toEqual({ job_id:'abc123', job_name:'athletics store', job_address_street_line1:'456 Real St',
      job_address_street_unit:'#2', job_address_street_city:'Vancouver', job_description:'big job', shop_docs_link:null, active:true})
    })

    test("Add invalid job", async function(){

      
      expect.assertions(1);
      try{
        await JobsManager.addJob(invJob);
      }
      catch(e){

        expect(e).toEqual(new Error('Key details are missing.'))

      }

      
    })

    test("Edit Job", async function(){

      let data = {job_name:'athletics store edited', job_address_street_line1:'456 Real St',
      job_address_street_unit:'#2', job_address_street_city:'Vancouver City', job_description:'big job'}

      
      let editJobRes = await JobsManager.editJob(data, '400-22044');
      expect(editJobRes).toEqual({
        job_id:'400-22044', job_name:'athletics store edited', job_address_street_line1:'456 Real St',
      job_address_street_unit:'#2', job_address_street_city:'Vancouver City', job_description:'big job',
      shop_docs_link:null, active:true
      })
    })

    test("Edit non-existent job", async function(){

      let data = {job_name:'athletics store edited', job_address_street_line1:'456 Real St',
      job_address_street_unit:'#2', job_address_street_city:'Vancouver City', job_description:'big job'}

      expect.assertions(1);
      try{
        await JobsManager.editJob(data, '0');
      }
      catch(e){

        expect(e).toEqual(new Error('Job not found'))

      }
    })

    test("Edit job status", async function(){

      let data = {job_name:'athletics store edited', job_address_street_line1:'456 Real St',
      job_address_street_unit:'#2', job_address_street_city:'Vancouver City', job_description:'big job'}

      
      let editJobRes = await JobsManager.updateJobStatus('400-22044', false);
      expect(editJobRes).toEqual({"active": false, "job_address_street_city": "West Vancouver", "job_address_street_line1": "1845 Marine Drive", "job_address_street_unit": null, "job_description": "Doctors office", "job_id": "400-22044", "job_name": "Dr. Oonchi", "shop_docs_link": "https://www.dropbox.com/sh/diwnsimhvkiy7hs/AADn3VkGDe8H4YwKqYqzJXj7a?dl=0"}
    )
   
    })

    test("Edit non-existent job status", async function(){

      expect.assertions(1);
      try{
        await JobsManager.updateJobStatus('0', false);
      }
      catch(e){

        expect(e).toEqual(new Error('Job not found.'))

      }

   
    })

    test("delete job", async function(){

     
      let r =await JobsManager.deleteJob('abc123');
     
      let allJobs = await JobsManager.getJob("abc123");
      
      expect(allJobs).toEqual(false)



   
    })






})