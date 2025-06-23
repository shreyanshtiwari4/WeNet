const jwt = require('jsonwebtoken');
const Admin = require('../../models/user.model');

const requireAdminAuth = async( req, res, next)=>{
    try{
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authorization token is missing',
            });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.id);
        if(admin){
            next();
        }else{
            req.status(401).json({message: "Unauthorized access"});
        }
    }catch(error){
        console.error("Error in admin authentication middleware:", error.message);
        res.status(500).json({
            success: false,
            message: 'Unauthorized access',
            error: error.message,
        });
    }
}

module.exports = requireAdminAuth;