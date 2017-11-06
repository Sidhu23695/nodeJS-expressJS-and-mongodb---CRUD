require('dotenv').config();
const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose');


//Set up default mongoose connection
const mongoDB = process.env.MONGODB_URL;
mongoose.connect(mongoDB);

mongoose.Promise = global.Promise;


//Get the default connection
const db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', () => {
    console.log('mongoDB connection error')
});

//body-parser configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));


//import routes

const userRouter = require('./routes/user');


//register routes

app.use('/user', userRouter);


//configure port
app.set('port', process.env.PORT);

app.listen(app.get('port'), () => {
    console.log('app listening on port 3000');
});