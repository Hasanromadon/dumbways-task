const { Pool, } = require('pg');

// const dbPool = new Pool({
//     host: "ec2-34-238-37-113.compute-1.amazonaws.com",
//     user: "stupvablyvfhuo",
//     port: "5432",
//     password: "cc1be3edc71e6781920903cc42a832de9c50cdda9fd652ade1b920fcc3a1378e",
//     database: "d74494t4318bbn",
//     ssl: { rejectUnauthorized: false }
// });

const dbPool = new Pool({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "123",
    database: "postgres"
});

module.exports = dbPool;

// postgres://ullvmhlbycfuzx:99fe7c057106d683db7c3fc935684f756f123680db54798f217e5786c11321f9@ec2-44-192-245-97.compute-1.amazonaws.com:5432/dbvf5314ua3tbq