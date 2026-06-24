import { message } from "antd";
import axios from "axios";
import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { API_URL } from '../../config'
import { setDoctor } from "../../Redux/DoctorSlice";

const DoctorLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({}); 
  const [submitting, setSubmitting] = useState(false); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" })); // ✅ NEW
  };

  // ✅ NEW — basic validation
  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email zaroori hai";
    if (!formData.password.trim()) newErrors.password = "Password zaroori hai";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true); 
    try {
      const res = await axios.post(
        `${API_URL}/doctor/api/v1/login`,
        formData
      );
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        const res2 = await axios.post(
          `${API_URL}/doctor/api/v1/getDoctor`,
          { token: localStorage.getItem("token") },
          {
            headers: {
              authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.data.success) {
          dispatch(setDoctor(res2.data.data));
        }
        message.success("Login Successfully");
        navigate("/Doctor");
      } else {
        
        message.error(res.data.message || "Enter correct credentials");
      }
    } catch (error) {
      console.error("Doctor login error:", error);
      
      const errMsg = error.response?.data?.message || "Something went wrong. Please try again.";
      message.error(errMsg);
    } finally {
      setSubmitting(false); 
    }
  };

  return (
    <>
      <Form onSubmit={handleSubmit} noValidate>
        <Form.Group className="mb-3" controlId="exampleInputEmail1">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            name="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
            isInvalid={!!errors.email} 
          />
          {errors.email && (
            <div style={{ color: "#dc2626", fontSize: 12, marginTop: 4 }}>
              ⚠️ {errors.email}
            </div>
          )}
          <Form.Text className="text-muted">
            We'll never share your email with anyone else.
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3" controlId="exampleInputPassword1">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            isInvalid={!!errors.password} 
          />
          {errors.password && ( 
            <div style={{ color: "#dc2626", fontSize: 12, marginTop: 4 }}>
              ⚠️ {errors.password}
            </div>
          )}
        </Form.Group>

        <Form.Group className="mb-3" controlId="exampleCheck1">
          <Form.Check type="checkbox" label="Check me out" />
        </Form.Group>

        <Button variant="primary" type="submit" disabled={submitting}>
          {submitting ? "Logging in..." : "Submit"} {/* ✅ NEW */}
        </Button>
      </Form>
    </>
  );
};

export default DoctorLogin;