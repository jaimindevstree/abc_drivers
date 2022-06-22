const controller = require('./expenses.controller');
const router = require("express").Router();
const guards = require('../../helper/guards')
const { createExpenses } = require('./expenses.validation')

/*
 *  Hourly Pay
 */
router.post(
    "/expenses",
    createExpenses,
    guards.isAuthorized(['user']),
    controller.createUserExpenses
);



module.exports = router