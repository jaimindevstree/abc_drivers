const constants = require('../../helper/resources/messages.json')
const ExpensesModel = require('../expenses/expenses.model')
const { commonResponse } = require('../../helper');

module.exports = {
	/*
	 * Calculate expenses for user
	 */
	createUserExpenses: async (req, res, next) => {
		try {
			let lang_code = req.query.lang_code ? req.query.lang_code : 'en';
			const { id: userId } = req.user;
			req.body.date = new Date(req.body.date)
			console.log("req.body : ", req.body)
			const userExpenses = await ExpensesModel.create({
				...req.body,
				user: userId
			})
			if (userExpenses) {
				return commonResponse.success(res, constants.USER_EXPENSES_CREATED, 200, userExpenses)
			}
			return commonResponse.error(lang_code, res, constants.DEFAULTERR);

		} catch (err) {
			console.log('Calculate user Expenses -> ', err);
			return commonResponse.CustomError(res, err);
		}
	},


};
