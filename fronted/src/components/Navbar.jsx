import React, { useContext, useState } from 'react'
import {assets} from "../assets/assets"
import { NavLink, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext';

const Navbar = () => {
    const navigate=useNavigate();

    const{token,setToken,userData}=useContext(AppContext)

    const [showMenu,setShowMenu]=useState(false);


    // to create logout logic
    const logout=async()=>{
        setToken(false)
        localStorage.removeItem('token')
    }
   

  return (
    <div className='flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-500'>
        <img onClick={()=> navigate("/")}
         className='w-44 cursor-pointer'
        src={assets.logo} alt=''/>
        <ul className='hidden md:flex items-start font-medium gap-5'>
            <NavLink to="/" >
                <li className='py-1'>HOME</li>
                <hr className='border-none outline-none h-0.5 bg-primary  w-3/5 m-auto hidden'/>
            </NavLink>
            <NavLink to="/doctors">
                < li className='py-1'>ALL DOCTORS</ li>
                <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden'/>
            </NavLink>
            <NavLink to="/about">
                <li className='py-1'>ABOUT</li>
                <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden'/>
            </NavLink>
            <NavLink to="/contact">
                <li className='py-1'>CONTACT</li>
                <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden'/>
            </NavLink>
        </ul>

        <div className='flex items-center gap-4'>
            {
                token  && userData
                ? <div className='flex items-center gap-2 cursor-pointer group relative'>
                   <img  className="w-8 rounded-full" src={userData.image} alt=''/>
                   <img className='w-2.5 ' src={assets.dropdown_icon} alt=''/>
                   {/* design for dropdown mwnu when i click on image */}
                   <div className='absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 hidden group-hover:block z-20 '>
                <div className='min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4'>
              <p  onClick={()=> navigate("/my-profile")}
              className='hover:text-black cursor-pointer'>My Profile</p>
              <p onClick={()=> navigate("/my-appointments")}
              className='hover:text-black cursor-pointer'>My Appointments</p>
              <p onClick={logout}
               className='hover:text-black cursor-pointer'>Logout</p>
                        </div>
                    </div>
                </div>
                : <button onClick={()=> navigate("/login")}
            className=" text-white bg-[#5f6FFF] px-8 py-3 rounded-full font-light hidden md:block">
           Create account
         </button>
            }
            <img  className="w-6 md:hidden " src={assets.menu_icon} onClick={()=> setShowMenu(true)}/>
            {/* ----- Mobile menu --------- */}
            <div className={`md:hidden right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all ${showMenu ? 'fixed w-full' : 'h-0 w-0'}`}>
                <div className='flex items-center justify-between px-5 py-6'>
                    <img src={assets.logo} className='w-36'/>
                    <img onClick={()=> setShowMenu(false)} src={assets.cross_icon} className='w-7'/>
                </div>
                <ul  className='flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium'>
                  <NavLink to='/' onClick={()=> setShowMenu(false)} className='px-4 py-2 rounded inline-block'>
                <p> Home</p> </NavLink>
                  <NavLink to='/doctors' onClick={()=> setShowMenu(false)} className='px-4 py-2 rounded inline-block'>
                 <p>ALL DOCTORS</p> </NavLink>
                  <NavLink to='/about' onClick={()=> setShowMenu(false)} className='px-4 py-2 rounded inline-block'>
                 <p>ABOUT</p> </NavLink>
                  <NavLink to='/contact'onClick={()=> setShowMenu(false)} className='px-4 py-2 rounded inline-block'>
                 <p>CONTACT</p> </NavLink>
                </ul>
            </div>
         

        </div>
    </div>
  )
}

export default Navbar