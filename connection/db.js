const { Pool } = require('pg');

const dbPool = new Pool({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "123",
    database: "postgres"
});

module.exports = dbPool;