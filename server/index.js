require('dotenv').config()
const express = require('express')
const {sequelize} = require('./db/db.js')
const models = require('./db/models/models.js')
const router = require('./routes/index.js')

const errorHandler = require('./middleware/errorHandlingMiddleware.js')
const morgan = require('morgan');
const logger = require('./libs/logger.js')
const { default: helmet } = require('helmet')

const PORT = process.env.PORT || 5000;
console.log('Port number is: ', PORT)

const app = express();

// Express CORS middleware.. so much easier than trying to get Restify to work
var allowCrossDomain = function(req, res, next) {
  const allowedOrigins = ['https://sandbox.zarinpal.com', 'https://api.zarinpal.com', 'https://www.zarinpal.com', 'http://localhost:4000', 'http://localhost:3000'];
  const origin = req.headers.origin;
  if(allowedOrigins.includes(origin)){
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, Accept, Origin, Referer, User-Agent, Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials',  true);
 
  // intercept OPTIONS method
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  }
  else {
    next();
  }
};

app.use(allowCrossDomain);   // make sure this is is called before the router

app.use(express.json());
app.use(express.urlencoded({ extended: false })) // for parsing application/x-www-form-urlencoded
app.use(express.static(__dirname+'public'));
app.use('/api', router)
app.use(morgan('common',
 {
  //Output stream for writing log lines, defaults to process.stdout.
  //To send logs to module 'logger' - add stream attr as a callback write(mesage)
  stream:{
    // send variable message to log function 'logger.info(message)
    write: (message) => {logger.info(message)}
  }
}));
app.use(helmet());

app.use(errorHandler)

console.log('Before sequelize start line')

const start = async () => {
  try {
    //'Before sequelize Authentication'
    await sequelize.authenticate()
    .then(function (){ console.log('Connected Successfully!')})
    .catch(function (err){console.log('Error occured: ', err.message)});
    //'After sequelize Authentication'
    // await sequelize.validate();

    //'Before sequelize Sync'
    await sequelize.sync({logging:console.log})
    .then(function(){ console.log('Synced Successfully!')})
    .catch(function(err){ console.log('Error in syncing occured: ', err.message)});
    //'After sequelize Sync'

    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  } catch (e) {
    console.error('Unable to connect to the database: ', e.message)
  }
}

start();
