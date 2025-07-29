const RatingAndReview=require('../models/RatingAndReview');
const Course=require('../models/Course');
const { default: mongoose } = require('mongoose');


                                                    // create rating  ------->>>
exports.createRating=async(req, res)=>{
    try{
        // get user id
        const userId= req.user.id

        // fetch data from req body
        const{rating, review, courseId}=req.body;


        //check if user is enrolled or not
        const courseDetails=await Course.findOne(
            {_id:courseId,
            studentsEnrolled: {$elemMatch: {$eq:userId}},
            },
        )

        if(!courseDetails){
                return res.status(400).json({
                    success:false,
                    message:"Student is not enrolled in this course",
                })
        }


        //check if user is already reviewd the course
        const alreadyReviewed=await RatingAndReview.findOne({
            user:userId,
            course:courseId,
        })


        if(alreadyReviewed){
            return res.status(403).json({
                success:false,
                message:"Course is already reviewed by the user"
            })
        }



        // create rating and review  -->>>
        const ratingReview=await RatingAndReview.create({
            rating,
            review,
            course:courseId,
            user:userId,

        })



        //update course with this  rating and review
        const updatedCourseDetails = await Course.findByIdAndUpdate({_id:courseId},
            {
                $push:{
                    ratingAndReviews:ratingReview._id,
                }
            },
            {new:true},
        )

        console.log(updatedCourseDetails);

        // return response

        return res.status(200).json({
            success:true,
            message:"Rating And Review created Successfully..!!",
            ratingReview,
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







                                    //get Average Rating   -------->>>

exports.getAverageRating = async(req, res)=>{
    try{

        // get user id
        const{courseId}=req.body.courseId;

        //calculate avg rating
        const result=await RatingAndReview.aggregate([
            {
                $match:{
                    course:new mongoose.Types.ObjectId(courseId),    // course id starting me string thi hmne use convert kia object id ke ander
                }
            },
            {
                $group:{
                    _id:null,
                    averageRating:{$avg: "$rating"},
                }
            }
        ])

        // return rating
        if(result.length > 0){
            return res.status(200).json({
                success:true,
                averageRating:result[0].averageRating,
            })
        }

        // if no rating / review exist

        return res.status(200).json({
            success:true,
            message:"Average rating is 0, no rating given till now",
            averageRating:0,
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





                                        // GET ALL RARTING ---------->>>

exports.getAllRating=async(req, res)=>{
    try{
        const allReviews= await RatingAndReview.find({})
                                        .sort({rating: "desc"})    // get rating  in descending order
                                        .populate({
                                            path:"user",
                                            select:"firstName lastName email image",    //  user ke ander kis kis field  ko populate krna hai..  
                                        })
                                        .populate({
                                            path:"course",
                                            select:"courseName",
                                        })
                                        .exec();
        return res.status(200).json({
            success:true,
            message:"All reviews fetched Successfully..!!",
            data:allReviews,
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