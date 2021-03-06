var createError = require('http-errors')
  , express = require('express')
  , path = require('path')
  , cookieParser = require('cookie-parser')
  , logger = require('morgan')

  , indexRouter = require('./routes/index')
  , roundsRouter = require('./routes/rounds')
  , ticketsRouter = require('./routes/tickets')
  , drawningsRouter = require('./routes/drawnings')

  , bodyParser = require('body-parser')
  , swagger = require('./')
  , cors = require('cors')
  , app = express();

var db
const MongoClient = require('mongodb').MongoClient

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

if (process.env.ADDRESS)
  var address = process.env.ADDRESS
else
  var address = 'http://localhost:3000'

app.use(swagger.init(app, {
  apiVersion: '1.0',
  swaggerVersion: '1.0',
  basePath: address,
  swaggerURL: '/swagger',
  swaggerJSON: '/api-docs.json',
  swaggerUI: './app/public/swagger/',
  apis: ['routes/rounds.js', 'routes/tickets.js', 'routes/drawnings.js']
}));

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use('/', roundsRouter);
app.use('/', ticketsRouter);
app.use('/', drawningsRouter);
app.use('/', indexRouter);

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(3000, function(){
  console.log('listening on 3000')
})

module.exports = app;
