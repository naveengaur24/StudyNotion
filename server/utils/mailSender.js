const nodemailer=require('nodemailer');
require("dotenv").config();
const mailSender=async(email,title,body)=>{
  try{
    //Create Transporter
    let transporter=nodemailer.createTransport({
      host:process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth:{
        user:process.env.MAIL_USER,
        pass:process.env.MAIL_PASS,
      },
    });

    //Send mail
    let info=await transporter.sendMail({
      from:"StudyNotion",
      to:`${email}`,
      subject:`${title}`,
      html:`${body}`
    });

    console.log(info);
    return info;
  }
  catch (error) {
  console.error("Mail sender error details:", error); // add this line
  return { success: false, message: error.message }; // optional, for clarity
}
}


module.exports=mailSender;