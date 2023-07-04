import { configureStore } from "@reduxjs/toolkit";
import contentReducer from "./contentSlice";
import userReducer from "./userSlice";
import authReducer from "./authSlice.js";
import razorpayReducer from "./razorpaySlice";
import  adminSlice  from "./adminSlice";
export const store = configureStore({
  reducer: {
    admin: adminSlice,
    content: contentReducer,
    user: userReducer,
    auth: authReducer,
    razorpay: razorpayReducer
  }
});
