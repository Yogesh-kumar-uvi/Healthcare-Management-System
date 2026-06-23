import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import { message } from "antd";
import { API_URL } from "../../config";
import { generatePrescriptionPDF } from "../../utils/generatePrescriptionPDF";

const PrescriptionModal = ({ show, onClose, patient, doctor }) => {
    const [diagnosis, setDiagnosis] = useState("");
    const [notes, setNotes] = useState("");
    const [medicines, setMedicines] = useState([
        { name: "", dosage: "", frequency: "", duration: "" },
    ]);
    const [saving, setSaving] = useState(false);

    const handleMedicineChange = (index, field, value) => {
        const updated = [...medicines];
        updated[index][field] = value;
        setMedicines(updated);
    };

    const addMedicineRow = () => {
        setMedicines([...medicines, { name: "", dosage: "", frequency: "", duration: "" }]);
    };

    const removeMedicineRow = (index) => {
        if (medicines.length === 1) return;
        setMedicines(medicines.filter((_, i) => i !== index));
    };

    const resetForm = () => {
        setDiagnosis("");
        setNotes("");
        setMedicines([{ name: "", dosage: "", frequency: "", duration: "" }]);
    };

    const handleSubmit = async () => {
        const isValid = medicines.every(
            (m) => m.name.trim() && m.dosage.trim() && m.frequency.trim() && m.duration.trim()
        );
        if (!isValid) {
            message.error("Please fill all medicine fields");
            return;
        }

        if (!patient?._id || !doctor?._id) { // ✅ NEW — safety check
            message.error("Missing patient or doctor information.");
            return;
        }

        setSaving(true);
        try {
            const response = await axios.post(`${API_URL}/prescription/api/v1`, {
                userID: patient._id,
                doctorID: doctor._id,
                diagnosis,
                medicines,
                notes,
            });

            if (response.data.success) {
                message.success("Prescription saved successfully");

                generatePrescriptionPDF({
                    doctorName: doctor.name,
                    specialization: doctor.specialization,
                    patientName: patient.name,
                    patientPhone: patient.phone,
                    diagnosis,
                    medicines,
                    notes,
                    date: new Date().toLocaleDateString("en-IN"),
                });

                resetForm();
                onClose();
            }
        } catch (error) {
            console.error("Prescription save error:", error); // ✅ FIX — log add kiya
            // ✅ FIX — backend ka specific error dikhao
            message.error(error.response?.data?.message || "Failed to save prescription. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal show={show} onHide={onClose} centered size="lg">
            <Modal.Header closeButton style={{ background: "linear-gradient(135deg,#0f4c81,#1a6bb5)", color: "white" }}>
                <Modal.Title>
                    <i className="fa-solid fa-file-prescription" style={{ marginRight: 8 }}></i>
                    Write Prescription — {patient?.name}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body style={{ padding: 24 }}>
                <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: 600, fontSize: 13 }}>Diagnosis</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="e.g. Viral Fever, Migraine, etc."
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                    />
                </Form.Group>

                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>
                    Medicines <span style={{ color: "#dc2626" }}>*</span>
                </div>

                {medicines.map((med, index) => (
                    <div
                        key={index}
                        style={{
                            display: "flex",
                            gap: 8,
                            marginBottom: 10,
                            alignItems: "center",
                            flexWrap: "wrap",
                        }}
                    >
                        <Form.Control
                            placeholder="Medicine name"
                            value={med.name}
                            onChange={(e) => handleMedicineChange(index, "name", e.target.value)}
                            style={{ flex: 2, minWidth: 120 }}
                        />
                        <Form.Control
                            placeholder="Dosage (e.g. 500mg)"
                            value={med.dosage}
                            onChange={(e) => handleMedicineChange(index, "dosage", e.target.value)}
                            style={{ flex: 1.5, minWidth: 100 }}
                        />
                        <Form.Control
                            placeholder="Frequency (e.g. 2x/day)"
                            value={med.frequency}
                            onChange={(e) => handleMedicineChange(index, "frequency", e.target.value)}
                            style={{ flex: 1.5, minWidth: 100 }}
                        />
                        <Form.Control
                            placeholder="Duration (e.g. 5 days)"
                            value={med.duration}
                            onChange={(e) => handleMedicineChange(index, "duration", e.target.value)}
                            style={{ flex: 1.5, minWidth: 100 }}
                        />
                        <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => removeMedicineRow(index)}
                            disabled={medicines.length === 1}
                        >
                            <i className="fa-solid fa-trash"></i>
                        </Button>
                    </div>
                ))}

                <Button variant="outline-primary" size="sm" onClick={addMedicineRow} style={{ marginBottom: 16 }}>
                    <i className="fa-solid fa-plus"></i> Add Medicine
                </Button>

                <Form.Group className="mb-2">
                    <Form.Label style={{ fontWeight: 600, fontSize: 13 }}>Additional Notes</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Any additional instructions for the patient..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </Form.Group>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="outline-secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={saving}
                    style={{ background: "linear-gradient(135deg,#0f4c81,#1a6bb5)", border: "none" }}
                >
                    {saving ? "Saving..." : (
                        <>
                            <i className="fa-solid fa-file-pdf" style={{ marginRight: 6 }}></i>
                            Save & Download PDF
                        </>
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default PrescriptionModal;