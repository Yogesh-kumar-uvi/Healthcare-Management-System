import express from "express";
import {
  allNotification,
  getNotification,
  notificationSeen,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/getNotification", getNotification);
router.get("/:userID", allNotification);
router.put("/", notificationSeen);

export default router;
