const uuid = require("uuid");
const mongoose = require("mongoose");

exports.SessionModel = mongoose.model(
  "sessions",
  new mongoose.Schema(
    {
      _id: { type: String, default: () => uuid?.v4() },
      enable: { type: Boolean, default: true },
      userId: { type: String, require: true },
      keyId: { type: String },
      lastSeen: { type: Date },
    },
    {
      timestamps: true,
    }
  )
);
