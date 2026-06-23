import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import "../../styles/Home.css";
import Login from "../Login/Login";
import DoctorLogin from "../Doctor/DoctorLogin";
import Register from "../Registration/Register";
import DoctorRegistration from "../Doctor/DoctorRegistration";

const Home = () => {
  const [show, setShow] = useState(false);
  const [regShow, setRegShow] = useState(false);
  const [doctShow, setDoctShow] = useState(false);
  const [doctRegShow, setDoctRegShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleShowRegister = () => setRegShow(true);
  const handleCloseRegister = () => setRegShow(false);
  const handleCloseDoctor = () => setDoctShow(false);
  const handleShowDoctor = () => setDoctShow(true);
  const handleShowDoctorRegistration = () => setDoctRegShow(true);
  const handleCloseDoctorRegistration = () => setDoctRegShow(false);

  return (
    <>
      <div className="landing-page">
        {/* Top bar - Fixed */}
        <div className="landing-topbar">
          <div className="landing-logo">
            <img src="https://www.healthcare-management-degree.net/wp-content/uploads/2016/09/cropped-healthcare-mgmt512.png" alt="HCMS" />
            <span>HealthCare<br /><small style={{fontWeight:400,fontSize:13,color:'rgba(255,255,255,0.7)'}}>Management System</small></span>
          </div>
          <div className="landing-topbar-links">
            <span>Hospitals Near Me</span>
            <span>e-Clinic</span>
            <span>Services</span>
            <span className="emergency-badge">🚨 Emergency 108</span>
          </div>
        </div>

        {/* Hero */}
        <div className="landing-hero">
          <div className="hero-left">
            <div className="hero-badge">
              <i className="fa-solid fa-shield-heart"></i>
              Trusted Healthcare Platform
            </div>
            <h1 className="hero-title">
              Your Health,<br />
              <span>Our Priority</span>
            </h1>
            <p className="hero-subtitle">
              Connect with top doctors, book appointments instantly, and manage your health journey — all in one place.
            </p>
            <div className="hero-features">
              {[
                { icon: "fa-user-doctor", text: "100+ Verified Doctors" },
                { icon: "fa-stethoscope", text: "20+ Specializations" },
                { icon: "fa-credit-card", text: "Secure Online Payments (UPI & Cards)" },
                { icon: "fa-comments", text: "Real-time Doctor Chat" },
                { icon: "fa-calendar-check", text: "Easy Appointment Booking" },
              ].map((f, i) => (
                <div className="hero-feature-item" key={i}>
                  <i className={`fa-solid ${f.icon}`}></i>
                  {f.text}
                </div>
              ))}
            </div>
          </div>

          <div className="hero-right">
            <div className="auth-card">
              <div className="auth-card-title">Get Started</div>
              <div className="auth-card-sub">Choose how you'd like to continue</div>
              <div className="auth-btn-group">
                <button className="auth-btn auth-btn-doctor-login" onClick={handleShowDoctor}>
                  <i><span className="fa-solid fa-user-tie"></span></i>
                  <div>
                    <div style={{fontSize:15,fontWeight:700}}>Doctor Login</div>
                    <div style={{fontSize:12,opacity:0.8}}>Access your doctor dashboard</div>
                  </div>
                </button>
                <button className="auth-btn auth-btn-doctor-reg" onClick={handleShowDoctorRegistration}>
                  <i><span className="fa-solid fa-user-plus"></span></i>
                  <div>
                    <div style={{fontSize:15,fontWeight:700}}>Doctor Registration</div>
                    <div style={{fontSize:12,opacity:0.7}}>Join as a healthcare provider</div>
                  </div>
                </button>
                <div className="auth-divider">— or —</div>
                <button className="auth-btn auth-btn-user-login" onClick={handleShow}>
                  <i><span className="fa-solid fa-user"></span></i>
                  <div>
                    <div style={{fontSize:15,fontWeight:700}}>Patient Login</div>
                    <div style={{fontSize:12,opacity:0.8}}>Access your health portal</div>
                  </div>
                </button>
                <button className="auth-btn auth-btn-user-reg" onClick={handleShowRegister}>
                  <i><span className="fa-solid fa-circle-user"></span></i>
                  <div>
                    <div style={{fontSize:15,fontWeight:700}}>Patient Registration</div>
                    <div style={{fontSize:12,opacity:0.7}}>Create your account</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="landing-stats">
          {[
            { n: "100+", l: "Doctors" },
            { n: "20+", l: "Specializations" },
            { n: "5000+", l: "Patients Served" },
            { n: "24/7", l: "Online Support" },
          ].map((s, i) => (
            <div className="stat-item" key={i}>
              <div className="stat-number">{s.n}</div>
              <div className="stat-label">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="landing-footer">
          <div className="footer-inner">
            <div className="footer-brand">
              <img src="https://www.healthcare-management-degree.net/wp-content/uploads/2016/09/cropped-healthcare-mgmt512.png" alt="HCMS" />
              <div>
                <div className="footer-brand-name">HealthCare Management System</div>
                <div className="footer-brand-tagline">Your health, our priority — always.</div>
              </div>
            </div>

            <div className="footer-links">
              <div className="footer-col">
                <div className="footer-col-title">Quick Links</div>
                <span>Hospitals Near Me</span>
                <span>e-Clinic</span>
                <span>Services</span>
                <span>Book Appointment</span>
              </div>
              <div className="footer-col">
                <div className="footer-col-title">For Doctors</div>
                <span>Doctor Login</span>
                <span>Doctor Registration</span>
                <span>Dashboard</span>
                <span>Patient Records</span>
              </div>
              <div className="footer-col">
                <div className="footer-col-title">Support</div>
                <span>Help Center</span>
                <span>Privacy Policy</span>
                <span>Terms of Service</span>
                <span>Contact Us</span>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <span>🚨 Emergency Helpline: <strong>108</strong></span>
            <span className="footer-copy">© {new Date().getFullYear()} HealthCare Management System. All rights reserved.</span>
            <span>Made with ❤️ for better healthcare</span>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <Modal show={doctRegShow} onHide={handleCloseDoctorRegistration} centered>
        <Modal.Header closeButton style={{background:'#0f4c81',color:'white'}}>
          <Modal.Title>Doctor Registration</Modal.Title>
        </Modal.Header>
        <Modal.Body><DoctorRegistration /></Modal.Body>
        <Modal.Footer>
          <button className="auth-btn auth-btn-doctor-login" style={{width:'auto',padding:'10px 20px'}}
            onClick={() => { handleCloseDoctorRegistration(); handleShowDoctor(); }}>
            Already registered? Login
          </button>
        </Modal.Footer>
      </Modal>

      <Modal show={doctShow} onHide={handleCloseDoctor} centered>
        <Modal.Header closeButton style={{background:'#0f4c81',color:'white'}}>
          <Modal.Title>Doctor Login</Modal.Title>
        </Modal.Header>
        <Modal.Body><DoctorLogin /></Modal.Body>
        <Modal.Footer>
          <button className="auth-btn auth-btn-doctor-reg" style={{width:'auto',padding:'10px 20px'}}
            onClick={() => { handleCloseDoctor(); handleShowDoctorRegistration(); }}>
            New doctor? Register here
          </button>
        </Modal.Footer>
      </Modal>

      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton style={{background:'#00c9a7',color:'white'}}>
          <Modal.Title>Patient Login</Modal.Title>
        </Modal.Header>
        <Modal.Body><Login /></Modal.Body>
        <Modal.Footer>
          <button className="auth-btn auth-btn-user-reg" style={{width:'auto',padding:'10px 20px'}}
            onClick={() => { handleClose(); handleShowRegister(); }}>
            New here? Register
          </button>
        </Modal.Footer>
      </Modal>

      <Modal show={regShow} onHide={handleCloseRegister} centered>
        <Modal.Header closeButton style={{background:'#00c9a7',color:'white'}}>
          <Modal.Title>Patient Registration</Modal.Title>
        </Modal.Header>
        <Modal.Body><Register /></Modal.Body>
        <Modal.Footer>
          <button className="auth-btn auth-btn-user-login" style={{width:'auto',padding:'10px 20px'}}
            onClick={() => { handleCloseRegister(); handleShow(); }}>
            Already have account? Login
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Home;