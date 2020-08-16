const express = require('express');
const config = require('config');
const cors = require('cors');
const mongoose = require('mongoose');

//Getting the routes
const auth = require('./routes/auth.route');
const post = require('./routes/posts.route');
const comment = require('./routes/comments.route');

const PORT = config.get('PORT');
const MongoUri = config.get('MongoUri');

const app = express();

//Parsing json in express server
app.use(express.json());
//Adding CORS to all routes
app.use(cors());

//Setting up the routes
app.use('/api/auth', auth);
app.use('/api/post', post);
app.use('/api/comment', comment)

//Async function for connecting MongoDb
const MongoConnect = async () => {
    try{
        await mongoose.connect(MongoUri,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
            createIndexes: true
        });
        //Approving the connect
        console.log('Server connected to MongoDb');
    }
    catch(err){
        console.log(`You have an Error with Mongo connection: ${err}`);
    }
}
MongoConnect();

//Starting the express server
app.listen(PORT, () => console.log(`You have started the server on port: ${PORT}`));
// postId: 5f05053f6eabdd0d405062a9
// userId: 5f0504986eabdd0d405062a8