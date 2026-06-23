import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import doctorModel from "../models/doctorModel.js";

const doctorRegistration = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    specialization,
    experience,
    fees,
    password,
    day1,
    time1,
    day2,
    time2,
  } = req.body;
  if (
    !name ||
    !email ||
    !phone ||
    !specialization ||
    !experience ||
    !fees ||
    !password ||
    !day1 ||
    !day2 ||
    !time1 ||
    !time2
  )
    return res.status(404).json({ message: "Provide Complete data." });
  const exist = await doctorModel.find({
    $or: [{ email: email }, { phone: phone }],
  });
  if (exist.length !== 0)
    return res
      .status(404)
      .json({ message: "Account already exist. Please LogIn." });
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const doctor = new doctorModel({
    name,
    email,
    phone,
    specialization,
    experience,
    fees,
    password: hashedPassword,
    availableTimings: {
      day1,
      time1,
      day2,
      time2,
    },
  });
  const save = await doctor.save();
  if (save)
    return res.status(200).json({
      message: "Account Registered Successfully. Please login",
      success: true,
    });
});

const doctorLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(404).json({ message: "Provide complete data" });

  const doctor = await doctorModel.findOne({
    email: email,
  });
  if (!doctor) {
    return res
      .status(404)
      .json({ message: "No account is associated with this email." });
  }
  const isMatch = await bcrypt.compare(password, doctor.password);
  if (!isMatch)
    return res.status(404).json({ message: "Password doesn't match." });
  await doctorModel.findByIdAndUpdate(
    doctor._id,
    { online: true },
    { new: true }
  );
  const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  return res
    .status(200)
    .json({ message: "Login Success", success: true, token, success: true });
});

const getAllDoctors = asyncHandler(async (req, res) => {
  const doctors = await doctorModel.find({}).select("-password");
  return res.status(200).json({
    message: "Doctors sent successfully.",
    data: doctors,
    success: true,
  });
});

const getDoctor = asyncHandler(async (req, res) => {
  const { doctorID } = req.body;
  const doctor = await doctorModel.findById(doctorID).select("-password");
  if (!doctor) return res.status(400).json({ message: "No doctor found." });
  return res
    .status(200)
    .json({ message: "Doctor sent successfully.", data: doctor });
});

const updateDoctorProfile = asyncHandler(async (req, res) => {
  const { doctorID } = req.body;
  const doctor = await doctorModel.findById(doctorID);
  if (!doctor) return res.status(400).json({ message: "No doctor found." });
  let {
    name,
    email,
    phone,
    specialization,
    experience,
    fees,
    day1,
    time1,
    day2,
    time2,
  } = req.body;
  if (!name) name = doctor.name;
  if (!email) email = doctor.email;
  if (!phone) phone = doctor.phone;
  if (!specialization) specialization = doctor.specialization;
  if (!experience) experience = doctor.experience;
  if (!fees) fees = doctor.fees;
  if (!day1) day1 = doctor.availableTimings.day1;
  if (!day2) day2 = doctor.availableTimings.day2;
  if (!time1) time1 = doctor.availableTimings.time1;
  if (!time2) time2 = doctor.availableTimings.time2;

  const result = await doctorModel.findByIdAndUpdate(
    doctorID,
    {
      name: name,
      email: email,
      phone: phone,
      specialization: specialization,
      experience: experience,
      fees: fees,
      availableTimings: {
        day1: day1,
        time1: time1,
        day2: day2,
        time2: time2,
      },
    },
    { new: true }
  );
  if (result)
    return res
      .status(200)
      .json({ message: "Doctor Profile Updated successfully.", data: doctor });
});

const offlineDoctor = asyncHandler(async (req, res) => {
  const doctorId = req.params.doctorId;
  if (!doctorId) return res.status(400).json({ message: "Provide Doctor Id" });

  await doctorModel.findByIdAndUpdate(
    doctorId,
    { online: false },
    { new: true }
  );
  return res.status(200).json({ message: "Logged Out successfully." });
});

export {
  doctorRegistration,
  doctorLogin,
  getAllDoctors,
  getDoctor,
  updateDoctorProfile,
  offlineDoctor,
};
