const express = require("express");
const { registerHandler, loginHandler, verifyEmailHandler,refreshHandler,logoutHandler,forgetPasswordHandler,resetPasswordHandler, googleAuthStartHandler, googleAuthCallbackHandler, twoFASetupHandler, twoFAVerifyHandler } = require("../controllers/auth/authController");
const { requireAuth } = require("../middleware/requireAuth");
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
router.post('/2fa/setup',requireAuth,twoFASetupHandler);
router.post('/2fa/verify',requireAuth,twoFAVerifyHandler);
module.exports = router;
