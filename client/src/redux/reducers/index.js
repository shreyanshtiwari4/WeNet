import { combineReducers } from "redux";

import postReducer from "./posts";
import authReducer from "./auth";
import communityReducer from "./community";

const rootReducer = combineReducers({
  auth: authReducer,
  community: communityReducer,
  post: postReducer,
});

export default rootReducer;