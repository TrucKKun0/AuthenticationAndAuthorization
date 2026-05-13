

const requireRole = (role)=>{
    return (req,res,next)=>{
        const authReq = req;
        const authUser = authReq.user;
        if(!authUser){
            return res.status(401).json({
                success:false,
                message:'Unauthorized'
            });
        }
        if(authUser.role !== role){
            return res.status(403).json({
                success:false,
                message:'Forbidden, you do not have the required role to access this resource'
            });
        }
        next();
    }
}