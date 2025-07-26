import express from "express";
const router = express.Router();
import passport from "passport";

import {
  getPublicPosts,
  getPosts,
  getPost,
  createPost,
  confirmPost,
  rejectPost,
  deletePost,
  getCommunityPosts,
  getFollowingUsersPosts,
  likePost,
  unlikePost,
  addComment,
  savePost,
  unsavePost,
  getSavedPosts,
  clearPendingPosts,
} from "../controllers/post.controller.js";

import {
  postValidator,
  commentValidator,
  validatorHandler,
} from "../middlewares/post/userInputValidator.js";

import {
  createPostLimiter,
  likeSaveLimiter,
  commentLimiter,
} from "../middlewares/limiter/limiter.js";

import postConfirmation from "../middlewares/post/postConfirmation.js";
import analyzeContent from "../services/analyzeContent.js";
import processPost from "../services/processPost.js";
import fileUpload from "../middlewares/post/fileUpload.js";
import decodeToken from "../middlewares/auth/decodeToken.js";

const requireAuth = passport.authenticate("jwt", { session: false }, null);

router.use(requireAuth, decodeToken);

router.get("/community/:communityId", getCommunityPosts);
router.get("/saved", getSavedPosts);
router.get("/:publicUserId/userPosts", getPublicPosts);
router.get("/:id/following", getFollowingUsersPosts);
router.get("/:id", getPost);
router.get("/", getPosts);

router.post("/confirm/:confirmationToken", confirmPost);
router.post("/reject/:confirmationToken", rejectPost);

router.post(
  "/:id/comment",
  commentLimiter,
  commentValidator,
  validatorHandler,
  analyzeContent,
  addComment
);

router.post(
  "/",
  createPostLimiter,
  fileUpload,
  postValidator,
  validatorHandler,
  analyzeContent,
  processPost,
  postConfirmation,
  createPost
);

router.delete("/pending", clearPendingPosts);
router.delete("/:id", deletePost);

router.use(likeSaveLimiter);

router.patch("/:id/save", savePost);
router.patch("/:id/unsave", unsavePost);
router.patch("/:id/like", likePost);
router.patch("/:id/unlike", unlikePost);

export default router;