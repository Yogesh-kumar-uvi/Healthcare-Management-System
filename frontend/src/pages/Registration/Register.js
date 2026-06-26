import React, { useState } from "react";
import { Form, Button, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { message } from "antd";
import { API_URL } from '../../config'
import { useDispatch } from "react-redux";
import { setUser } from "../../Redux/UserSlice";
import { hideLoading, showLoading } from "../../Redux/AlertSlice";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const [showModal, setShowModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

   
    if (name === "phone") {
      const numericValue = value.replace(/[^0-9]/g, "");
      setFormData((prevState) => ({
        ...prevState,
        [name]: numericValue,
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Naam zaroori hai";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) newErrors.email = "Email zaroori hai";
    else if (!emailRegex.test(formData.email))
      newErrors.email = "Valid email likho (example@gmail.com)";

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.phone.trim()) newErrors.phone = "Phone zaroori hai";
    else if (!phoneRegex.test(formData.phone))
      newErrors.phone = "Valid 10 digit Indian mobile number likho";

    if (!formData.password.trim()) newErrors.password = "Password zaroori hai";
    else if (formData.password.length < 6)
      newErrors.password = "Password kam se kam 6 characters hona chahiye";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/user/api/v1/register`,formData
      );
      if (response.status === 200) {
        setShowModal(true);
        dispatch(showLoading());
        const res = await axios.post(
      `${API_URL}/user/api/v1/login`,formData
        );
        dispatch(hideLoading());
        if (res.data.success) {
          // ✅ UPDATED — cookie backend ne set kar diya, localStorage nahi chahiye
          const res2 = await axios.post(`${API_URL}/user/api/v1/getUserData`);
          if (res2.data.success) {
            dispatch(setUser(res2.data.data));
          }
          message.success("Login Successfully");
          navigate("/User");
        }
      } else if (response.status === 400) {
        message.error("Account already exists.");
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || "Registration failed.";
      message.error(errMsg);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    navigate("/");
  };

  const errorText = (field) =>
    errors[field] ? (
      <div style={{ color: "#dc2626", fontSize: 12, marginTop: 4 }}>
        ⚠️ {errors[field]}
      </div>
    ) : null;

  return (
    <>
      <Form onSubmit={handleSubmit} noValidate autoComplete="off">
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
            isInvalid={!!errors.name}
          />
          {errorText("name")}
          <Form.Text className="text-muted">
            We'll never share your data with anyone else.
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            isInvalid={!!errors.email}
          />
          {errorText("email")}
          <Form.Text className="text-muted">
            We'll never share your email with anyone else.
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3" controlId="phone">
          <Form.Label>Phone</Form.Label>
          <Form.Control
            type="tel"
            name="phone"
            placeholder="Enter your phone"
            value={formData.phone}
            onChange={handleChange}
            maxLength={10}
            isInvalid={!!errors.phone}
          />
          {errorText("phone")}
          <Form.Text className="text-muted">
            We'll never share your contact with anyone else.
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            placeholder="Password (min 6 characters)"
            value={formData.password}
            onChange={handleChange}
            isInvalid={!!errors.password}
          />
          {errorText("password")}
        </Form.Group>

        <Form.Group className="mb-3" controlId="exampleCheck1">
          <Form.Check type="checkbox" label="Check me out" />
        </Form.Group>
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>

      {/* Modal for showing the "Registration successful" message */}
      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Registration successful</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Your registration was successful. You can now login with your
          credentials.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>   
    </>
  );
};

export default Register;