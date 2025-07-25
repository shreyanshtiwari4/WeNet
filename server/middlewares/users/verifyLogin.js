import nodemailer from 'nodemailer';
import SuspiciousLogin from '../../models/suspiciousLogin.model.js';
import UserContext from '../../models/context.model.js';
import EmailVerification from '../../models/email.model.js';
import { query, validationResult } from 'express-validator';
import { verifyLoginHTML } from '../../utils/emailTemplates.js';
import dotenv from 'dotenv';
dotenv.config();

const verifyLoginValidation = [
    query('email').isEmail().normalizeEmail(),
    query('id').isLength({ min: 24, max: 24 }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        next();
    }
];

const sendLoginVerificationEmail = async (req, res) => {
    const USER = process.env.SMTP_USER;
    const PASS = process.env.SMTP_PASS;
    const CLIENT_URL = process.env.CLIENT_URL;
    const { id } = req.currentContextData
    const { email, name } = req.user;

    const verificationLink = `${CLIENT_URL}/verify-login?id=${id}&email=${email}`;
    const blockLink = `${CLIENT_URL}/block-device?id=${id}&email=${email}`;

    try {
        let transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
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
            subject: "Action required: Verify your login",
            html: verifyLoginHTML(name, verificationLink, blockLink, req.currentContextData),
        });

        const newVerification = new EmailVerification({
            email,
            verificationCode: id,
            messageId: info.messageId,
            for: "login",
        });

        await newVerification.save();
        res.status(401).json({
            success: true,
            message: "Access blocked due to suspicious activity. Verification email was sent to your email address.",
        });
    } catch (error) {
        console.error("Error sending verification email:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to send verification email",
        });
    }
};

const verifyLogin = async (req, res) => {
    const { id, email } = req.query;
    try {
        const suspiciousLogin = await SuspiciousLogin.findOne(id);
        if (!suspiciousLogin || suspiciousLogin.email !== email) {
            return res.status(404).json({
                success: false,
                message: "Invalid verification link",
            });
        }

        const newContextData = new UserContext({
            user: suspiciousLogin.user,
            email: suspiciousLogin.email,
            ip: suspiciousLogin.ip,
            city: suspiciousLogin.city,
            country: suspiciousLogin.country,
            location: suspiciousLogin.location,
            browser: suspiciousLogin.browser,
            os: suspiciousLogin.os,
            platform: suspiciousLogin.platform,
            deviceType: suspiciousLogin.deviceType,
        });
        await newContextData.save();
        await SuspiciousLogin.findOneAndUpdate(
            { _id: { $eq: id } },
            { $set: { isTrusted: true, isBlocked: false } },
            { new: true }
        );
        res.status(200).json({
            success: true,
            message: "Login verified successfully",
        })
    }catch(error){
        res.status(500).json({message: "Could not verify login", error: error.message});
    }
};

const blockLogin = async(req, res)=>{
    const {id, email} = req.query;

     try {
    const suspiciousLogin = await SuspiciousLogin.findById(id);

    if (!suspiciousLogin || suspiciousLogin.email !== email) {
      return res.status(400).json({ message: "Invalid verification link" });
    }

    await SuspiciousLogin.findOneAndUpdate(
      { _id: { $eq: id } },
      { $set: { isBlocked: true, isTrusted: false } },
      { new: true }
    );

    res.status(200).json({ message: "Login blocked" });
  } catch (err) {
    res.status(500).json({ message: "Could not block your login" });
  }
};

export {
    verifyLoginValidation,
    sendLoginVerificationEmail,
    verifyLogin,
    blockLogin,
};