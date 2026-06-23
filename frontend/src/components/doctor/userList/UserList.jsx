import React, { useEffect, useState } from 'react'
import './UserList.css'
import axios from 'axios';
import { useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';
import { Modal } from "react-bootstrap";
import StatusUpdate from './StatusUpdate';
import ChatPage from './ChatPage';
import PrescriptionModal from '../../Prescription/PrescriptionModal'; // ✅ NEW import

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState(false);
  const [statusID, setStatusID] = useState();
  const [chatShow, setChatShow] = useState(false);
  const [chat, setChat] = useState();
  const [loading, setLoading] = useState(true);

  // ✅ NEW states for prescription
  const [prescriptionShow, setPrescriptionShow] = useState(false);
  const [prescriptionPatient, setPrescriptionPatient] = useState(null);

  const navigate = useNavigate();
  const { doctor } = useSelector((state) => state.doctor);

  if (!doctor) navigate("/");

  const closeChat = () => { setChatShow(false); setChat(null); }
  const openChat = (data) => { setChatShow(true); setChat(data); }
  const closeStatus = () => setStatus(false);
  const openStatus = (user) => { setStatusID(user); setStatus(true); }

  // ✅ NEW — prescription open/close
  const openPrescription = (user) => {
    setPrescriptionPatient(user.user);
    setPrescriptionShow(true);
  };
  const closePrescription = () => {
    setPrescriptionShow(false);
    setPrescriptionPatient(null);
  };

  useEffect(() => {
    const userList = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/doctor/api/v1/doctorAppointments/${doctor._id}`);
        if (response.data.success) setUsers(response.data.data.reverse());
      } catch (error) {
        console.error("Error fetching patients:", error);
      } finally {
        setLoading(false);
      }
    }
    userList();
  }, [])

  return (
    <>
      {loading ? (
        <div className="loading-state">
          <i className="fa-solid fa-spinner fa-spin loading-icon"></i>
          Loading patients...
        </div>
      ) : users.length === 0 ? (
        <div className="no-patients">
          <div className="no-patients-icon">👥</div>
          <div className="no-patients-title">No Patients Yet</div>
          <div className="no-patients-sub">Patients who book appointments will appear here</div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="user-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Patient</th>
                <th>Mobile</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user._id}>
                  <td>{index + 1}</td>
                  <td>
                    <div className="patient-name-cell" onClick={() => openChat(user)}>
                      <div className="patient-avatar">
                        {user.user?.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="patient-name">{user.user?.name}</span>
                    </div>
                  </td>
                  <td>+91-{user.user?.phone}</td>
                  <td>{user.user?.email}</td>
                  <td>
                    <span className={`status-badge ${
                      user.status === 'Confirmed' ? 'status-confirmed' :
                      user.status === 'Cancelled' ? 'status-cancelled' :
                      user.status === 'Completed' ? 'status-completed' : 'status-pending'
                    }`}>
                      {user.status || 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn action-btn-status" onClick={() => openStatus(user)}>
                        <i className="fa-solid fa-stethoscope"></i> Status
                      </button>
                      <button className="action-btn action-btn-chat" onClick={() => openChat(user)}>
                        <i className="fa-solid fa-comments"></i> Chat
                      </button>
                      {/* ✅ NEW — Prescription button */}
                      <button
                        className="action-btn"
                        style={{ background: '#7c3aed', color: 'white' }}
                        onClick={() => openPrescription(user)}
                      >
                        <i className="fa-solid fa-file-prescription"></i> Prescribe
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Status Modal */}
      <Modal show={status} onHide={closeStatus} centered>
        <Modal.Header closeButton style={{ background: 'linear-gradient(135deg,#0f4c81,#1a6bb5)', color: 'white' }}>
          <Modal.Title>Update Appointment Status</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: 24 }}>
          <StatusUpdate user={statusID} doctor={doctor._id} />
        </Modal.Body>
      </Modal>

      {/* Chat Modal */}
      <Modal show={chatShow} onHide={closeChat} centered size="lg">
        <Modal.Header closeButton style={{ background: 'linear-gradient(135deg,#0f4c81,#1a6bb5)', color: 'white' }}>
          <Modal.Title>
            <i className="fa-solid fa-comments" style={{ marginRight: 8 }}></i>
            Chat with {chat?.user?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: 0, height: 500, display: 'flex', flexDirection: 'column' }}>
          {chat ? (
            <ChatPage
              user={chat.user._id}
              doctor={doctor._id}
              patientName={chat.user?.name}
            />
          ) : ""}
        </Modal.Body>
      </Modal>

      {/* ✅ NEW — Prescription Modal */}
      <PrescriptionModal
        show={prescriptionShow}
        onClose={closePrescription}
        patient={prescriptionPatient}
        doctor={doctor}
      />
    </>
  );
};

export default UserList;