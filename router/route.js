const express = require('express');
const router = express.Router();
const { loginUser, registerUser,
    getSeatInfo,
    bookSeat,
    getBookingInfo,
    addTrain } = require('../controllers/controller.js');
const { verifyUser, isAdmin } = require('../middleware/Auth.js')

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/addtrain').post(verifyUser, isAdmin, addTrain);
router.route('/bookticket').post(verifyUser, bookSeat);

router.route('/getseatinfo').get(verifyUser, getSeatInfo);
router.route('/bookinginfo').get(verifyUser, getBookingInfo);

module.exports = router;

