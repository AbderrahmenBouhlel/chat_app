const express = require('express');
const messageController = require('../controllers/messageController');



const messageRouter = express.Router();

messageRouter.post('/createmessage' , messageController.createMessage)
messageRouter.post('/roommessages' , messageController.findRoomMessages)
messageRouter.post('/roomlatestmessage' , messageController.findLatestRoomMessages)


module.exports = messageRouter