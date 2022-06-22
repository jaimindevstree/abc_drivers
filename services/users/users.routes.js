const router = require("express").Router();
const controller = require("./users.controller");
const { validate } = require("express-validation");
const { guard } = require("../../helper");
const {
  register,
  login,
  forgotPassword,
  changePassword,
  updateStatus,
  resendVerificationLink,
  resetPassword,
  getUserById,
} = require("../../services/users/users.validation");
const multerSetting = require("../../helper/multer").userImageUpload;

/*
 *  Register New User
 */
router.post("/register", validate(register), controller.register);

/*
 *  Login
 */
router.post("/login", validate(login), controller.login);

/*
 *  Resend verification Link
 */
router.post(
  "/resend-verification-link",
  validate(resendVerificationLink),
  controller.resendVerificationLink
);

/*
 *  Verify User Account
 */
router.post("/verify-user", validate(updateStatus), controller.verifyUser);

/*
 *  Forgot Password
 */
router.post(
  "/forgot-password",
  validate(forgotPassword),
  controller.forgotPassword
);

/*
 *  Reset Password
 */
router.post(
  "/reset-password",
  validate(resetPassword),
  controller.resetPassword
);

/**
 * Edit Profile
 */
router.post(
  "/update-profile",
  guard.isAuthorized(['admin', 'user']),
  multerSetting,
  controller.updateProfile
);

// /*
//  *  Update Profile
//  */
// router.put(
//   "/update",
//   multerSetting,
//   guard.isAuthorized(["admin", "player"]),
//   controller.update
// );

// /**
//  * Delete Profile
//  */
// router.delete("/delete/:id", guard.isAuthorized(["admin"]), controller.delete);
/*
 *  Change Password
 */
router.post(
  "/change-password",
  guard.isAuthorized(["admin", "user"]),
  validate(changePassword),
  controller.changePassword
);

/*
 *  Get Profile
 */
router.get(
  "/get-profile",
  guard.isAuthorized(["admin", "user"]),
  controller.get
);

/*
 *  Get user by id
 */
router.get(
  "/get/:id",
  guard.isAuthorized(["admin", "user"]),
  validate(getUserById),
  controller.get
);

/*
 *  logout
 */
router.post(
  "/logout",
  guard.isAuthorized(["admin", "user"]),
  controller.logout
);

module.exports = router;
