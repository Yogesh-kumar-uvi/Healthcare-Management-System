import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import DoctorProfile from "../../components/doctor/DoctorProfile.jsx";
import UserList from "../../components/doctor/userList/UserList.jsx";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setDoctor } from "../../Redux/DoctorSlice.jsx";
import { message } from "antd";
import "./Doctor.css";
import NurseList from "../../components/doctor/nurseList/nurseList.jsx";
import PharmacistList from "../../components/doctor/pharmacistList/PharmacistList.jsx";
import Department from "../../components/doctor/department/Department.jsx";
import Payment from "../../components/doctor/Payment.jsx";
import { API_URL } from '../../config'
import axios from "axios";

const navItems = [
  { key: "dashboard", icon: "fa-chart-line", label: "Dashboard" },
  { key: "department", icon: "fa-hospital", label: "Department" },
  { key: "doctor", icon: "fa-user-tie", label: "My Profile" },
  { key: "Patient", icon: "fa-users", label: "Patients" },
  { key: "Payment", icon: "fa-money-bill-wave", label: "Payments" },
  { key: "Nurse", icon: "fa-user-nurse", label: "Nurses" },
  { key: "Pharmacist", icon: "fa-flask", label: "Pharmacists" },
];

const actionCards = [
  { key: "department", icon: "fa-hospital", label: "Department", color: "#0f4c81", bg: "#dceeff" },
  { key: "Patient", icon: "fa-users", label: "Patients", color: "#16a34a", bg: "#dcfce7" },
  { key: "doctor", icon: "fa-user-tie", label: "My Profile", color: "#7c3aed", bg: "#ede9fe" },
  { key: "Payment", icon: "fa-money-bill-wave", label: "Payments", color: "#ca8a04", bg: "#fef9c3" },
  { key: "Nurse", icon: "fa-user-nurse", label: "Nurses", color: "#0891b2", bg: "#cffafe" },
  { key: "Pharmacist", icon: "fa-flask", label: "Pharmacists", color: "#dc2626", bg: "#fee2e2" },
];

const Doctor = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeOption, setActiveOption] = useState("dashboard");
  const [activeModal, setActiveModal] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { doctor } = useSelector((state) => state.doctor);

  const openModal = (key) => { setActiveOption(key); setActiveModal(key); setSidebarOpen(false); };
  const closeModal = () => setActiveModal(null);

  const logOutFunction = async () => {
    try {
      await axios.put(`${API_URL}/doctor/api/v1/offline-doctor/${doctor._id}`);
    } catch (e) {
      console.error("Failed to set doctor offline:", e);
    }
    dispatch(setDoctor(null));
    localStorage.removeItem("token");
    navigate("/");
    message.success("Logged out successfully");
  };

  const getInitials = (name) => {
    if (!name) return "D";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getPageTitle = () => {
    const found = navItems.find(n => n.key === activeOption);
    return found ? found.label : "Dashboard";
  };

 
  const renderAvatar = (size = 40) => {
    if (doctor?.profilePhoto) {
      return (
        <img
          src={doctor.profilePhoto}
          alt="avatar"
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            objectFit: "cover",
            flexShrink: 0,
          }}
        />
      );
    }
    return (
      <div className="doc-avatar" style={{ width: size, height: size }}>
        {getInitials(doctor?.name)}
      </div>
    );
  };

  const modalContent = {
    department: { title: "Department", comp: <Department /> },
    Patient: { title: "Patient List", comp: <UserList /> },
    doctor: { title: "Doctor Profile", comp: <DoctorProfile /> },
    Payment: { title: "Payment Details", comp: <Payment /> },
    Nurse: { title: "Nurse List", comp: <NurseList /> },
    Pharmacist: { title: "Pharmacist List", comp: <PharmacistList /> },
  };

  return (
    <div className="doctor-dashboard">
      {/* Sidebar */}
      <aside className={`doc-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="doc-sidebar-brand">
          <img src="https://www.healthcare-management-degree.net/wp-content/uploads/2016/09/cropped-healthcare-mgmt512.png" alt="HCMS" />
          <div className="doc-sidebar-brand-text">
            HealthCare
            <small>Doctor Portal</small>
          </div>
        </div>
        {doctor && (
          <div className="doc-doctor-pill">
            {renderAvatar(40)} {/* ✅ FIX — photo ya initials */}
            <div>
              <div className="doc-name">Dr. {doctor.name}</div>
              <div className="doc-role">Doctor</div>
            </div>
          </div>
        )}
        <nav className="doc-nav">
          <div className="doc-section-label">Navigation</div>
          {navItems.map(item => (
            <button
              key={item.key}
              className={`doc-nav-item ${activeOption === item.key ? "active" : ""}`}
              onClick={() => item.key === "dashboard" ? setActiveOption("dashboard") : openModal(item.key)}
            >
              <i className={`fa-solid ${item.icon} doc-nav-icon`}></i>
              {item.label}
            </button>
          ))}
        </nav>
        <button className="doc-sidebar-logout" onClick={logOutFunction}>
          <i className="fa-solid fa-arrow-right-from-bracket"></i>
          Logout
        </button>
      </aside>

      {/* Main */}
      <main className="doc-main">
        <div className="doc-topbar">
          <div className="doc-topbar-title">{getPageTitle()}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {doctor && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {renderAvatar(34)} {/* ✅ FIX — photo ya initials */}
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>Dr. {doctor.name}</span>
              </div>
            )}
          </div>
        </div>

        <div className="doc-content">
          {/* Welcome */}
          <div style={{
            background: 'linear-gradient(135deg,#0a3460,#00c9a7)',
            borderRadius: 16, padding: '24px 28px', marginBottom: 24, color: 'white'
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
              Welcome, Dr. {doctor?.name} 👨‍⚕️
            </div>
            <div style={{ fontSize: 14, opacity: 0.85 }}>
              {doctor?.specialization} · {doctor?.experience} years experience
            </div>
          </div>

          {/* Quick actions */}
          <div className="doc-card-title" style={{ marginBottom: 16 }}>
            <i className="fa-solid fa-grid-2"></i>
            Quick Access
          </div>
          <div className="doc-action-grid">
            {actionCards.map(card => (
              <div
                key={card.key}
                className={`doc-action-card ${activeOption === card.key ? "active" : ""}`}
                onClick={() => openModal(card.key)}
              >
                <div className="doc-action-icon" style={{ background: card.bg, color: card.color }}>
                  <i className={`fa-solid ${card.icon}`}></i>
                </div>
                <div className="doc-action-label">{card.label}</div>
              </div>
            ))}
          </div>

          {/* Info cards */}
          <div className="doc-stat-grid">
            {[
              { icon: 'fa-stethoscope', label: 'Specialization', val: doctor?.specialization || '—', color: '#0f4c81', bg: '#dceeff' },
              { icon: 'fa-briefcase', label: 'Experience', val: `${doctor?.experience || '—'} yrs`, color: '#16a34a', bg: '#dcfce7' },
              { icon: 'fa-phone', label: 'Contact', val: doctor?.phone || '—', color: '#7c3aed', bg: '#ede9fe' },
              { icon: 'fa-indian-rupee-sign', label: 'Consultation Fee', val: `₹${doctor?.fees || '—'}`, color: '#ca8a04', bg: '#fef9c3' },
            ].map((s, i) => (
              <div key={i} className="doc-stat-card">
                <div className="doc-stat-icon" style={{ background: s.bg, color: s.color }}>
                  <i className={`fa-solid ${s.icon}`}></i>
                </div>
                <div>
                  <div className="doc-stat-val" style={{ fontSize: 16, color: s.color }}>{s.val}</div>
                  <div className="doc-stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Mobile toggle */}
      <button style={{
        display: 'none', position: 'fixed', bottom: 24, right: 24, zIndex: 200,
        width: 52, height: 52, borderRadius: '50%', background: '#0f4c81',
        color: 'white', border: 'none', cursor: 'pointer', fontSize: 20,
        alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(15,76,129,0.4)'
      }} onClick={() => setSidebarOpen(!sidebarOpen)}
        className="mobile-toggle">
        <i className={`fa-solid ${sidebarOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
      </button>

      {/* Modals */}
      {activeModal && modalContent[activeModal] && (
        <Modal show={true} onHide={closeModal} centered size="lg">
          <Modal.Header closeButton style={{ background: 'linear-gradient(135deg,#0a3460,#1a6bb5)', color: 'white' }}>
            <Modal.Title>{modalContent[activeModal].title}</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ padding: 24 }}>
            {modalContent[activeModal].comp}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={closeModal}>Close</Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default Doctor;