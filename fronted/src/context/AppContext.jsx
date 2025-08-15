import { createContext, useEffect, useState } from "react";
import axios from "axios"
import {toast} from "react-toastify"

export const AppContext = createContext();

const AppContextProvider = (props) => {

  const currencySymbol= '$'
  const backendUrl=import.meta.env.VITE_BACKEND_URL
  const[doctors,setDoctors]=useState([])
  const[userData,setUserData]=useState(false)

  // to token
  const [token,setToken]=useState(`localStorage.getItem('token') ? localStorage.getItem('token'): false`)


   const getDoctorsData=async()=>{
    try {
       
      const {data}=await axios.get(backendUrl + '/api/doctor/list')
      if(data.success){
          setDoctors(data.doctors)
      }else{
        toast.error(data.message)
      }
      
    } catch (error) {
       toast.error(error.message)
    }
   }


   const loadUserProfileData=async()=>{
       try {

        const token = localStorage.getItem("token"); // or your actual key
    if (!token) {
      toast.error("No token found, please log in again.");
      return;
    }
    
        
       const {data}=await axios.get(backendUrl + '/api/user/get-profile',{headers:{token}})
         console.log("Token being sent:", token);
       if(data.success){
        setUserData(data.userData)

       }else{
        toast.error(data.message)
       }
       } catch (error) {
        toast.error(error.message)
       }
   }

  

   const value = {
    doctors,
    currencySymbol,
    token,
    setToken,
    backendUrl,
    userData,
    setUserData,
    loadUserProfileData,
    setUserData,
    getDoctorsData
  };

   useEffect(()=>{
    getDoctorsData()
   },[])

    useEffect(()=>{
       if(token){
        loadUserProfileData()
       }else{
        setUserData(false)
       }
   },[token])



  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
