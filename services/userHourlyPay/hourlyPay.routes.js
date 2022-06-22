const controller = require('./hourlyPay.controller');
const router = require("express").Router();
const guards = require('../../helper/guards')
const { hourlyPay } = require('./hourlyPay.validation')

/*
 *  Hourly Pay
 */
router.post(
    "/hourly_pay",
    hourlyPay,
    guards.isAuthorized(['user']),
    controller.hourlyPay
);



module.exports = router