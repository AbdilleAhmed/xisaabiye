require('dotenv').config();
const express = require('express');

// Instantiate an express server:
const app = express();

// Use process.env.PORT if it exists, otherwise use 5001:
const PORT = process.env.PORT || 5001;

// Require auth-related middleware:
const sessionMiddleware = require('./modules/session-middleware');
const passport = require('./strategies/user.strategy');

// Require router files:
const userRouter = require('./routes/user.router');
const customerRouter = require ("./routes/customer.router")
const transactionsRouter = require('./routes/transactions.router');
const summaryRouter = require ('./routes/summary.router')

// Apply middleware:
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('build'));
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// Apply router files:
app.use('/api/users', userRouter);
app.use('/api/customers', customerRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/summary', summaryRouter);


// Start the server:
app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
