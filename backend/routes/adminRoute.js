import express from "express"
import {addDoctor, allDoctors, loginAdmin} from "../controllers/adminController.js"
import upload from "../middlewares/multer.js"
import authAdmin from "../middlewares/authAdmin.js";
import { changeAvailability } from "../controllers/doctorController.js";

const adminRouter=express.Router()

adminRouter.post("/add-doctor",authAdmin,upload.single("image"), addDoctor);
adminRouter.post("/login", loginAdmin); // bcz we want data send in form so use upload 
adminRouter.post('/all-doctors', authAdmin,allDoctors);
adminRouter.post('/change-availability', authAdmin,changeAvailability);


export default adminRouter