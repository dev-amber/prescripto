import doctorModel from "../models/doctorModel.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import appointmentModel from "../models/appointmentModel.js";

// we write in doctor bcz we use admin and doctor also
const changeAvailability = async (req, res) => {
  try {
    const { docId } = req.body;

    const docData = await doctorModel.findById(docId);
    await doctorModel.findByIdAndUpdate(docId,{available: !docData.available})
    res.json({success:true,message:"Availabiltiy Changed"})
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};


// api for doctor list in fronted
const doctorList=async(req,res)=>{
  try {
    const doctors=await doctorModel.find({}).select(['-password' ,'-email'])

    res.json({success:true, doctors})
  } catch (error) {
       console.log(error);
    return res.json({ success: false, message: error.message });
  }
}

// API for doctor login
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check doctor exists
    const doctor = await doctorModel.findOne({ email });
    if (!doctor) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, doctor.password);

    if (isMatch) {
      // 3. Sign JWT token
      const token = jwt.sign(
        { id: doctor._id }, 
        process.env.JWT_SECRET, 
      
      );
      return res.json({ success: true, token });
    } else {
      return res.json({ success: false, message: "Invalid credentials" });
    }

  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// Api to get all appointment of sepecific doctor
const appointmentsDoctor = async (req, res) => {
  try {
    const doctorId = req.doctor.id;   // from middleware
    const appointments = await appointmentModel.find({ docId: doctorId });

    res.json({ success: true, appointments });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: error.message });
  }
};


// API mark appointment completed
const appointmentComplete=async(req,res)=>{
  try {

       const doctorId = req.doctor.id;        // from middleware
    const { appointmentId } = req.body; 

    const appointmentData = await appointmentModel.findById( appointmentId);

    if(appointmentData && appointmentData.docId === doctorId){

       await appointmentModel.findByIdAndUpdate(appointmentId ,{isCompleted:true})
        res.json({success:true, message:"Appointment completed"})
    } else{
        return res.json({ success: false, message: "Mark failed!"});
    }
    
    
  } catch (error) {
        console.error(error);
    return res.json({ success: false, message: error.message });
  }
}



// API to cancel appointment
const appointmentCancel=async(req,res)=>{
  try {

       const doctorId = req.doctor.id;        // from middleware
    const { appointmentId } = req.body; 

    const appointmentData = await appointmentModel.findById(appointmentId);

    if(appointmentData && appointmentData.docId === doctorId){

       await appointmentModel.findByIdAndUpdate(appointmentId ,{cancelled:true})
        res.json({success:true, message:"Appointment cancelled"})
    } else{
        return res.json({ success: false, message: "cancellation failed !"});
    } 
  } catch (error) {
        console.error(error);
    return res.json({ success: false, message: error.message });
  }
}


// API to get dashboard data
const doctorDashboard=async(req,res)=>{
  try {

           const doctorId = req.doctor.id; 

           const appointments=await appointmentModel.find({docId: doctorId })  
           
           let earnings= 0

           appointments.map((item)=>{
             if(item.isCompleted || item.payment){
              earnings +=item.amount   // total earning of doctor
             }
           })

           let patients=[]
          // if patoiennt data avialable in array then not move to this patient appointment of ID
           appointments.map((item)=>{
            if(!patients.includes(item.userId)){
              patients.push(item.userId)
            }
           })

           const dashData={
            earnings,
            appointments: appointments.length,
            patients: patients.length, 
            latestAppointments: appointments.reverse().slice(0,5)
           }
    
             res.json({success:true, dashData})
  } catch (error) {
       console.error(error);
    return res.json({ success: false, message: error.message });
  }
}

//API to get doctor profile
const doctorProfile=async(req,res)=>{
  try {
     const doctorId = req.doctor.id; 
     const profileData=await doctorModel.findById(doctorId).select('-password')

     res.json({success:true, profileData})
  } catch (error) {
       console.error(error);
    return res.json({ success: false, message: error.message });
  }
}


// API to update doctor profile
const updateDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.doctor.id; 
    const { fees, address, available } = req.body;

    const updatedDoctor = await doctorModel.findByIdAndUpdate(
      doctorId,
      { fees, address, available },
      { new: true, runValidators: true, select: "-password" } // return updated profile
    );

    if (!updatedDoctor) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    res.json({ success: true, message: "Profile updated", profile: updatedDoctor });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: error.message });
  }
};



export {
  changeAvailability,
   doctorList,
   loginDoctor,
   appointmentsDoctor,
   appointmentCancel,
   appointmentComplete,
   doctorDashboard,
   doctorProfile,
   updateDoctorProfile

  
  }