const express = require('express');
const { xss } = require('express-xss-sanitizer');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const cors = require('cors');
const hpp = require('hpp');
const session = require('express-session');
const ErrorHandler = require('./middlewares/error.handler');
const morgan = require('./config/morgan');
const projectroutes = require('./routes/project.routes');
const creatorroutes = require('./routes/creator.routes');
const followerroutes = require('./routes/follower.routes');
const paymmentroutes = require('./routes/payment.routes');
const favoriteroutes = require('./routes/favourites.routes');

const app = express();
app.use(
  session({
    secret: 'goodandgooddaywillgotyouboy',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  }),
);
app.use(xss());
app.use(hpp());
app.use(helmet());
app.use(
  mongoSanitize({
    allowDots: true,
    replaceWith: '_',
  }),
);
app.use(express.json());
app.use(morgan.successHandler);
app.use(morgan.errorHandler);
app.use(cors());
app.use('/api', projectroutes, creatorroutes, followerroutes, paymmentroutes, favoriteroutes);

// handle 404 error
app.use((req, res) => {
  res.status(404).send('The resource is not availlable in this page');
});

app.use(ErrorHandler);
module.exports = app;
