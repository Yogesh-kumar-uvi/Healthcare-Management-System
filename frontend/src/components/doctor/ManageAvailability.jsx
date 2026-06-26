import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { message } from 'antd'
import { API_URL } from '../../config'

const ManageAvailability = () => {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('13:00');
  const [slotDuration, setSlotDuration] = useState(30);
  const [generating, setGenerating] = useState(false);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const fetchSlots = async (selectedDate) => {
    if (!selectedDate) { setSlots([]); return; }
    setLoadingSlots(true);
    try {
      const resp = await axios.post(
        `${API_URL}/slot/api/v1/my-slots`,
        { date: selectedDate },
        { withCredentials: true }  // ✅ FIX
      );
      if (resp.data.success) setSlots(resp.data.data);
    } catch (error) {
      message.error("Failed to load slots");
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => { fetchSlots(date); }, [date]);

  const handleGenerate = async () => {
    if (!date || !startTime || !endTime || !slotDuration) {
      message.error("Please fill all fields");
      return;
    }
    setGenerating(true);
    try {
      const resp = await axios.post(
        `${API_URL}/slot/api/v1/generate`,
        { date, startTime, endTime, slotDuration },
        { withCredentials: true }  // ✅ FIX
      );
      if (resp.data.success) {
        message.success(resp.data.message);
        fetchSlots(date);
      } else {
        message.error(resp.data.message || "Could not generate slots");
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (slotId) => {
    try {
      const resp = await axios.delete(
        `${API_URL}/slot/api/v1/${slotId}`,
        { withCredentials: true }  // ✅ FIX
      );
      if (resp.data.success) {
        message.success("Slot removed");
        setSlots(prev => prev.filter(s => s._id !== slotId));
      } else {
        message.error(resp.data.message || "Could not delete slot");
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Slot booked hai, delete nahi ho sakta");
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 20, padding: 16, background: '#f7fafc', borderRadius: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 12, color: '#0f4c81' }}>
          Generate New Slots
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>Date</label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ padding: '8px 10px', borderRadius: 8, border: '1.5px solid #e2e8f0' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              style={{ padding: '8px 10px', borderRadius: 8, border: '1.5px solid #e2e8f0' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              style={{ padding: '8px 10px', borderRadius: 8, border: '1.5px solid #e2e8f0' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>Slot Duration (min)</label>
            <select
              value={slotDuration}
              onChange={(e) => setSlotDuration(Number(e.target.value))}
              style={{ padding: '8px 10px', borderRadius: 8, border: '1.5px solid #e2e8f0' }}
            >
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={45}>45</option>
              <option value={60}>60</option>
            </select>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          style={{
            padding: '10px 20px', borderRadius: 8, border: 'none',
            background: '#0f4c81', color: 'white', fontWeight: 700, cursor: 'pointer',
          }}
        >
          {generating ? "Generating..." : "Generate Slots"}
        </button>
        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
          E.g. 10:00 - 13:00 with 30 min duration → 6 slots (10:00, 10:30, 11:00 ... 12:30) automatically ban jaayenge.
        </div>
      </div>

      {date && (
        <div>
          <div style={{ fontWeight: 700, marginBottom: 10, color: '#1a1a2e' }}>
            Slots for {date}
          </div>
          {loadingSlots ? (
            <div style={{ color: '#6b7280', fontSize: 13 }}>Loading...</div>
          ) : slots.length === 0 ? (
            <div style={{ color: '#6b7280', fontSize: 13 }}>No slots yet for this date. Generate some above.</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {slots.map((slot) => (
                <div
                  key={slot._id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 12px', borderRadius: 8,
                    background: slot.isBooked ? '#fef2f2' : '#f0fdf9',
                    border: `1.5px solid ${slot.isBooked ? '#fecaca' : '#bbf7d0'}`,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: slot.isBooked ? '#dc2626' : '#16a34a' }}>
                    {slot.time} {slot.isBooked ? '(Booked)' : '(Free)'}
                  </span>
                  {!slot.isBooked && (
                    <button
                      onClick={() => handleDelete(slot._id)}
                      title="Remove this slot"
                      style={{ border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer', fontSize: 13 }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageAvailability;