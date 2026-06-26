import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom';
import axios from 'axios'
import { useSelector, useDispatch } from 'react-redux';
import { hideLoading, showLoading } from '../../Redux/AlertSlice';
import { setUser } from '../../Redux/UserSlice';
import { API_URL } from '../../config';

export default function ProtectedRoute({ children }) {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user);
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (user) {
      setAuthed(true);
      setChecking(false);
      return;
    }

    const getUser = async () => {
      try {
        dispatch(showLoading());
        const res = await axios.post(
          `${API_URL}/user/api/v1/getUserData`,
          {},
          { withCredentials: true }
        );
        if (res.data.success) {
          dispatch(setUser(res.data.data));
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
    getUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (checking) return null;
  return authed ? children : <Navigate to="/" />;
}