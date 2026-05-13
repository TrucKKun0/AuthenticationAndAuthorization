const { verifyAccessToken } = require("../lib/token");
const User = require("../models/userModel");

async function requireAuth(req,res,next){
    const authHeader = req.headers.authorization
    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({
            success:false,
            message:'Unauthorized'
        });
    }
    const token = authHeader.split(' ')[1];
    try{
        const payload = await verifyAccessToken(token);
        const user = await User.findById(payload.sub);
        if(!user){
            return res.status(401).json({
                success:false,
                message:'User not found!'
            });
        }
        if(user.tokenVersion !== payload.tokenVersion){
            return res.status(401).json({
                success:false,
                message:'Token has been revoked!'
            });
        }
        const authReq = req;
        authReq.user = {
            id:user._id,
            role:user.role,
            email:user.email,
            name:user.name,
            isEmailVerified:user.isEmailVerified
        }
        next();
        }
    catch(err){
        console.log(err);
        return res.status(401).json({
            success:false,
            message:'Unauthorized'
        });
        
    }
}

module.exports = requireAuth;