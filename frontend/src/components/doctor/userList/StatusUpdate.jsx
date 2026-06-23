import { message } from 'antd';
import axios from 'axios';
import React, { useState } from 'react'

const StatusUpdate = (props) => {
  const [status, setStatus] = useState();
  const [loading, setLoading] = useState(null);

  const change = async (option) => {
    const formData = {
      doctorID: props.doctor,
      appointmentID: props.user._id
    }
    setLoading(option);
    try {
      let response;
      if (option === "approve") {
        response = await axios.put(`http://localhost:8080/doctor/api/v1/approval`, formData);
        if (response.data.success) { message.success("Appointment Approved!"); setStatus("Confirmed"); }
      } else if (option === "cancel") {
        response = await axios.put(`http://localhost:8080/doctor/api/v1/cancel`, formData);
        if (response.data.success) { message.success("Appointment Cancelled!"); setStatus("Cancelled"); }
      } else {
        response = await axios.put(`http://localhost:8080/doctor/api/v1/complete`, formData);
        if (response.data.success) { message.success("Appointment Completed!"); setStatus("Completed"); }
      }
    } catch (error) {
      console.error("Status update error:", error); // ✅ FIX — log add kiya
      // ✅ FIX — backend ka specific error dikhao
      message.error(error.response?.data?.message || "Failed to update status. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  if (!props.user) return "";

  const currentStatus = status || props.user.status;

  return (
    <div>
      {/* Patient Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: 'linear-gradient(135deg,#0f4c81,#00c9a7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 700, fontSize: 20
        }}>
          {props.user.user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 17 }}>{props.user.user?.name}</div>
          <div style={{ color: '#6b7280', fontSize: 13 }}>{props.user.user?.email}</div>
        </div>
      </div>

      {/* Details */}
      {[
        { label: 'Mobile', val: `+91 ${props.user.user?.phone}` },
        { label: 'Appointment Date', val: props.user.day },
        { label: 'Current Status', val: currentStatus || 'Pending', isStatus: true },
      ].map((row, i) => (
        <div key={i} style={{
          display: 'flex', justifyContent: 'space-between',
          padding: '10px 0', borderBottom: '1px solid #f0f5fb'
        }}>
          <span style={{ color: '#6b7280', fontSize: 14 }}>{row.label}</span>
          {row.isStatus ? (
            <span style={{
              fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
              background: currentStatus === 'Confirmed' ? '#dcfce7' :
                currentStatus === 'Cancelled' ? '#fee2e2' :
                currentStatus === 'Completed' ? '#dbeafe' : '#fef9c3',
              color: currentStatus === 'Confirmed' ? '#16a34a' :
                currentStatus === 'Cancelled' ? '#dc2626' :
                currentStatus === 'Completed' ? '#1d4ed8' : '#ca8a04'
            }}>{currentStatus || 'Pending'}</span>
          ) : (
            <span style={{ fontWeight: 600, fontSize: 14 }}>{row.val}</span>
          )}
        </div>
      ))}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <button
          onClick={() => change("approve")}
          disabled={loading === 'approve'}
          style={{
            flex: 1, padding: '10px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg,#16a34a,#15803d)',
            color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            opacity: loading === 'approve' ? 0.7 : 1
          }}>
          {loading === 'approve' ? '...' : '✅ Approve'}
        </button>
        <button
          onClick={() => change("cancel")}
          disabled={loading === 'cancel'}
          style={{
            flex: 1, padding: '10px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg,#dc2626,#b91c1c)',
            color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            opacity: loading === 'cancel' ? 0.7 : 1
          }}>
          {loading === 'cancel' ? '...' : '❌ Cancel'}
        </button>
        <button
          onClick={() => change("complete")}
          disabled={loading === 'complete'}
          style={{
            flex: 1, padding: '10px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg,#0f4c81,#1a6bb5)',
            color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            opacity: loading === 'complete' ? 0.7 : 1
          }}>
          {loading === 'complete' ? '...' : '🏁 Complete'}
        </button>
      </div>
    </div>
  );
}

export default StatusUpdate