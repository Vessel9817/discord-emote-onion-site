import express from 'express';
import { ChatController, HomeController } from '../controllers';
import { Chat, errorHandler } from '../middleware';

const router = express.Router();

// Building home routes
router.get('/', HomeController.getHome, errorHandler);

// Building chat routes
router.get('/chat', ChatController.getChat, errorHandler);
router.post('/chat/send', Chat.sendMsgValidators, ChatController.sendMsg, errorHandler);
router.post('/chat/edit', Chat.editMsgValidators, ChatController.editMsg, errorHandler);
router.post('/chat/delete', Chat.deleteMsgValidators, ChatController.deleteMsg, errorHandler);

export default router;
