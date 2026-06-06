const profileService = require("../services/profileService");
const { success } = require("../utils/apiResponse");

function createProfile(req, res, next) {
  try {
    const data = profileService.createProfile(req.session.userId, req.body);
    return success(res, data, 201);
  } catch (error) {
    return next(error);
  }
}

function getMyProfile(req, res, next) {
  try {
    const data = profileService.getMyProfile(req.session.userId);
    return success(res, data);
  } catch (error) {
    return next(error);
  }
}

function updateProfile(req, res, next) {
  try {
    const data = profileService.updateProfile(req.session.userId, req.body);
    return success(res, data);
  } catch (error) {
    return next(error);
  }
}

function listProfiles(req, res, next) {
  try {
    const data = profileService.listProfiles(req.session.userId, req.query);
    return success(res, data);
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
    return success(res, data);
  } catch (error) {
    return next(error);
  }
}

function uploadMyAvatar(req, res, next) {
  try {
    const data = profileService.uploadMyAvatar(req.session.userId, req.file?.filename);
    return success(res, data);
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
  uploadMyAvatar,
};
