const express = require('express');
const mongoose = require('mongoose');

/*
|--------------------------------------------------------------------------
| ROUTES
|--------------------------------------------------------------------------
*/

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

const app = express();

/*
|--------------------------------------------------------------------------
| BRING MONGODB KEY
|--------------------------------------------------------------------------
*/

const db = require('./config/keys').mongoURI;

/*
|--------------------------------------------------------------------------
| CONNECT TO MONGODB
|--------------------------------------------------------------------------
*/

mongoose
    .connect(db)
    .then(() => console.log('connected'))
    .catch(err => console.log("couldn't connect"));

app.get('/', (req, res) => res.send('hellssso'));

/*
|--------------------------------------------------------------------------
| USE ROUTES
|--------------------------------------------------------------------------
*/

app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server running on ${port}`));
