import doctorModel from "../models/doctorModel.js"


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

export {changeAvailability, doctorList}