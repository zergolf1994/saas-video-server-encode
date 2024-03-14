const { merge } = require("lodash");
const jwt = require("jsonwebtoken");
const { SessionModel } = require("../models/session.models");

exports.isAuthenticated = async (req, res, next) => {
  try {
    if (!req?.headers?.authorization) throw new Error("Something went wrong.");
    const authorization = req?.headers?.authorization?.split(" ");
    const bearer = authorization?.at(1);

    const verify = jwt.verify(bearer, process.env.JWT_TOKEN_KEY);

    const session = await SessionModel.findOne({ _id: verify?.sessionId });

    if (!session) throw new Error("Session Not found!");
    merge(req, { user: verify });
    return next();
  } catch (error) {
    return res.status(401).json({ error: true, message: error?.message });
  }
};
