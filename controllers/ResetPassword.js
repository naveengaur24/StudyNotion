const User=require("../models/User");
const mailSender=require("../utils/mailSender");
const bcrypt=require("bcrypt");

// reset password token
exports.resetPasswordToken = async (req, res) => {
    try{
        // get email from req. body
        const { email } = req.body;

        // validation\
        const user=await User.findOne({email:email});
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found with this email."
            })
        }

        //generate token
        const token= crypto.randomUUID(); // or use any other method to generate a unique token

        // update user with adding token and expiry time
        const updatedDetails=await User.findOneAndUpdate(
            {email:email},
            {
                token:token,
                resetPasswordExpires: Date.now() + 5*60*1000 // token valid for 5 min
            },
            {new:true}  // to return the updated document
        )

        // create URL
        const url='http://localhost:3000/reset-password/' + token;

        // send mail containing the url
        await mailSender(email, "Password reset link", 
            "password reset link is : " + url
        )

        // return response
        return res.status(200).json({
            success:true,
            message:"Email sent successfully, please check email and password.",
            url: url
        });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while reset the password";
        })
    }
}


// RESET PASSWORD
exports.resetPassword = async (req, res) => {
    try{
        // FETCH THE DATA FROM REQ BODY
        const{password, resetPassword, token}=req.body;

        // validation
        if(password!==confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Password not matching";
            })
        }

        //get user details from db using token
        const userDetails=await User.findOne({token:token});


        // if no entry -- invalid token
        if(!userDetails){
            return res.json({
                success:false,
                message:"Token is invalid "
            })
        }

        // token time check
        if(userDetails.resetPasswordExpires>Date.now()){
            return res.json({
                success:false,

            })
        }

        // hash the password
        const hashedPassword=await bcrypt.hash(password, 10);

        // password update
        await User.findOneAndUpdate(
            {token:token},
            {password:hashedPassword},
            {new:true},
        )

        // return res
        return res.status(200).json({
            success:true,
            message:"Password Reset Successfull..!!"
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while sending reset password and email"
        })
    }
}