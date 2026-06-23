import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generatePrescriptionPDF = (data) => {
    const { doctorName, specialization, patientName, patientPhone, diagnosis, medicines, notes, date } = data;

    const doc = new jsPDF();

    // Header
    doc.setFillColor(15, 78, 86);
    doc.rect(0, 0, 210, 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("MediCare HMS", 14, 16);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Healthcare Management System", 14, 23);
    doc.text("Prescription", 14, 29);

    // Doctor info
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Dr. ${doctorName}`, 14, 45);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`${specialization}`, 14, 51);

    doc.text(`Date: ${date}`, 150, 45);

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 56, 196, 56);

    // Patient info
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Patient Name:", 14, 64);
    doc.setFont("helvetica", "normal");
    doc.text(patientName || "-", 50, 64);

    doc.setFont("helvetica", "bold");
    doc.text("Phone:", 14, 70);
    doc.setFont("helvetica", "normal");
    doc.text(patientPhone || "-", 50, 70);

    // Diagnosis
    if (diagnosis) {
        doc.setFont("helvetica", "bold");
        doc.text("Diagnosis:", 14, 78);
        doc.setFont("helvetica", "normal");
        doc.text(diagnosis, 50, 78);
    }

    // Medicines table
    autoTable(doc, {
        startY: 86,
        head: [["#", "Medicine", "Dosage", "Frequency", "Duration"]],
        body: medicines.map((m, i) => [i + 1, m.name, m.dosage, m.frequency, m.duration]),
        headStyles: { fillColor: [15, 78, 86], textColor: 255, fontSize: 10 },
        bodyStyles: { fontSize: 9 },
        theme: "grid",
    });

    // Notes
    const finalY = doc.lastAutoTable.finalY || 86;
    if (notes) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("Additional Notes:", 14, finalY + 12);
        doc.setFont("helvetica", "normal");
        doc.text(notes, 14, finalY + 18, { maxWidth: 180 });
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
        "This is a digitally generated prescription from MediCare HMS.",
        14,
        285
    );

    // Download
    doc.save(`Prescription_${patientName?.replace(/\s+/g, "_") || "patient"}_${Date.now()}.pdf`);
};