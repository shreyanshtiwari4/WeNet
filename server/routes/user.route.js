import express from 'express';
const router = express.Router();
import passport from 'passport';
import useragent from 'express-useragent';
import requestIp from 'request-ip';

import {
    addUser,
    signin,
    logout,
    refreshToken,
    getModProfile,
    getUser,
    updateInfo
} from '../controllers/user.controller.js';

import {addUserValidator, addUserValidatorHandler} from '../middlewares/users/userValidator.js';

import {sendVerificationEmail} from '../middlewares/users/verifyEmail.js';

import {sendLoginVerificationEmail} from '../middlewares/users/verifyLogin.js';

import {
  signUpSignInLimiter,
  followLimiter,
} from "../middlewares/limiter/limiter.js";

import avatarUpload from '../middlewares/users/AvatarUpload.js';
import decodeToken from "../middlewares/auth/decodeToken.js";
const requireAuth = passport.authenticate('jwt', {session: false},null);

router.post("/signup",
    signUpSignInLimiter,
    avatarUpload,
    addUserValidator,
    addUserValidatorHandler,
    addUser,
    sendVerificationEmail
);

router.post("/refresh-token",refreshToken);

router.post(
  "/signin",
  signUpSignInLimiter,
  requestIp.mw(),
  useragent.express(),
  signin,
  sendLoginVerificationEmail
)

router.post("/logout",logout);

router.put("/:id",
  requireAuth,
  decodeToken,
  updateInfo
)



export default router;