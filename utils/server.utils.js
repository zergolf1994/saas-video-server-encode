const { ServerModel } = require("../models/server.models");
const { get_os } = require("./os");

exports.getLocalServer = async (query = []) => {
  try {
    let { ip_v4 } = get_os();
    return await ServerModel.findOne({
      $and: [
        {
          sv_ip: ip_v4,
          type: global.sv_type,
        },
        ...query,
      ],
    });
  } catch (error) {
    return null;
  }
};

exports.getHLSServer = async () => {
  try {
    const servers = await ServerModel.aggregate([
      {
        $match: {
          active: true,
          type: "hls",
          "ssh_option.username": { $ne: undefined },
          "ssh_option.password": { $ne: undefined },
          "ssh_option.port": { $ne: undefined },
          disk_percent: { $lte: 95 },
        },
      },
      { $sample: { size: 1 } },
      {
        $set: {
          serverId: "$$ROOT._id",
          auth: {
            host: "$$ROOT.sv_ip",
            username: "$$ROOT.ssh_option.username",
            password: "$$ROOT.ssh_option.password",
            port: "$$ROOT.ssh_option.port",
          },
        },
      },
      {
        $project: {
          _id: 0,
          serverId: 1,
          sv_name: 1,
          auth: 1,
        },
      },
    ]);
    if (!servers?.length) throw new Error("Not found");
    return servers[0];
  } catch (error) {
    return null;
  }
};
