const fs = require('fs');
const path = require('path');
const multer = require('multer');

function avatarUpload(req, res, next){
    const up_folder = path.join(__dirname, '../../assests/userAvatars');

    const storage = multer.diskStorage({
        destination: (req, file,cb)=>{
            if(!fs.existsSync(up_folder)){
                fs.mkdirSync(up_folder, { recursive: true });
            }
            cb(null, up_folder);
        },
        filename:(req, file,cb)=>{
            const uniqueSuffix = Date.now()+ '-' + Math.round(Math.random() * 1E9);
            const ext = path.extname(file.originalname);
            cb(null,file.fieldname + '-' + uniqueSuffix + ext);
        },


    });

    const upload = multer({
        storage: storage,
        limits:{
            fileSize: 20*1024*1024//20MB

        },
        fileFilter: (req, file,cb)=>{
            if(
                file.mimetype === 'image/jpeg' ||
                file.mimetype === 'image/png' ||
                file.mimetype === 'image/jpg'
            ){
                cb(null, true);
            }
            else{
                cb(new Error('Only JPEG, JPG, and PNG files are allowed'),false);
            }
        }
    });

    upload.any()(req,res,(err)=>{
        if(err){
            res.status(500).json({
                success: false,
                message:"Error uploading file",
                error: err.message,
            })
        }
        else{
            next();
        }
    })
}

module.exports = avatarUpload;