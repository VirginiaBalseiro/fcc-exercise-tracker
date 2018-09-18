const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const {ObjectID} = require('mongodb')


const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track', { useNewUrlParser: true } )

var {User} = require('./models/user');
var {Exercise} = require('./models/exercise');

app.use(cors());

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

//post username to db, get an id in return
app.post('/api/exercise/new-user/', function (req, res) {

  var username = req.body.username;
  var regex = /[a-zA-Z0-9]/gi;
  
  if (regex.test(username) === true && username.length <= 20){

        var newUser = new User({
         username
       });
        newUser.save().then((doc) => {
          return res.send(doc);
        }, (e) => {
          if (e.code === 11000) {
            return res.send('Username taken');
          }
          return res.status(400).send(e);
        }); 
  } else {
    return res.status(400).send('Invalid username: use letters a-z and A-Z and numbers 0-9');
  }
});

//post a workout to db, get it in an object in return
app.post('/api/exercise/add/', function (req, res) {
  var userId = req.body.userId;
  var description = req.body.description;
  var duration = req.body.duration;
  if (!req.body.date) {
      var date = Date.now()
  } else {
      var date = new Date(req.body.date);
    }
    console.log("Submitted date: "+req.body.date);
    console.log("Created date: "+date);
  var newExercise = new Exercise({
    userId,
    description,
    duration,
    date
  });
  newExercise.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    //res.send(date);
    return res.status(400).send(e);
  }); 
});

//get log by user ID (include from and to) - /api/exercise/log?{userId}[&from][&to][&limit]
app.get('/api/exercise/log?:userId/:from?/:to?/:limit?', (req, res) => {
  var params = {}
  params.userId = req.query.userId;
  if (req.query.from ) {
    if (!params.date) {
    params.date={}
    }
  params.date.$gte = new Date(req.query.from)
  }
  if (req.query.to ) {
    if (!params.date) {
    params.date={}
    }
  params.date.$lte = new Date(req.query.to)
  }
  /*if (req.query.limit) {
  params.limit = parseInt(req.query.limit)
  }*/
  var limit = req.query.limit ? parseInt(req.query.limit) : 0
  
  // add condition for is user id doesn't exist throw an error

  Exercise.find(params).limit(limit).then((exercise) => {
    return exercise.length ? res.send(exercise) : res.status(404).send('Not found');
  });
});

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
