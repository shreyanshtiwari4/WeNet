import express from "express";
const router = express.Router();

import {
  retrieveLogInfo,
  deleteLogInfo,
  signin,
  updateServicePreference,
  retrieveServicePreference,
  getCommunities,
  getCommunity,
  addModerator,
  removeModerator,
  getModerators,
} from "../controllers/admin.controller.js";

import requireAdminAuth from "../middlewares/auth/adminAuth.js";
import {
  configLimiter,
  logLimiter,
  signUpSignInLimiter,
} from "../middlewares/limiter/limiter.js";

router.post("/signin", signUpSignInLimiter, signin);

router.use(requireAdminAuth);

router.get("/community/:communityId", getCommunity);
router.get("/communities", getCommunities);
router.get("/moderators", getModerators);

router.patch("/add-moderators", addModerator);
router.patch("/remove-moderators", removeModerator);

router
  .route("/preferences")
  .get(configLimiter, retrieveServicePreference)
  .put(configLimiter, updateServicePreference);
router
  .route("/logs")
  .get(logLimiter, retrieveLogInfo)
  .delete(logLimiter, deleteLogInfo);

export default router;