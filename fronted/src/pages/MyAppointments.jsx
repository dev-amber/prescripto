
import React, { useContext } from 'react'
import { AppContext } from '../context/AppContext';
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useEffect } from 'react';

const MyAppointments = () => {

  const {backendUrl, token, userData, getDoctorsData}=useContext(AppContext);
  const months= ["","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  // to convet date in months jan feb
  const slotDateFormat=(slotDate)=>{
    const dateArray=slotDate.split('_')
    return dateArray[0]+ " "+ months[Number(dateArray[1])] + " "+dateArray[2]

  }

  // to store appointment
  const[appointments,setAppointments]=useState([])

const getUserAppointments=async()=>{
  try {
    
    const {data}=await axios.get(backendUrl + '/api/user/appointments', {headers: {token}})

    if(data.success){
      setAppointments(data.appointments)  // appoint in reverse order recent appoint on bottom
      console.log(data.appointments)
    }
  } catch (error) {
     console.log(error)
     toast.error(error.message)
  }
}

// cancel appointment
const cancelAppointment = async (appointmentId) => {
  try {
    if (!token) {
      toast.warn("Login to cancel appointment");
      return navigate("/login");
    }

    if (!userData?._id) {
      toast.error("User data not loaded. Please login again.");
      return navigate("/login");
    }

    const { data } = await axios.post(
      backendUrl + "/api/user/cancel-appointment",
      {
        appointmentId,
        userId: userData._id, // ✅ send userId
      },
      { headers: { token } } // send token to backend
    );

    if (data.success) {
      toast.success(data.message);
      getUserAppointments(); // refresh appointment list
      getDoctorsData()
    } else {
      if (
        data.message.includes("Invalid or expired token") ||
        data.message.includes("Not authorized")
      ) {
        toast.error(data.message);
        navigate("/login");
      } else {
        toast.error(data.message);
      }
    }
  } catch (error) {
    if (error.response?.status === 401) {
      toast.error("Session expired or invalid token. Please login again.");
      navigate("/login");
    } else {
      toast.error(error.response?.data?.message || error.message);
    }
  }
};


const appointmentRazorpay = async (appointmentId)=>{

    try {
      const {data } = await axios.post(backendUrl + '/api/user/payment-razorpay',{appointmentId},{headers:{token}} )

      if (data.success) {
        console.log(data.order)
        
      }
      
    } catch (error) {
       console.log(error)
      toast.error(error.response?.data?.message || error.message)
    }

  }



useEffect(()=>{
 if(token){
  getUserAppointments()
 }
},[token])
  return (
    <div className=''>
      <p className='pb-3 mt-12 font-medium text-zinc-700 border-b'>My appointments</p>
      <div>
      {appointments.map((item,index)=>(
        <div key={index} className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b'>
           <div >
            <img src={item.docData.image} className='w-32 bg-indigo-50'/>
            </div>
            <div className='flex-1 text0-sm text-zinc-800'>
              <p className='text-neutral-800 font-semibold '>{item.docData.name}</p>
              <p>{item.docData.speciality}</p>
              <p className='text-zinc-700 font-medium mt-1'>Address:</p>
              <p className='text-xs'>{item.docData.address.line1}</p>
              <p className='text-xs'>{item.docData.address.line1}</p>
              <p  className='text-sm mt-1'><span className='text-sm font-medium text-neutral-700'>Date & Time:</span>{slotDateFormat(item.slotDate)} |  {item.slotTime}</p>
            </div>
            <div></div>

            <div onClick={()=> appointmentRazorpay(item._id)}
            className='flex flex-col gap-2 justify-end'>
              {!item.cancelled && item.payment &&  !item.isCompleted &&
              <button className='sm:min-w-48 border rounded text-stone-500 bg-indigo-500'>Paid</button>}

            {!item.cancelled &&  item.payment &&  !item.isCompleted && <button className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300'>Pay Online</button> }  

           {!item.cancelled &&  !item.isCompleted &&<button onClick={()=> cancelAppointment(item._id)}
              className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded  hover:bg-red-600 hover:text-white transition-all duration-300 '>Cancel appointment</button> }   
               
               {item.cancelled && !item.isCompleted && <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'
              >Appointment cancelled</button>}

              {
                item.isCompleted && <button className='min-w-48 py-2 border border-green-500 text-green-500'>
                  Completed
                </button>
              }

           
              </div>
          </div>
      ))
      }
      </div>
    </div>
  )
}

export default MyAppointments