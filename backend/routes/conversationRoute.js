import express from 'express'
import { doctorSendMessage, 
        getMessages, 
        userSendMessage 
} from '../controllers/conversationController.js';

const router = express.Router();

router.post("/userSend",userSendMessage)
router.post("/doctorSend",doctorSendMessage)
router.get("/getMessages",getMessages)

export default router;