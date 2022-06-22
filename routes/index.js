const { usersRoutes } = require("../services/users");
const { adminRoutes } = require("../services/admin")
const { userNetHourlyPayRoute } = require("../services/userHourlyPay")
const { userExpensesRoute } = require("../services/expenses")



const initialize = (app) => {
  app.use("/api/users", usersRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/user_net_pay", userNetHourlyPayRoute);
  app.use("/api/user_expenses", userExpensesRoute );
  
  app.use("/authError", (req, res, next) => {
    return next(new Error("DEFAULT_AUTH"));
  });

  app.get("/ping", (req, res) => {
    res.status(200).send({
      success: true,
      statusCode: 200,
    });
  });
};



module.exports = { initialize };