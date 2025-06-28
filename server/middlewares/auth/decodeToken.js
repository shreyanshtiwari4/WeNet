const jwt = require('jsonwebtoken');

const decodeToken = (req, res, next)=>{
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Authorization header is missing or invalid',
        });
    }
    const token = authHeader.split(' ')[1];
    try{
        const decoded = jwt.verify(token,process.env.SECRET);
        req.userId = decoded.id;
        next();
    }catch(error){
        res.status(401).json({
            message: "Unauthorized access"})
    }
}

module.exports = decodeToken;

