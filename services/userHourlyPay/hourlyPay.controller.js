const constants = require('../../helper/resources/messages.json')
const HoulyPayModel = require('../userHourlyPay/hourlyPay.model')
const { commonResponse, commonFunctions } = require('../../helper');

module.exports = {
	/*
	 * Calculate net hourly Mileage for user
	 */
	hourlyPay: async (req, res, next) => {
		try {

			req.body.gross_pay = req.body.gross_pay ? parseFloat((parseFloat(req.body.gross_pay)).toFixed(2)) : 0;
			req.body.mileage = req.body.mileage ? parseFloat((parseFloat(req.body.mileage)).toFixed(2)) : 0;
			let lang_code = req.query.lang_code ? req.query.lang_code : 'en';
			let minuteAsNumber = parseInt(req.body.minutes) / 60;
			req.body.hours_worked_as_number = parseFloat((parseInt(req.body.hours) + minuteAsNumber).toFixed(2));
			let { gross_pay, hours_worked_as_number, mileage, date } = req.body;
			const { id: userId } = req.user;
			const netPay = await commonFunctions.netHourlyPay(gross_pay, hours_worked_as_number, mileage);
			req.body.net_hour_pay = netPay.toFixed(2);
			req.body.date = new Date(date)
			const userNetPay = await HoulyPayModel.create({
				...req.body,
				user: userId
			})
			if (userNetPay) {
				return commonResponse.success(res, constants.NET_HOURLY_PAY, 200, userNetPay)
			}
			return commonResponse.error(lang_code, res, constants.DEFAULTERR);

		} catch (err) {
			console.log('Calculate NetHour Pay -> ', err);
			return commonResponse.CustomError(res, err);
		}
	},


};
