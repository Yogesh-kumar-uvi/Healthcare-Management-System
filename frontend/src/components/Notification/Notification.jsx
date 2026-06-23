import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useSelector } from "react-redux";
import { message } from "antd";
import '../../styles/User.css';

const Notification = () => {
  const [notificationL, setNotificationL] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.user);

  const callingNotificationAPI = async () => {
    try {
      // ✅ FIX — 8081 → 8080 (galat port tha)
      const res = await axios.get(`http://localhost:8080/notification/api/v1/${user.id}`)
      if (res.status === 200) setNotificationL(res.data.data.reverse());
    } catch (error) {
      console.error("Notification fetch error:", error); // ✅ FIX — log add kiya
      message.error("Failed to load notifications."); // ✅ FIX — user ko bataya
    }
    finally { setLoading(false) }
  }

  useEffect(() => { callingNotificationAPI(); }, [user]) // ✅ FIX — dependency array mein user add kiya

  const msgSeen = async (notif) => {
    if (notif.seen) { message.info("Already marked as seen"); return; }
    try {
      // ✅ FIX — 8081 → 8080
      const res = await axios.put(`http://localhost:8080/notification/api/v1/`, { notificationID: notif._id })
      if (res.status === 200) {
        message.success("Marked as seen");
        setNotificationL(prev => prev.map(n => n._id === notif._id ? { ...n, seen: true } : n));
      }
    } catch (error) {
      console.error("Mark as seen error:", error); // ✅ NEW — pehle ye function bina try-catch ke tha
      message.error("Failed to mark as seen."); // ✅ NEW
    }
  }

  const unread = notificationL.filter(n => !n.seen).length;

  return (
    <>
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
        {unread > 0 && (
          <span style={{
            background: '#fee2e2', color: '#dc2626', fontSize: 12,
            fontWeight: 700, padding: '3px 12px', borderRadius: 20
          }}>
            {unread} unread
          </span>
        )}
      </div>

      <div className="hc-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 28, marginBottom: 12, display: 'block' }}></i>
            Loading notifications...
          </div>
        ) : notificationL.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', marginBottom: 8 }}>All Caught Up!</div>
            <div style={{ color: '#6b7280' }}>No notifications yet</div>
          </div>
        ) : notificationL.map((notif, i) => (
          <div
            key={notif._id || i}
            className="notif-item"
            style={{ cursor: 'pointer', opacity: notif.seen ? 0.6 : 1 }}
            onClick={() => msgSeen(notif)}
          >
            <div className={`notif-icon ${notif.seen ? 'info' : 'warning'}`}>
              <i className={`fa-solid ${notif.seen ? 'fa-check' : 'fa-bell'}`}></i>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e' }}>
                  Dr. {notif.appointment?.doctor?.name}
                  {!notif.seen && (
                    <span style={{
                      marginLeft: 8, background: '#fef3c7', color: '#d97706',
                      fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 600
                    }}>New</span>
                  )}
                </div>
                <div className="notif-time">
                  {notif.updatedAt ? new Date(notif.updatedAt).toLocaleDateString() : ''}
                </div>
              </div>
              <div className="notif-text" style={{ marginTop: 4 }}>{notif.message}</div>
              {!notif.seen && (
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                  Click to mark as seen
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default Notification