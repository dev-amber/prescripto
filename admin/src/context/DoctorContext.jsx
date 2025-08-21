import { createContext, useContext, useState } from "react";
import axios from "axios"
import {toast} from "react-toastify"



export const DoctorContext=createContext()

// addlogin for doctor login and token
const DoctorContextProvider=(props)=>{
    
    const backendUrl=import.meta.env.VITE_BACKEND_URL
     const [dToken, setDToken] = useState(
    localStorage.getItem("dToken") || ""
  );

  const [appointments,setAppointments]=useState([])
  const[dashData,setDashData]=useState(false)
  const [profileData,setProfileData]=useState(false)
//get appointment
  const getAppointments=async()=>{
    try {
        
        const {data}=await axios.get(backendUrl + '/api/doctor/appointments', {headers:{dToken}})
        if(data.success){
            setAppointments(data.appointments)
            console.log(data.appointments)
        }else{
            toast.error(data.message)
        }
    } catch (error) {
        toast.error(error.message)
        console.log(error)
    }
  }

  // mark appointment complete
  const completeAppointment=async(appointmentId)=>{
    try {

        const {data}=await axios.post(backendUrl + '/api/doctor/complete-appointment', {appointmentId},{headers:{dToken}})
        if(data.success){
            toast.success(data.message)
            getAppointments()
        }else{
             toast.error(data.message)
        }
        
    } catch (error) {
              toast.error(error.message)
                console.log(error)
    }
  }

// cancel appointment
  const cancelAppointment=async(appointmentId)=>{
    try {

        const {data}=await axios.post(backendUrl + '/api/doctor/cancel-appointment', {appointmentId},{headers:{dToken}})
        if(data.success){
            toast.success(data.message)
            getAppointments()
        }else{
             toast.error(data.message)
        }
        
    } catch (error) {
              toast.error(error.message)
                console.log(error)
    }
  }

  // dashboard data 
  const getDashData=async()=>{
    try {

      const {data}=await axios.get(backendUrl + '/api/doctor/dashboard', {headers:{dToken}})
      if(data.success){
        setDashData(data.dashData)
        console.log(data.dashData)
      }else{
         toast.error(data.message)
      }
      
    } catch (error) {
       toast.error(error.message)
       console.log(error)
    }
  }


  // doctor profile
  const  getProfileData=async()=>{
    try {
      
      const {data}=await axios.get(backendUrl + '/api/doctor/profile', {headers: {dToken}})
      if(data.success){
        setProfileData(data.profileData)
        console.log(data.profileData)
      }
    } catch (error) {
       toast.error(error.message)
       console.log(error)
    }
  }



  
    const value={
        dToken,
        setDToken,
        backendUrl,
        appointments,
        setAppointments,
        getAppointments,
        completeAppointment,
        cancelAppointment,
        dashData,
        setDashData,
        getDashData,
        profileData,
        setProfileData,
        getProfileData
        
    }



   return (
    <DoctorContext.Provider value={value}>
        {props.children}
    </DoctorContext.Provider>
   )
}


export default DoctorContextProvider




