const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async (req, res) => {
  try {
    // data fetch
    const { sectionName, courseId } = req.body;

    // data validation
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Missing properties",
      });
    }

    // create section
    const newSection = await Section.create({ sectionName });

    // update course with section objectId
    const updatedCourseDetails = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      { new: true }
    )
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection", // assuming each section has subSection array
        },
      });

    // return response
    return res.status(200).json({
      success: true,
      message: "Section created Successfully..!!",
      updatedCourseDetails,
    });
  }
  catch (err) {
    return res.status(500).json({
      success: false,
      message: "Unable to create section, Please try again",
      error: err.message,
    });
  }
};


//    UPDATE SECTION HANDLER FUNCTION

exports.updateSection= async(req,res)=>{
    try{

        // data input
        const{sectionName, sectionId}= req.body;

        // data validation
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:"Missing Properties",
            })
        }

        //update data
        const section=await Section.findByIdAndUpdate(sectionId, {sectionName}, {new:true});

        //return response
        return res.status(200).json({
            success:true,
            message:"Section update Successfully..!!",
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"Unable to update section, Please try again",
            error:err.message,
        });
    }
}



// DELETE SECTION HANDLER FUNCTION
exports.updatedCourseDetails=async(req,res)=>{
    try{
        // get id  - assuming sectionId is passed in the request parameters
        const { sectionId } = req.params;

        // use findByIdAndDelete to remove the section
        await section.findByIdAndDelete(sectionId);

        // return response
        return res.status(200).json({
            success:true,
            message:"Section deleted Successfully..!!",
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"Unable to delete section, Please try again",
            error:err.message,
        });
    }
}