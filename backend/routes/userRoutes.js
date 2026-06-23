import express from "express";
import {
  authController,
  loginController,
  registerController,
  userProfileUpdateController,
} from "../controllers/userController.js";
import { isUser } from "../middleware/authMiddleware.js";
import { getAllDoctors } from "../controllers/doctorController.js";
import {
  getAppointmentByUser,
  getUniqueAppointmentByUser,
} from "../controllers/appointmentController.js";

// router onject
const router = express.Router();

// routes

router.post("/login", loginController);
router.post("/register", registerController);
router.post("/getUserData", isUser, authController);
router.get("/getAllDoctors", getAllDoctors);
router.get("/getAllAppointments/:userID", getAppointmentByUser);
router.put("/updateUserProfile", isUser, userProfileUpdateController);
router.get("/getUniqueAppointments/:userID", getUniqueAppointmentByUser);

export default router;
