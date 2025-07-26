const User=require('../models/User');
const OTP=require('../models/OTP');
const OTPGenerator=require('otp-generaor');
const bcrypt=require('bcrypt');
const jwt=require("jsonwebtoken");
require("dotenv").config();
const mailSender = require("../utils/mailSender");

exports.sendOTP=async(req, res)=>{

    try{
            // fetch email from the request body
        const{email}=req.body;

        // check if the user exists
        const checkUserPresent=await User.findOne({email});

        // if user already exists, send error response
        if(checkUserPresent){
            return res.status(400).json({
                success:false,
                message:"User already exists with this email."
            })
        }

        // GENERATE OTP
        var otp=OTPGenerator.generate(6,{
            upperCase: false,
            lowerCase: false,
            specialChars: false
        })
        console.log("Generated OTP:", otp);

        // check Unique OTP or not ?

        const result=await OTP.findOne({otp});

        while(result){
            otp=OTPGenerator.generate(6,{
                upperCase: false,
                lowerCase: false,
                specialChars: false
            });
            result=await OTP.findOne({otp});
        }
        const payload={
            email,
            otp,
        }

        //  craete an entry in the OTP collection
        const otpBody=await OTP.create(payload);
        console.log("OTP Entry Created:", otpBody);


        // return response successfully
        return res.status(200).json({
            success:true,
            message:"OTP sent successfully to your email.",
            otp,
        })
    }
    catch(err){
        console.log("Error occurred while sending OTP:", err);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error",
            error: err.message
        });
    }
}



//                  SIGN UP CONTROLLER

exports.signUp=async(req,res)=>{

    // DATA FETCH FROM REQUEST BODY
    try{
        const {firstName,lastName, email, password, confirmPassword, accountType, contactNumber, otp} = req.body;

    // VALIDATE THE DATA
    if(!firstName || !lastName || !email || !password || !confirmPassword || !accountType || !contactNumber || !otp){
        return res.status(403).json({
            success:false,
            message:"Please provide all the required fields."
        })
    }

    // CONFIRM BOTH 2 PASSWORDS ARE SAME OR NOT (PASSSWORD AND CONFIRM PASSWORD)
    if(password!==confirmPassword){
        return res.status(400).json({
            success:false,
            message:"Passwords and confirm password does not match."
        });
    }
    // CHECK IF USER ALREADY EXISTS
    const existingUser=await User.findOne({email});
    if(existingUser){
        return res.status(400).json({
            success:false,
            message:"User already exists with this email."
        });
    }

    // FIND MORE RECENT OTP FOR THE USER
    const recentOtp =await OTP.findOne({email}).sort({createdAt:-1});        //.sort({ createdAt: -1 }) — This sorts the results    in descending order by createdAt, meaning the newest document will come first.
    console.log(recentOtp);

    // VALIDATE THE OTP
    if(recentOtp.length==0){
        // if no OTP found for the user
        return res.status(400).json({
            success:false,
            message:"No OTP found for this user. Please request a new OTP."
        })
    }
    else if(recentOtp.otp!==otp){
        // Invalid OTP
        return res.status(400).json({
            success:false,
            message:"Invalid OTP. Please try again."
        });
    }

    // HASH THE PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);
     

    // CREATE ENTRY IN THE DATABASE

    const profileDetails=await Profiler.create({
        gender:null,
        dateOfBirth:null,
        address:null,
        about:null,
        contactNumber:null,
    });


    const user=await user.create({
        firstName,
        lastName,
        password:hashedPassword,
        email,
        contactNumber,
        accountType,
        additionalDetails:profileDetails._id,  // additional detail k liye profile ka object bhi create krna pdega
        image:`https://api.dicebear.com/9.x/initials/svg?seed=<your_seed>`
    })
        // RETURN RESPONSE
        res.status(200).json({
            success:true,
            message:"User registered Successfully",
            user,
        })
}
    catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"User can not be registered. Please try again..!!"
        })
    }

}



//               LOGIN CONTROLLER       

exports.login=async(req,res)=>{
    try{

        // fetch data from req body
        const{email, password}=req.body;

        // validate the data
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:"All fields are required please try again..!!"
            })
        }

        // check if user exists or not
         const user=await User.findOne({email}).populate("additionalDetails");

         if(!user){
            return res.status(401).json({
                success:false,
                message:"User is not registered. Please SignUp first..!!"
            })
         }

        // generate JWT token, after Matching the password
        if(await bcrypt.compare(password, user.password)){
            const payload={
                email:user.email,
                id:user._id,
                role:user.accountType,

            }
            const token=jwt.sign(payload, process.env.JWT_SECRET,{expiresIn:"2h"});
            user.token=token;
            user.password=undefined;

            //create a cookie with the JWT token 
            const options={
                expires:new Date(Date.now()+3*24*60*60*1000),  // 3 days
                httpOnly:true, // cookie will not be accessible from client side javascript
            }
            res.cookie("token", token, options).status(200).json({
                success:true,
                token,
                user,
                message:"Loggod in successfully..!!"
            })
        }
        else{
            return res.status(401).json({
                success:false,
                message:"Password is incorrect. Please try again..!!"
            })
        }

        // send response

    }
    catch(err){
        console.log("Error occurred while logging in:", err);
        return res.status(500).json({
            success:false,
            message:"Login failure",
            error: err.message
        });
    }
}


//                CHANGED PASSWORD


exports.changePassword = async (req, res) => {
  try {
    // 1. Fetch the data from request body
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // 2. Validate inputs
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "New passwords do not match" });
    }

    // 3. Get user from DB using ID (assumed to be set via auth middleware)
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 4. Compare old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Old password is incorrect" });
    }

    // 5. Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 6. Update password in DB
    user.password = hashedPassword;
    await user.save();

    // 7. Send confirmation email
    try {
      await mailSender(user.email, "Password Updated", `Hi ${user.name}, your password was successfully changed.`);
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError.message);
    }

    // 8. Return success response
    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });

  } catch (err) {
    console.error("Change Password Error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while changing password",
    });
  }
};
