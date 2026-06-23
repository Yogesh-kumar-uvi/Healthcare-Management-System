import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { uploadUserPhoto, uploadDoctorPhoto } from "../controllers/uploadController.js";

const router = express.Router();

router.post("/user", upload.single("photo"), uploadUserPhoto);
router.post("/doctor", upload.single("photo"), uploadDoctorPhoto);

export default router;