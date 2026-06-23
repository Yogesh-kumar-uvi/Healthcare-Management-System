import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { message } from 'antd'; // ✅ NEW import
import { API_URL, SOCKET_URL } from '../../config';
import VideoCallModal from '../VideoCall/VideoCallModal';
import '../../styles/User.css';

const socket = io(SOCKET_URL);

const ChatPage = ({ user, doctor, doctorName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [dOnline, setDOnline] = useState(false);
  const [callType, setCallType] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const chatWindowRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatWindowRef.current)
        chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }, 50);
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API_URL}/conversation/api/v1/getMessages`, {
        params: { userID: user, doctorID: doctor }
      });
      if (response.data.success) {
        setMessages(response.data.data || []);
        scrollToBottom();
      }
    } catch (error) {
      console.error("Error fetching messages:", error); // ✅ FIX — log add kiya
      setMessages([]);
    }
  };

  useEffect(() => {
    setMessages([]);
    setDOnline(false);

    socket.emit('join', user);
    fetchMessages();

    socket.on('receiveMessage', (msgData) => {
      setMessages(prev => [...(prev || []), msgData]);
      scrollToBottom();
    });

    socket.on('incomingCall', ({ from, offer, callType: type, callerName }) => {
      setIncomingCall({ from, offer, type, callerName });
    });

    const checkOnlineInterval = setInterval(() => {
      socket.emit('checkOnline', doctor, (isOnline) => {
        setDOnline(isOnline);
      });
    }, 3000);

    socket.emit('checkOnline', doctor, (isOnline) => {
      setDOnline(isOnline);
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('incomingCall');
      clearInterval(checkOnlineInterval);
    };
  }, [user, doctor]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const response = await axios.post(`${API_URL}/conversation/api/v1/userSend`, {
        userID: user, doctorID: doctor, message: newMessage
      });

      if (response.data.success) {
        setMessages(prev => [...(prev || []), response.data.data]);
        setNewMessage('');
        scrollToBottom();

        socket.emit('sendMessage', {
          userID: user,
          doctorID: doctor,
          message: newMessage,
          sender: 'user'
        });
      }
    } catch (error) {
      console.error("Error sending message:", error); // ✅ FIX — log add kiya
      // ✅ FIX — backend ka specific error dikhao (jaise "No appointment found" jab appointment-check fail ho)
      message.error(error.response?.data?.message || "Failed to send message. Please try again.");
    }
  };

  const handleKey = (e) => { if (e.key === 'Enter') sendMessage(); };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const startCall = (type) => {
    if (!dOnline) {
      message.warning('Doctor is currently offline. Cannot start call.'); // ✅ FIX — alert() ki jagah message.warning
      return;
    }
    setCallType(type);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Header ── */}
      <div style={{
        padding: '12px 20px',
        background: 'white',
        borderBottom: '1px solid #e8eef5',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexShrink: 0
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: '50%',
          background: 'linear-gradient(135deg,#0f4c81,#00c9a7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 700, fontSize: 16, flexShrink: 0
        }}>
          {doctorName?.[0]?.toUpperCase() || 'D'}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e' }}>
            Dr. {doctorName}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: dOnline ? '#16a34a' : '#9ca3af',
              display: 'inline-block'
            }}></span>
            <span style={{ fontSize: 12, color: dOnline ? '#16a34a' : '#9ca3af' }}>
              {dOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        <div
          onClick={() => startCall('audio')}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: '#f0f5fb',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#0f4c81', fontSize: 15, cursor: 'pointer'
          }}
        >
          <i className="fa-solid fa-phone"></i>
        </div>

        <div
          onClick={() => startCall('video')}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: '#f0f5fb',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#0f4c81', fontSize: 15, cursor: 'pointer'
          }}
        >
          <i className="fa-solid fa-video"></i>
        </div>
      </div>

      {/* ── Messages ── */}
      <div
        ref={chatWindowRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          background: '#f8fafc',
        }}
      >
        {messages.length === 0 && (
          <div style={{
            textAlign: 'center', color: '#9ca3af',
            fontSize: 13, marginTop: 40
          }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>👋</div>
            No messages yet. Say hello!
          </div>
        )}

        {messages.map((msg, i) => {
          const isSent = msg.messages?.sender === 'user';
          return (
            <div key={i} style={{
              alignSelf: isSent ? 'flex-end' : 'flex-start',
              maxWidth: '65%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                padding: '10px 14px',
                borderRadius: isSent ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: isSent
                  ? 'linear-gradient(135deg,#0f4c81,#1a6bb5)'
                  : 'white',
                color: isSent ? 'white' : '#1a1a2e',
                fontSize: 14,
                lineHeight: 1.5,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                {msg.messages?.message}
              </div>
              <div style={{
                fontSize: 11, color: '#9ca3af', marginTop: 3,
                textAlign: isSent ? 'right' : 'left'
              }}>
                {isSent ? 'You' : `Dr. ${doctorName}`} · {formatTime(msg.messages?.timestamp || msg.createdAt)}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Input ── */}
      <div style={{
        padding: '12px 20px',
        background: 'white',
        borderTop: '1px solid #e8eef5',
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        flexShrink: 0
      }}>
        <input
          type="text"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type a message..."
          style={{
            flex: 1,
            border: '1.5px solid #e8eef5',
            borderRadius: 24,
            padding: '10px 18px',
            fontSize: 14,
            outline: 'none',
            background: '#f8fafc',
            fontFamily: 'inherit',
            transition: 'border 0.2s'
          }}
          onFocus={e => e.target.style.borderColor = '#0f4c81'}
          onBlur={e => e.target.style.borderColor = '#e8eef5'}
        />
        <button
          onClick={sendMessage}
          style={{
            width: 42, height: 42,
            borderRadius: '50%',
            background: 'linear-gradient(135deg,#0f4c81,#1a6bb5)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            flexShrink: 0,
            transition: 'transform 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <i className="fa-solid fa-paper-plane"></i>
        </button>
      </div>

      {/* ── Call modals ── */}
      {callType && (
        <VideoCallModal
          socket={socket}
          myId={user}
          targetId={doctor}
          targetName={`Dr. ${doctorName}`}
          callType={callType}
          isIncoming={false}
          incomingOffer={null}
          onClose={() => setCallType(null)}
        />
      )}

      {incomingCall && !callType && (
        <VideoCallModal
          socket={socket}
          myId={user}
          targetId={incomingCall.from}
          targetName={incomingCall.callerName || `Dr. ${doctorName}`}
          callType={incomingCall.type}
          isIncoming={true}
          incomingOffer={incomingCall.offer}
          onClose={() => setIncomingCall(null)}
        />
      )}
    </div>
  );
};

export default ChatPage;