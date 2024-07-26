// userModel.js

const {getConnection} = require('../db.js')


const FreindShip = {
    async create(requestObj){
        try{
            const connection = await getConnection();
            const senderId = requestObj.senderId || null;
            const reciverId = requestObj.reciverId || null;
            const status = "pending";

            const [result] = await connection.excute(
                'INSERT INTO freindships (user_id, freind_id, status) VALUES (?, ?, ?, ?)',
                [reciverId,senderId, status]
            )
            return result
        } catch (error){
            console.error('Error creating freind request:',error);
            throw error;
        }
        
    },
    async findfreinds(requestObj){
        try{
            const connection = await getConnection();
            const userId = requestObj.userId;
            if (!userId ){
                throw new Error('userID must be provided') ;
            }
            let query = "SELECT * FROM freindships WHERE " ;
            const queryParms = [] ;
            if (userId){
                query += ' user_id = ?'
                queryParms.push(userId)
            }
            const [rows] = await connection.excute(query , queryParms);
            return rows.length > 0 ? rows : null ;
        } catch(error){
            console.error('Error finding freindships:',error);
            throw error;
        }

    }
}

module.exports = FreindShip ;