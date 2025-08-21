import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const currencySymbol = "$";
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [doctors, setDoctors] = useState([]);
  const [userData, setUserData] = useState(null);

  // Token state
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  // Whenever token changes, update localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      loadUserProfileData();
    } else {
      localStorage.removeItem("token");
      setUserData(null);
    }
  }, [token]);

  // Fetch all doctors
  const getDoctorsData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/list`);
      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Load user profile
  const loadUserProfileData = async () => {
    try {
      if (!token) return;

      const { data } = await axios.get(`${backendUrl}/api/user/get-profile`, {
        headers: { token },
      });

      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message);
        setToken(null); // clear invalid token
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      setToken(null); // clear token on error
    }
  };

  const value = {
    doctors,
    currencySymbol,
    token,
    setToken,
    backendUrl,
    userData,
    setUserData,
    getDoctorsData,
    loadUserProfileData,
  };

  useEffect(() => {
    getDoctorsData();
  }, []);

  return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};

export default AppContextProvider;
