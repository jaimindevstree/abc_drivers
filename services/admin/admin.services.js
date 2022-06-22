const Model = require("../users/users.model");
const NetHourlyPayModel = require("../userHourlyPay/hourlyPay.model");
const UserExpensesModel = require("../expenses/expenses.model");
const { commonFunctions } = require("../../helper");
const moment = require("moment")
const mongoose = require("mongoose");


/*
 *  Get By Id
 */
exports.get = async (id) => {
  return await Model.findOne({ _id: id }).select("-password").lean();
};

/*
 *  Update User
 */
exports.update = async (id, reqBody) => {
  console.log(id, reqBody);
  return await Model.findOneAndUpdate(
    { _id: id },
    { $set: reqBody },
    { new: true, runValidators: true }
  )
    .select("-password")
    .lean();
};

/**
 * Find All
 */
exports.find = async (query) => {
  return await Model.find(query).select("-password").lean();
};



/*
 *  List Users and Payment Count
 */
exports.dashboardCounts = async (req, userId) => {
  let returnData = {};

  let query = {
    deleted: false,
    user: mongoose.Types.ObjectId(userId)
  }

  if (req.month == 1) {
    query.date = {
      $gte: new Date(moment().startOf('month').format('YYYY-MM-DD HH:mm:ss')),
      $lt: new Date(moment().endOf('month').format('YYYY-MM-DD HH:mm:ss')),
    };
  }
  if (req.month == 3) {
    query.date = {
      $gte: new Date(moment().subtract(3, 'month').format('YYYY-MM-DD HH:mm:ss')),
      $lt: new Date(moment().endOf('month').format('YYYY-MM-DD HH:mm:ss')),
    };
  }
  if (req.month == 6) {
    query.date = {
      $gte: new Date(moment().subtract(6, 'month').format('YYYY-MM-DD HH:mm:ss')),
      $lt: new Date(moment().endOf('month').format('YYYY-MM-DD HH:mm:ss')),
    };
  }
  if (req.month == 12) {
    query.date = {
      $gte: new Date(moment().subtract(12, 'month').format('YYYY-MM-DD HH:mm:ss')),
      $lt: new Date(moment().endOf('year').format('YYYY-MM-DD HH:mm:ss')),
    };
  }

  let netHourly_pay = await NetHourlyPayModel.aggregate([
    {
      $match: query
    },

    {
      $group: {
        _id: "$date",
        count: {
          $sum: "$net_hour_pay"
        },
      },
    },
    { $sort: { _id: -1 } },
    {
      $project: {
        _id: 0,
        count: {
          $trunc: ["$count", 2]
        },
        date: { $dateToString: { date: "$_id", format: "%m-%d-%Y" } },
      },
    },
  ]);

  let total_milage = await NetHourlyPayModel.aggregate([
    {
      $match: query
    },

    {
      $group: {
        _id: "$date",
        count: {
          $sum: "$mileage"
        },
      },
    },
    { $sort: { _id: -1 } },
    {
      $project: {
        _id: 0,
        count: {
          $trunc: ["$count", 2]
        },
        date: { $dateToString: { date: "$_id", format: "%m-%d-%Y" } },
      },
    },
  ]);

  let total_gross_pay = await NetHourlyPayModel.aggregate([
    {
      $match: query
    },

    {
      $group: {
        _id: "$date",
        count: {
          $sum: "$gross_pay"
        },
      },
    },
    { $sort: { _id: -1 } },
    {
      $project: {
        _id: 0,
        count: {
          $trunc: ["$count", 2]
        },
        date: { $dateToString: { date: "$_id", format: "%m-%d-%Y" } },
      },
    },
  ]);

  let total_hours_worked = await NetHourlyPayModel.aggregate([
    {
      $match: query
    },

    {
      $group: {
        _id: "$date",
        count: {
          $sum: "$hours_worked_as_number"
        },
      },
    },
    { $sort: { _id: -1 } },
    {
      $project: {
        _id: 0,
        count: {
          $trunc: ["$count", 2]
        },
        date: { $dateToString: { date: "$_id", format: "%m-%d-%Y" } },
      },
    },
  ]);

  let total_expenses = await UserExpensesModel.aggregate([
    {
      $match: query
    },
    {
      $unwind: "$expenses"
    },

    {
      $group: {
        _id: "$date",
        count: {
          $sum: "$expenses.amount"
        },
      },
    },
    { $sort: { _id: -1 } },
    {
      $project: {
        _id: 0,
        count: {
          $trunc: ["$count", 2]
        },
        date: { $dateToString: { date: "$_id", format: "%m-%d-%Y" } },
      },
    },
  ])

  returnData.netHourly_pay = netHourly_pay;
  returnData.total_milenge = total_milage;
  returnData.total_gross_pay = total_gross_pay;
  returnData.total_hours_worked = total_hours_worked;
  returnData.total_expenses = total_expenses
  return returnData;
};

/**
 * 
 */
exports.foreCastingCount = async (userId) => {
  let returnData = {

  }
  let query = {
    deleted: false,
    user: mongoose.Types.ObjectId(userId)
  }


  returnData.grossPay = await NetHourlyPayModel.aggregate([
    {
      $match: query
    },
    {
      $group: {
        _id: 0,
        total: {
          $sum: "$gross_pay"
        }
      }
    },
    {
      $project: {
        total: 1,
        Average: {
          $trunc: ["$total", 2]
        },
      }
    }
  ]);

  returnData.hoursWorked = await NetHourlyPayModel.aggregate([
    {
      $match: query
    },
    {
      $group: {
        _id: 0,
        total: {
          $sum: "$hours_worked_as_number"
        }
      }
    },
    {
      $project: {
        total: 1,
        Average: {
          $trunc: ["$total", 2]
        },
      }
    }

  ])


  returnData.mileage = await NetHourlyPayModel.aggregate([
    {
      $match: query
    },
    {
      $group: {
        _id: 0,
        total: {
          $sum: "$mileage"
        }
      }
    },
    {
      $project: {
        total: 1,
        Average: {
          $trunc: ["$total", 2]
        },
      }
    }
  ])

  returnData.netHourPay = await NetHourlyPayModel.aggregate([
    {
      $match: query
    },
    {
      $group: {
        _id: 0,
        TotalDocument: {
          $sum: 1
        },
        total: {
          $sum: "$net_hour_pay"
        }
      }
    },
    {
      $project: {
        total: 1,
        Average: { $divide: ["$total", "$TotalDocument"] }
      }
    },
    {
      $project: {
        total: 1,
        Average: {
          $trunc: ["$Average", 2]
        },
      }
    }
  ])


  returnData.netHourPayWithoutAverage = await NetHourlyPayModel.aggregate([
    {
      $match: query
    },
    {
      $group: {
        _id: 0,
        TotalDocument: {
          $sum: 1
        },
        total: {
          $sum: "$net_hour_pay"
        }
      }
    },
    {
      $project: {
        TotalDocument: 1,
        Average: {
          $trunc: ["$total", 2]
        },
      }
    }
  ])

  returnData.expenses = await UserExpensesModel.aggregate([
    {
      $match: query
    },
    {
      $unwind: "$expenses"
    },
    {
      $group: {
        _id: 0,
        // TotalDocument: {
        //   $sum: 1
        // },
        TotalDocument: {
          "$sum": "$expenses.amount"
        },
      }
    },
    {
      $project: {
        total: 1,
        Average: {
          $trunc: ["$TotalDocument", 2]
        },
      }
    }
  ])



  returnData.netHourPay = (returnData.netHourPay && returnData.netHourPay.length > 0 ? returnData.netHourPay[0].Average : 0)
  returnData.grossPay = (returnData.grossPay && returnData.grossPay.length > 0 ? returnData.grossPay[0].total : 0)
  returnData.hoursWorked = (returnData.hoursWorked && returnData.hoursWorked.length > 0 ? returnData.hoursWorked[0].total : 0)
  returnData.mileage = (returnData.mileage && returnData.mileage.length > 0 ? returnData.mileage[0].Average : 0)
  returnData.expenses = (returnData.expenses && returnData.expenses.length > 0 ? returnData.expenses[0].Average : 0)
  returnData.netHourPayWithoutAverage = (returnData.netHourPayWithoutAverage && returnData.netHourPayWithoutAverage.length > 0 ? returnData.netHourPayWithoutAverage[0].Average : 0)




  return returnData

}


exports.listByDate = async (userId, reqBody) => {
  let query = {
    deleted: false,
    user: mongoose.Types.ObjectId(userId)
  }

  query.date = {
    $gte: new Date(reqBody.startDate && reqBody.startDate ? reqBody.startDate + " 00:00:00" : ""),
    $lt: new Date(reqBody.endDate && reqBody.endDate ? reqBody.endDate + " 23:59:59" : ""),
  };

  data = await NetHourlyPayModel.find(query).sort({ date: 1 }).lean()
  console.log("data : ", data)
  return data
}


exports.expensesListByDate = async (userId, reqBody) => {
  let query = {
    deleted: false,
    user: mongoose.Types.ObjectId(userId)
  }

  query.date = {
    $gte: new Date(reqBody.startDate && reqBody.startDate ? reqBody.startDate + " 00:00:00" : ""),
    $lt: new Date(reqBody.endDate && reqBody.endDate ? reqBody.endDate + " 23:59:59" : ""),
  };

  data = await UserExpensesModel.aggregate([
    {
      $match: query
    },
    {
      $unwind: {
        path: "$expenses"
      }
    },
    {
      $group: {
        _id: "$_id",
        TotalDocument: {
          "$sum": "$expenses.amount"
        },
        created_at: { $first: "$created_at" },
        date: { $first: "$date" },
        expenses: { $push: "$expenses" },
        user: { $first: "$user" },
        description: {
          "$push": "$expenses.description"
        },
      }
    },
    { $sort: { date: -1 } },
    {
      $project: {
        _id: "$_id",
        TotalDocument: 1,
        created_at: 1,
        date: 1,
        expenses: 1,
        description: 1,
        user: 1
      }
    },
  ])

  return data
}