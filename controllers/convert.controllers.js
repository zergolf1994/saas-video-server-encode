const { EncodeModel } = require("../models/encode.models");
const { get_video_info, encode_video } = require("../utils/ffmpeg");
const { getLocalServer } = require("../utils/server.utils");

exports.getVideoData = async (req, res) => {
  try {
    const server = await getLocalServer();

    if (!server?._id) throw new Error("Server not found");

    const encoding = await EncodeModel.aggregate([
      { $match: { serverId: server?._id } },
      { $limit: 1 },
      //media
      {
        $lookup: {
          from: "medias",
          localField: "fileId",
          foreignField: "fileId",
          as: "medias",
          pipeline: [
            { $match: { quality: "default" } },
            {
              $project: {
                _id: 0,
                file_name: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          media: { $arrayElemAt: ["$medias", 0] },
        },
      },
      {
        $set: {
          file_default: {
            $concat: [global.dirPublic, "$media.file_name"],
          },
          file_output: {
            $concat: [global.dirPublic, "file_", "$$ROOT.quality", ".mp4"],
          },
          file_name: "$media.file_name",
        },
      },
      {
        $project: {
          _id: 0,
          task: 1,
          quality: 1,
          percent: 1,
          file_name: 1,
          file_default: 1,
          file_output: 1,
        },
      },
    ]);

    if (!encoding?.length) throw new Error("Encode not found");
    const file = encoding[0];

    const video_info = await get_video_info(file.file_default);

    return res.json(video_info);
  } catch (err) {
    console.log(err);
    return res.json({ error: true, msg: err?.message });
  }
};

exports.convertVideo = async (req, res) => {
  try {
    const server = await getLocalServer();

    if (!server?._id) throw new Error("Server not found");

    const encoding = await EncodeModel.aggregate([
      { $match: { serverId: server?._id } },
      { $limit: 1 },
      //media
      {
        $lookup: {
          from: "medias",
          localField: "fileId",
          foreignField: "fileId",
          as: "medias",
          pipeline: [
            { $match: { quality: "default" } },
            {
              $project: {
                _id: 0,
                file_name: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          media: { $arrayElemAt: ["$medias", 0] },
        },
      },
      {
        $set: {
          file_default: {
            $concat: [global.dirPublic, "$media.file_name"],
          },
          file_output: {
            $concat: [global.dirPublic, "file_", "$$ROOT.quality", ".mp4"],
          },
          file_name: "$media.file_name",
        },
      },
      {
        $project: {
          _id: 0,
          task: 1,
          quality: 1,
          percent: 1,
          file_name: 1,
          file_default: 1,
          file_output: 1,
        },
      },
    ]);

    if (!encoding?.length) throw new Error("Encode not found");
    const file = encoding[0];

    const data_encode = await encode_video(file);
    return res.json(data_encode);
  } catch (err) {
    console.log(err);
    return res.json({ error: true, msg: err?.message });
  }
};
