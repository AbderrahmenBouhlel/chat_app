const Message = require('../models/message_modules');
const CreateError = require("../utils/appError");

// Create a new message
exports.createMessage = async (req, res, next) => {
    try {
        const { user_id, room_id, content, status, timeStamp } = req.body;
        // Validate request body
   
        if (!user_id || !room_id || !content) {
            return next(new CreateError('User ID, Room ID, and content are required.', 400));
        }

        const message = await Message.createMessage({
            user_id, room_id, content, status, timeStamp
        });

        res.status(201).json({
            status: "success",
            message: "Message created successfully.",
            messageId: message.messageId
        });
    } catch (error) {
        console.error("Error creating message:", error);
        next(error);
    }
}

// Find all messages in a room
exports.findRoomMessages = async (req, res, next) => {
    try {
        const { roomId } = req.body;

        // Validate request body
        if (!roomId) {
            return next(new CreateError('Room ID is required.', 400));
        }

        const messages = await Message.findRoomMessage({ roomId });


        res.status(200).json({
            status: 'success',
            message: 'Room messages found successfully.',
            messages: messages
        });
    } catch (error) {
        console.error("Error fetching room messages:", error);
        next(error);
    }
}




exports.findLatestRoomMessages = async (req, res, next) => {
    try {
        const { roomId } = req.body;

        // Validate request body
        if (!roomId) {
            return next(new CreateError('Room ID is required.', 400));
        }

        const message = await Message.findLatestRoomMessage({ roomId });


        res.status(200).json({
            status: 'success',
            message: 'Room latest message  found successfully.',
            message: message
        });
    } catch (error) {
        console.error("Error fetching latest room message:", error);
        next(error);
    }
}




