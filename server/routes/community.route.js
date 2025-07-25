import express from "express";
const router = express.Router();
import passport from "passport";

import {
  getNotMemberCommunities,
  getMemberCommunities,
  getCommunityMembers,
  getCommunityMods,
  getReportedPosts,
  removeReportedPost,
  joinCommunity,
  leaveCommunity,
  banUser,
  unbanUser,
  reportPost,
  getCommunity,
  getCommunities,
  createCommunity,
  addRulesToCommunity,
  addRules,
  addModToCommunity,
} from "../controllers/community.controller.js";

import decodeToken from "../middlewares/auth/decodeToken.js";

router.use(passport.authenticate("jwt", { session: false }, null), decodeToken);

router.get("/notmember", getNotMemberCommunities);
router.get("/member", getMemberCommunities);
router.get("/:name/reported-posts", getReportedPosts);
router.get("/:name/moderators", getCommunityMods);
router.get("/:name/members", getCommunityMembers);
router.get("/:name", getCommunity);
router.get("/", getCommunities);

router.post("/report", reportPost);
router.post("/rules", addRules);
router.post("/:name/ban/:id", banUser);
router.post("/:name/unban/:id", unbanUser);
router.post("/:name/join", joinCommunity);
router.post("/:name/leave", leaveCommunity);
router.post("/:name/add-all-rules", addRulesToCommunity);
router.post("/:name", createCommunity);

router.delete("/reported-posts/:postId", removeReportedPost);

router.patch("/:name/add-moderators", addModToCommunity);

export default router;