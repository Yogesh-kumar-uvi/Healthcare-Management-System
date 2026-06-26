import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import { Link } from "react-router-dom";
import { message } from "antd";
import { API_URL } from "../../config";

// ✅ NEW — Step 1 of forgot-password flow: user apna email deta hai
const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) {
            message.error("Please enter your email");
            return;
        }
        setSubmitting(true);
        try {
            const res = await axios.post(`${API_URL}/user/api/v1/forgot-password`, { email });
            if (res.data.success) {
                setSent(true);
                message.success(res.data.message);
            }
        } catch (error) {
            message.error(error.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(135deg,#0a3460,#00c9a7)", padding: 20,
        }}>
            <div style={{
                background: "white", borderRadius: 16, padding: 36, width: "100%", maxWidth: 420,
                boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
            }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#0f4c81", marginBottom: 6 }}>
                    Forgot Password?
                </div>
                <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>
                    Enter your registered email — we'll send you a link to reset your password. The link is valid for 10 minutes.
                </div>

                {sent ? (
                    <div style={{ fontSize: 14, color: "#16a34a", background: "#f0fdf9", padding: 14, borderRadius: 10 }}>
                        ✅ If this email is registered, a reset link has been sent. Please check your inbox (and spam folder).
                    </div>
                ) : (
                    <Form onSubmit={handleSubmit} noValidate>
                        <Form.Group className="mb-3">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" disabled={submitting} style={{ width: "100%" }}>
                            {submitting ? "Sending..." : "Send Reset Link"}
                        </Button>
                    </Form>
                )}

                <div style={{ marginTop: 18, textAlign: "center", fontSize: 13 }}>
                    <Link to="/">← Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;