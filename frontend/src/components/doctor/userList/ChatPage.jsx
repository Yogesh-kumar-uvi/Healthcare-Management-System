import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { message } from 'antd'; // ✅ NEW import
import { API_URL, SOCKET_URL } from '../../../config';
import VideoCallModal from '../../VideoCall/VideoCallModal';
import PrescriptionModal from '../../Prescription/PrescriptionModal';

const socket = io(SOCKET_URL);

const ChatPage = (props) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [uOnline, setUOnline] = useState(false);
  const [callType, setCallType] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [showPrescription, setShowPrescription] = useState(false);
  const chatWindowRef = useRef(null);

  const { doctor } = useSelector((state) => state.doctor);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatWindowRef.current)
        chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }, 50);
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API_URL}/conversation/api/v1/getMessages`, {
        params: { userID: props.user, doctorID: props.doctor }
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
    setUOnline(false);

    socket.emit('join', props.doctor);
    fetchMessages();

    socket.on('receiveMessage', (msgData) => {
      setMessages(prev => [...(prev || []), msgData]);
      scrollToBottom();
    });

    socket.on('incomingCall', ({ from, offer, callType: type, callerName }) => {
      setIncomingCall({ from, offer, type, callerName });
    });

    const checkOnlineInterval = setInterval(() => {
      socket.emit('checkOnline', props.user, (isOnline) => {
        setUOnline(isOnline);
      });
    }, 3000);

    socket.emit('checkOnline', props.user, (isOnline) => {
      setUOnline(isOnline);
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('incomingCall');
      clearInterval(checkOnlineInterval);
    };
  }, [props.user, props.doctor]);

  const sendDoctorMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const response = await axios.post(`${API_URL}/conversation/api/v1/doctorSend`, {
        userID: props.user,
        doctorID: props.doctor,
        message: newMessage
      });

      if (response.data.success) {
        setMessages(prev => [...(prev || []), response.data.data]);
        setNewMessage('');
        scrollToBottom();

        socket.emit('sendMessage', {
          userID: props.user,
          doctorID: props.doctor,
          message: newMessage,
          sender: 'doctor'
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // ✅ FIX — backend ka specific error dikhao
      message.error(error.response?.data?.message || "Failed to send message. Please try again.");
    }
  };

  const handleKey = (e) => { if (e.key === 'Enter') sendDoctorMessage(); };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const startCall = (type) => {
    if (!uOnline) {
      message.warning('Patient is currently offline. Cannot start call.'); // ✅ FIX — alert() ki jagah message.warning
      return;
    }
    setCallType(type);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 400 }}>

      {/* ── Header ── */}
      <div style={{
        padding: '12px 16px',
        background: 'white',
        borderBottom: '1px solid #e8eef5',
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'linear-gradient(135deg,#00c9a7,#0f6e56)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 700, fontSize: 15, flexShrink: 0
        }}>
          {props.patientName?.[0]?.toUpperCase() || 'P'}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e' }}>
            {props.patientName || 'Patient'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: uOnline ? '#16a34a' : '#9ca3af',
              display: 'inline-block'
            }}></span>
            <span style={{ fontSize: 12, color: uOnline ? '#16a34a' : '#9ca3af' }}>
              {uOnline ? 'Online' : 'Offline'}
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

        <div
          onClick={() => setShowPrescription(true)}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: '#f0f5fb',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#7c3aed', fontSize: 15, cursor: 'pointer'
          }}
        >
          <i className="fa-solid fa-file-prescription"></i>
        </div>
      </div>

      {/* ── Messages ── */}
      <div ref={chatWindowRef} style={{
        flex: 1,
        overflowY: 'auto',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        background: '#f8fafc',
        minHeight: 320,
        maxHeight: 360
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, marginTop: 20 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>👋</div>
            No messages yet. Start the conversation!
          </div>
        )}
        {messages.map((msg, index) => {
          const isDoctor = msg.messages?.sender === 'doctor';
          return (
            <div key={index} style={{
              alignSelf: isDoctor ? 'flex-end' : 'flex-start',
              maxWidth: '65%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                padding: '10px 14px',
                borderRadius: isDoctor ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: isDoctor
                  ? 'linear-gradient(135deg,#0f4c81,#1a6bb5)'
                  : 'white',
                color: isDoctor ? 'white' : '#1a1a2e',
                fontSize: 14,
                lineHeight: 1.5,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                {msg.messages?.message}
              </div>
              <div style={{
                fontSize: 11, color: '#9ca3af', marginTop: 3,
                textAlign: isDoctor ? 'right' : 'left'
              }}>
                {isDoctor ? 'You' : props.patientName || 'Patient'} · {formatTime(msg.messages?.timestamp || msg.createdAt)}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Input ── */}
      <div style={{
        padding: '12px 16px',
        background: 'white',
        borderTop: '1px solid #e8eef5',
        display: 'flex',
        gap: 10,
        alignItems: 'center'
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
          onClick={sendDoctorMessage}
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
          myId={props.doctor}
          targetId={props.user}
          targetName={props.patientName || 'Patient'}
          callType={callType}
          isIncoming={false}
          incomingOffer={null}
          onClose={() => setCallType(null)}
        />
      )}

      {incomingCall && !callType && (
        <VideoCallModal
          socket={socket}
          myId={props.doctor}
          targetId={incomingCall.from}
          targetName={incomingCall.callerName || 'Patient'}
          callType={incomingCall.type}
          isIncoming={true}
          incomingOffer={incomingCall.offer}
          onClose={() => setIncomingCall(null)}
        />
      )}

      <PrescriptionModal
        show={showPrescription}
        onClose={() => setShowPrescription(false)}
        patient={{ _id: props.user, name: props.patientName, phone: '' }}
        doctor={doctor}
      />
    </div>
  );
};

export default ChatPage;