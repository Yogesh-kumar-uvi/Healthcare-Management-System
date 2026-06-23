import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { message } from "antd"; // ✅ NEW import
import { API_URL } from "../../config";
import { generatePrescriptionPDF } from "../../utils/generatePrescriptionPDF";
import "../../styles/User.css";

const MyPrescriptions = () => {
    const { user } = useSelector((state) => state.user);
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrescriptions = async () => {
            try {
                const response = await axios.get(
                    `${API_URL}/prescription/api/v1/patient/${user.id}`
                );
                if (response.data.success) {
                    setPrescriptions(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching prescriptions:", error);
                message.error("Failed to load prescriptions."); // ✅ FIX — user ko bataya
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchPrescriptions();
    }, [user]);

    const handleDownload = (prescription) => {
        try { // ✅ NEW — PDF generation bhi fail ho sakti hai
            generatePrescriptionPDF({
                doctorName: prescription.doctor?.name,
                specialization: prescription.doctor?.specialization,
                patientName: user.name,
                patientPhone: user.phone || "",
                diagnosis: prescription.diagnosis,
                medicines: prescription.medicines,
                notes: prescription.notes,
                date: new Date(prescription.createdAt).toLocaleDateString("en-IN"),
            });
        } catch (error) {
            console.error("PDF generation error:", error); // ✅ NEW
            message.error("Failed to generate PDF."); // ✅ NEW
        }
    };

    if (loading) {
        return (
            <div className="loading-state">
                <i className="fa-solid fa-spinner fa-spin loading-icon"></i>
                Loading prescriptions...
            </div>
        );
    }

    if (prescriptions.length === 0) {
        return (
            <div className="no-patients">
                <div className="no-patients-icon">💊</div>
                <div className="no-patients-title">No Prescriptions Yet</div>
                <div className="no-patients-sub">
                    Prescriptions written by your doctors will appear here
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="hc-card-title">
                <i className="fa-solid fa-file-prescription"></i> My Prescriptions
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {prescriptions.map((p) => (
                    <div key={p._id} className="hc-card">
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                marginBottom: 14,
                                flexWrap: "wrap",
                                gap: 10,
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: "50%",
                                        background: "linear-gradient(135deg,#0f4c81,#00c9a7)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "white",
                                        fontWeight: 700,
                                        fontSize: 16,
                                    }}
                                >
                                    {p.doctor?.name?.[0]?.toUpperCase() || "D"}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 15 }}>
                                        Dr. {p.doctor?.name}
                                    </div>
                                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                                        {p.doctor?.specialization} ·{" "}
                                        {new Date(p.createdAt).toLocaleDateString("en-IN")}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleDownload(p)}
                                style={{
                                    padding: "8px 16px",
                                    borderRadius: 8,
                                    background: "linear-gradient(135deg,#7c3aed,#9333ea)",
                                    color: "white",
                                    border: "none",
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                }}
                            >
                                <i className="fa-solid fa-file-pdf"></i> Download PDF
                            </button>
                        </div>

                        {p.diagnosis && (
                            <div style={{ marginBottom: 10, fontSize: 13 }}>
                                <span style={{ fontWeight: 600, color: "#374151" }}>
                                    Diagnosis:{" "}
                                </span>
                                <span style={{ color: "#6b7280" }}>{p.diagnosis}</span>
                            </div>
                        )}

                        <div
                            style={{
                                background: "#f8fafc",
                                borderRadius: 10,
                                padding: 12,
                                marginBottom: p.notes ? 10 : 0,
                            }}
                        >
                            {p.medicines.map((med, i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        padding: "6px 0",
                                        borderBottom:
                                            i !== p.medicines.length - 1
                                                ? "1px solid #e8eef5"
                                                : "none",
                                        fontSize: 13,
                                    }}
                                >
                                    <span style={{ fontWeight: 600, color: "#1a1a2e" }}>
                                        {med.name}
                                    </span>
                                    <span style={{ color: "#6b7280" }}>
                                        {med.dosage} · {med.frequency} · {med.duration}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {p.notes && (
                            <div style={{ fontSize: 13, color: "#6b7280" }}>
                                <span style={{ fontWeight: 600, color: "#374151" }}>
                                    Notes:{" "}
                                </span>
                                {p.notes}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyPrescriptions;