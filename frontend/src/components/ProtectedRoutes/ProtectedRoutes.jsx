import React, {useEffect} from 'react'
import { Navigate } from 'react-router-dom';
import axios from 'axios'
import {useSelector, useDispatch} from 'react-redux';
import { hideLoading, showLoading } from '../../Redux/AlertSlice';
import { setUser } from '../../Redux/UserSlice'; 

export default function ProtectedRoute({children}) {
  const dispatch = useDispatch()
  const {user} = useSelector(state => state.user)
  console.log(user);

  // get user
  const getUser = async() =>{
    try {
      dispatch(showLoading())
      const res = await axios.post('http://localhost:8081/user/api/v1/getUserData',
      { token : localStorage.getItem('token')},
      {
        headers:{
          authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
      )
      if (res.data.success) {
        dispatch(setUser(res.data.data))
      }else{
        <Navigate to="/login" />
      }
      dispatch(hideLoading())
    } catch (error) {
    //   dispatch(hideLoading())
      console.log(error);
    }
  }
  useEffect(()=>{
    if(!user){
      getUser();
    }
  },[])

  if (localStorage.getItem("token")) {
    return children;
  } else {
    return <Navigate to="/" />;
  }
}
