const shell = require("shelljs");
const { EncodeModel } = require("../models/encode.models");
const { MediaModel } = require("../models/media.models");
const { get_video_info } = require("../utils/ffmpeg");
const { SCPRemote } = require("../utils/scp.utils");
const { getLocalServer, getHLSServer } = require("../utils/server.utils");

exports.startRemote = async (req, res) => {
  try {
    if (!fileId) throw new Error("fileId not found");
    // คำสั่ง เพื่อดำเนินการ ส่งต่อไปยัง bash
    shell.exec(
      `sudo bash ${global.dir}/bash/remote.sh`,
      { async: false, silent: false },
      function (data) {}
    );
    return res.json({ msg: "start remote video" });
  } catch (err) {
    return res.json({ error: true, msg: err?.message });
  }
};

exports.remoteVideoEncode = async (req, res) => {
  try {
    const server = await getLocalServer();

    if (!server?._id) throw new Error("Server not found");
    const server_hls = await getHLSServer();
    if (!server_hls) throw new Error("Server hls not found");

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
          remote_dir: {
            $concat: [global.dirPublic, "$$ROOT.fileId"],
          },
          file_convert: {
            $concat: [global.dirPublic, "file_", "$$ROOT.quality", ".mp4"],
          },
          file_name: {
            $concat: ["file_", "$$ROOT.quality", ".mp4"],
          },
          fileId: "$$ROOT.fileId",
        },
      },
      {
        $project: {
          _id: 1,
          task: 1,
          quality: 1,
          percent: 1,
          file_name: 1,
          remote_dir: 1,
          file_convert: 1,
          fileId: 1,
        },
      },
    ]);

    if (!encoding?.length) throw new Error("Encode not found");
    const file = encoding[0];

    const existing = await MediaModel.findOne({
      quality: file.quality,
      fileId: file.fileId,
    });

    if (existing) throw new Error("Existing");

    const scp_data = await SCPRemote({
      ssh: server_hls.auth,
      file,
    });

    if (scp_data?.error) throw new Error("Scp error");

    const { format, streams } = await get_video_info(file.file_convert);

    const videoStream = streams.find((stream) => stream.codec_type === "video");

    if (!videoStream) throw new Error("streams not found");

    let { width, height } = videoStream;

    const saveDb = await MediaModel.create({
      file_name: file.file_name,
      quality: file.quality,
      size: format.size,
      dimention: `${width}x${height}`,
      fileId: file.fileId,
      serverId: server_hls.serverId,
    });

    if (!saveDb?._id) throw new Error("save media error");
    await EncodeModel.deleteOne({ _id: file?._id });
    // ลบไฟล์ที่ประมวลผล
    shell.exec(
      `sudo rm -rf ${global.dirPublic}/*`,
      { async: false, silent: false },
      function (data) {}
    );
    return res.json({ msg: "remoted" });
  } catch (err) {
    return res.json({ error: true, msg: err?.message });
  }
};
