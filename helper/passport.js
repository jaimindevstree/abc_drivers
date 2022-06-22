const passport = require("passport");
const CustomStrategy = require("passport-custom").Strategy;
const usersModel = require("../services/users/users.model");

const commonFunctions = require("./functions");
// Passport Custom Strategy
passport.use(
  "user",
  new CustomStrategy(async function (req, done) {
    try {
      // req.body.user_name = req.body.user_name.toLowerCase();
      let user = await usersModel.findOne({ user_name: { $regex: `^${req.body.user_name}$`, $options: 'i' } });
      console.log("User Data : ", req.body);
      if (!user) {
        return done(new Error("INVALID_USERNAME"));
      }
      let isPasswordValid = await commonFunctions.matchPassword(req.body.password, user.password);
      console.log("isPasswordValid : ", isPasswordValid);
      if (isPasswordValid) {
        return done(null, user);
      } else {
        return done(new Error("INVALID_PASSWORD"));
      }
    } catch (error) {
      return done(error);
    }
  })
);

passport.use(
  "admin",
  new CustomStrategy(async function (req, done) {
    try {
      // req.body.user_name = req.body.user_name;
      let user = await usersModel.findOne({ user_name: req.body.user_name, role: 'admin' });
      console.log("User Data : ", user);
      if (!user) {
        return done(new Error("INVALID_USERNAME"));
      }
      let isPasswordValid = await commonFunctions.matchPassword(req.body.password, user.password);
      console.log("isPasswordValid : ", isPasswordValid);
      if (isPasswordValid) {
        return done(null, user);
      } else {
        return done(new Error("INVALID_PASSWORD"));
      }
    } catch (error) {
      return done(error);
    }
  })
);
