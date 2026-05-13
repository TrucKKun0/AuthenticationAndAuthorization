const express = require('express');
const router = express.Router();

const requireRole = require('../middleware/requireRole');
const requireAuth = require('../middleware/requireAuth');

router.get('/users',requireAuth,requireRole('admin'),(req,res)=>{
    try{
    const users = await User.find(
        {},
        {
            id : 1,
            name : 1,
            email : 1,
            role : 1,
            isEmailVerified : 1
        }
    );
    const result = users.map(u=>{
        return {
            id : u._id,
            name : u.name,
            email : u.email,
            role : u.role,
            isEmailVerified : u.isEmailVerified
        }
    })
    return res.json({
        success:true,
        users:result
    });
}catch(error){
    console.log(error);
    return res.status(500).json({
        success:false,
        message:'Internal Server Error'
    });
}
});
module.exports = router;