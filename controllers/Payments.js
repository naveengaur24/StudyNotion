const {instance}=require('../config/razorpay');
const Course=require("../models/Course");
const User= require("../models/User");
const mailSender= require("../utils/mailSender");
const {courseEnrollmentEmail}= require("../mail/templates/courseEnrollmentEmail");
const { default: payments } = require('razorpay/dist/types/payments');


//  CAPTURE THE PAYMENT AND INITIATE THE RAZORPAY ORDER

exports.capturePayment= async(req, res)=>{
    
        // get course id and user id
        const{course_id}=req.body;
        const userId=req.user.id;

        // validation    -->   valid courseId
        if(!course){
            return res.json({
                success:false,
                message:"Please provide valid course id",
            })
        }



        //valid courseDetail
        let course;
        try{
            course=await Course.findById(course_id);
            if(!course){
                return res.json({
                    success:false,
                    message:"Could not find the course",
                })
            }


                // user already pay for same course

            const uid=new mongoose.Types.ObjectId(userId);  // userId jo ki string type me exist kr rhi thi use convert kr lia hai object id ke ander
            if(course.studentsEnrolled.includes(uid)){
                return res.status(200).json({
                    success:false,
                    message:"Studnet is already enrolled",
                })
            }

        }
        catch(err){
            console.log(err);
            return res.status(500).json({
                success:false,
                message:err.message,
            })
        }

        // order create
        const amount=course.price;
        const currency="INR";

        const options={
            amount:amount*100,
            currency,
            receipt:Math.random(Date.now()).toString(),
            notes:{
                courseId:course_id,
                userId,
            }
        };

        try{
            // initiate the payment using razorpay
            const paymentResponse=await instance.orders.create(options);
            console.log(paymentResponse);

            // return response
            return res.status(200).json({
                success:true,
                courseName:course.courseName,
                courseDescription:course.courseDescription,
                thumbnail:course.thumbnail,
                orderId:paymentResponse.id,
                currency:paymentResponse.currency,
                amount:paymentResponse.amount,
            })

        }
        catch(err){
            console.log(err);
            return res.json({
                success:false,
                message:"Could not initiate Order",
            })
        }    
}


// verify Signature of Razorpay and Server

exports.verifySignature=async(req, res)=>{
    const webhookSecret="12345678";   // This is your Razorpay Webhook Secret (we manually set this in the Razorpay dashboard).  It's used to validate the authenticity of incoming webhook requests.

    const signature=req.headers["x-razorpay-signature"];   //  Uses Node's crypto module to create a SHA256 HMAC.
    //  ye razorpay ne send kiya hai  (ye razorpay ke taraf se aaya hai)

    const shasum= crypto.createHmac("sha256", webhookSecret);
    shasum.update(JSON.stringify(req.body));  // convert in string format
    const digest= shasum.digest("hex");   //Generates the final hexadecimal digest (our own version of the signature).

    // match digest and signature
    if(signature==digest){
        console.log("Payment is Authorized");

        const{userId, courseId}= req.body.payload.payment.entity.notes;   // ye ids ab frontend se nhi aa rhi ye ab razorpay se aa rhi hai

        try{
              // fulfill the actions

            // find the course and enroll the student in it

            const enrolledCourse=await Course.findOneAndUpdate(
                                            {_id:courseId},  //Finds the course by _id.
                                            {$push:{studentsEnrolled:userId}},  //Adds the userId to the studentsEnrolled array using $push.
                                            {new:true},  // Returns the updated document after the operation.
            )

            if(!enrolledCourse){
                return res.status(500).json({
                    success:false,
                    message:"Course Not Found..!!"
                });
            }
            console.log(enrolledCourse);

            // find the studnets and add the course to their list enrolled courses
            const enrolledStudent=await User.findOneAndUpdate(
                                            {_id:userId},
                                            {$push:{courses:courseId}},
                                            {new:true},
            )
            console.log(enrolledStudent);

            // mail send krna hai confirmation wala
            const emailResponse= await mailSender(
                enrolledStudent.email,
                "Congratulations from CodeHelp",
                "Congratulations..!! you are onboarded into new codeHelp Course",

            );
            console.log(emailResponse);
            return res.status(200).json({
                success:true,
                message:"Signature verified and course Added",
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

    else{
        return res.status(400).json({
            success:false,
            message:"Invalid Request",
        })
    }
}