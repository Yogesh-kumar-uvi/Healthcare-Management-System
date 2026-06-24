import axios from "axios";
import React, { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { message } from "antd"; 
import { API_URL } from "../../config";

const specializations = [
  "Cardiologist", "Dermatologist", "Neurologist", "Orthopedic",
  "Pediatrician", "Psychiatrist", "Gynecologist", "Ophthalmologist",
  "ENT Specialist", "Dentist", "General Physician", "Urologist",
  "Gastroenterologist", "Pulmonologist", "Endocrinologist", "Oncologist",
  "Nephrologist", "Rheumatologist", "Radiologist", "Anesthesiologist",
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DoctorRegistration = () => {
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", specialization: "",
    experience: "", fees: "", password: "",
  });
  const [selectedDays, setSelectedDays] = useState([]);
  const [timing, setTiming] = useState({ from: "09:00", to: "17:00" });
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleDayToggle = (day) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
    if (errors.days) setErrors(prev => ({ ...prev, days: "" }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Naam zaroori hai";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) newErrors.email = "Email zaroori hai";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Valid email likho (example@gmail.com)";

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.phone.trim()) newErrors.phone = "Phone zaroori hai";
    else if (!phoneRegex.test(formData.phone)) newErrors.phone = "Valid 10 digit Indian mobile number likho";

    if (!formData.specialization) newErrors.specialization = "Specialization select karo";

    if (!formData.experience.trim()) newErrors.experience = "Experience zaroori hai";
    else if (isNaN(formData.experience) || Number(formData.experience) < 0)
      newErrors.experience = "Valid number likho (years mein)";

    if (!formData.fees.trim()) newErrors.fees = "Fees zaroori hai";
    else if (isNaN(formData.fees) || Number(formData.fees) <= 0)
      newErrors.fees = "Valid fees likho (rupees mein)";

    if (!formData.password.trim()) newErrors.password = "Password zaroori hai";
    else if (formData.password.length < 6) newErrors.password = "Password kam se kam 6 characters hona chahiye";

    if (selectedDays.length === 0) newErrors.days = "Kam se kam ek din select karo";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const submitData = {
      ...formData,
      day1: selectedDays[0] || "Monday",
      day2: selectedDays[1] || selectedDays[0] || "Monday",
      time1: timing.from,
      time2: timing.to,
    };

    setSubmitting(true); // ✅ NEW
    try {
      const response = await axios.post(
        `${API_URL}/doctor/api/v1/registration`,
        submitData
      );
      if (response.status === 200) setShowModal(true);
    } catch (error) {
      console.error("Doctor registration error:", error); 
      
      const errMsg = error.response?.data?.message || "Registration failed. Please try again.";
      message.error(errMsg);
    } finally {
      setSubmitting(false); // ✅ NEW
    }
  };

  const inputStyle = (field) => ({
    borderColor: errors[field] ? '#dc2626' : '#e8eef5',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 14,
  });

  const errorText = (field) => errors[field] ? (
    <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>
      ⚠️ {errors[field]}
    </div>
  ) : null;

  const labelStyle = { fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 };

  return (
    <>
      <Form onSubmit={handleSubmit} noValidate autoComplete="off">

        {/* Name */}
        <Form.Group className="mb-3">
          <Form.Label style={labelStyle}>Full Name *</Form.Label>
          <Form.Control
            style={inputStyle('name')}
            type="text"
            name="name"
            placeholder="Dr. Ramesh Kumar"
            value={formData.name}
            onChange={handleChange}
            autoComplete="off"
          />
          {errorText('name')}
        </Form.Group>

        {/* Email */}
        <Form.Group className="mb-3">
          <Form.Label style={labelStyle}>Email Address *</Form.Label>
          <Form.Control
            style={inputStyle('email')}
            type="email"
            name="email"
            placeholder="doctor@example.com"
            value={formData.email}
            onChange={handleChange}
            autoComplete="off"
          />
          {errorText('email')}
        </Form.Group>

        {/* Phone */}
        <Form.Group className="mb-3">
          <Form.Label style={labelStyle}>Mobile Number * (10 digits)</Form.Label>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              fontSize: 13, color: '#6b7280', fontWeight: 600
            }}>+91</span>
            <Form.Control
              style={{ ...inputStyle('phone'), paddingLeft: 42 }}
              type="tel"
              name="phone"
              placeholder="9876543210"
              value={formData.phone}
              onChange={handleChange}
              maxLength={10}
              autoComplete="off"
            />
          </div>
          {errorText('phone')}
        </Form.Group>

        {/* Specialization */}
        <Form.Group className="mb-3">
          <Form.Label style={labelStyle}>Specialization *</Form.Label>
          <Form.Select
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            style={inputStyle('specialization')}
          >
            <option value="">-- Select Specialization --</option>
            {specializations.map(s => <option key={s} value={s}>{s}</option>)}
          </Form.Select>
          {errorText('specialization')}
        </Form.Group>

        {/* Experience & Fees */}
        <div style={{ display: 'flex', gap: 12 }}>
          <Form.Group className="mb-3" style={{ flex: 1 }}>
            <Form.Label style={labelStyle}>Experience (Years) *</Form.Label>
            <Form.Control
              style={inputStyle('experience')}
              type="number"
              name="experience"
              placeholder="5"
              value={formData.experience}
              onChange={handleChange}
              min="0"
              autoComplete="off"
            />
            {errorText('experience')}
          </Form.Group>
          <Form.Group className="mb-3" style={{ flex: 1 }}>
            <Form.Label style={labelStyle}>Consultation Fees (₹) *</Form.Label>
            <Form.Control
              style={inputStyle('fees')}
              type="number"
              name="fees"
              placeholder="500"
              value={formData.fees}
              onChange={handleChange}
              min="1"
              autoComplete="off"
            />
            {errorText('fees')}
          </Form.Group>
        </div>

        {/* Available Days */}
        <Form.Group className="mb-3">
          <Form.Label style={labelStyle}>
            Available Days * (kam se kam ek din select karo)
          </Form.Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
            {days.map(day => (
              <div
                key={day}
                onClick={() => handleDayToggle(day)}
                style={{
                  padding: '7px 14px', borderRadius: 20, cursor: 'pointer',
                  fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
                  background: selectedDays.includes(day)
                    ? 'linear-gradient(135deg, #0f4c81, #1a6bb5)'
                    : '#f0f5fb',
                  color: selectedDays.includes(day) ? 'white' : '#374151',
                  border: selectedDays.includes(day)
                    ? '1.5px solid #0f4c81'
                    : '1.5px solid #e8eef5',
                  userSelect: 'none',
                }}
              >
                {day.substring(0, 3)}
              </div>
            ))}
          </div>
          {selectedDays.length > 0 && (
            <div style={{ fontSize: 12, color: '#16a34a', marginTop: 6, fontWeight: 600 }}>
              ✅ Selected: {selectedDays.join(', ')}
            </div>
          )}
          {errorText('days')}
        </Form.Group>

        {/* Timing */}
        <div style={{
          background: '#f8fafc', borderRadius: 10, padding: 14,
          marginBottom: 16, border: '1px solid #e8eef5'
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12 }}>
            🕐 Available Timing
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Form.Group style={{ flex: 1 }}>
              <Form.Label style={labelStyle}>From</Form.Label>
              <Form.Control
                type="time"
                value={timing.from}
                onChange={e => setTiming(prev => ({ ...prev, from: e.target.value }))}
                style={{ borderRadius: 10, fontSize: 13, padding: '10px 12px' }}
              />
            </Form.Group>
            <Form.Group style={{ flex: 1 }}>
              <Form.Label style={labelStyle}>To</Form.Label>
              <Form.Control
                type="time"
                value={timing.to}
                onChange={e => setTiming(prev => ({ ...prev, to: e.target.value }))}
                style={{ borderRadius: 10, fontSize: 13, padding: '10px 12px' }}
              />
            </Form.Group>
          </div>
        </div>

        {/* Password */}
        <Form.Group className="mb-4">
          <Form.Label style={labelStyle}>Password * (min 6 characters)</Form.Label>
          <Form.Control
            style={inputStyle('password')}
            type="password"
            name="password"
            placeholder="Create Password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
          />
          {errorText('password')}
        </Form.Group>

        <Button type="submit" disabled={submitting} style={{
          width: '100%', padding: '12px', borderRadius: 10,
          background: 'linear-gradient(135deg, #0f4c81, #1a6bb5)',
          border: 'none', fontWeight: 700, fontSize: 15
        }}>
          {submitting ? "Registering..." : "Register as Doctor"} {/* ✅ NEW */}
        </Button>
      </Form>

      {/* Success Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton style={{ background: '#dcfce7', border: 'none' }}>
          <Modal.Title style={{ color: '#16a34a' }}>✅ Registration Successful!</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ textAlign: 'center', padding: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <div style={{ fontSize: 16, color: '#374151' }}>
            Aapka registration successful ho gaya!<br />
            Ab login karke dashboard access kar sakte hain.
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={() => setShowModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DoctorRegistration;