const mongoose = require("mongoose");
let softDelete = require("mongoosejs-soft-delete");

const Schema = mongoose.Schema;

const expensesSchema = new Schema(
  {
    expenses: [{
      amount: Number,
      description: String,
    }],
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      trim: true,
      default: null,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

expensesSchema.plugin(softDelete);

const userExpenses = mongoose.model("userExpenses", expensesSchema);

module.exports = userExpenses;
