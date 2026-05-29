const profileService = require("../services/profileService");

function createProfile(req, res, next) {
  try {
    const data = profileService.createProfile(req.session.userId, req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

function getMyProfile(req, res, next) {
  try {
    const data = profileService.getMyProfile(req.session.userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

function updateProfile(req, res, next) {
  try {
    const data = profileService.updateProfile(req.session.userId, req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

function listProfiles(req, res, next) {
  try {
    const data = profileService.listProfiles(req.session.userId, req.query);
    res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

function getProfileDetail(req, res, next) {
  try {
    const data = profileService.getProfileDetail(
      req.session.userId,
      req.params.userId
    );
    res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createProfile,
  getMyProfile,
  updateProfile,
  listProfiles,
  getProfileDetail,
};
