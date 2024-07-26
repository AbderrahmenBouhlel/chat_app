const Room = require('../models/room_modules.js');
const CreateError = require("../utils/appError");
const User = require('../models/user_modules.js')

// regiqter user
exports.createDuoRoom = async (req , res  , next ) =>{
    try{
        const {userId , friendId} = req.body ;
        console.log(req.body)
        if (!userId || !friendId){
            return next(new CreateError('userId ID and freindId are required', 400));
        }
        const roomobj = await Room.createDuoRoom({userId:userId , friendId:friendId}) ;

        if (roomobj.founded === false){
            const roomDetails = await Room.findRoomData({roomId:roomobj.roomId, userId:userId})
            res.status(201).json({
                status:"success",
                message: "room is created succesfully" ,
                roomId:roomobj.roomId ,
                user: await User.findOne({id :userId}),
                friend : await User.findOne({id :friendId}),
                new: true ,
                roomDetails :roomDetails ,
            })

        }
        else{
            res.status(201).json({
                status:"success",
                message:"room is founded succesfully",
                roomId:roomobj.roomId ,
                user: await User.findOne({id :userId}),
                friend : await User.findOne({id :friendId}),
                new: false ,
            })

        }
       

    } catch(error){
        next(error)
    }
}

exports.findRoomDataC = async (req , res  , next ) =>{
    try{
        const {roomId , userId} = req.body ;
     
        if (!roomId){
            return next(new CreateError('roomId ID are required', 400));
        }
        const roomData = await Room.findRoomData({roomId:roomId, userId:userId}) ;
        res.status(201).json({
            status:"success",
            roomData:roomData ,
        })

    } catch(error){
        next(error)
    }
}


exports.userRooms = async (req , res  , next ) =>{
    try{
        const {userId} = req.body ;
     
        if (!userId){
            return next(new CreateError('user ID is required', 400));
        }
        const userRooms = await Room.findUserRooms({userId:userId}) ;
        res.status(201).json({
            status:"success",
            userRooms:userRooms ,
        })

    } catch(error){
        next(error)
    }
}





