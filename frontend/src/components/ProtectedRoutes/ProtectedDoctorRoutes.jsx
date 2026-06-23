import React, {useEffect} from 'react'
import { Navigate } from 'react-router-dom';
import axios from 'axios'
import {useSelector, useDispatch} from 'react-redux';
import { hideLoading, showLoading } from '../../Redux/AlertSlice';
import { setDoctor } from '../../Redux/DoctorSlice'; 

export default function ProtectedDoctorRoute({children}) {
  const dispatch = useDispatch()
  const {doctor} = useSelector(state => state.doctor)

  // get doctor
  const getDoctor = async() =>{
    try {
      dispatch(showLoading())
      const res = await axios.post('http://localhost:8081/doctor/api/v1/getDoctor',
      { token : localStorage.getItem('token')},
      {
        headers:{
          authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
      )
      if (res.data.success) {
        dispatch(setDoctor(res.data.data))
      }else{
        <Navigate to="/Home" />
      }
      dispatch(hideLoading())
    } catch (error) {
    //   dispatch(hideLoading())
      console.log(error);
    }
  }
  useEffect(()=>{
    if(!doctor){
      getDoctor();
    }
  },[])

  if (localStorage.getItem("token")) {
    return children;
  } else {
    return <Navigate to="/" />;
  }
}
