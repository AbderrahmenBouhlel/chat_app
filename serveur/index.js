const express = require('express')
const cors = require('cors')
const authRouter = require('./routes/authRouts.js')
const freindShipRouter = require('./routes/freindshipRoutes.js')
const roomRouter = require('./routes/roomRoutes.js')
const messageRouter =require("./routes/messageRoutes.js")
const {getConnection} = require('./db.js')
const http = require('http')
const socketIo = require("socket.io")
const Room = require('./models/room_modules.js')
const Notification = require('./models/notification_modules.js')



const app = express();



//1) MIDDLEWARE
app.use(cors())
app.use(express.json())


// Route
app.use('/api/auth', authRouter);
app.use('/api/freeindship', freindShipRouter);
app.use('/api/room', roomRouter);
app.use('/api/message', messageRouter);



const serveur  =  http.createServer(app);

const io = socketIo(serveur , {
    cors:{
        origin : "*",
        methods : ["GET","POST"],
    }
})


let userSocketMap = {}; // Maps userId to socketId
let currentlyConnectedSockets = [];

// On server startup
const initializeServerState = async () => {
    userSocketMap = {}; // Clear the userSocketMap
    currentlyConnectedSockets = []; // Clear the currentlyConnectedSockets
};

initializeServerState();

io.on('connection', (socket) =>{
    console.log(`user connected ${socket.id}`);
    socket.emit('request_user_id');
    socket.on('set_user_id', async (data) => {
        const { userId } = data;
        try {
            if (!userSocketMap[userId]) {
                userSocketMap[userId] = [];
            }
            userSocketMap[userId].push(socket.id);
            console.log(`User ID ${userId} connected with socket ID ${socket.id}`);
        } catch (err) {
            console.error('Redis command error:', err);
        }
        console.log(userSocketMap)
    });

    
    socket.on('disconnect', async () => {
        console.log(userSocketMap)
        for (let userId in userSocketMap) {
            if (userSocketMap[userId].includes(socket.id)) {
                userSocketMap[userId] = userSocketMap[userId].filter(id => id !== socket.id);
                if (userSocketMap[userId].length === 0) {
                    delete userSocketMap[userId];
                } 
                console.log(userSocketMap)
                break;
            }
        }
        currentlyConnectedSockets = currentlyConnectedSockets.filter(id => id !== socket.id);
        console.log('User Disconnected', socket.id);
    });

  
    socket.on('join_room', (data) =>{
        socket.join(data)
        console.log(`user with ID : ${socket.id} joined room : ${data}`)
    })

    socket.on('leave_room', (data) => {
        socket.leave(data.roomId);
        console.log(`User ${socket.id} left room ${data.roomId}`);
    });

    socket.on('send_message', async (data) =>{
        console.log(userSocketMap)
        const recipientSockets = userSocketMap[data.recipientId]
       
        let notificationData = {
            userId:data.recipientId ,
            message_data : {
                content: data.content,
                timestamp: data.timestamp,
                sender_id: data.user_id ,
                room_id: data.room_id,
                recipientId : data.recipientId ,
            }
        }
        let {notificationId} =  await Notification.createNotification(notificationData)

        notificationData = {...notificationData , notificationId:notificationId}
        if (recipientSockets){
            for (let recipientSocketId of recipientSockets){
                io.to(recipientSocketId).emit('new_notification' ,notificationData)
                
            }
        }

        console.log(notificationData)
        socket.to(data.room_id).emit("recive_message",notificationData);
    });

    socket.on('createRoom',async ({ userId, friendId })=>{
        if (!userId || !friendId){
            return next(new CreateError('userId ID and freindId are required', 400));
        }
        const roomobj = await Room.createDuoRoom({userId:userId , friendId:friendId}) ;
        if (roomobj.founded === false){
            const roomDetails = await Room.findRoomData({roomId:roomobj.roomId, userId:userId})
            socket.emit('roomCreated', roomDetails);
        }
        else if (roomobj.founded === true){
            socket.emit('roomfounded', roomobj.roomId);
        }
            
    })

    socket.on('readNotification', async ({ notificationId }) => {
        if (notificationId) {
            try {
                // Call your function to modify the notification status
                await Notification.modifyNotificationStatus({ notificationId });
                console.log('Notification is read');
                
                // Optionally, you can emit a confirmation event back to the client
                socket.emit('notificationStatusUpdated', { notificationId });

            } catch (error) {
                console.error('Error modifying notification status:', error.message);
                // Optionally, emit an error event back to the client
                //socket.emit('error', { message: 'Failed to update notification status' });
            }
        } else {
            console.error('No notification ID provided');
        }
    });
})


// error handler
app.use((err, req,res,next) =>{
    err.statusCode = err.statusCode || 500 ;
    err.status = err.status || 'error' ;

    res.status(err.statusCode).json({
        status : err.status ,
        message : err.message,
        error: true ,
    });
})



// 5)
const PORT = 3000 ;

getConnection().then(()=>{
    serveur.listen(PORT , ()=>{
        console.log('SERVEUR RUNNING');
    })

}).catch(err =>{
    console.error('Failed to initialize connection ',err);
})
