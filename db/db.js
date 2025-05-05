require('dotenv').config();
const { Sequelize } = require('sequelize');
const logger  = require('../libs/logger');

// user must have permission to create databases.
const sequelize = new Sequelize({
  dialect:'postgres',
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: encodeURI(process.env.DB_PASS),
  host: 'localhost',
  port: 5432,
  logging: (sql)=> {logger.info(`[${new Date()}] - ${sql}`)},
  sync: true,
  define:{
    charset: 'utf8',
    collate: 'utf8_general_ci'
  },
  pool: {
    max: 5,
    min: 1,
    idle: 30000,
    acquire: 60000
  },
  maxUses: process.env.MAXUSES
});


const testDbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

module.exports = {sequelize, testDbConnection};
