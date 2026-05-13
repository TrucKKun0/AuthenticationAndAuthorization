const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');


router.get('/me',requireAuth,(req,res)=>{
    const authReq = req;
    const authUser = authReq.user;
    res.json({
        success:true,
        user:authUser
    });
});

module.exports = router;