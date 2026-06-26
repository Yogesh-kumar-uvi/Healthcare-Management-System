import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Modal } from 'react-bootstrap'
import { message } from 'antd'
import { API_URL } from '../../config'
import '../../styles/User.css'

const Appointments = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const { user } = useSelector(state => state.user)
  const [doctdetail, setDoctdetail] = useState({});
  const [docto, setDocto] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAppointment = async () => {
    if (!user) { navigate("/"); return; }
    try {
      const res = await axios.get(`${API_URL}/user/api/v1/getAllAppointments/${user.id}`);
      if (res.data.success && res.data.data) setDocto(res.data.data.reverse());
    } catch (e) {
      console.error("Error fetching appointments:", e);
      message.error("Failed to load appointments. Please refresh.");
    }
    finally { setLoading(false) }
  }

  useEffect(() => { getAppointment() }, [user])

  const statusClass = (s) => {
    if (!s) return 'status-pill status-pending';
    const sl = s.toLowerCase();
    if (sl === 'approved') return 'status-pill status-approved';
    if (sl === 'rejected') return 'status-pill status-rejected';
    return 'status-pill status-pending';
  }

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, color: '#6b7280' }}>Total: {docto.length} appointment(s)</div>
      </div>

      {/* ✅ FIX — hc-card ke bahar overflow wrapper rakha */}
      <div className="hc-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 28, marginBottom: 12, display: 'block' }}></i>
            Loading appointments...
          </div>
        ) : docto.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', marginBottom: 8 }}>No Appointments Yet</div>
            <div style={{ color: '#6b7280', marginBottom: 20 }}>Book your first appointment with a doctor</div>
            <button onClick={() => navigate('/User')} style={{
              background: 'linear-gradient(135deg,#0f4c81,#1a6bb5)',
              color: 'white', border: 'none', borderRadius: 10,
              padding: '10px 24px', fontWeight: 700, cursor: 'pointer'
            }}>Find a Doctor</button>
          </div>
        ) : (
          // ✅ FIX — scroll wrapper table ke directly upar
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
            <table className="appt-table" style={{ minWidth: 600, marginBottom: 0 }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Doctor</th>
                  <th>Specialization</th>
                  <th>Date</th>
                  <th>Fees</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {docto.map((appt, i) => (
                  <tr key={appt._id || i}>
                    <td style={{ color: '#6b7280' }}>{i + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%',
                          background: 'linear-gradient(135deg,#0f4c81,#00c9a7)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontSize: 14, flexShrink: 0
                        }}>
                          <i className="fa-solid fa-user-doctor"></i>
                        </div>
                        <span style={{ fontWeight: 600 }}>Dr. {appt.doctor?.name}</span>
                      </div>
                    </td>
                    <td style={{ color: '#6b7280' }}>{appt.doctor?.specialization}</td>
                    <td style={{ color: '#6b7280' }}>{appt.day?.substring(0, 10)}</td>
                    <td style={{ fontWeight: 700, color: '#0f4c81' }}>₹{appt.doctor?.fees}</td>
                    <td><span className={statusClass(appt.status)}>{appt.status || 'Pending'}</span></td>
                    <td>
                      <button onClick={() => { setDoctdetail(appt); setShow(true); }} style={{
                        padding: '6px 14px', borderRadius: 8,
                        background: '#f0f7ff', color: '#0f4c81',
                        border: '1.5px solid #c2daf7', fontWeight: 600,
                        fontSize: 12, cursor: 'pointer'
                      }}>
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton style={{ background: 'linear-gradient(135deg,#0f4c81,#1a6bb5)', color: 'white' }}>
          <Modal.Title>Appointment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: 24 }}>
          {Object.keys(doctdetail).length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#0f4c81,#00c9a7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: 20
                }}>
                  <i className="fa-solid fa-user-doctor"></i>
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 17 }}>Dr. {doctdetail.doctor?.name}</div>
                  <div style={{ color: '#6b7280', fontSize: 13 }}>{doctdetail.doctor?.specialization}</div>
                </div>
              </div>
              {[
                { label: 'Patient', val: user?.name },
                { label: 'Phone', val: `+91 ${doctdetail.doctor?.phone}` },
                { label: 'Experience', val: `${doctdetail.doctor?.experience} years` },
                { label: 'Fees', val: `₹${doctdetail.doctor?.fees}`, highlight: true },
                { label: 'Applied On', val: doctdetail.day?.substring(0, 10) },
                { label: 'Status', val: doctdetail.status || 'Pending' },
              ].map((row, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '10px 0', borderBottom: '1px solid #f0f5fb'
                }}>
                  <span style={{ color: '#6b7280', fontSize: 14 }}>{row.label}</span>
                  <span style={{
                    fontWeight: 700, fontSize: 14,
                    color: row.label === 'Status'
                      ? (doctdetail.status === 'approved' ? '#16a34a' : doctdetail.status === 'rejected' ? '#dc2626' : '#ca8a04')
                      : row.highlight ? '#0f4c81' : '#1a1a2e'
                  }}>
                    {row.val}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button onClick={() => setShow(false)} style={{
            padding: '10px 24px', borderRadius: 10,
            background: 'linear-gradient(135deg,#0f4c81,#1a6bb5)',
            color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer'
          }}>Close</button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default Appointments 