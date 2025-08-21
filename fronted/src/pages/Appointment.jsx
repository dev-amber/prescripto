import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import { toast } from "react-toastify";
import axios from "axios";
import RelatedDoctors from "../components/RelatedDoctors";

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol, backendUrl, getDoctorsData, token, userData } =
    useContext(AppContext);
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const navigate = useNavigate();

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");

  // Fetch doctor info
  const fetchDocInfo = () => {
    const info = doctors.find((doc) => doc._id === docId);
    setDocInfo(info);
  };

  // Generate available slots
  const getAvailableSlots = () => {
    if (!docInfo) return;
    const today = new Date();
    const allSlots = [];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      const endTime = new Date(today);
      endTime.setDate(today.getDate() + i);
      endTime.setHours(21, 0, 0, 0);

      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10);
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
      } else {
        currentDate.setHours(10, 0, 0, 0);
      }

      const timeSlots = [];
      while (currentDate < endTime) {
        const formattedTime = currentDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

   let day = currentDate.getDate();
   let month = currentDate.getMonth() + 1; // months start at 0
   let year = currentDate.getFullYear();

        const slotDate = `${String(day).padStart(2,"0")}_${String(month).padStart(2,"0")}_${year}`;

        const slotTime=formattedTime

        const bookedTimes = docInfo.slots_booked?.[slotDate] || [];
     const isSlotAvailable = !bookedTimes.includes(slotTime)
        

        if(isSlotAvailable){
          // add slot to array
        timeSlots.push({ datetime: new Date(currentDate), 
        time: formattedTime });
        }

      


        // increment current time by 30 minutes
        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }

      allSlots.push(timeSlots);
    }

    setDocSlots(allSlots);
  };

  // Book appointment
  const bookedAppointment = async () => {
    if (!token) {
      toast.warn("Login to book appointment");
      return navigate("/login");
    }

    if (!userData?._id) {
      toast.error("User data not loaded. Please login again.");
      return navigate("/login");
    }

    if (!slotTime) {
      toast.warn("Please select a time slot");
      return;
    }

    if (!docSlots[slotIndex] || !docSlots[slotIndex][0]) {
      toast.error("No slot data available");
      return;
    }

    try {
      const date = docSlots[slotIndex][0].datetime;
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const slotDate = `${day}_${month}_${year}`;

      const { data } = await axios.post(
        `${backendUrl}/api/user/booked-appointment`,
        {
          docId,
          slotDate,
          slotTime,
          userId: userData._id, // ✅ send userId
        },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        getDoctorsData();
        navigate("/my-appointments");
      } else {
        if (data.message.includes("Invalid or expired token") || data.message.includes("Not authorized")) {
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

  // Effects
  useEffect(() => {
    fetchDocInfo();
  }, [doctors, docId]);

  useEffect(() => {
    if (docInfo) getAvailableSlots();
  }, [docInfo]);

  return (
    docInfo && (
      <div>
        {/* Doctor details */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <img
              className="bg-primary w-full rounded-lg sm:max-w-72"
              src={docInfo.image}
              alt={docInfo.name}
            />
          </div>
          <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
            <p className="flex items-center gap-2 text-2xl font-medium text-gray-900">
              {docInfo.name}
              <img className="w-5" src={assets.verified_icon} alt="verified" />
            </p>
            <div className="flex items-center gap-2 text-sm mt-1 text-gray-600">
              <p>
                {docInfo.degree} - {docInfo.speciality}
              </p>
              <button className="py-0.5 px-2 border text-xs rounded-full">
                {docInfo.experience}
              </button>
            </div>
            <div>
              <p className="flex items-center gap-1 text-gray-900 text-sm font-medium">
                About <img src={assets.info_icon} alt="info" />
              </p>
              <p className="text-sm text-gray-500 max-w-[700px] mt-1">{docInfo.about}</p>
            </div>
            <p className="text-gray-500 font-medium mt-4">
              Appointment fee:{" "}
              <span className="text-gray-600">
                {currencySymbol}
                {docInfo.fees}
              </span>
            </p>
          </div>
        </div>

        {/* Booking slots */}
        <div className="sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700">
          <p>Booking slots</p>
          <div className="flex gap-3 w-full items-center overflow-x-scroll mt-4">
            {docSlots.map((item, index) => (
              <div
                onClick={() => {
                  setSlotIndex(index);
                  setSlotTime("");
                }}
                key={index}
                className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${
                  slotIndex === index ? "bg-primary text-white" : "border border-gray-200"
                }`}
              >
                <p>{daysOfWeek[item[0]?.datetime.getDay()]}</p>
                <p>{item[0]?.datetime.getDate()}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full overflow-x-scroll mt-4">
            {docSlots[slotIndex]?.map((item, index) => (
              <p
                onClick={() => setSlotTime(item.time)}
                key={index}
                className={`text-sm font-light cursor-pointer flex-shrink-0 px-5 py-2 rounded-full ${
                  item.time === slotTime ? "bg-primary text-white" : "text-gray-400 border border-gray-100"
                }`}
              >
                {item.time.toLowerCase()}
              </p>
            ))}
          </div>

          <button
            className="bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6"
            onClick={bookedAppointment}
          >
            Book an appointment
          </button>
        </div>

        {/* Related doctors */}
        <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
      </div>
    )
  );
};

export default Appointment;
