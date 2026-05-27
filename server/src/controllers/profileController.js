const profileService = require("../services/profileService");

function createProfile(req, res, next) {
  try {
    const data = profileService.createProfile(req.session.userId, req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createProfile,
};
