const nodemailer = require('nodemailer');
const EmailVerification = require('../../models/email.model');
const User = require('../../models/user.model');
const UserPreference = require('../../models/preference.model');
const{query, validationResult} = require('express-validator');
const {verifyEmailHTML} = require('../../utils/emailTemplates');
require('dotenv').config();


const verifyEmailValidation = [
    query('email').isEmail().normalizeEmail(),
    query('code').isLength({min:5, max:5}),
    (req, res, next)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(422).json({errors: errors.array()});
        }
        next();
    }
];

const sendVerificationEmail = async (req, res) => {
    const USER = process.env.SMTP_USER;
    const PASS = process.env.SMTP_PASS;
    const CLIENT_URL = process.env.CLIENT_URL;
    const {email, name} = req.body;
    const verificationCode = Math.floor(10000+Math.random()*90000);
    const verificationLink = `${CLIENT_URL}/auth/verify?email=${email}&code=${verificationCode}`;
    try{
        let transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST ,
            port: process.env.MAIL_PORT,
            secure: false,
            auth: {
                user: USER,
                pass: PASS,
            },
        });

        let info = await transporter.sendMail({
            from: `"WeNet" <${USER}>`,
            to: email,
            subject: "Verify your email address",
            html: verifyEmailHTML(name, verificationLink, verificationCode),
        });

        const newVerification = new EmailVerification({
            email,
            verificationCode,
            messageId: info.messageId,
            for:"signup",
        });

        await newVerification.save();
        res.status(200).json({
            success: true,
            message: "Verification email sent successfully",
        });
    }catch(error){
        console.error("Error sending verification email:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send verification email",
            error: error.message,
        });
    }

}

const verifyEmail = async( req, res, next)=>{
    const {email, code} = req.query;
    try{
        const [isVerified, verification] = await Promise.all(
            [User.findOne({email: email, isEmailVerified: true}),
                EmailVerification.findOne({email: email, verificationCode: code})
            ]
        )

        if(isVerified){
            return res.status(400).json({
                message: "Email is already verified",
            });
        }

        if(!verification){
            return res.status(400).json({
                message: "Verification code is invalid or has expired",
            });
        }
        const updatedUser = await User.findOneAndUpdate(
            {email: email},
            {isEmailVerified: true},
            {new: true}
        ).exec();

        await Promise.all([
            EmailVerification.deleteMany({email: email}).exec(),
            new UserPreference({
                user: updatedUser._id,
                enableContextBasedAuth: true,
            }).save(),
        ]);

        req.userId = updatedUser._id;;
        req.email = updatedUser.email;
        next();

    }catch(error){
        console.log("Error verifying email:", error.message);;
        res.status(500).json({
            success: false,
            message: "Failed to verify email",
            error: error.message,
        });
    }
};

module.exports = {
    verifyEmailValidation,
    sendVerificationEmail,
    verifyEmail,
};
