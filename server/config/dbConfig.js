const mongoose = require('mongoose');
mongoose.set('strictQuery', false)
mongoose.connect(process.env.mongo_url)

const connection = mongoose.connection;

connection.on('connected', ()=> {
    console.log('Mongo DB Connection Successful');
})

connection.on('error', ()=> {
    console.log('Mongo DB Connection Failed');
})