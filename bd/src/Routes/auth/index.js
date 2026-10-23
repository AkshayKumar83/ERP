const express = require("express");
const { userRegister, userLogin, userLogout, sendOTP, sendResetOTP, resetNewPsk} = require("../../controllers/auth");

const router = express.Router("router");

router.post("/register", userRegister); // new
router.post("/login", userLogin);
router.post("/get_otp", sendOTP);
router.post("/reset-psk-otp", sendResetOTP);
router.post("/reset-new-psk", resetNewPsk);
router.post("/logout", userLogout);


module.exports = router;