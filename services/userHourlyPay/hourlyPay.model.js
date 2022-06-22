const mongoose = require("mongoose");
let softDelete = require("mongoosejs-soft-delete");

const Schema = mongoose.Schema;

const hourlySchema = new Schema(
  {
    gross_pay: {
      type: Number,
      required: true,
    },
    hours: {
      type: Number,
      required: true,
    },
    minutes: {
      type: Number,
      required: true,
    },
    hours_worked_as_number: {
      type: Number,
      required: true,
    },
    mileage: {
      type: Number,
      required: true,
    },
    net_hour_pay: {
      type: Number,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      trim: true,
      default: null,
    }
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

hourlySchema.plugin(softDelete);

const HoulyPay = mongoose.model("hourlyPay", hourlySchema);

module.exports = HoulyPay;
