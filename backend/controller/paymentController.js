const customError = require("../utils/customError.js");
const userModel = require("../model/userSchema.js");
const razorpay = require("../config/razorpayConfig.js");
const asyncHandler = require("../middleware/asyncHandler.js");

const createSubscription = asyncHandler(async (req, res, next) => {
  // Extracting ID from request obj
  const { id } = req.user;
  const { planName } = req.body;

  const {
    RAZORPAY_STANDARD_PLAN,
    RAZORPAY_BASIC_PLAN,
    RAZORPAY_PREMIUM_PLAN,
    RAZORPAY_MOBILE_PLAN
  } = process.env;

  const planID =
    "standard" === planName.toLowerCase()
      ? RAZORPAY_STANDARD_PLAN
      : null || "basic" === planName.toLowerCase()
      ? RAZORPAY_BASIC_PLAN
      : null || "premium" === planName.toLowerCase()
      ? RAZORPAY_PREMIUM_PLAN
      : null || "mobile" === planName.toLowerCase()
      ? RAZORPAY_MOBILE_PLAN
      : null;

  // Finding the user based on the ID
  const user = await userModel.findById(id);

  if (!user) {
    return next(new customError("Unauthorized, please login"));
  }

  // Checking the user role
  if (user.role === "ADMIN") {
    return next(new customError("Admin cannot purchase a subscription", 400));
  }

  // Creating a subscription using razorpay that we imported from the config/rasorpayConfig.js
  const subscription = await razorpay.subscriptions.create({
    plan_id: planID, // The unique plan ID
    customer_notify: 1, // 1 means razorpay will handle notifying the customer, 0 means we will not notify the customer
    total_count: 1 // 1 means it will charge only one month sub.
  });

  // Adding the ID and the status to the user account
  user.subscription.id = subscription.id;
  user.subscription.status = subscription.status;

  // Saving the user object
  await user.save();

  res.status(200).json({
    success: true,
    subscription_id: subscription.id
  });
});

const getRazorpayApiKey = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    key: process.env.RAZORPAY_KEY_ID
  });
});

const verifySubscription = asyncHandler(async (req, res, next) => {
  const { id } = req.user;
  const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } =
    req.body;

  // Finding the user
  const user = await User.findById(id);

  // Getting the subscription ID from the user object
  const subscriptionId = user.subscription.id;

  // Generating a signature with SHA256 for verification purposes
  // Here the subscriptionId should be the one which we saved in the DB
  // razorpay_payment_id is from the frontend and there should be a '|' character between this and subscriptionId
  // At the end convert it to Hex value
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(`${razorpay_payment_id}|${subscriptionId}`)
    .digest("hex");

  // Check if generated signature and signature received from the frontend is the same or not
  if (generatedSignature !== razorpay_signature) {
    return next(new AppError("Payment not verified, please try again.", 400));
  }

  // If they match create payment and store it in the DB
  await Payment.create({
    razorpay_payment_id,
    razorpay_subscription_id,
    razorpay_signature
  });

  // Update the user subscription status to active (This will be created before this)
  user.subscription.status = "active";

  // Save the user in the DB with any changes
  await user.save();

  res.status(200).json({
    success: true,
    message: "Payment verified successfully"
  });
});

module.exports = { createSubscription, getRazorpayApiKey, verifySubscription };
