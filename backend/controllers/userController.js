import validator from "validator"
import bycrypt from "bcrypt"
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken"
import {v2 as cloudinary} from "cloudinary"
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";


// API to register user
const registerUser=async(req,res)=>{
    try {
        const {name,email, password}=req.body;

        if(!name || !email || !password){
            return res.json({success:false, message: "Missing Details"})
        }

        // to verify email use validator
        if(!validator.isEmail(email)){
           return res.json({success:false, message: "Enter a valid email"})
        }

        // password is validate min 8 char
        if(password.length < 8){
              return res.json({success:false, message: "Enter a strong password"})
        }

        // hashing user password
        const salt=await bycrypt.genSalt(10)
        const hashedPassword=await bycrypt.hash(password, salt)

        // pass data in db
        const userData={
          name,
          email,
          password:hashedPassword
        }
   const newUser=new userModel(userData)
   const user=await newUser.save()

   // to create token
   const token=jwt.sign({id:user._id},process.env.JWT_SECRET)

   res.json({success:true,token})

    } catch (error) {
          console.log(error);
    return res.json({ success: false, message: error.message });
    }
}


// api  for userlogin
const  loginUser=async(req,res)=>{
    try {
        
        const {email,password}=req.body;

        const user=await userModel.findOne({email})
        if(!user){
            return res.json({success:false, message:"User not exist"})
        }
      // if user password and password match
        const isMatch=await bycrypt.compare(password,user.password)
        if(isMatch){
            const token=jwt.sign({id:user._id},process.env.JWT_SECRET)
            res.json({success:true, token})
        }else{
            res.json({success:false, message:"Invalid credentials"})
        }
    } catch (error) {
           console.log(error);
    return res.json({ success: false, message: error.message });
    }
}

// apifor get profile
const getProfile = async (req, res) => {
  try {
    const userData = await userModel.findById(req.userId).select("-password");
    res.json({ success: true, userData });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// api for updateProfie
const updateProfile = async (req, res) => {
 try {
    const { userId, name, phone, dob, gender, address } = req.body;
    const imageFile = req.file;

    if (!name || !phone || !dob || !gender) {
        return res.json({ success: false, message: "Data missing" });
    }

    // Safe JSON parse for address
    let parsedAddress = address;
    if (typeof address === "string") {
        try {
            parsedAddress = JSON.parse(address);
        } catch (err) {
            return res.json({ success: false, message: "Invalid address format" });
        }
    }

    await userModel.findByIdAndUpdate(userId, {
        name,
        phone,
        dob,
        gender,
        address: parsedAddress
    });

    if (imageFile) {
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
            resource_type: "image"
        });
        const imageURL = imageUpload.secure_url;

        await userModel.findByIdAndUpdate(userId, { image: imageURL });
    }

    res.json({ success: true, message: "Profile updated" });
} catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
}
};

// api for booked appointment
const bookAppointment=async(req,res)=>{
    try {
        
        const {docId,slotDate,slotTime}=req.body;
        const userId=req.body.userId

        const docData=await doctorModel.findById(docId).select('-password')

        if(!docData.available){
             res.json({success:false, message:"Doctor not Available"});
        }
      
        // docData available
        let slots_booked=docData.slots_booked // all slots in this var

        // check date and time of slots available
        if(slots_booked(slotDate)){
            if(slots_booked[slotDate].includes(slotTime)){
                res.json({success:false, message:"Slot not Available"});
            }else{
                // in this case slot time is not available
                slots_booked[slotDate].push(slotTime)
            }
        }else{
             // in case not part date is booked for appointment
              slots_booked[slotDate]=[]
              slots_booked[slotDate].push(slotTime)
        }

        const userData=await userModel.findById(userId).select('-password')

        delete docData.slots_booked  // we dont want history of slots booked so this

        const appointmentData={
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotDate,
            slotTime,
            date: Date.now()// current timsstramp

        }

        const newappointment=new appointmentModel(appointmentData)
        await newappointment.save()

        // save new slots data in doctor data
        await doctorModel.findByIdAndUpdate(docId,{slots_booked}) // after all this update the data

        res.json({success:true, message: "Appointment Booked"})

    } catch (error) {
        console.log(error);
    return res.json({ success: false, message: error.message });
    }
}



export {registerUser,
    loginUser,
    getProfile,
    updateProfile,
    bookAppointment

}