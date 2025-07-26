const jwt=require("jsonwebtoken");
require("dotenv").config();
const user=require('../models/User');

// auth middleware to check if the user is authenticated

exports.auth=async(req, resizeBy, next)=>{
    try{
        // extract token from the request headers
        const token=req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer ", "");
        // if token missing, return error response
        if(!token){
            return res.status(401).json({
                success:false,
                message:"Toekn is missing, please login again."
            })
        }

        // verify the token
        try{
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            console.log("Decoded Token:", decode);
            req.user=decode; // attach user info to the request object
        }
        catch(err){
            // verification failed, return error response
            return res.status(401).json({
                success:false,
                message:"Invalid token, please login again."
            })  
        }
        next(); // proceed to the next middleware or route handler
    }
    catch(err){
        console.log("Error occurred in auth middleware:", err);
        return res.status(401).json({
            success:false,
            message:"Authentication failure",
            error: err.message
        });
    }
}


// IsStudent middleware to check if the user is a student

exports.isStudent=async(req,res,next)=>{
    try{
        if(req.user.accountType!=="Student"){
            return res.status(401).json({
                success:false,
                message:"This is a protected routes for students only."
            })
        }
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"User role can not be verified",
            error: err.message
        });
    }
}



//         INSTRUCTOR AUTH MIDDLEWARE

exports.isInstructor=async(req,res,next)=>{
    try{
        if(req.user.accountType!=="Instructor"){
            return res.status(401).json({
                success:false,
                message:"This is a protected routes for Instructor only."
            })
        }
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"User role can not be verified",
            error: err.message
        });
    }
}


//                       ADMIN AUTH MIDDLEWARE

exports.isAdmin=async(req,res,next)=>{
    try{
        if(req.user.accountType!=="Admin"){
            return res.status(401).json({
                success:false,
                message:"This is a protected routes for Admin only."
            })
        }
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"User role can not be verified",
            error: err.message
        });
    }
}