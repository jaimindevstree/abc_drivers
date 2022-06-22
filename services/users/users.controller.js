const UsersService = require("./users.services");
const passport = require("passport");
const constants = require("../../helper/resources/messages.json");
const guard = require("../../helper/guards");
const { commonResponse, commonFunctions, nodemailer } = require("../../helper");

module.exports = {
  /*
   *  Register New User
   */
  register: async (req, res, next) => {
    try {
      req.body.email = req.body.email.toLowerCase();
      let is_exist = await UsersService.is_exist({ email: req.body.email });
      if (is_exist) {
        return commonResponse.success(
          res,
          constants.USER_EXIST,
          400,
          constants.USER_EXIST
        );
      }

      req.body.password = await commonFunctions.encryptStringCrypt(
        req.body.password
      );

      req.body.otp = commonFunctions.randomSixDigit();
      let user = await UsersService.save(req.body);

      if (user) {
        /* Send Account Verification Link */
        let emailData = {
          to: user.email,
          subject: "magicStairs || Account Verification OTP",
          text: `Your account verification Link Is ${user.otp}`,
          html: `<h1> magicStairs </h1>
                            <p>Your account verification OTP is :  ${user.otp}</b></p>`,
        };
        nodemailer.sendMail(emailData);

        let getUser = await UsersService.get(user._id);
        const token = guard.createToken(user, getUser.role);
        getUser.token = token.token;
        commonResponse.success(
          res,
          constants.USER_CREATED,
          200,
          getUser,
          constants.ACCOUNT_VERIFICATION_OTP
        );
      } else {
        return commonResponse.customResponse(
          res,
          constants.DEFAULTERR,
          400,
          user,
          constants.DEFAULTERR
        );
      }
    } catch (error) {
      console.log("Create User -> ", error);
      return commonResponse.CustomError(
        res,
        constants.DEFAULTERR,
        500,
        {},
        error.message
      );
    }
  },

  /*
   *  Login
   */
  login: async (req, res, next) => {
    passport.authenticate("user", async function (err, user, info) {
      if (err) {
        var err = err;
        err.status = 400;
        return next(err);
      }

      if (info) {
        var err = new Error(constants.Missing_Credentials);
        err.status = 400;
        return next(err);
      }

      if (user) {
        if (user.status == "pending") {
          return commonResponse.customResponse(
            res,
            constants.USER_NOT_VERIFIED,
            400,
            user,
            constants.VERIFY_EMAIL
          );
        }
        if (user.status == "deactivated") {
          return commonResponse.customResponse(
            res,
            constants.USER_DEACTIVATED,
            400,
            user,
            constants.USER_DEACTIVATED
          );
        }

        await UsersService.update(user._id, {
          fcm_token: req.body.fcm_token ? req.body.fcm_token : "",
          device_type: req.body.device_type ? req.body.device_type : "android",
          device_id: req.body.device_id ? req.body.device_id : "",
        });

        let userResponse = await UsersService.get(user._id);
        const token = guard.createToken(user, userResponse.role);
        userResponse.token = token.token;
        return commonResponse.success(
          res,
          constants.LOGIN_SUCCESS,
          200,
          userResponse
        );
      } else {
        return commonResponse.customResponse(
          res,
          "NOT-FOUND",
          400,
          {},
          constants.USER_NOT_FOUND
        );
      }
    })(req, res, next);
  },

  /*
   *  Resend Verification Link
   */
  resendVerificationLink: async (req, res, next) => {
    try {
      req.body.email = req.body.email.toLowerCase();
      let user = await UsersService.is_exist(req.body);
      if (user) {
        let otp = await commonFunctions.randomSixDigit();
        // let otp = "123456";
        let updateData = {
          otp: otp,
        };
        let updateUser = await UsersService.update(user._id, updateData);
        if (updateUser) {
          /* Send Account Verification OTP */
          let emailData = {
            to: updateUser.email,
            subject: "Trivia-vr || Account Verification OTP",
            text: `Your account verification Link Is ${updateUser.otp}`,
            html: `<h1> Trivia-vr </h1>
                                <p>Your account verification OTP is :  ${updateUser.otp}</b></p>`,
          };
          nodemailer.sendMail(emailData);

          return commonResponse.success(
            res,
            constants.RESEND_VERIFICATION_LINK_SUCCESS,
            200,
            updateUser,
            constants.RESEND_VERIFICATION_LINK_SUCCESS
          );
        } else {
          return commonResponse.customResponse(
            res,
            constants.DEFAULTERR,
            400,
            {},
            constants.DEFAULTERR
          );
        }
      } else {
        return commonResponse.customResponse(
          res,
          constants.EMAIL_NOT_EXIST,
          400,
          {},
          constants.EMAIL_NOT_EXIST
        );
      }
    } catch (error) {
      console.log("Resend User Verification Link -> ", error);
      return commonResponse.CustomError(
        res,
        constants.DEFAULT_INTERNAL_SERVER_ERROR,
        500,
        {},
        error.message
      );
    }
  },

  /*
   *  Verify User
   */
  verifyUser: async (req, res, next) => {
    try {
      req.body.email = req.body.email.toLowerCase();
      let getUser = await UsersService.is_exist(req.body);
      if (getUser) {
        if (getUser.status == "deactivated") {
          return commonResponse.customResponse(
            res,
            constants.USER_DEACTIVATED,
            400,
            getUser,
            constants.USER_DEACTIVATED
          );
        }
        if (
          req.body.otp != getUser.otp ||
          req.body.otp == 0 ||
          req.body.otp == "0"
        ) {
          return commonResponse.customResponse(
            res,
            constants.INVALID_OTP,
            400,
            getUser,
            constants.INVALID_OTP
          );
        }

        let updateData = {
          status: "verified",
          otp: 0,
        };

        let updateUserDetails = await UsersService.update(
          getUser._id,
          updateData
        );
        if (updateUserDetails) {
          const token = await guard.createToken(updateUserDetails, "user");
          updateUserDetails.token = token.token;
          return commonResponse.success(
            res,
            constants.USER_VERIFIED_SUCCESS,
            200,
            updateUserDetails,
            constants.USER_VERIFIED_SUCCESS
          );
        } else {
          return commonResponse.customResponse(
            res,
            constants.DEFAULTERR,
            400,
            {},
            constants.DEFAULTERR
          );
        }
      } else {
        return commonResponse.customResponse(
          res,
          constants.EMAIL_NOT_EXIST,
          400,
          {},
          constants.EMAIL_NOT_EXIST
        );
      }
    } catch (error) {
      console.log("Verify User -> ", error);
      return commonResponse.CustomError(
        res,
        constants.DEFAULT_INTERNAL_SERVER_ERROR,
        500,
        {},
        error.message
      );
    }
  },

  /*
   *  Forgot Password
   */
  forgotPassword: async (req, res, next) => {
    try {
      req.body.email = req.body.email.toLowerCase();
      let checkUserExist = await UsersService.is_exist(req.body);
      if (checkUserExist) {
        if (checkUserExist.status == "deactivated") {
          return commonResponse.customResponse(
            res,
            constants.USER_DEACTIVATED,
            400,
            checkUserExist,
            constants.USER_DEACTIVATED
          );
        }
        let otp = commonFunctions.randomSixDigit();
        // let otp = "123456";
        let updateData = {
          otp: otp,
        };
        let updateUser = await UsersService.update(
          checkUserExist._id,
          updateData
        );
        /* Send Reset Password OTP */
        let emailData = {
          to: updateUser.email,
          subject: "Trivia-vr || Reset Password OTP",
          text: `Your Reset Password OTP Is ${updateUser.otp}`,
          html: `<h1> Trivia-vr </h1>
                            <p>Your Reset Password verification OTP is <br><br><b>${updateUser.otp}</b></p>`,
        };
        nodemailer.sendMail(emailData);

        return commonResponse.success(
          res,
          constants.FORGOT_PASSWORD_SUCCESS,
          200,
          updateUser,
          constants.FORGOT_PASSWORD_SUCCESS
        );
      } else {
        return commonResponse.customResponse(
          res,
          constants.EMAIL_NOT_EXIST,
          400,
          {},
          constants.EMAIL_NOT_EXIST
        );
      }
    } catch (error) {
      console.log("User Forgot Password -> ", error);
      return commonResponse.CustomError(
        res,
        constants.DEFAULT_INTERNAL_SERVER_ERROR,
        500,
        {},
        error.message
      );
    }
  },

  /*
   *  Reset Password
   */
  resetPassword: async (req, res, next) => {
    try {
      let user = await UsersService.get(req.body._id);
      if (user) {
        if (user.status == "pending") {
          return commonResponse.customResponse(
            res,
            constants.USER_NOT_VERIFIED,
            400,
            user,
            constants.USER_NOT_VERIFIED
          );
        }
        if (user.status == "deactivated") {
          return commonResponse.customResponse(
            res,
            constants.USER_DEACTIVATED,
            400,
            user,
            constants.USER_DEACTIVATED
          );
        }

        if (req.body.new_password == req.body.confirm_password) {
          req.body.new_password = await commonFunctions.encryptStringCrypt(
            req.body.new_password
          );
          let updateData = {
            password: req.body.new_password,
          };
          let updateUserDetails = await UsersService.update(
            user._id,
            updateData
          );
          if (updateUserDetails) {
            return commonResponse.success(
              res,
              constants.PASSWORD_RESET_SUCCESS,
              200,
              updateUserDetails,
              constants.PASSWORD_RESET_SUCCESS
            );
          } else {
            return commonResponse.customResponse(
              res,
              constants.DEFAULTERR,
              400,
              {},
              constants.DEFAULTERR
            );
          }
        } else {
          return commonResponse.customResponse(
            res,
            constants.INVALID_CONFIRM_PASSWORD,
            400,
            {},
            constants.INVALID_CONFIRM_PASSWORD
          );
        }
      } else {
        return commonResponse.customResponse(
          res,
          constants.USER_NOT_FOUND,
          400,
          {},
          constants.USER_NOT_FOUND
        );
      }
    } catch (error) {
      console.log("User Reset Password -> ", error);
      return commonResponse.CustomError(
        res,
        constants.DEFAULT_INTERNAL_SERVER_ERROR,
        500,
        {},
        error.message
      );
    }
  },

  //   /*
  //    *  Update Profile
  //    */
  //   update: async (req, res, next) => {
  //     try {
  //       if (req.files != undefined && req.files.image != undefined) {
  //         req.body.image =
  //           process.env.DOMAIN_URL +
  //           "/user-profile/" +
  //           req.files.image[0].filename;
  //       }
  //       let updatedUser = await UsersService.update(req.user.id, req.body);
  //       if (updatedUser) {
  //         return commonResponse.success(
  //           res,
  //           "USER_PROFILE_UPDATE",
  //           200,
  //           updatedUser
  //         );
  //       } else {
  //         return commonResponse.customResponse(
  //           res,
  //           "USER_NOT_FOUND",
  //           400,
  //           {},
  //           "User not found, please try again"
  //         );
  //       }
  //     } catch (error) {
  //       return commonResponse.CustomError(
  //         res,
  //         "DEFAULT_INTERNAL_SERVER_ERROR",
  //         500,
  //         {},
  //         error.message
  //       );
  //     }
  //   },

  /*
   * Delete Profile
   */
  //   delete: async (req, res, next) => {
  //     try {
  //       let deleteUser = await UsersService.delete(req.params.id);
  //       if (deleteUser) {
  //         return commonResponse.success(
  //           res,
  //           "USER_PROFILE_DELETED",
  //           200,
  //           deleteUser
  //         );
  //       } else {
  //         return commonResponse.customResponse(
  //           res,
  //           "USER_NOT_FOUND",
  //           400,
  //           {},
  //           "User not found, please try again"
  //         );
  //       }
  //     } catch (error) {
  //       return commonResponse.CustomError(
  //         res,
  //         "DEFAULT_INTERNAL_SERVER_ERROR",
  //         500,
  //         {},
  //         error.message
  //       );
  //     }
  //   },

  /*
   *  Change Password
   */
  changePassword: async (req, res, next) => {
    try {
      let getUser = await UsersService.get(req.user.id);
      if (getUser) {
        let isPasswordValid = await commonFunctions.matchPassword(
          req.body.old_password,
          getUser.password
        );
        if (isPasswordValid) {
          if (req.body.new_password == req.body.confirm_password) {
            req.body.new_password = await commonFunctions.encryptStringCrypt(
              req.body.new_password
            );
            let updateData = {
              password: req.body.new_password,
            };
            let updatePassword = await UsersService.update(
              req.user.id,
              updateData
            );
            if (updatePassword) {
              return commonResponse.success(
                res,
                constants.PASSWORD_CHANGED_SUCCESS,
                200,
                updatePassword,
                constants.PASSWORD_CHANGED_SUCCESS
              );
            } else {
              return commonResponse.customResponse(
                res,
                constants.DEFAULTERR,
                400,
                {},
                constants.DEFAULTERR
              );
            }
          } else {
            return commonResponse.customResponse(
              res,
              constants.INVALID_CONFIRM_PASSWORD,
              400,
              {},
              constants.INVALID_CONFIRM_PASSWORD
            );
          }
        } else {
          return commonResponse.customResponse(
            res,
            constants.INVALID_OLD_PASSWORD,
            400,
            {},
            constants.INVALID_OLD_PASSWORD
          );
        }
      } else {
        return commonResponse.customResponse(
          res,
          constants.USER_NOT_FOUND,
          400,
          {},
          constants > USER_NOT_FOUND
        );
      }
    } catch (error) {
      console.log("User Change Password -> ", error);
      return commonResponse.CustomError(
        res,
        constants.DEFAULT_INTERNAL_SERVER_ERROR,
        500,
        {},
        error.message
      );
    }
  },

  /*
   *  Get Profile
   */
  get: async (req, res, next) => {
    try {
      let User = await UsersService.get(req.user.id);
      if (User) {
        commonResponse.success(
          res,
          constants.GET_PROFILE,
          200,
          User,
          constants.GET_PROFILE
        );
      } else {
        return commonResponse.customResponse(
          res,
          constants.USER_NOT_FOUND,
          400,
          {},
          constants.USER_NOT_FOUND
        );
      }
    } catch (error) {
      return commonResponse.CustomError(
        res,
        constants.DEFAULT_INTERNAL_SERVER_ERROR,
        500,
        {},
        error.message
      );
    }
  },

  /*
   *  Get User By Id
   */
  getUserById: async (req, res, next) => {
    try {
      let User = await UsersService.get(req.params.id);
      if (User) {
        commonResponse.success(
          res,
          constants.GET_USER,
          200,
          User,
          constants.GET_USER
        );
      } else {
        return commonResponse.customResponse(
          res,
          constants.USER_NOT_FOUND,
          400,
          {},
          constants.USER_NOT_FOUND
        );
      }
    } catch (error) {
      return commonResponse.CustomError(
        res,
        constants.DEFAULT_INTERNAL_SERVER_ERROR,
        500,
        {},
        error.message
      );
    }
  },
  /*
   *  logout
   */
  logout: async (req, res, next) => {
    try {
      let updateData = {
        fcm_token: "",
        device_id: "",
      };
      let update = await UsersService.update(req.user.id, updateData);
      if (update) {
        return commonResponse.success(
          res,
          constants.USER_LOGOUT,
          200,
          update,
          constants.USER_LOGOUT
        );
      } else {
        return commonResponse.customResponse(
          res,
          constants.DEFAULTERR,
          400,
          {},
          constants.DEFAULTERR
        );
      }
    } catch (error) {
      return commonResponse.CustomError(
        res,
        constants.DEFAULT_INTERNAL_SERVER_ERROR,
        500,
        {},
        error.message
      );
    }
  },


  /**
   * Update Profile
   */
  updateProfile: async (req, res, next) => {
    try {
      if (req.files != undefined && req.files.profile_pic != undefined) {
        req.body.profile_pic = process.env.DOMAIN_URL + "/user-profile/" + req.files.profile_pic[0].filename;
      }

      if (req.body.email) {
        return commonResponse.customResponse(res, "SOMETHING_WENT_WRONG", 400, {}, "Cannot Change Email Address");
      }

      if (req.body.password) {
        return commonResponse.customResponse(res, "SOMETHING_WENT_WRONG", 400, {}, "Cannot Edit Password");
      }

      if (req.body.username) {
        return commonResponse.customResponse(res, "SOMETHING_WENT_WRONG", 400, {}, "cannot Edit Username");
      }

      let updatedUser = await UsersService.update(req.user.id, req.body);

      if (updatedUser) {
        return commonResponse.success(res, "USER_PROFILE_UPDATE", 200, updatedUser);
      } else {
        return commonResponse.customResponse(res, "USER_NOT_FOUND", 400, {}, "User not found, please try again");
      }
    } catch (error) {
      return commonResponse.CustomError(res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {}, error.message);
    }
  },
};
