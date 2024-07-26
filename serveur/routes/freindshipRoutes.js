const express = require('express');
const freindShipController = require('../controllers/freindShipController.js');



const router = express.Router();
router.post('/addfreind' , freindShipController.addFreind)
router.post('/acceptfreind' , freindShipController.acceptFreind)



module.exports = router