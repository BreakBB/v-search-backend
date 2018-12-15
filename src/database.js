const {parseIniFile} = require("./iniParser");
const { Pool } = require('pg');

const dbData = parseIniFile('database.ini');

if(dbData === undefined || dbData.postgresql === undefined){
  const err = "Error while reading database.ini. Make sure it is formatted correctly.";
  console.error(err);
  throw err;
}

const dbConfig = {
  user: dbData.postgresql.user,
  host: dbData.postgresql.host,
  database: dbData.postgresql.database,
  password: dbData.postgresql.password,
  port: dbData.postgresql.port
};

const pool = new Pool(dbConfig);

module.exports = {
  query: (text, params) => pool.query(text, params)
};