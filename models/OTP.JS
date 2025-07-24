const mongoose=require("mongoose");
const mailSender=require('../utils/mailSender'); // Assuming you have a mailSender utility for sending emails

const OTPSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now,
        expires:5*60, // OTP expires in 5 minutes
    }

})


//              -->>    a function to send emails

async function sendVerificationEmail(email, otp){
    try{
        const mailResponse=await mailSender(email, "OTP Verification", `Your OTP is: ${otp}`);
        console.log("Email sent successfully:", mailResponse);
    }
    catch(err){
        console.log("Error occured while sending email:", err);
        throw err;
    }
}

OTPSchema.pre('save', async function(next){
    await sendVerificationEmail(this.email, this.otp);
    next();
})




module.exports=mongoose.model("OTP", OTPSchema);