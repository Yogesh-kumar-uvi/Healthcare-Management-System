import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { message } from "antd"; // ✅ NEW import
import ChatPage from "./ChatPage";
import "../../styles/User.css";

const Conversation = () => {
  const navigate = useNavigate();
  const [chatList, setChatList] = useState([]);
  const [activeDoctor, setActiveDoctor] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ NEW
  const { user } = useSelector((state) => state.user);

  if (!user) navigate("/");

  useEffect(() => {
    const conversationList = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/user/api/v1/getUniqueAppointments/${user.id}`
        );
        if (response.data.success) setChatList(response.data.data);
      } catch (error) {
        console.error("Error fetching conversations:", error); // ✅ FIX — log add kiya
        message.error("Failed to load your conversations. Please refresh."); // ✅ FIX — user ko bataya
      } finally {
        setLoading(false); // ✅ NEW
      }
    };
    conversationList();
  }, [user]); // ✅ FIX — dependency array mein user add kiya (warning avoid karne ke liye)

  return (
    <div className="chat-container">
      {/* Contact list */}
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <i className="fa-solid fa-comments" style={{color:'#0f4c81',marginRight:8}}></i>
          My Doctors
          <div style={{fontSize:12,color:'#6b7280',fontWeight:400,marginTop:2}}>{chatList.length} conversation(s)</div>
        </div>
        {loading ? ( // ✅ NEW — loading state
          <div style={{padding:24,textAlign:'center',color:'#6b7280',fontSize:13}}>
            <i className="fa-solid fa-spinner fa-spin" style={{marginRight:8}}></i>
            Loading conversations...
          </div>
        ) : chatList.length === 0 ? (
          <div style={{padding:24,textAlign:'center',color:'#6b7280',fontSize:13}}>
            No conversations yet.<br/>Book an appointment first.
          </div>
        ) : chatList.map((item, i) => (
          <div
            key={i}
            className={`chat-contact ${activeDoctor === item.doctor._id ? 'active' : ''}`}
            onClick={() => setActiveDoctor(item.doctor._id)}
          >
            <div className="chat-contact-avatar">
              {item.doctor.name?.[0]?.toUpperCase() || 'D'}
            </div>
            <div>
              <div className="chat-contact-name">Dr. {item.doctor.name}</div>
              <div className="chat-contact-status">{item.doctor.specialization}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Chat window */}
      <div className="chat-window">
        {activeDoctor ? (
          <ChatPage user={user.id} doctor={activeDoctor}
            doctorName={chatList.find(c => c.doctor._id === activeDoctor)?.doctor?.name}
          />
        ) : (
          <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'#6b7280'}}>
            <div style={{fontSize:48,marginBottom:16}}>💬</div>
            <div style={{fontSize:18,fontWeight:700,color:'#1a1a2e',marginBottom:8}}>Select a Doctor to Chat</div>
            <div style={{fontSize:14}}>Choose from your appointment doctors on the left</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Conversation;