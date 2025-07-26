import { combineReducers } from "redux";


import authReducer from "./auth";
import communityReducer from "./community";

const rootReducer = combineReducers({
  auth: authReducer,
  community: communityReducer,
});

export default rootReducer;