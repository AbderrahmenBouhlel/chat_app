// userModel.js

const {getConnection} = require('../db.js');
const User = require('./user_modules.js');
const fs = require('fs')


const Room = {
    async createDuoRoom(requestObj) {
        let connection;
        try {
            connection = await getConnection();
            const userId = requestObj.userId || null;
            const friendId = requestObj.friendId || null;
            const roomName = requestObj.roomName || "";
            const isPrivate = true;
    
            // Check if the userId and friendId are the same
            if (userId === friendId) {
                throw new Error('Cannot create a conversation with yourself');
            }
            else{
                const sharedRoomObj = await Room.findDuoRoom({ userId: userId, friendId: friendId });
                if (sharedRoomObj.test === false) {
                    const [result1] = await connection.execute(
                        'INSERT INTO chat_rooms (room_name, is_private, created_by) VALUES (?, ?, ?)',
                        [roomName, isPrivate, userId]
                    );
                    const roomId = result1.insertId;
        
                    const [result2] = await connection.execute(
                        'INSERT INTO user_chat_rooms (room_id, user_id) VALUES (?, ?)',
                        [roomId, userId]
                    );
        
                    const [result3] = await connection.execute(
                        'INSERT INTO user_chat_rooms (room_id, user_id) VALUES (?, ?)',
                        [roomId, friendId]
                    );
        
                    return { roomId: roomId ,founded:false};
                } else {
                    return { roomId: sharedRoomObj.roomId , founded:true };
                }
                
            }
            
        } catch (error) {
            console.error('Error creating room:', error);
            throw error;
        }
    },
    
    async findDuoRoom(requestObj) {
        try {
            const connection = await getConnection();
            const userId = requestObj.userId;
            const friendId = requestObj.friendId;
            if (!userId || !friendId) {
                throw new Error('userId and friendId must be provided');
            }
           
            const query = `
                SELECT ucr1.room_id 
                FROM user_chat_rooms AS ucr1 
                INNER JOIN user_chat_rooms AS ucr2 
                ON ucr1.room_id = ucr2.room_id 
                WHERE ucr1.user_id = ? AND ucr2.user_id = ?
            `;
            const queryParms = [userId, friendId];
    
            const [rows] = await connection.execute(query, queryParms);
            return rows.length > 0 ? { test: true, roomId: rows[0].room_id } : { test: false };
        } catch (error) {
            console.error('Error finding room:', error);
            throw error;
        }
    },
    async findRoomData(requestObj) {
        try {
            const connection = await getConnection();
            const roomId = requestObj.roomId;
    
            if (!roomId ) {
                throw new Error('roomId must be provided');
            }
           
            const query = `
                SELECT cr.*, ucr.user_id AS participant_id
                FROM chat_rooms AS cr
                INNER JOIN user_chat_rooms AS ucr ON cr.room_id = ucr.room_id
                WHERE cr.room_id = ? ;
            `;

            const queryParms = [roomId];
            const [result] = await connection.execute(query, queryParms);
            if (result.length === 0) {
                throw new Error('No room data found');
            }
            const creator = await User.findOne({ id: result[0].created_by });
            if (!creator) {
                throw new Error('Creator not found');
            }
          
            // handle finding friend

            const friendData = result.find(obj => obj.participant_id !== result[0].created_by);
           
            if (friendData){
                const friend = await User.findOne({ id: friendData.participant_id });
                let freindPhotoData = null 
                freindPhotoData = fs.readFileSync(friend.photo, { encoding: "base64" });

                let creatorPhotoData = null 
                creatorPhotoData = fs.readFileSync(creator.photo, { encoding: "base64" });
                
                return {roomId : roomId ,creator :{email : creator.email , username : creator.username,id:creator.id , photo:creatorPhotoData} ,
                    friend :{email : friend.email ,username : friend.username, id:friend.id , photo:freindPhotoData} 
                };

            }
            else{
                
                let creatorPhotoData = null 
                creatorPhotoData = fs.readFileSync(creator.photo, { encoding: "base64" });
                
                return {roomId : roomId ,creator :{email : creator.email , username : creator.username,id:creator.id , photo:creatorPhotoData} ,
                };
            }
            

           

        } catch (error) {
            console.error('Error finding room data:', error);
            throw error;
        }
    },
    async findUserRooms(requestObj) {
        try {
            const connection = await getConnection();
            const userId = requestObj.userId;
    
            if (!userId ) {
                throw new Error('userId must be provided');
            }
           
            const query = `
                SELECT * from user_chat_rooms where user_id = ?
            `;
            const queryParms = [userId];
            const [result] = await connection.execute(query, queryParms);
            const roomPromises = await  result.map(async (obj)=>{ 
                return await Room.findRoomData({roomId:obj.room_id}) ; 
            })
            const userRoomsData = await Promise.all(roomPromises);
            return userRoomsData;
        } catch (error) {
            console.error('Error finding room data:', error);
            throw error;
        }
    }
    
}

module.exports = Room ;