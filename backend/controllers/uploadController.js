import cloudinary from "../config/cloudinaryConfig.js";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import asyncHandler from "express-async-handler";

// ✅ Helper — buffer ko Cloudinary pe upload karo
const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(fileBuffer);
  });
};

const uploadUserPhoto = asyncHandler(async (req, res) => {
  const { userID } = req.body;
  if (!userID || !req.file)
    return res.status(400).json({ message: "Provide user ID and image", success: false });

  const user = await userModel.findById(userID);
  if (!user)
    return res.status(400).json({ message: "No user found", success: false });

  const result = await uploadToCloudinary(req.file.buffer, "hcms/users");

  const updated = await userModel.findByIdAndUpdate(
    userID,
    { profilePhoto: result.secure_url },
    { new: true }
  );

  return res.status(200).json({
    message: "Profile photo updated successfully",
    data: updated,
    success: true,
  });
});

const uploadDoctorPhoto = asyncHandler(async (req, res) => {
  const { doctorID } = req.body;
  if (!doctorID || !req.file)
    return res.status(400).json({ message: "Provide doctor ID and image", success: false });

  const doctor = await doctorModel.findById(doctorID);
  if (!doctor)
    return res.status(400).json({ message: "No doctor found", success: false });

  const result = await uploadToCloudinary(req.file.buffer, "hcms/doctors");

  const updated = await doctorModel.findByIdAndUpdate(
    doctorID,
    { profilePhoto: result.secure_url },
    { new: true }
  );

  return res.status(200).json({
    message: "Profile photo updated successfully",
    data: updated,
    success: true,
  });
});

export { uploadUserPhoto, uploadDoctorPhoto };