import { lazy } from "react";

// import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import AllCommunities from "./pages/AllCommunities";
import MyCommunities from "./pages/MyCommunities";

const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const EmailVerifiedMessage = lazy(() => import("./pages/EmailVerifiedMessage"));
const BlockDevice = lazy(() => import("./pages/BlockDevice"));
const LoginVerified = lazy(() => import("./pages/LoginVerified"));
const AccessDenied = lazy(() => import("./pages/AccessDenied"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Post = lazy(() => import("./pages/Post"));
const OwnPost = lazy(() => import("./pages/OwnPost"));
const Saved = lazy(() => import("./pages/Saved"));

export const privateRoutes = [
  // {
  //   path: "/",
  //   element: <Home />,
  // },
  // {
  //   path: "/home",
  //   element: <Home />,
  // },
  {
    path: "/post/:postId",
    element: <Post />,
  },
  {
    path: "/my/post/:postId",
    element: <OwnPost />,
  },
  {
    path: "/saved",
    element: <Saved />,
  },
];

export const publicRoutes = [
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/auth/verify",
    element: <VerifyEmail />,
  },
  {
    path: "/email-verified",
    element: <EmailVerifiedMessage />,
  },
  {
    path: "/block-device",
    element: <BlockDevice />,
  },
  {
    path: "/verify-login",
    element: <LoginVerified />,
  },
  {
    path: "/access-denied",
    element: <AccessDenied />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
  {
    path: "/communities",
    element: <AllCommunities />,
  },
  {
    path: "/my-communities",
    element: <MyCommunities />,
  },
];
