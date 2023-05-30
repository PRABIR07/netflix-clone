const express = require("express");
const authRoute = express.Router();
const {
  signUp,
  signIn,
  forgotPassword,
  resetPassword
} = require("../controller/userController.js");

authRoute.post("/signup", signUp);
authRoute.post("/signin", signIn);
authRoute.post("/forgotpassword", forgotPassword);
authRoute.post("/resetpassword/:token", resetPassword);

module.exports = authRoute;