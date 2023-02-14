// OLD
// const { Client } = require("pg");

// const client = new Client(process.env.DATABASE_URL || "postgresql:///cascade");

// client.connect();

// module.exports = client;

const { Client } = require("pg");
const { getDatabaseUri } = require("./config");

let db = new Client({
  host: process.env.RDS_HOSTNAME,
  user: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  port: process.env.RDS_PORT,
  connectionString: process.env.DATABASE_URL
})

// if (process.env.NODE_ENV === "production") {
//   db = new Client({
//     connectionString: getDatabaseUri(),
//     ssl: {
//       rejectUnauthorized: false
//     }
//   });
// } else {
//   db = new Client({
//     connectionString: getDatabaseUri()
//   });
// }

db.connect();

module.exports = db;