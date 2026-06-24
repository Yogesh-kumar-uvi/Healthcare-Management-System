import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useSelector } from "react-redux";
import { message } from "antd"; // ✅ NEW import
import { API_URL } from '../../config';

const Payment = () => {
  const [paymentLista, setPaymentList] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ NEW
  const { doctor } = useSelector((state) => state.doctor);

  const paymentListFunction = async () => {
    try {
      const paymentList = await axios.get(`${API_URL}/appointment/api/v1/get-payment-list/${doctor._id}`)
      if (paymentList.status === 200 && paymentList.data.data) {
        setPaymentList(paymentList.data.data.reverse());
      }
    } catch (error) {
      console.error("Payment fetch error:", error);
      message.error("Failed to load payment records."); // ✅ FIX — user ko bataya
    } finally {
      setLoading(false); // ✅ NEW
    }
  }

  useEffect(() => { paymentListFunction() }, [doctor]) // ✅ FIX — dependency array mein doctor add kiya

  // ✅ NEW — loading state
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 28, marginBottom: 12, display: 'block' }}></i>
        Loading payment records...
      </div>
    );
  }

  return (
    <>
      {paymentLista.length > 0 ? (
        <div>
          {paymentLista.map((p, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '16px 0', borderBottom: '1px solid #f0f5fb'
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: '#f0f7ff', color: '#0f4c81',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
              }}>
                <i className="fa-solid fa-money-check-dollar"></i>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e' }}>{p.userId?.name}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                  +91-{p.userId?.phone} &nbsp;·&nbsp; {String(p.updatedAt).substring(0, 10)} {String(p.updatedAt).substring(11, 16)}
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>ID: {p._id}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#0f4c81' }}>₹{p.totalAmount}</div>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                  background: p.paymentStatus === 'Fully Paid' ? '#dcfce7' : '#fef9c3',
                  color: p.paymentStatus === 'Fully Paid' ? '#16a34a' : '#ca8a04'
                }}>{p.paymentStatus}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
          <i className="fa-solid fa-money-bill-wave" style={{ fontSize: 36, marginBottom: 12, display: 'block' }}></i>
          No Payment Records Found
        </div>
      )}
    </>
  )
}

export default Payment