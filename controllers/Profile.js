const Profile=require("../models/Profile");  
const User=require("../models/User");

exports.updateProfile=async(req, res)=>{
    try{
        // get data
        const{dateOfBirth="", about="", contactNumber, gender}=req.body;

        //get userId
        const id=req.user.id;

        // validation
        if(!contactNumber || !gender || !id){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        }

        //find profile
        const userDetails= await User.findById(id);
        const profileId= userDetails.additionalDetails;
        const profileDetails=await Profile.findById(profileId);

        //update profile
        profileDetails.dateOfBirth=dateOfBirth;
        profileDetails.about=about;
        profileDetails.gender=gender;
        profileDetails.contactNumber=contactNumber;
        await profileDetails.save();



        //return response
        return res.status(200).json({
            success:true,
            message:"profile UPdated successully..!!",
            profileDetails,
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error",
        })
    }
}





// delete Account



exports.deleteAccount=async(req, res)=>{
    try{
        // get id
        const id=req.user.id;

        // validation
        const userDetails=await User.findById(id);
        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:"user not found"
            })
        }

        // delete profile
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});

        // [TODO]-> Unenroll user from all enrolled courses

        //user delete
        await User.findByIdAndDelete({_id:id});

        //response return
        return res.status(200).json({
            success:true,
            message:"User deleted successfully..!!",
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"User can not be deleted successfully..!!"
        })
    }
}


// get all user details

exports.getAllUserDetails = async(req, res)=>{
    try{
        //get id
        const id=req.user.id;

        //get user details
        const userDetails=await User.findById(id).populate("additionalDetails").exec();

        // return res
        return res.status(200).json({
            success:true,
            message:"User Data Fetched Successfully..!!"
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:err.message, 
        })
    }
}