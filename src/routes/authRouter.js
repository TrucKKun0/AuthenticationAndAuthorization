const express = require("express");
const { registerHandler, loginHandler, verifyEmailHandler,refreshHandler,logoutHandler,forgetPasswordHandler,resetPasswordHandler, googleAuthStartHandler, googleAuthCallbackHandler } = require("../controllers/auth/authController");
const router = express.Router();

router.post("/register",registerHandler);
router.post("/login",loginHandler);
router.get("/verify-email",verifyEmailHandler);
router.post("/refresh-token",refreshHandler);
router.post("/logout",logoutHandler);
router.post("/forget-password",forgetPasswordHandler);
router.post("/reset-password",resetPasswordHandler);
router.get('/google',googleAuthStartHandler);
router.get('/google/callback',googleAuthCallbackHandler);
module.exports = router;
