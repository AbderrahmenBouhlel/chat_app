const { getConnection } = require('../db.js');
const User = require('./user_modules.js');
const Room = require("./room_modules.js");
const fs = require('fs');

const Message = {
    async createMessage(requestObj) {
        let connection;
        try {
            connection = await getConnection();
            const user_id = requestObj.user_id || null;
            const room_id = requestObj.room_id || null;
            const content = requestObj.content || null;
            const status = requestObj.status || 'sent'; // Default to 'sent' if not provided
            const timeStamp = new Date();
            // Check if the userId is provided
            if (!user_id) {
                throw new Error('Cannot create a message without a sender');
            }

            // Ensure that roomId and content are provided
            if (!room_id || !content) {
                throw new Error('Room ID and content are required');
            }

            // SQL query to insert a new message
            const query = `
                INSERT INTO messages (content, room_id, user_id, status, timeStamp)
                VALUES (?, ?, ?, ?, ?);
            `;

            // Query parameters
            const queryParms = [content, room_id, user_id, status, timeStamp];
            const [result] = await connection.execute(query, queryParms);
            
            // Return the ID of the inserted message (or other relevant details)
            return { messageId: result.insertId, status: 'Message created successfully' };

        } catch (error) {
            console.error('Error creating message:', error);
            throw error;
        } 
    },
    async findRoomMessage(requestObj) {
        let connection;
        try {
            connection = await getConnection();
            const roomId = requestObj.roomId || null;
    
            // Check if roomId is provided
            if (!roomId) {
                throw new Error('Room ID is required');
            }
            
            
            // SQL query to get all messages for a specific room, ordered by timestamp
            const query = `
                SELECT * FROM messages
                WHERE room_id = ?
                ORDER BY timeStamp ASC;
            `;

            // Query parameters
            const queryParms = [roomId];
           
            const [results] = await connection.execute(query, queryParms);
            // Return the messages
            return results;

        } catch (error) {
            console.error('Error searching messages:', error);
            throw error;
        }
    },

    async findLatestRoomMessage(requestObj) {
        let connection;
        try {
            connection = await getConnection();
            const roomId = requestObj.roomId || null;
    
            // Check if roomId is provided
            if (!roomId) {
                throw new Error('Room ID is required');
            }
            
            
            // SQL query to get all messages for a specific room, ordered by timestamp
            const query = `
                SELECT * FROM messages
                WHERE room_id = ?
                ORDER BY timeStamp DESC
                LIMIT 1;
            `;

            // Query parameters
            const queryParms = [roomId];
           
            const [results] = await connection.execute(query, queryParms);
            // Return the messages
            return results;

        } catch (error) {
            console.error('Error searching messages:', error);
            throw error;
        }
    },
};

module.exports = Message;





