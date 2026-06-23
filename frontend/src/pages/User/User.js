import React, { useState } from "react";
import { useNavigate, Link, Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../Redux/UserSlice";
import { message } from "antd";
import "../../styles/User.css";

const navItems = [
  { to: "", label: "Dashboard", icon: "fa-chart-line", exact: true },
  { to: "Appointments", label: "Appointments", icon: "fa-calendar-check" },
  { to: "Prescriptions", label: "Prescriptions", icon: "fa-file-prescription" },
  { to: "Profile", label: "My Profile", icon: "fa-user-circle" }, // ✅ NEW
  { to: "Notification", label: "Notifications", icon: "fa-bell" },
  { to: "Conversation", label: "Chat", icon: "fa-comments" },
];

const User = () => {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const logout = () => {
    dispatch(setUser(null));
    localStorage.removeItem("token");
    navigate("/");
    message.success("Logged out successfully");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2);
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.endsWith("Appointments")) return "My Appointments";
    if (path.endsWith("Prescriptions")) return "My Prescriptions";
    if (path.endsWith("Profile")) return "My Profile"; // ✅ NEW
    if (path.endsWith("Notification")) return "Notifications";
    if (path.endsWith("Conversation")) return "Chat";
    return "Dashboard";
  };

  const isActive = (to) => {
    const path = location.pathname;
    if (to === "") return path === "/User" || path === "/User/";
    return path.includes(to);
  };

  return (
    <div className="user-layout">
      {/* Sidebar */}
      <aside className={`user-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <img src="https://www.healthcare-management-degree.net/wp-content/uploads/2016/09/cropped-healthcare-mgmt512.png" alt="HCMS" />
          <div className="sidebar-brand-text">
            HealthCare
            <small>Management System</small>
          </div>
        </div>

        {user && (
          <div className="sidebar-user-pill">
            {/* ✅ NEW — photo dikhao agar hai, warna initials */}
            {user.profilePhoto ? (
              <img
                src={user.profilePhoto}
                alt="avatar"
                style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              <div className="sidebar-user-avatar">{getInitials(user.name)}</div>
            )}
            <div>
              <div className="sidebar-user-name">{user.name}</div>
              <div className="sidebar-user-role">Patient</div>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Main Menu</div>
          {navItems.map((item) => (
            <Link
              key={item.to}
              className={`sidebar-nav-item ${isActive(item.to) ? "active" : ""}`}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
            >
              <i className={`fa-solid ${item.icon} nav-icon`}></i>
              {item.label}
            </Link>
          ))}
        </nav>

        <button className="sidebar-logout" onClick={logout}>
          <i className="fa-solid fa-arrow-right-from-bracket"></i>
          Logout
        </button>
      </aside>

      {/* Main */}
      <main className="user-main">
        <div className="user-topbar">
          <div className="user-topbar-title">{getPageTitle()}</div>
          <div className="user-topbar-right">
            <button className="topbar-notif-btn" onClick={() => navigate("Notification")}>
              <i className="fa-regular fa-bell"></i>
            </button>
            {user && (
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                {/* ✅ NEW — topbar mein bhi photo dikhao */}
                {user.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt="avatar"
                    style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover" }}
                  />
                ) : (
                  <div style={{
                    width:34,height:34,borderRadius:'50%',
                    background:'linear-gradient(135deg,#0f4c81,#00c9a7)',
                    display:'flex',alignItems:'center',justifyContent:'center',
                    color:'white',fontWeight:700,fontSize:13
                  }}>{getInitials(user.name)}</div>
                )}
                <span style={{fontSize:13,fontWeight:600,color:'#1a1a2e'}}>{user.name}</span>
              </div>
            )}
          </div>
        </div>
        <div className="user-content">
          <Outlet />
        </div>
      </main>

      {/* Mobile toggle */}
      <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <i className={`fa-solid ${sidebarOpen ? "fa-xmark" : "fa-bars"}`}></i>
      </button>
    </div>
  );
};

export default User;