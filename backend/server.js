import express from "express";
import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import { Server } from "socket.io";
import connectDb from "./config/configDB.js";
import userRoutes from "./routes/userRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoute from "./routes/appointmentRoutes.js";
import notificationRoute from "./routes/notificationRoutes.js";
import conversationRoute from "./routes/conversationRoute.js";
import doctorModel from "./models/doctorModel.js";
import prescriptionRoute from "./routes/prescriptionRoutes.js";
import uploadRoute from "./routes/uploadRoutes.js";
import slotRoute from "./routes/slotRoutes.js"; // ✅ NEW
import startReminderJob from "./utils/reminderJob.js"; // ✅ NEW
import cors from "cors";
import cookieParser from "cookie-parser"; // ✅ NEW
import { razorpayWebhook } from "./controllers/appointmentController.js"; // ✅ NEW

const app = express();

// ✅ FIX — CORS env variable se, fallback localhost
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

const PORT = process.env.PORT || 8080;
const MongoDBURI = process.env.MONGO_URI;

// ✅ NEW — Razorpay Webhook route
// ⚠️ IMPORTANT: yeh express.json() se PEHLE hona chahiye, kyunki signature
// verify karne ke liye raw bytes chahiye, parsed JSON object nahi.
app.post(
  "/appointment/api/v1/webhook",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);

// Middlewares
app.use(express.json());
app.use(cookieParser()); // ✅ NEW — cookie se token padhne ke liye
// app.use(morgan("dev"));

// Connect MongoDB
connectDb(MongoDBURI);

// Routes
app.use("/user/api/v1", userRoutes);
app.use("/doctor/api/v1", doctorRoutes);
app.use("/appointment/api/v1", appointmentRoute);
app.use("/notification/api/v1", notificationRoute);
app.use("/conversation/api/v1", conversationRoute);
app.use("/prescription/api/v1", prescriptionRoute);
app.use("/upload/api/v1", uploadRoute);
app.use("/slot/api/v1", slotRoute); // ✅ NEW

// ✅ HTTP server + Socket.io
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// ✅ Online users track karo — { userId: socketId }
const onlineUsers = new Map();

io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("sendMessage", ({ userID, doctorID, message, sender }) => {
    const msgData = {
      messages: {
        sender,
        message,
        timestamp: new Date()
      }
    };

    if (sender === "user") {
      const doctorSocket = onlineUsers.get(doctorID);
      if (doctorSocket) {
        io.to(doctorSocket).emit("receiveMessage", msgData);
      }
    } else {
      const userSocket = onlineUsers.get(userID);
      if (userSocket) {
        io.to(userSocket).emit("receiveMessage", msgData);
      }
    }
  });

  socket.on("checkOnline", (targetId, callback) => {
    if (typeof callback === "function") {
      callback(onlineUsers.has(targetId));
    }
  });

  socket.on("callUser", ({ from, to, offer, callType, callerName }) => {
    const targetSocket = onlineUsers.get(to);
    if (targetSocket) {
      io.to(targetSocket).emit("incomingCall", { from, offer, callType, callerName });
    } else {
      socket.emit("callFailed", { message: "User is offline" });
    }
  });

  socket.on("answerCall", ({ from, to, answer }) => {
    const targetSocket = onlineUsers.get(to);
    if (targetSocket) {
      io.to(targetSocket).emit("callAccepted", { from, answer });
    }
  });

  socket.on("iceCandidate", ({ to, candidate }) => {
    const targetSocket = onlineUsers.get(to);
    if (targetSocket) {
      io.to(targetSocket).emit("iceCandidate", { candidate });
    }
  });

  socket.on("rejectCall", ({ to }) => {
    const targetSocket = onlineUsers.get(to);
    if (targetSocket) {
      io.to(targetSocket).emit("callRejected");
    }
  });

  socket.on("endCall", ({ to }) => {
    const targetSocket = onlineUsers.get(to);
    if (targetSocket) {
      io.to(targetSocket).emit("callEnded");
    }
  });

  socket.on("disconnect", async () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        try {
          await doctorModel.findByIdAndUpdate(userId, { online: false });
        } catch (e) {}
      }
    }
  });
});

httpServer.listen(
  PORT,
  () => console.log(`Server running on port ${PORT}`)
);

startReminderJob(); 