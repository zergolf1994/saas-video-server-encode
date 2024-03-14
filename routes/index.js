"use strict";
const express = require("express");
const router = express.Router();

const {
  serverDetail,
  serverCreate,
} = require("../controllers/server.controllers");
const {
  prepareEncode,
  dataEncode,
  updateTask,
  getEncode,
  cancleEncode,
  startEncode,
} = require("../controllers/encode.controllers");
const { getVideoData, convertVideo } = require("../controllers/convert.controllers");
const { remoteVideoEncode } = require("../controllers/remote.controllers");

router.all("/", async (req, res) => {
  return res.status(200).json({ msg: "saas-video-server-upload" });
});

//encode
router.get("/encode", getEncode);
router.get("/encode/prepare", prepareEncode);
router.get("/encode/data", dataEncode);
router.all("/encode/update/:encodeId", updateTask);

router.get("/encode/start", startEncode);
router.get("/encode/cancle", cancleEncode);

// server
router.get("/server/detail", serverDetail);
router.get("/server/create", serverCreate);

//convert
router.get("/convert/video", convertVideo);
router.get("/convert/video-data", getVideoData);

//remote
router.get("/remote/video", remoteVideoEncode);

router.all("*", async (req, res) => {
  return res.status(404).json({ error: true, msg: "not found!" });
});

module.exports = router;
