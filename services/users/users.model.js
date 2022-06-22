const mongoose = require("mongoose");
let softDelete = require("mongoosejs-soft-delete");

const Schema = mongoose.Schema;

const usersSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    full_name: {
      type: String,
      required: true,
    },
    user_name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    profile_pic: {
      type: String,
      required: false,
      default: ""
    },
    otp: {
      type: Number,
      required: false,
      default: 0,
    },
    status: {
      type: String,
      enum: ["verified", "pending", "deactivated"],
      default: "verified",
      required: false,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
      required: false,
    },
    fcm_token: {
      type: String,
      required: false,
      default: "",
    },
    device_type: {
      type: String,
      enum: ["android", "ios"],
      default: "android",
      required: false,
    },
    device_id: {
      type: String,
      required: false,
      default: "",
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

usersSchema.plugin(softDelete);

const Users = mongoose.model("Users", usersSchema);

module.exports = Users;
