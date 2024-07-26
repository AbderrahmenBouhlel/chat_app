const express = require('express');
const roomController = require('../controllers/roomController.js');



const roomRouter = express.Router();

roomRouter.post('/duoroom' , roomController.createDuoRoom)
roomRouter.post('/roomData' , roomController.findRoomDataC)
roomRouter.post('/userrooms' , roomController.userRooms)



module.exports = roomRouter