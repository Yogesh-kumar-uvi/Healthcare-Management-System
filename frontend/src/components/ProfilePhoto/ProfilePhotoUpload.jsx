import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { message } from "antd";
import { API_URL } from "../../config";

const ProfilePhotoUpload = ({ id, currentPhoto, userType, onUploadSuccess, initials }) => {
  const [preview, setPreview] = useState(currentPhoto || "");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // ✅ FIX — jab bhi parent se currentPhoto update ho (Redux se), preview ko bhi sync karo
  useEffect(() => {
    if (currentPhoto) {
      setPreview(currentPhoto);
    }
  }, [currentPhoto]);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      message.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      message.error("Image must be under 5MB");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      formData.append(userType === "doctor" ? "doctorID" : "userID", id);

      const response = await axios.post(
        `${API_URL}/upload/api/v1/${userType}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log("Upload response:", response.data); // ✅ DEBUG — console mein dekho exact response

      if (response.data.success) {
        const uploadedUrl = response.data.data.profilePhoto;

        if (uploadedUrl) {
          message.success("Profile photo updated!");
          setPreview(uploadedUrl); // ✅ Cloudinary se mila actual URL
          if (onUploadSuccess) onUploadSuccess(uploadedUrl);
        } else {
          message.error("Upload succeeded but no photo URL returned");
          console.error("No profilePhoto in response:", response.data);
        }
      }
    } catch (error) {
      console.error("Upload error:", error); // ✅ DEBUG
      message.error("Failed to upload photo");
      setPreview(currentPhoto || "");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ position: "relative", width: 90, height: 90 }}>
      <div
        onClick={() => fileInputRef.current.click()}
        style={{
          width: 90,
          height: 90,
          borderRadius: "50%",
          overflow: "hidden",
          cursor: "pointer",
          border: "3px solid #e8eef5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: preview ? "transparent" : "linear-gradient(135deg,#0f4c81,#00c9a7)",
          position: "relative",
        }}
      >
        {preview ? (
          <img
            src={preview}
            alt="Profile"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              console.error("Image failed to load:", preview); // ✅ DEBUG
              e.target.style.display = "none";
            }}
          />
        ) : (
          <span style={{ color: "white", fontSize: 28, fontWeight: 700 }}>
            {initials || "?"}
          </span>
        )}

        {uploading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <i className="fa-solid fa-spinner fa-spin" style={{ color: "white", fontSize: 20 }}></i>
          </div>
        )}
      </div>

      <div
        onClick={() => fileInputRef.current.click()}
        style={{
          position: "absolute",
          bottom: -2,
          right: -2,
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "#0f4c81",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          border: "2px solid white",
        }}
      >
        <i className="fa-solid fa-camera" style={{ color: "white", fontSize: 12 }}></i>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default ProfilePhotoUpload;