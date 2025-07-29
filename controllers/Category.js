const Category=require("../models/Categories");

// Create a new tag
exports.createCategory=async(req, res)=>{
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
        const categoryDetails=await Category.create({
            name:name,
            description:description,
        });
        console.log(categoryDetails);

        // return response
        return res.status(200).json({
            success:true,
            message:"Category created Successfully",
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

exports.showAllCategories=async(req,res)=>{
    try{
        const allCategories=await Tag.find({}, {name:true, description:true});

        return res.status(200).json({
            success:true,
            message:"All tags return successfully",
            allCategories,
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"Something went wrong while fetching tags",
        });
    }
}


                                // category page Details

exports.categoryPageDetails = async(req, res)=>{
    try{

        // category id
        const{CategoryId}=req.body;


        //get courses for specifid category
        const selectedCategory=await Category.findById(CategoryId)
                                            .populate("courses")
                                            .exec();


        // validation
        if(!selectedCategory){
            return res.status(404).json({
                success:false,
                message:"data not found"
            })
        }


        //get courses for diff. category
        const differentCategories= await Category.find({
            _id: {$ne : categoryId}    // mujhe aisi category ka data lake do jo is id ke equal nhi hai  --> [$ne means not equal]
            .populate("courses")
            .exec();

        });   


       //  -->    //get top 10selling courses      [HOME WORK]

        // RETURN RESPONSE
        return res.status(200).json({
            success:true,
            data:{
                selectedCategory,
                differentCategories,
            },
        })


    }
    catch(err){

    }
}
