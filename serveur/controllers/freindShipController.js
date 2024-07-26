const FreindRequest = require('../models/freindReq_modules');
const FreindShip = require('../models/freindships_modules');
const CreateError = require("../utils/appError");

// regiqter user
exports.addFreind = async (req , res  , next ) =>{
    try{
        const {senderId , reciverId} = req.body ;
        if (!senderId || !reciverId){
            return next(CreateError('Sender ID and Receiver ID are required', 400));
        }
        const freindRequest = await FreindRequest.create({senderId: req.body.senderId , reciverId: req.body.reciverId });
        if (!friendRequest) {
            return next(CreateError('Friend request encountered an error', 500));
        }
        res.status(201).json({
            status:"success",
            message:"freind request is created succesfully",
        })
        console.log("freind request is created succesfully")
    } catch(error){
        next(error)
    }
}

exports.acceptFreind = async (req , res  , next ) =>{
    try{
        const {senderId , reciverId} = req.body ;
        if (!senderId || !reciverId){
            return next(CreateError('Sender ID and Receiver ID are required', 400));
        }
        const freindShip = await FreindShip.create({senderId: req.body.senderId , reciverId: req.body.reciverId });
        if (!freindShip) {
            return next(CreateError('Friend request encountered an error', 500));
        }
        res.status(201).json({
            status:"success",
            message:"freindship is created succesfully",
        })
        console.log("freindship is created succesfully");
    } catch(error){
        next(error);
    }
}

