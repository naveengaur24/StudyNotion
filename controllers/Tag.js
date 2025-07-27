const Tag=require("../models/Tags");

// Create a new tag
exports.createTag=async(req, res)=>{
    try{

        // Fetch the data from the request body
        const{name,description}=req.body;

        // Validation
        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:"All fields are required",  
            })
        }

        // create entry in db
        const tagDetails=await Tag.create({
            name:name,
            description:description,
        });
        console.log(tagDetails);

        // return response
        return res.status(200).json({
            success:true,
            message:"Tag created Successfully",
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while creating the tag",
        });
    }
}


// getAllTags Handler Function

exports.showAllTags=async(req,res)=>{
    try{
        const allTags=await Tag.find({}, {name:true, description:true});

        return res.status(200).json({
            success:true,
            message:"All tags return successfully",
            allTags,
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"Something went wrong while fetching tags",
        });
    }
}
