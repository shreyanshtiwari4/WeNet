const router = require("express").Router();
const passport = require("passport")
const useragent = require("express-useragent")

const {
      addContextData,
  getAuthContextData,
  getUserPreferences,
  getTrustedAuthContextData,
  getBlockedAuthContextData,
  deleteContextAuthData,
  blockContextAuthData,
  unblockContextAuthData
} =require("../controllers/auth.controller")

const {verifyEmailValidation,
    verifyEmail
} = require("../middlewares/users/verifyEmail")

const {
    verifyLoginValidation,
    verifyLogin,
    blockLogin
} = require("../middlewares/users/verifyLogin")

const decodeToken = require("../middlewares/auth/decodeToken")

const requireAuth = passport.authenticate("jwt",{session:false},null)

router.get(
    "/context-data/primary",
    requireAuth,
    decodeToken,
    getAuthContextData
)


router.get(
    "context-data/trusted",
    requireAuth,
    decodeToken,
    getTrustedAuthContextData
)

router.get(
  "/context-data/blocked",
  requireAuth,
  decodeToken,
  getBlockedAuthContextData
);

router.get(
    "/user-preferences",
    requireAuth,
    decodeToken,
    getUserPreferences
)

router.delete(
    "/context-data/block/:contextId",
    requireAuth,
    deleteContextAuthData
)

router.patch(
  "/context-data/block/:contextId",
  requireAuth,
  blockContextAuthData
);
router.patch(
  "/context-data/unblock/:contextId",
  requireAuth,
  unblockContextAuthData
);

router.get("/verify", verifyEmailValidation, verifyEmail, addContextData);
router.get("/verify-login", verifyLoginValidation, verifyLogin);
router.get("/block-login", verifyLoginValidation, blockLogin);

module.exports = router;


