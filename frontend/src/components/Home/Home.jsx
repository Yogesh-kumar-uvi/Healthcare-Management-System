import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { message } from 'antd'
import { Modal } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../../config'
import '../../styles/User.css'

const Home = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [doctdetail, setDoctdetail] = useState({});
  const [doctor, setDoctor] = useState([]);
  const [search, setSearch] = useState('');
  const { user } = useSelector(state => state.user)

  const dataGetter = async () => {
    try {
      const resp = await axios.get(`${API_URL}/user/api/v1/getAllDoctors`)
      if (resp.data.success) setDoctor(resp.data.data)
    } catch (error) {
      message.error("Failed to load doctors")
    }
  }

  useEffect(() => { dataGetter() }, [])

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const createAppointment = async (item) => {
    const time = `${item.availableTimings.day1} ${item.availableTimings.time1}  ${item.availableTimings.day2} ${item.availableTimings.time2}`
    try {
      const resp = await axios.post(`${API_URL}/appointment/api/v1/`, {
        userID: user.id, doctorID: item._id, timing: time
      })
      if (resp.data.success) {
        message.success(resp.data.message)
        navigate("Appointments")
      }
    } catch (error) { message.error("Appointment failed") }
  }


  const formatPhoneForRazorpay = (phone) => {
    if (!phone) return "";
    const digitsOnly = String(phone).replace(/\D/g, "");

    if (digitsOnly.length === 12 && digitsOnly.startsWith("91")) {
      return `+${digitsOnly}`;
    }
    
    if (digitsOnly.length === 10) {
      return `+91${digitsOnly}`;
    }
   
    return `+91${digitsOnly}`;
  };

  const openRazorpay = async (doctdetail) => {
    const order = await axios.post(`${API_URL}/appointment/api/v1/create-order`, {
      userId: user.id, doctorId: doctdetail._id, amount: doctdetail.fees
    });
    if (!order.data.success) { alert("Order failed!"); return; }
    const options = {
      key: order.data.data.razorpayKeyId,
      amount: doctdetail.fees * 100,
      currency: 'INR',
      name: 'HealthCare Management',
      description: 'Appointment Booking',
      image: 'https://www.healthcare-management-degree.net/wp-content/uploads/2016/09/cropped-healthcare-mgmt512.png',
      order_id: order.data.data.id,
      handler: async function (response) {
        const orderResult = await axios.post(`${API_URL}/appointment/api/v1/verify-order`, {
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature
        });
        if (orderResult.data.success) createAppointment(doctdetail);
      },
      prefill: {
        name: user.name,
        email: user.email,
        contact: formatPhoneForRazorpay(user.phone) 
      },
      theme: { color: '#0f4c81' },
    };
    const rzp1 = new window.Razorpay(options);
    rzp1.on('payment.failed', () => message.error('Payment Failed'));
    rzp1.open();
  };

  const filtered = doctor.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f4c81, #00c9a7)',
        borderRadius: 16, padding: '24px 28px', marginBottom: 24, color: 'white'
      }}>
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
          Welcome back, {user?.name || 'Patient'} 👋
        </div>
        <div style={{ fontSize: 14, opacity: 0.85 }}>
          Find a doctor and book your appointment below
        </div>
      </div>

      {/* Search */}
      <div className="search-bar-wrapper">
        <i className="fa-solid fa-magnifying-glass"></i>
        <input
          className="search-bar-input"
          placeholder="Search by doctor name or specialization..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {[
          { icon: 'fa-user-doctor', label: 'Total Doctors', val: doctor.length, color: '#0f4c81' },
          { icon: 'fa-stethoscope', label: 'Available Now', val: doctor.filter(d => d.isOnline).length, color: '#00c9a7' },
        ].map((s, i) => (
          <div key={i} className="hc-card" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: s.color + '18', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: s.color, fontSize: 20
            }}>
              <i className={`fa-solid ${s.icon}`}></i>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Doctor grid */}
      <div className="hc-card-title">
        <i className="fa-solid fa-user-doctor"></i> Available Doctors
      </div>
      <div className="doctor-grid" style={{ marginTop: 0 }}>
        {filtered.map((doc) => (
          <div className="doctor-card" key={doc._id}>
            <div className="doctor-card-avatar">
              <i className="fa-solid fa-user-doctor"></i>
            </div>
            <div className="doctor-card-name">Dr. {doc.name}</div>
            <div className="doctor-card-spec">{doc.specialization}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 12, background: '#f0f7ff', color: '#0f4c81', padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>
                <i className="fa-solid fa-briefcase"></i> {doc.experience} yrs
              </span>
              <span style={{ fontSize: 12, background: '#f0fdf9', color: '#00a88b', padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>
                ₹{doc.fees}
              </span>
              <span className={`online-badge ${doc.isOnline ? '' : 'offline'}`}>
                <span className="online-dot"></span>
                {doc.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 14 }}>
              <i className="fa-regular fa-clock" style={{ marginRight: 6 }}></i>
              {doc.availableTimings?.day1} {doc.availableTimings?.time1} &nbsp;·&nbsp;
              {doc.availableTimings?.day2} {doc.availableTimings?.time2}
            </div>
            <button
              onClick={() => { setDoctdetail(doc); setShow(true); }}
              style={{
                width: '100%', padding: '10px', borderRadius: 10,
                background: 'linear-gradient(135deg, #0f4c81, #1a6bb5)',
                color: 'white', border: 'none', fontWeight: 700,
                fontSize: 14, cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseOver={e => e.target.style.opacity = '0.85'}
              onMouseOut={e => e.target.style.opacity = '1'}
            >
              Book Appointment
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: '#6b7280' }}>
            <i className="fa-solid fa-user-doctor" style={{ fontSize: 36, marginBottom: 12, display: 'block' }}></i>
            No doctors found
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton style={{ background: 'linear-gradient(135deg,#0f4c81,#1a6bb5)', color: 'white' }}>
          <Modal.Title>Confirm Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: 24 }}>
          {Object.keys(doctdetail).length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#0f4c81,#00c9a7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: 22
                }}>
                  <i className="fa-solid fa-user-doctor"></i>
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>Dr. {doctdetail.name}</div>
                  <div style={{ color: '#6b7280', fontSize: 14 }}>{doctdetail.specialization}</div>
                </div>
              </div>
              {[
                { label: 'Experience', val: `${doctdetail.experience} years` },
                { label: 'Consultation Fees', val: `₹${doctdetail.fees}`, highlight: true },
                { label: 'Available', val: `${doctdetail.availableTimings?.day1} ${doctdetail.availableTimings?.time1} · ${doctdetail.availableTimings?.day2} ${doctdetail.availableTimings?.time2}` },
              ].map((row, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '10px 0', borderBottom: '1px solid #f0f5fb'
                }}>
                  <span style={{ color: '#6b7280', fontSize: 14 }}>{row.label}</span>
                  <span style={{ fontWeight: 700, color: row.highlight ? '#0f4c81' : '#1a1a2e', fontSize: 14 }}>
                    {row.val}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ gap: 10 }}>
          <button onClick={() => setShow(false)} style={{
            padding: '10px 20px', borderRadius: 10, border: '1.5px solid #e8eef5',
            background: 'white', color: '#6b7280', fontWeight: 600, cursor: 'pointer'
          }}>Cancel</button>
          <button onClick={() => { setShow(false); openRazorpay(doctdetail); }} style={{
            padding: '10px 24px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg,#0f4c81,#1a6bb5)',
            color: 'white', fontWeight: 700, cursor: 'pointer'
          }}>
            Pay & Confirm
          </button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default Home