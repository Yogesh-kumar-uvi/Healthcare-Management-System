import cron from "node-cron";
import appointmentModel from "../models/appointmentModel.js";
import { sendEmail } from "./sendEmail.js";

// ✅ NEW — Har din subah 8 baje (IST) check karta hai: "kal kiska appointment hai?"
// aur unhe reminder email bhejta hai.
//
// ⚠️ IMPORTANT — yeh sirf un appointments ke liye kaam karega jinka `appointmentDate`
// (real Date field) set hai — yaani slot-based booking (`/appointment/api/v1/book-slot`)
// se aaye hain. Purane free-text `day` wale appointments me real Date nahi hota,
// isliye unke liye "kal" ka calculation possible nahi hai.
const startReminderJob = () => {
    // cron pattern "0 8 * * *" = roz subah 8:00 baje
    cron.schedule(
        "0 8 * * *",
        async () => {
            console.log("⏰ Running daily appointment reminder job...");
            try {
                const now = new Date();
                const tomorrowStart = new Date(now);
                tomorrowStart.setDate(now.getDate() + 1);
                tomorrowStart.setHours(0, 0, 0, 0);

                const tomorrowEnd = new Date(tomorrowStart);
                tomorrowEnd.setHours(23, 59, 59, 999);

                const appointments = await appointmentModel
                    .find({
                        appointmentDate: { $gte: tomorrowStart, $lte: tomorrowEnd },
                        status: "Confirmed", // sirf confirmed appointments ke liye reminder bhejo
                    })
                    .populate("user", "name email")
                    .populate("doctor", "name");

                for (const appt of appointments) {
                    if (!appt.user?.email) continue;

                    await sendEmail(
                        appt.user.email,
                        "Reminder: You have an appointment tomorrow — MediCare HMS",
                        `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
                <h2 style="color:#0f6e56;">Hello ${appt.user.name},</h2>
                <p>This is a friendly reminder that you have an appointment scheduled for <b>tomorrow</b>.</p>
                <table style="width:100%;margin:16px 0;font-size:14px;">
                <tr><td style="padding:6px 0;color:#5f5e5a;">Doctor</td><td style="font-weight:600;">Dr. ${appt.doctor?.name || "—"}</td></tr>
                <tr><td style="padding:6px 0;color:#5f5e5a;">Date & Time</td><td>${appt.appointmentDate.toLocaleString("en-IN")}</td></tr>
                </table>
                <p style="margin-top:20px;color:#5f5e5a;font-size:13px;">— MediCare HMS Team</p>
            </div>`
                    );
                }

                console.log(`✅ Reminder job done — ${appointments.length} email(s) sent`);
            } catch (error) {
                console.error("❌ Reminder job failed:", error.message);
            }
        },
        { timezone: "Asia/Kolkata" } // ✅ taaki server kahin bhi (e.g. US server pe) deployed ho, 8 AM IST hi rahe
    );

    // console.log("🕐 Appointment reminder cron job scheduled (daily 8:00 AM IST)");
};

export default startReminderJob;