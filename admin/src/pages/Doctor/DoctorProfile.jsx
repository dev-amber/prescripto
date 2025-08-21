import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const DoctorProfile = () => {
  const { profileData, dToken, getProfileData, setProfileData, backendUrl } = useContext(DoctorContext)
  const { currency } = useContext(AppContext)

  const [isEdit, setIsEdit] = useState(false)

  // save data in db
  const updateProfile = async () => {
    try {
      const updateData = {
        address: profileData.address,
        fees: profileData.fees,
        available: profileData.available
      }

      const { data } = await axios.post(
        backendUrl + '/api/doctor/update-profile',
        updateData,
        { headers: { dToken } }
      )

      if (data.success) {
        toast.success(data.message)
        setIsEdit(false)
        getProfileData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
      console.log(error)
    }
  }

  useEffect(() => {
    if (dToken) {
      getProfileData()
    }
  }, [dToken, getProfileData])

  if (!profileData) return null

  return (
    <div>
      <div className='flex flex-col gap-4 m-5'>
        <div>
          <img
            src={profileData.image}
            className='bg-primary/80 w-full sm:max-w-64 rounded-lg'
          />
        </div>

        <div className='flex-1 border border-stone-100 rounded-lg p-8 py-7 bg-white'>
          {/* Doc info */}
          <p className='flex items-center gap-2 text-3xl font-medium text-gray-700'>
            {profileData.name}
          </p>
          <div className='flex items-center gap-2 mt-1 text-gray-600'>
            <p>{profileData.degree} - {profileData.speciality}</p>
            <button className='px-2 py-0.5 border text-xs rounded-full'>{profileData.experience}</button>
          </div>

          {/* About */}
          <div>
            <p className='flex items-center gap-1 font-medium text-sm text-neutral-800 mt-3'>About:</p>
            <p className='text-sm text-gray-600 mt-1 max-w-[700px]'>{profileData.about}</p>
          </div>

          {/* Appointment Fee */}
          <p className='text-gray-600 font-medium mt-5'>
            Appointment Fee:
            <span className='text-gray-800'>
              {currency}
              {isEdit ? (
                <input
                  type='number'
                  onChange={(e) =>
                    setProfileData(prev => ({
                      ...prev,
                      fees: e.target.value
                    }))
                  }
                  value={profileData.fees || ""}
                  className="border px-2 py-1 rounded ml-2"
                />
              ) : (
                profileData.fees
              )}
            </span>
          </p>

          {/* Address */}
          <div className='flex gap-2 py-2'>
            <p>Address:</p>
            <p className='text-sm'>
              {isEdit ? (
                <input
                  type='text'
                  onChange={(e) =>
                    setProfileData(prev => ({
                      ...prev,
                      address: { ...prev.address, line1: e.target.value }
                    }))
                  }
                  value={profileData.address.line1 || ""}
                  className="border px-2 py-1 rounded block mb-2"
                />
              ) : (
                profileData.address.line1
              )}
              <br />
              {isEdit ? (
                <input
                  type='text'
                  onChange={(e) =>
                    setProfileData(prev => ({
                      ...prev,
                      address: { ...prev.address, line2: e.target.value }
                    }))
                  }
                  value={profileData.address.line2 || ""}
                  className="border px-2 py-1 rounded block"
                />
              ) : (
                profileData.address.line2
              )}
            </p>
          </div>

          {/* Availability */}
          <div className='flex gap-1 pt-2'>
            <input
              type='checkbox'
              checked={profileData.available}
              onChange={() =>
                isEdit &&
                setProfileData(prev => ({ ...prev, available: !prev.available }))
              }
            />
            <label>Available</label>
          </div>

          {/* Edit / Save Buttons */}
          {isEdit ? (
            <button
              onClick={updateProfile}
              className='px-4 py-1 border border-primary text-sm rounded-full mt-5 hover:bg-primary hover:text-white transition-all'
            >
              Save
            </button>
          ) : (
            <button
              onClick={() => setIsEdit(true)}
              className='px-4 py-1 border border-primary text-sm rounded-full mt-5 hover:bg-primary hover:text-white transition-all'
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default DoctorProfile
