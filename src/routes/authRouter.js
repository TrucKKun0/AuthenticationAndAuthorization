const express = require("express");
const { registerHandler, loginHandler, verifyEmailHandler,refreshHandler,logoutHandler,forgetPasswordHandler,resetPasswordHandler } = require("../controllers/auth/authController");
const router = express.Router();

router.post("/register",registerHandler);
router.post("/login",loginHandler);
router.get("/verify-email",verifyEmailHandler);
router.post("/refresh-token",refreshHandler);
router.post("/logout",logoutHandler);
router.post("/forget-password",forgetPasswordHandler);
router.post("/reset-password",resetPasswordHandler);
module.exports = router;
