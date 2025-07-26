import express from "express";
const router = express.Router();
import passport from "passport";
import useragent from "express-useragent";

import {
      addContextData,
  getAuthContextData,
  getUserPreferences,
  getTrustedAuthContextData,
  getBlockedAuthContextData,
  deleteContextAuthData,
  blockContextAuthData,
  unblockContextAuthData
} from "../controllers/auth.controller.js";

import {verifyEmailValidation,
    verifyEmail
} from "../middlewares/users/verifyEmail.js";

import {
    verifyLoginValidation,
    verifyLogin,
    blockLogin
} from "../middlewares/users/verifyLogin.js";

import decodeToken from "../middlewares/auth/decodeToken.js";

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

export default router;


