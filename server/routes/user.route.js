const router = require('express').Router();
const passport = require('passport');
const useragent = require('express-useragent');
const requestIp = require('request-ip');

const {
    addUser,
    signin,
    logout,
    refreshToken,
    getModProfile,
    getUser,
    updateInfo
} = require('../controllers/user.controller');

const {addUserValidator, addUserValidatorHandler} = require('../middlewares/users/userValidator');

const {sendVerificationEmail} = require('../middlewares/users/verifyEmail');

const {sendLoginVerificationEmail} =require('../middlewares/users/verifyLogin');

const {
  signUpSignInLimiter,
  followLimiter,
} = require("../middlewares/limiter/limiter");

const avatarUpload = require('../middlewares/users/AvatarUpload');
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

router.put(":/id",
  requireAuth,
  decodeToken,
  updateInfo
)



module.exports = router;