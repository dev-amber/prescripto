import { createContext } from "react";


export const DoctorContext=createContext()

// addlogin for doctor login and token
const DoctorContextProvider=(props)=>{
  
    const value={}



   return (
    <DoctorContext.Provider value={value}>
        {props.children}
    </DoctorContext.Provider>
   )
}


export default DoctorContextProvider




