import validator from "validator"
import bycrypt from "bcrypt"
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken"
import {v2 as cloudinary} from "cloudinary"
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import Razorpay from "razorpay";


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
          res.json({
  success: true,
  message: "Login successful",
  token,
  user: {
    _id: user._id,
    name: user.name,
    email: user.email
  }
});

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
const bookAppointment = async (req, res) => {
    try {
        // ✅ Check if request body exists and required fields are provided
        const { docId, slotDate, slotTime, userId } = req.body || {};
        if (!docId || !slotDate || !slotTime || !userId) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // ✅ Fetch doctor data
        const docData = await doctorModel.findById(docId).select("-password");
        if (!docData) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        // ✅ Check if doctor is available
        if (!docData.available) {
            return res.status(400).json({ success: false, message: "Doctor not available" });
        }

        // ✅ Get slots already booked
        let slots_booked = docData.slots_booked || {};

        // ✅ Check if the requested date already has bookings
        if (slots_booked[slotDate]) {
            // If the requested time is already booked
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.status(400).json({ success: false, message: "Slot not available" });
            } else {
                // Add new slot time for the given date
                slots_booked[slotDate].push(slotTime);
            }
        } else {
            // No bookings for this date → create array and add the time
            slots_booked[slotDate] = [slotTime];
        }

        // ✅ Fetch user data
        const userData = await userModel.findById(userId).select("-password");
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // ✅ Remove booked slots from doctor data before saving appointment
        const doctorCopy = docData.toObject();
        delete doctorCopy.slots_booked;

        // ✅ Prepare appointment data
        const appointmentData = {
            userId,
            docId,
            userData,
            docData: doctorCopy,
            amount: docData.fees,
            slotDate,
            slotTime,
            date: Date.now()
        };

        // ✅ Save appointment
        const newAppointment = new appointmentModel(appointmentData);
        await newAppointment.save();

        // ✅ Update doctor's booked slots
        await doctorModel.findByIdAndUpdate(docId, { slots_booked });

        // ✅ Send success response
        return res.json({ success: true, message: "Appointment booked successfully" });

    } catch (error) {
        console.error("Error booking appointment:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};


// api for list of appointment to myappointment
const  listAppointment=async(req,res)=>{

    try {
        
        const userId=req.userId;
        const appointments= await appointmentModel.find({userId}) // bcz we find doc data of part user

        res.json({success: true, appointments})
    } catch (error) {
        console.error("Error booking appointment:", error);
        return res.status(500).json({ success: false, message: error.message });
    
    }
}

// api to cancel appointment
const cancelAppointment = async (req, res) => {
    try {
        const { appointmentId, userId } = req.body;

        const appointmentData = await appointmentModel.findById(appointmentId);
        if (!appointmentData) {
            return res.status(404).json({ success: false, message: "Appointment not found" });
        }

        // Verify appointment belongs to user
        if (appointmentData.userId.toString() !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized action" });
        }

        // Mark appointment as cancelled
        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

        // Release doctor slot
        const { docId, slotDate, slotTime } = appointmentData;
        await doctorModel.findByIdAndUpdate(docId, {
            $pull: { [`slots_booked.${slotDate}`]: slotTime }
        });

        res.json({ success: true, message: "Appointment Cancelled" });

    } catch (error) {
        console.error("Error cancelling appointment:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};


const razorpayInstance = new Razorpay({
  key_id: process.env.RAZOR_PAY_KEY_ID,
  key_secret: process.env.RAZOR_PAY_SECRET_KEY,
});

// API to make payment using Razorpay
const paymentRazorpay = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    // creating options for razor payment
    const options = {
      amount: appointmentData.amount * 100, // amount in paise
      currency: process.env.CURRENCY || "INR",
      receipt: `receipt_${appointmentId}`,
    };

    // creation of an order
    const order = await razorpayInstance.orders.create(options);

    return res.json({
      success: true,
      order,
      appointment: {
        id: appointmentData._id,
        doctor: appointmentData.doctorName,
        patient: appointmentData.patientName,
        amount: appointmentData.amount,
      },
    });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};



export {registerUser,
    loginUser,
    getProfile,
    updateProfile,
    bookAppointment,
    listAppointment,
    cancelAppointment,
    paymentRazorpay

}