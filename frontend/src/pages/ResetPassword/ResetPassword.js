import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { message } from "antd";
import { API_URL } from "../../config";

// ✅ NEW — Step 2 of forgot-password flow: user link se aaya, ab naya password set karega
// :token URL me hi aata hai (email me jo link bheja gaya tha usi se)
const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 6) {
            message.error("Password must be at least 6 characters");
            return;
        }
        if (password !== confirmPassword) {
            message.error("Passwords do not match");
            return;
        }
        setSubmitting(true);
        try {
            const res = await axios.put(`${API_URL}/user/api/v1/reset-password/${token}`, { password });
            if (res.data.success) {
                message.success(res.data.message);
                navigate("/"); // login page pe wapas bhej do
            } else {
                message.error(res.data.message || "Reset failed");
            }
        } catch (error) {
            // ✅ Yahi error aayega agar token expire ho gaya ho ya invalid ho
            message.error(error.response?.data?.message || "Reset link is invalid or has expired");
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
                    Reset Password
                </div>
                <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>
                    Enter your new password below.
                </div>

                <Form onSubmit={handleSubmit} noValidate>
                    <Form.Group className="mb-3">
                        <Form.Label>New Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Enter new password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Re-enter new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit" disabled={submitting} style={{ width: "100%" }}>
                        {submitting ? "Resetting..." : "Reset Password"}
                    </Button>
                </Form>

                <div style={{ marginTop: 18, textAlign: "center", fontSize: 13 }}>
                    <Link to="/">← Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;