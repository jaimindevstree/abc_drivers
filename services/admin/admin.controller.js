const passport = require("passport");
const { usersServices } = require("../users");
const guard = require("../../helper/guards");
const constants = require("../../helper/resources/messages.json");
const services = require("../users/users.services");
const adminServices = require("../admin/admin.services");
const { commonResponse, commonFunctions, nodemailer } = require("../../helper");

module.exports = {
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
            constants.USER_PENDING,
            400,
            {},
            constants.USER_PENDING,
          );
        }
        if (user.status == "deactivated") {
          console.log("dsjgdja : ")
          return commonResponse.customResponse(
            res,
            constants.USER_DEACTIVATED,
            400,
            {},
            constants.USER_DEACTIVATED,
          );
        }

        let userResponse = await services.get(user._id);
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
          constants.USER_NOT_FOUND,
          400,
          {},
          constants.USER_NOT_FOUND,
        );
      }
    })(req, res, next);
  },

  /*
   * Register User By Admin
   */
  register: async (req, res, next) => {
    try {
      let lang_code = req.query.lang_code ? req.query.lang_code : "en";
      req.body.user_name = req.body.user_name;
      // Check Nickname Exists
      let is_exist_user_name = await services.is_userName_exists({
        user_name: req.body.user_name,
      });
      if (is_exist_user_name) {
        return commonResponse.error(
          res,
          constants.USER_EXIST,
          400,
          constants.USER_EXIST
        );
      }
      // Check Email Exists
      req.body.email = req.body.email.toLowerCase();
      let is_exist_email = await services.is_exist({ email: req.body.email });
      if (is_exist_email) {
        return commonResponse.error(
          res,
          constants.EMAIL_EXIST,
          400,
          constants.EMAIL_EXIST
        );
      }

      req.body.password = await commonFunctions.encryptStringCrypt(
        req.body.password
      );

      let user = await usersServices.save(req.body);
      if (user) {
        return commonResponse.success(
          res,
          constants.USER_REGISTERED,
          200,
          user,
          constants.USER_REGISTERED,
        );
      }
      return commonResponse.error(lang_code, res, constants.DEFAULTERR);
    } catch (err) {
      console.log("Create User -> ", err);
      return commonResponse.CustomError(
        res,
        constants.DEFAULTERR,
        500,
        {},
        err.message
      );
    }
  },

  //Forgot password send otp
  forgotPassword: async (req, res) => {
    try {
      let lang_code = req.query.lang_code ? req.query.lang_code : "en";
      req.body.email = req.body.email;
      let user = await services.is_exist({ email: req.body.email });
      console.log("users", user);
      if (user) {
        if (user.status != "verified") {
          return commonResponse.error(lang_code, res, "USER_NOT_FOUND");
        }
        let otp = await commonFunctions.randomSixDigit();
        let updateData = {
          otp: otp,
        };
        let updateUser = await services.update(user._id, updateData);
        /* Send Reset Password OTP */
        let emailData = {
          to: updateUser.email,
          subject: "ABC_Drivers || Reset Password OTP",
          text: `Your Reset Password OTP Is ${updateUser.otp}`,
          html: `<h1>ABC-Drivers</h1>
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
    } catch (err) {
      console.log("Error in forgot Password as ", err);
      return commonResponse.error(res, err);
    }
  },
  /*
   *  Reset Password
   */
  resetPassword: async (req, res, next) => {
    try {
      let user = await services.get(req.body._id);
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
          let updateUserDetails = await services.update(user._id, updateData);
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

  GraphAndHoulyPayCount: async (req, res, next) => {
    try {
      let count = await adminServices.dashboardCounts(req.query, req.user.id);
      if (count) {
        return commonResponse.success(res, "DASHBOARD", 200, count, "Success");
      } else {
        return commonResponse.success(
          res,
          "DEFAULT_ERROR",
          200,
          {},
          "Something went wrong, Please try again"
        );
      }
    } catch (error) {
      console.log("List Organizers -> ", error);
      return commonResponse.CustomError(
        res,
        "DEFAULT_INTERNAL_SERVER_ERROR",
        500,
        {},
        error.message
      );
    }
  },

  foreCastingCounts: async (req, res, next) => {
    try {
      let count = await adminServices.foreCastingCount(req.user.id)
      return commonResponse.success(res, "DASHBOARD", 200, count, "Success");
    } catch (error) {
      return commonResponse.CustomError(
        res,
        "DEFAULT_INTERNAL_SERVER_ERROR",
        500,
        {},
        error.message
      );
    }
  },

  foreCastingGuessCount: async (req, res, next) => {
    try {
      let count = await adminServices.foreCastingCount(req.user.id)

      let reqBody = {
        guess_gross_pay: req.body.guess_gross_pay ? parseInt(req.body.guess_gross_pay) : 0,
        guess_mileage: req.body.guess_mileage ? parseInt(req.body.guess_mileage) : 0,
        guess_expenses: req.body.guess_expenses ? parseInt(req.body.guess_expenses) : 0
      }

      let minuteAsNumber = parseInt(req.body.minutes) / 60;
      reqBody.guess_hours_worked = parseFloat((parseInt(req.body.hours) + minuteAsNumber).toFixed(2));

      const netPay = await commonFunctions.futureHourlyPay(reqBody.guess_gross_pay, reqBody.guess_hours_worked, reqBody.guess_mileage, count.netHourPay);

      console.log("minuteAsNumber : ", reqBody.guess_hours_worked)

      if (count) {
        reqBody.guess_gross_pay = parseFloat((reqBody.guess_gross_pay + count.grossPay).toFixed(2))
        reqBody.guess_hours_worked = parseFloat((reqBody.guess_hours_worked + count.hoursWorked).toFixed(2))
        reqBody.guess_mileage = parseFloat((reqBody.guess_mileage + count.mileage).toFixed(2))
        reqBody.guess_expenses = parseFloat((reqBody.guess_expenses + count.expenses).toFixed(2))
        reqBody.guess_net_hour_pay = parseFloat((netPay).toFixed(2))
      }

      return commonResponse.success(res, "DASHBOARD", 200, reqBody, "Success");
    } catch (error) {
      return commonResponse.CustomError(
        res,
        "DEFAULT_INTERNAL_SERVER_ERROR",
        500,
        {},
        error.message
      );
    }
  },

  UserHourlyListByDate: async (req, res, next) => {
    try {
      let getList = await adminServices.listByDate(req.user.id, req.body)
      return commonResponse.success(res, "ACTION_SUCCESSFULLY_PERFORM", 200, getList, "Success");
    } catch (error) {
      return commonResponse.CustomError(
        res,
        "DEFAULT_INTERNAL_SERVER_ERROR",
        500,
        {},
        error.message
      );
    }
  },


  UserExpensesByDate: async (req, res, next) => {
    try {
      let getList = await adminServices.expensesListByDate(req.user.id, req.body)
      return commonResponse.success(res, "ACTION_SUCCESSFULLY_PERFORM", 200, getList, "Success");
    } catch (error) {
      return commonResponse.CustomError(
        res,
        "DEFAULT_INTERNAL_SERVER_ERROR",
        500,
        {},
        error.message
      );
    }
  },

  userList: async (req, res, next) => {
    try {
      let getList = await adminServices.find({ deleted: false, role: "user" })
      return commonResponse.success(res, "ACTION_SUCCESSFULLY_PERFORM", 200, getList, "Success");
    } catch (error) {
      return commonResponse.CustomError(
        res,
        "DEFAULT_INTERNAL_SERVER_ERROR",
        500,
        {},
        error.message
      );
    }
  },

  DesiredMilageCalculation: async (req, res, next) => {
    try {
      let returnObject = {
        desired_hours_worked: req.body.desired_hours_worked ? parseFloat(req.body.desired_hours_worked) : false,
        desired_gross_pay: req.body.desired_gross_pay ? parseFloat(req.body.desired_gross_pay) : false,
        desired_mileage: req.body.desired_mileage ? parseFloat(req.body.desired_mileage) : false,
        desired_net_hour_pay: req.body.desired_net_hour_pay ? parseFloat(req.body.desired_net_hour_pay) : false
      }

      if (returnObject.desired_net_hour_pay == false) {
        returnObject.desired_net_hour_pay = parseFloat(((returnObject.desired_gross_pay - (0.585 * returnObject.desired_mileage)) / returnObject.desired_hours_worked).toFixed(2));
      }
      if (returnObject.desired_gross_pay == false) {
        returnObject.desired_gross_pay = parseFloat(((returnObject.desired_net_hour_pay * returnObject.desired_hours_worked) + (0.585 * returnObject.desired_mileage)).toFixed(2))
      }
      if (returnObject.desired_mileage == false) {
        returnObject.desired_mileage = parseFloat((returnObject.desired_gross_pay - (returnObject.desired_net_hour_pay * returnObject.desired_hours_worked)).toFixed(2))
      }
      if (returnObject.desired_hours_worked == false) {
        returnObject.desired_hours_worked = parseFloat(((returnObject.desired_gross_pay - (0.585 * returnObject.desired_mileage)) / returnObject.desired_net_hour_pay).toFixed(2));
      }

      return commonResponse.success(res, "ACTION_SUCCESSFULLY_PERFORM", 200, returnObject, "Success");

    } catch (error) {
      console.log("Error : ", error)
    }
  },

  DesiredExpensesCalculation: async (req, res, next) => {
    try {
      let returnObject = {
        desired_hours_worked: req.body.desired_hours_worked ? parseFloat(req.body.desired_hours_worked) : false,
        desired_gross_pay: req.body.desired_gross_pay ? parseFloat(req.body.desired_gross_pay) : false,
        desired_expense: req.body.desired_expense ? parseFloat(req.body.desired_expense) : false,
        desired_net_hour_pay: req.body.desired_net_hour_pay ? parseFloat(req.body.desired_net_hour_pay) : false
      }

      if (returnObject.desired_net_hour_pay == false) {
        returnObject.desired_net_hour_pay = parseFloat(((returnObject.desired_gross_pay - (0.585 * returnObject.desired_expense)) / returnObject.desired_hours_worked).toFixed(2));
      }
      if (returnObject.desired_gross_pay == false) {
        returnObject.desired_gross_pay = parseFloat(((returnObject.desired_net_hour_pay * returnObject.desired_hours_worked) + (0.585 * returnObject.desired_expense)).toFixed(2))
      }
      if (returnObject.desired_expense == false) {
        returnObject.desired_expense = parseFloat((returnObject.desired_gross_pay - (returnObject.desired_net_hour_pay * returnObject.desired_hours_worked)).toFixed(2))
      }
      if (returnObject.desired_hours_worked == false) {
        returnObject.desired_hours_worked = parseFloat(((returnObject.desired_gross_pay - (0.585 * returnObject.desired_expense)) / returnObject.desired_net_hour_pay).toFixed(2));
      }

      return commonResponse.success(res, "ACTION_SUCCESSFULLY_PERFORM", 200, returnObject, "Success");

    } catch (error) {
      console.log("Error : ", error)
    }
  },

  /**
     * Update Admin status deactivate / blocked
     */
  updateStatus: async (req, res, next) => {
    try {
      let updateStatus = await adminServices.update(req.params.id, req.body);
      if (updateStatus) {
        return commonResponse.success(res, "SUCCESS", 200, updateStatus, "Status updated successfully");
      } else {
        return commonResponse.customResponse(res, "ERROR", 400, {}, "Couldn't update status");
      }
    } catch (error) {
      return commonResponse.CustomError(res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {}, error.message);
    }
  },


  /**
   * Not Working
   */
  // updateAll: async (req, res, next) => {
  //   try {
  //     let update = await adminServices.updateAll(req.body.old, req.body.new)
  //     if (update) {
  //       return commonResponse.success(res, "DASHBOARD", 200, update, "Success");
  //     } else {
  //       return commonResponse.success(
  //         res,
  //         "DEFAULT_ERROR",
  //         200,
  //         {},
  //         "Something went wrong, Please try again"
  //       );
  //     }
  //   } catch (error) {
  //     console.log("List Organizers -> ", error);
  //     return commonResponse.CustomError(
  //       res,
  //       "DEFAULT_INTERNAL_SERVER_ERROR",
  //       500,
  //       {},
  //       error.message
  //     );
  //   }
  // }
}
