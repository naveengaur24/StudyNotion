const Course=require('..models/Course');
const Tag=require('../models/Categories');
const User=require('../models/User');
const{uploadImageToCloudinary}= require('../utils/imageUploader');

// Create a new course

exports.createCourse=async(req, res)=>{
    try{

        // Fetch the data from the request body
        const{courseName, courseDescription, whatwillYouLearn, price, tag}=req.body;

        //get thumbnail image from req.file
        const thumbnail=req.files.thumbnailImage;

        // validation
        if(!courseName || !courseDescription || !whatwillYouLearn || !price || !tag){
            return res.status(400).json({
                success:false,
                message:"All fields are required",  
            })
        }

        // check for instructor
        const userId=req.user.id;    // instructor ki user id to hai par object id nahi hai
        const instructorDetails=await User.findById(userId);  // object id se instructor details mil jayegi or ye nikala apne db me se
        console.log("Instructor Details: ", instructorDetails);

        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:"Instructor Detailsn Not Found",
            })
        }

        // check given tag is valid or not
        const tagDetails=await Tag.findById(tag);  // tag is ObjectId so that's why we can use findById
        if(!tagDetails){
            return res.status(404).json({
                success:false,
                message:"Tag Deyails not found",
            })
        }

        // upload thumbnail image to cloudinary
        const thumbnailImage=await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);


        // CREATE AND ENTRY FOR NEW COURSE
        const newCourse=await Course.create({ 
            courseName,
            courseDescription,
            whatwillYouLearn:whatwillYouLearn,
            price,
            tag:tagDetails._id,  // store tag id
            thumbnai:thumbnailImage.secure_url,  // store image url
            instructor:instructorDetails._id,  // store instructor id
        })

        // add the new course to the user schema for instriuctor
        await User.findByIdAndUpdate(
            {_id:instructorDetails._id},
            {$push:{courses:newCourse._id}},  // push new course id to the courses array
            {new:true}  // to return the updated document
        );

        // update the TAG ka schema 
        await Tag.findByIdAndUpdate(
            { _id: tagDetails._id },
            { $push: { courses: newCourse._id } },
            { new: true }
        );

        // return response
        return res.status(200).json({
            success:true,
            message:"Course created Successfully",
            data:newCourse,
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while creating the course",
        });
    }
}


//getAllCourses Handler Function

exports.createCourse=async(req,res)=>{
    try{
        const allCourses=await Course.find({}, {
            courseName:true,
            price:true,
            thumbnail:true,
            instructor:true,
            ratingAndReviews:true,
            studentsEnrolled:true,
            //tag:true,
        })
             .populate("instructor")  // populate instructor details
             .exec();
            // .populate("tag", "name description")  // populate tag details
            // .populate("students", "firstName lastName email image")  // populate students details

        return res.status(200).json({
            success:true,
            message:"Data for all courses fetched successfully",
            allCourses,
        }) 
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while fetching courses",
        });
    }
}