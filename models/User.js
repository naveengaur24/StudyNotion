const mongoose =require("mongoose");
const { resetPasswordToken } = require("../controllers/ResetPassword");

const userSchema= new mongoose.Schema({
    firstName: {
        type:String,
        required:true,
        trim:true, //It automatically removes leading and trailing white spaces from the firstName string before saving it to the database.
    },
    lastName:{
        type:String,
        required:true,
        trim:true,   // Remove extra spaces
    },
    email:{
        type:String,
        required:true,
        unique:true, // Ensures that no two users can have the same email address.
        trim:true, // Remove extra spaces
    },
    password:{
        type:String,
        requiredtrue,

    },
    accountType:{
        type:String,
        enum:["Admin", "Student","Instructor" ],  //  it ensures that only one of the specified strings ("Admin", "Student", "Instructor") can be stored in the accountType field.
        required:true,
    },
    additionalDetails:{
        type:mongoose.Schema.Types.ObjectId, // This field can store an ObjectId that references another document in the database, allowing for flexible relationships between documents.
        ref:"Profile", // This specifies that the ObjectId will reference a document in the "Profile" collection.
    },
    courses:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Course",
        }
    ],
    image:{
        type:String,
        required:true,
    },
    token:{
        type:String,
    },
    resetPasswordExpires:{
        type:Date,
        //default:"", // Default value is an empty string
    },
    courseProgress:[
        {
             type:mongoose.Schema.Types.ObjectId,
             ref:"CourseProgress",
        }
    ],

})

module.exports=mongoose.model("User",userSchema );