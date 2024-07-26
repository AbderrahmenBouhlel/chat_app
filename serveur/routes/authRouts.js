const express = require('express');
const authController = require('../controllers/authController.js');
const User = require('../models/user_modules.js')
const multer = require('multer')
const upload = multer({ dest: __dirname + '/uploads' });
const path = require('path')
const fs = require('fs')

const router = express.Router();
router.post('/signup' ,upload.single('photo'), authController.signup)
router.post('/email' , authController.authEmail)
router.post('/password' , authController.authPassword)
router.get('/users' , authController.users)
router.post('/userchanges' ,upload.single('photo'),  authController.userChanges)
router.get('/protected' , authController.verifyToken , async (req,res) =>{
    const userData = await User.findOne({id :req.userData , email:null})
    let fileData = null;
    if (userData.photo) {
        const filePath = path.resolve(userData.photo)
        fileData = await fs.readFileSync(filePath , {encoding: "base64"})
    }
    res.status(200).json({message:'this is a protected route',  user:{
        id:userData.id,
        username:userData.username,
        email:userData.email,
        photo:fileData,
    },})
})







module.exports = router