import React, { useState } from 'react'
import axios from 'axios'
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';
import { setDoctor } from "../../Redux/DoctorSlice";
import { message } from 'antd';
import ProfilePhotoUpload from "../ProfilePhoto/ProfilePhotoUpload";

import './DoctorProfile.css'

const DoctorProfile = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [edite, setEdite] = useState(false);
    const [saving, setSaving] = useState(false); // ✅ NEW
    const { doctor } = useSelector((state) => state.doctor);
    const edit = () => {
        if (doctor) {
            setEdite(true);
        }
    }
    const [formData, setFormData] = useState({
        doctorID: doctor._id,
        name: '',
        phone: '',
        specialization: '',
        experience: '',
        fees: '',
        email: '',
    });
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };
    const save = async () => {
        setSaving(true); // ✅ NEW
        try { // ✅ FIX — try-catch missing tha pehle
            const res = await axios.put('http://localhost:8080/doctor/api/v1/', formData);
            if (res.status === 200) {
                dispatch(setDoctor(res.data.data));
                message.success("Updated Successfully");
                setEdite(false); // ✅ FIX — navigate("/") hata diya, ye logout jaisa effect deta tha
            } else {
                message.error("Try again");
            }
        } catch (error) {
            console.error("Profile update error:", error); // ✅ NEW
            message.error(error.response?.data?.message || "Failed to update profile. Please try again."); // ✅ NEW
        } finally {
            setSaving(false); // ✅ NEW
        }
    }

    const getInitials = (name) => {
        if (!name) return "D";
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    };

    return (
        <>
            <div className='doctor-background'>
                <div className='profile-card'>
                    {edite ?
                        (<>
                            <div className='left'>
                                <div className='card-eyebrow'>Editing Profile</div>

                                <div style={{ marginBottom: 20 }}>
                                    <ProfilePhotoUpload
                                        id={doctor._id}
                                        currentPhoto={doctor.profilePhoto}
                                        userType="doctor"
                                        initials={getInitials(doctor.name)}
                                        onUploadSuccess={(newPhotoUrl) => {
                                            dispatch(setDoctor({ ...doctor, profilePhoto: newPhotoUrl }));
                                        }}
                                    />
                                </div>

                                <div className='field-group'>
                                    <label className='heading-doctor-profile'>Name</label>
                                    <div className='answer'>
                                        <input type='text' name='name' placeholder={doctor.name} value={formData.name} onChange={handleChange}></input>
                                    </div>
                                </div>

                                <div className='field-group'>
                                    <label className='heading-doctor-profile'>Speciality</label>
                                    <div className='answer'>
                                        <input type='text' name='specialization' placeholder={doctor.specialization} value={formData.specialization} onChange={handleChange}></input>
                                    </div>
                                </div>

                                <div className='field-group'>
                                    <label className='heading-doctor-profile'>Experience</label>
                                    <div className='answer'>
                                        <input type='text' name='experience' placeholder={doctor.experience} value={formData.experience} onChange={handleChange}></input>
                                    </div>
                                </div>

                                <div className='field-group'>
                                    <label className='heading-doctor-profile'>Contact</label>
                                    <div className='answer'>
                                        <input type='tell' name='phone' placeholder={doctor.phone} value={formData.phone} onChange={handleChange}></input>
                                    </div>
                                </div>

                                <div className='field-group'>
                                    <label className='heading-doctor-profile'>E-mail</label>
                                    <div className='answer'>
                                        <input type='email' name='email' placeholder={doctor.email} value={formData.email} onChange={handleChange}></input>
                                    </div>
                                </div>
                            </div>
                            <div className='right'>
                                <div className='heading-doctor-profile'>Fees</div>
                                <div className='answer'>
                                    <span className='currency-prefix'>₹</span>
                                    <input type='text' name='fees' className='fees-input' placeholder={doctor.fees} value={formData.fees} onChange={handleChange}></input>
                                </div>
                                <button className='edit-btn save-btn' onClick={save} disabled={saving}> {/* ✅ NEW disabled */}
                                    {saving ? "Saving..." : "Save changes"} {/* ✅ NEW */}
                                </button>
                            </div>
                        </>) :
                        (<>
                            <div className='left'>
                                <div className='card-eyebrow'>Doctor Profile</div>

                                <div className='profile-name-row'>
                                    <ProfilePhotoUpload
                                        id={doctor._id}
                                        currentPhoto={doctor.profilePhoto}
                                        userType="doctor"
                                        initials={doctor ? doctor.name.charAt(0).toUpperCase() : "J"}
                                        onUploadSuccess={(newPhotoUrl) => {
                                            dispatch(setDoctor({ ...doctor, profilePhoto: newPhotoUrl }));
                                        }}
                                    />
                                    <div>
                                        <div className='doctor-name'>{doctor ? doctor.name.toUpperCase() : "DR. JAMES GRAHAM"}</div>
                                        <div className='doctor-subline'>MBBS &middot; Apollo Hospital, New Delhi</div>
                                    </div>
                                </div>

                                <div className='field-group'>
                                    <div className='heading-doctor-profile'>Speciality</div>
                                    <div className='answer'>{doctor ? doctor.specialization : "CARDIOLOGY"}</div>
                                </div>

                                <div className='field-group'>
                                    <div className='heading-doctor-profile'>Experience</div>
                                    <div className='answer'>{doctor ? doctor.experience : "20"} Years+</div>
                                </div>

                                <div className='field-group'>
                                    <div className='heading-doctor-profile'>Contact</div>
                                    <div className='answer'>+91 {doctor ? doctor.phone : "9876564534"}</div>
                                </div>

                                <div className='field-group'>
                                    <div className='heading-doctor-profile'>E-mail</div>
                                    <div className='answer'>{doctor ? doctor.email : "doctor@gmail.com"}</div>
                                </div>
                            </div>
                            <div className='right'>
                                <div className='heading-doctor-profile'>Fees</div>
                                <div className='fees-display'>₹{doctor ? doctor.fees : "200"}<span className='fees-unit'>/visit</span></div>
                                <button className='edit-btn' onClick={edit}>
                                    Edit profile
                                </button>
                            </div>
                        </>)}
                </div>
            </div>
        </>
    )
}

export default DoctorProfile