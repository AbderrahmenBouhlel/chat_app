// userModel.js
const {getConnection} = require('../db.js')


const FreindRequest = {
    async create(requestObj){
        try{
            const connection = await getConnection();
            const senderId = requestObj.senderId || null;
            const reciverId = requestObj.reciverId || null;
            const status = "pending";

            const [result] = await connection.excute(
                'INSERT INTO freind_requests (sender_id, reciver_id, status) VALUES (?, ?, ?, ?)',
                [senderId,reciverId, status]
            )
            return result
        } catch (error){
            console.error('Error creating freind request:',error);
            throw error
        }
        
    },
    async findRequests(requestObj){
        try{
            const connection = await getConnection();
            const reciverId = requestObj.reciverId;
            if (!reciverId ){
                throw new Error('userID must be provided') ;
            }
            let query = "SELECT * FROM freind_requests WHERE " ;
            const queryParms = [] ;
            if (reciverId){
                query += ' reciver_id = ?'
                queryParms.push(reciverId)
            }
            const [rows] = await connection.excute(query , queryParms);
            return rows.length > 0 ? rows : null ;
        } catch(error){
            console.error('Error finding freind requests:',error);
            throw error;
        }

    }
}

module.exports = FreindRequest ;