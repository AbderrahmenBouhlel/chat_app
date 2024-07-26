// userModel.js

const {getConnection} = require('../db.js')


const User = {
    
    async create(requestObj){
        try{
            const connection = await getConnection();
            const username = requestObj.name || null;
            const email = requestObj.email || null;
            const password = requestObj.password || null;
            const photo = requestObj.photo || null;

            const [result] = await connection.execute(
                'INSERT INTO users (username, email, password,photo) VALUES (?, ?, ?,?)',
                [username,email, password,photo]
            )
            return {id:result.insertId , username:username , email:email ,photo:photo}
        } catch (error){
            console.error('Error creating user:',error);
            throw error
        }
        
    },
    async  findOne(requestObj){
        try{
            const connection = await getConnection();
            const email = requestObj.email;
            const id = requestObj.id ;
            if (!email && !id){
                throw new Error('Email or ID must be provided') ;
            }
            let query = "SELECT * FROM users WHERE " ;
            const queryParms = [] ;
            if (email){
                query += ' email = ?'
                queryParms.push(email)
            }
            if (id){
                query += ' id = ?'
                queryParms.push(id);
            }
            const [rows] = await connection.execute(query , queryParms);
            return rows.length > 0 ? rows[0] : null ;
        } catch(error){
            console.error('Error finding user:',error);
            throw error;
        }

    },
    async modify(requestObj){
        try{
            const connection = await getConnection();
            const { username, photo, id } = requestObj;
            if (!id){
                throw new Error('Email or ID must be provided') ;
            }
            let query = "UPDATE users SET " ;
    
            const queryParams = [] ;
            if (username){
                query += "username = ? ";
                queryParams.push(username);
                
            }
            if (photo) {
                if (username) {
                    query += ", "; // Add comma only if name is also being updated
                }
                query += "photo = ? ";
                queryParams.push(photo);
            }
            
            if (id){
                query += " where id = ? ;"
                queryParams.push(id);
            }
            
            const [rows] = await connection.execute(query , queryParams);
            return rows.affectedRows > 0 ? {id:id , username:username ,photo:photo} : null ;
        } catch(error){
            console.error('Error changing user data:',error);
            throw error;
        }

    },
    async usersRows() {
        try {
            const connection = await getConnection();
            const [result] = await connection.execute('SELECT * FROM users');
            return result;
        } catch (error) {
            console.error('Error returning users rows:', error);
            throw error;
        }
    },
}

module.exports = User ;