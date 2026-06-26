import React, { useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../Redux/UserSlice";
import { message } from "antd";
import { API_URL } from "../../config";
import ProfilePhotoUpload from "../ProfilePhoto/ProfilePhotoUpload";

const MyProfile = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.user);
    const [edit, setEdit] = useState(false);
    const [saving, setSaving] = useState(false); // ✅ NEW
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
    });

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setSaving(true); // ✅ NEW
        try {
            const response = await axios.put(
                `${API_URL}/user/api/v1/updateUserProfile`,
                { userID: user.id, ...formData }
                // ✅ UPDATED — auth header ki zaroorat nahi, cookie automatically jaati hai
            );
            if (response.data.success) {
                dispatch(setUser({ ...user, ...response.data.data }));
                message.success("Profile updated successfully");
                setEdit(false);
            }
        } catch (error) {
            console.error("Profile update error:", error); // ✅ FIX — log add kiya
            // ✅ FIX — backend ka specific error dikhao
            message.error(error.response?.data?.message || "Failed to update profile. Please try again.");
        } finally {
            setSaving(false); // ✅ NEW
        }
    };

    return (
        <div className="hc-card" style={{ maxWidth: 560 }}>
            <div className="hc-card-title">
                <i className="fa-solid fa-user-circle"></i> My Profile
            </div>

            {/* Photo */}
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 24 }}>
                <ProfilePhotoUpload
                    id={user.id}
                    currentPhoto={user.profilePhoto}
                    userType="user"
                    initials={getInitials(user.name)}
                    onUploadSuccess={(newPhotoUrl) => {
                        dispatch(setUser({ ...user, profilePhoto: newPhotoUrl }));
                    }}
                />
                <div>
                    <div style={{ fontWeight: 700, fontSize: 17, color: "#1a1a2e" }}>
                        {user?.name}
                    </div>
                    <div style={{ fontSize: 13, color: "#6b7280" }}>Patient</div>
                </div>
            </div>

            {/* Fields */}
            {edit ? (
                <>
                    <div className="mb-3">
                        <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, display: "block" }}>
                            Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            style={{
                                width: "100%",
                                padding: "9px 12px",
                                borderRadius: 8,
                                border: "1.5px solid #e8eef5",
                                fontSize: 14,
                            }}
                        />
                    </div>
                    <div className="mb-3">
                        <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, display: "block" }}>
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            style={{
                                width: "100%",
                                padding: "9px 12px",
                                borderRadius: 8,
                                border: "1.5px solid #e8eef5",
                                fontSize: 14,
                            }}
                        />
                    </div>
                    <div className="mb-3">
                        <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, display: "block" }}>
                            Phone
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            maxLength={10}
                            style={{
                                width: "100%",
                                padding: "9px 12px",
                                borderRadius: 8,
                                border: "1.5px solid #e8eef5",
                                fontSize: 14,
                            }}
                        />
                    </div>
                    <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                        <button
                            onClick={handleSave}
                            disabled={saving} // ✅ NEW
                            style={{
                                padding: "10px 24px",
                                borderRadius: 10,
                                background: "linear-gradient(135deg,#0f4c81,#1a6bb5)",
                                color: "white",
                                border: "none",
                                fontWeight: 700,
                                cursor: "pointer",
                                opacity: saving ? 0.7 : 1, // ✅ NEW
                            }}
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                            onClick={() => setEdit(false)}
                            style={{
                                padding: "10px 24px",
                                borderRadius: 10,
                                background: "white",
                                color: "#6b7280",
                                border: "1.5px solid #e8eef5",
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f0f5fb" }}>
                            <span style={{ color: "#6b7280", fontSize: 13 }}>Name</span>
                            <span style={{ fontWeight: 600, fontSize: 13 }}>{user?.name}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f0f5fb" }}>
                            <span style={{ color: "#6b7280", fontSize: 13 }}>Email</span>
                            <span style={{ fontWeight: 600, fontSize: 13 }}>{user?.email}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0" }}>
                            <span style={{ color: "#6b7280", fontSize: 13 }}>Phone</span>
                            <span style={{ fontWeight: 600, fontSize: 13 }}>{user?.phone}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setEdit(true)}
                        style={{
                            marginTop: 20,
                            padding: "10px 24px",
                            borderRadius: 10,
                            background: "linear-gradient(135deg,#0f4c81,#1a6bb5)",
                            color: "white",
                            border: "none",
                            fontWeight: 700,
                            cursor: "pointer",
                        }}
                    >
                        Edit Profile
                    </button>
                </>
            )}
        </div>
    );
};

export default MyProfile;