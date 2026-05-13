require("dotenv").config();
const mongoose = require('mongoose');
const MONGODB_URL = process.env.MONGODB_URL;
console.log(MONGODB_URL);

const connectToMongoDB = async()=>{
try{
    await mongoose.connect(MONGODB_URL);
    console.log("Connection created successfully with Mongo DB");
    
}catch(error){
    console.log("Mongo DB Connection Failed", error);
    process.exit(1);
    
}
}
module.exports = {connectToMongoDB};