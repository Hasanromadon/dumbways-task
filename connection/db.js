const { Pool, } = require('pg');

const dbPool = new Pool({
    host: "ec2-44-192-245-97.compute-1.amazonaws.com",
    user: "ullvmhlbycfuzx",
    port: "5432",
    password: "99fe7c057106d683db7c3fc935684f756f123680db54798f217e5786c11321f9",
    database: "dbvf5314ua3tbq",
    ssl: { rejectUnauthorized: false }
});

// const dbPool = new Pool({
//     host: "localhost",
//     user: "postgres",
//     port: 5432,
//     password: "123",
//     database: "postgres"
// });

module.exports = dbPool;

// postgres://ullvmhlbycfuzx:99fe7c057106d683db7c3fc935684f756f123680db54798f217e5786c11321f9@ec2-44-192-245-97.compute-1.amazonaws.com:5432/dbvf5314ua3tbq