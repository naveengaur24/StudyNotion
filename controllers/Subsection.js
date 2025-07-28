const SubSection= require("../models/SubSection");
const Section= require("../models/Section");

// create subsection handler function

exports.createSubSection=async(req, res)=>{
    try{
        // fetch data from request body
        const { sectionId, title, timeDuration, description } = req.body;

        //extract video/file
        const video=req.files.videoFile;


        //validation
        if(!sectionId || !title || !timeDuration || !description){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        }

        //upload video/file to cloudinary
        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);

        // create susection
        const subSectionDetails = await SubSection.create({
            title:title,
            timeDuration:timeDuration,
            description:description,
            video: uploadDetails.secure_url, // store video url
        });

        //update section with subsection objectId
        const updatedSection= await Section.findByIdAndUpdate(
            {_id:sectionId},
            {
                $push:{
                    subSection:subSectionDetails._id, // push subsection id to section
                }
            },
            {new:true}
        )

        // log updated section here after adding populate query  [TODO]
        const populatedSection = await Section.findById(sectionId).populate("subSections");

        // return response
        return res.status(200).json({
            success:false,
            message:"SubSection created SuccessFully..!!",
            updatedSection,
        })
    }

    catch(err){
        return res.status(500).json({
            success:false,
            message:"Unable to create subsection, Please try again",
            error: err.message,
        });
    }
}


// UPDATE SUBSECTION CONTROLLER





// DELETE SUBSECTION CONTROLLER