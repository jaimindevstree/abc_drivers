const controller = require('./admin.controller');
const router = require("express").Router();
const { guard } = require('../../helper')
const { login, register } = require('./admin.validation')


/*
 *  Login Admin
 */
router.post(
  "/login",
  login,
  controller.login
);

/*
 *  Register User By Admin
 */
router.post(
  "/register-user",
  register,
  // guards.isAuthorized(['admin']),
  controller.register
);


/*
 *  Forgot Password
 */
router.post(
  "/forgot-password",
  controller.forgotPassword
);

/*
 *  Reset Password
 */
router.post(
  "/reset-password",
  controller.resetPassword
);


/*
 *  dashboard
 */
router.get(
  "/dashboard",
  guard.isAuthorized(['user']),
  controller.GraphAndHoulyPayCount
);

/*
 *  dashboard
 */
router.get(
  "/forecastingCount",
  guard.isAuthorized(['user']),
  controller.foreCastingCounts
);

/*
*  Future Forecasting Count Calculation
*/
router.post(
  "/future-calculation",
  guard.isAuthorized(['user']),
  controller.foreCastingGuessCount
);

/*
*  Users List Date Wise
*/
router.post(
  "/users-list-date-wise",
  guard.isAuthorized(['user']),
  controller.UserHourlyListByDate
);


/*
*  Users expenses List Date Wise
*/
router.post(
  "/users-expenses-list-date-wise",
  guard.isAuthorized(['user']),
  controller.UserExpensesByDate
);

/*
*  Users expenses List Date Wise
*/
router.get(
  "/userList",
  guard.isAuthorized(['admin']),
  controller.userList
);

/*
 *  Update Status
 */
router.put(
  "/update-status/:id",
  guard.isAuthorized(['admin']),
  controller.updateStatus
);


/*
*  Desired Milage Calculation
*/
router.post(
  "/desired-milage-calculation",
  guard.isAuthorized(['user']),
  controller.DesiredMilageCalculation
);

/*
*  Desired Expense Calculation
*/
router.post(
  "/desired-expense-calculation",
  guard.isAuthorized(['user']),
  controller.DesiredExpensesCalculation
);
module.exports = router