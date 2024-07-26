const User = require('../models/user_modules');
const CreateError = require("../utils/appError")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const fs = require('fs')
const path = require('path')
// regiqter user

exports.signup = async (req , res  , next ) =>{
    try{
        const user = await User.findOne({email: req.body.email});
        if (user){
            if (req.file){
                fs.unlink(req.file.path , (err)=>{     // remove the file in case of user already exist
                    if (err) console.error('Error removing file:',err);
                })
            }
            return next(new CreateError('User already exists' , 400));
        }
        const hashedPassword = await bcrypt.hash(req.body.password,12);
        const newUser = await User.create({
            ...req.body ,
            photo: req.file ? req.file.path : null ,
            password : hashedPassword
        })

        // assign JWT (json web token)
        const token = jwt.sign({id:newUser.insertId},"sekretkey123",{
            expiresIn:"90d"
        })

        // read the file and convert it to a base64 string
        let fileData = null;
        if (req.file) {
            const filePath = path.resolve(req.file.path)
            fileData = fs.readFileSync(filePath , {encoding: "base64"})
        }
        res.status(201).json({
            status:"success",
            message:"User registerd succesfully",
            token,
            user:{
                id:newUser.id,
                name:newUser.username,
                email:newUser.email,
                photo: fileData ? fileData: null 
            }
        })
        console.log("user created succefully")
    } catch(error){
        if (req.file){
            fs.unlink(req.file.path , (err)=>{
                if (err) console.error('Error removing file:',err); // remove the file in case of error
            })
        }
        next(error)
    }
}



exports.authEmail = async (req, res,next) =>{
    try{
        const {email} = req.body;
        const user = await User.findOne({email});
        if(!user) return next(new CreateError('User Not Found' ,404));
        let fileData = null;
        if (user.photo) {
            const filePath = path.resolve(user.photo)
            fileData = fs.readFileSync(filePath , {encoding: "base64"})
        }
        res.status(200).json({
            status:'success',
            message:'user is founded successfully.',
            user:{
                username:user.username,
                photo:fileData
            },
        })
    }catch(error){
        next(error)
    }
}

exports.authPassword = async (req, res,next) =>{
    try{
        const {email , password} = req.body;
        const user = await User.findOne({email});
        
        if(!user) return next(new CreateError('User Not Found' ,404));

        let fileData = null;
        if (user.photo) {
            const filePath = path.resolve(user.photo)
            fileData = fs.readFileSync(filePath , {encoding: "base64"})
        }

        const isPasswordValid = await bcrypt.compare(password ,user.password);
       
        if (!isPasswordValid){
            return next(new CreateError('Incorect pssword',401));
        }
        const token = jwt.sign({id:user.id} ,"sekretkey123", {
            expiresIn: "90d"
        })
        

        
        res.status(200).json({
            status:'success',
            token,
            message:'Logged in successfully.',
            user:{
                id:user.id,
                username:user.username,
                email:user.email,
                photo:fileData
            },
        })
       
    }catch(error){
        next(error)
    }
}




exports.verifyToken = async(req , res ,next) => {
    try{
        const token = req.headers['authorization'];
        if(!token) return next(new CreateError('token is required',403));
        jwt.verify(token ,'sekretkey123',(err,decoded) =>{
            if(err) return next(new CreateError('invalid token' ,401));
            req.userData = decoded.id;
            next();
        })
    }catch(error){
        next(error)
    }
}






exports.userChanges = async (req, res,next) =>{
    try{
        const {id , username } = req.body;
        let user = await User.findOne({id});

   
        if (!user){
            return next(CreateError('user not found', 404))
        }
        let fileData = null;
        if (req.file){
            fs.unlink(user.photo , (err)=>{     // remove the file in case of user already exist
                if (err) console.error('Error removing file:',err); 
            })
        }
       
        await User.modify({username:username , id :id ,photo:req.file?.path});
        user = await User.findOne({id}); // update the user ater changing
       
        if (req.file){
            const filePath = path.resolve(req.file.path)
            fileData = fs.readFileSync(filePath , {encoding: "base64"})
        }
        
        
       
        res.status(200).json({
            status:'success',
            message:'user changed successfully.',
            user:{
                id:user.id,
                username:user.username,
                email:user.email,
                photo:fileData,
            },
        })
       
    }catch(error){
        next(error)
    }
}



exports.users = async (req, res, next) => {
    try {
      const rows = await User.usersRows();
      const users = rows.map(user => {
        let photoData = null;
        if (user.photo) {
          try {
            photoData = fs.readFileSync(user.photo, { encoding: "base64" });
          } catch (error) {
            console.error(`Error reading photo for user ${user.id}: `, error);
          }
        }
        return { ...user, photo: photoData };
      });
      res.status(200).json({ status: 'success', message: 'users rows are loaded successfully.', users });
    } catch (error) {
      next(error);
    }
  };



