import {check, validationResult} from 'express-validator';
import User from '../../models/user.model.js';
import path from 'path';
import fs from 'fs';

const addUserValidator = [
    check("name")
    .trim()
    .isLength({min:2, max:20})
    .withMessage("Name must be between 2 and 20 characters long")
    .isAlpha("en-US",{ignore: " "})
    .withMessage("Name must not contain anything other than alphabet and spaces"),
    check("email")
    .trim()
    .isEmail()
    .withMessage("Email is not valid")
    .custom(async (value)=>{
        try{
            const user = await User.findOne({email: value});
            if(user){
                throw new Error("There is already an account associated with this email address");
            }
        }
        catch(error){
            throw error;
        }
    }),
    check("password")
    .isLength({min:6})
    .withMessage("Password must be at least 6 characters long"),
    check("role")
    .default("general")
    .isIn(["general", "moderator", "admin"]),
]

const addUserValidatorHandler = (req, res, next) => {
    const errors = validationResult(req);
    const mappedErrors = errors.mapped();
    if(Object.keys(mappedErrors).length==0){
        next();
    }else{
        if(req.files && req.files.length>0){
            const {filename} = req.files[0];
            const filePath = path.join(__dirname, '../../assests/userAvatars', filename);
            fs.unlink(filePath, (err)=>{
                if(err){
                    console.log(err);
                }
                console.log(`${filePath} was deleted`);
            })
        }

        res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: Object.values(mappedErrors).map(error => error.msg) ,
        });
    }
}

export {
    addUserValidator,
    addUserValidatorHandler,
};