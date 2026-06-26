import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom';
import axios from 'axios'
import { useSelector, useDispatch } from 'react-redux';
import { hideLoading, showLoading } from '../../Redux/AlertSlice';
import { setDoctor } from '../../Redux/DoctorSlice';
import { API_URL } from '../../config';

export default function ProtectedDoctorRoute({ children }) {
  const dispatch = useDispatch();
  const { doctor } = useSelector(state => state.doctor);
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (doctor) {
      setAuthed(true);
      setChecking(false);
      return;
    }

    const getDoctor = async () => {
      try {
        dispatch(showLoading());
        const res = await axios.post(
          `${API_URL}/doctor/api/v1/getDoctor`,
          {},
          { withCredentials: true }
        );
        if (res.data.success) {
          dispatch(setDoctor(res.data.data));
          setAuthed(true);
        } else {
          setAuthed(false);
        }
      } catch (error) {
        setAuthed(false);
      } finally {
        dispatch(hideLoading());
        setChecking(false);
      }
    };
    getDoctor();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (checking) return null;
  return authed ? children : <Navigate to="/" />;
}