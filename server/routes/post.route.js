const router = require("express").Router();
const passport = require("passport");

const {
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
} = require("../controllers/post.controller");

const {
  postValidator,
  commentValidator,
  validatorHandler,
} = require("../middlewares/post/userInputValidator");

const {
  createPostLimiter,
  likeSaveLimiter,
  commentLimiter,
} = require("../middlewares/limiter/limiter");
