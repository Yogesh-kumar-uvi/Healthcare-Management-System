import React, { useEffect, useState } from 'react'
import '../userList/UserList.css'
import axios from 'axios';
import { message } from "antd"; // ✅ NEW import
import DoctorModal from './DoctorModal';
import { Modal } from 'react-bootstrap';

const Department = () => {
  const [users, setUsers] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [modalOpen, setModelOpen] = useState(false);
  const [loading, setLoading] = useState(true); // ✅ NEW

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ✅ FIX — 8081 → 8080 (galat port tha)
        const response = await axios.get('http://localhost:8080/user/api/v1/getAllDoctors');
        setUsers(response.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        message.error("Failed to load doctors list."); // ✅ FIX — user ko bataya
      } finally {
        setLoading(false); // ✅ NEW
      }
    };

    fetchData();
  }, []);

  const openModal = (doctor) => {
    setSelectedDoctor(doctor);
    setModelOpen(true);
  };

  const closeModal = () => {
    setSelectedDoctor(null);
    setModelOpen(false);
  };

  return (
    <div>
      {loading ? ( // ✅ NEW — loading state
        <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 28, marginBottom: 12, display: 'block' }}></i>
          Loading doctors...
        </div>
      ) : (
        <table className="user-table">
          <thead>
            <tr className='red-line'>
              <th>#</th>
              <th>Profile Pic</th>
              <th>Name</th>
              <th>Mobile</th>
              <th>Email ID</th>
              <th>Specialization</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? users.map((user, index) => (
              <tr key={user._id || index} className={`${index % 2 === 0 ? "blue-line" : "black-line"}`}>
                <td>{index + 1}</td>
                <td><img src='https://png.pngtree.com/png-vector/20191130/ourmid/pngtree-doctor-icon-circle-png-image_2055257.jpg' alt={user.name} className="profile-pic" /></td>
                <td>{user.name}</td>
                <td>+91 {user.phone}</td>
                <td>{user.email}</td>
                <td>{user.specialization}</td>
                <td><button className="action-button" onClick={() => openModal(user)}>View</button></td>
              </tr>
            )) : <tr><td colSpan="7">No data</td></tr>}
          </tbody>
        </table>
      )}
      <Modal
        show={modalOpen}
        onHide={closeModal}
      >
        <Modal.Header style={{ backgroundColor: "blue", color: "white" }}>
          <h3>Doctor Information</h3>
          <div style={{ cursor: "pointer", fontSize: "20px", fontWeight: "bolder", color: "red" }} onClick={closeModal}>&times;</div>
        </Modal.Header>

        <Modal.Body>
          <DoctorModal doctor={selectedDoctor} />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Department;