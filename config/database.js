const mongoose =require("mongoose");
require("dotenv").config();

exports.connectDB= ()=>{
    mongoose.connect(process.env.MONGODB_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true,
    })
    .then(()=>{
        console.log("Database Connection Suscessfull..!!");
    })
    .catch((err)=>{
        console.log("Database Connection Failed..!!", err);
        process.exit(1); // Exit process with failure
    })
}
