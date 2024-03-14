const uuid = require("uuid");
const mongoose = require("mongoose");
const { Mixed } = mongoose.Schema.Types;

exports.FileModel = mongoose.model(
  "files",
  new mongoose.Schema(
    {
      _id: { type: String, default: () => uuid?.v4() },
      public: { type: Boolean, default: true },
      userId: { type: String, require: true },
      slug: { type: String, require: true, unique: true },
      folderId: { type: String },
      title: { type: String },
      originalTitle: { type: String },
      poster: { type: String },
      size: { type: Mixed },
      duration: { type: Number },
      mimeType: { type: String },
      views: { type: Mixed },
      trashedAt: { type: Date },
      deletedAt: { type: Date },
    },
    {
      timestamps: true,
    }
  )
);
