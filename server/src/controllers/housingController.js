const housingService = require("../services/housingService");
const { success } = require("../utils/apiResponse");

function searchHousing(req, res, next) {
  try {
    const data = housingService.searchHousing(req.query);
    return success(res, data);
  } catch (error) {
    return next(error);
  }
}

function getMyLinkedHousing(req, res, next) {
  try {
    const data = housingService.getMyLinkedHousing(req.session.userId);
    return success(res, data);
  } catch (error) {
    return next(error);
  }
}

function linkMyHousing(req, res, next) {
  try {
    const data = housingService.linkMyHousing(req.session.userId, req.body);
    return success(res, data);
  } catch (error) {
    return next(error);
  }
}

function unlinkMyHousing(req, res, next) {
  try {
    const data = housingService.unlinkMyHousing(req.session.userId);
    return success(res, data);
  } catch (error) {
    return next(error);
  }
}

function getHousingMapData(req, res, next) {
  try {
    const data = housingService.getHousingMapData(
      req.session.userId,
      req.query
    );
    return success(res, data);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  searchHousing,
  getMyLinkedHousing,
  linkMyHousing,
  unlinkMyHousing,
  getHousingMapData,
};
