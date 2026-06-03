const questionnaireService = require("../services/questionnaireService");
const { success } = require("../utils/apiResponse");

function getMyQuestionnaire(req, res, next) {
  try {
    const data = questionnaireService.getMyQuestionnaire(req.session.userId);
    return success(res, data);
  } catch (error) {
    return next(error);
  }
}

function upsertQuestionnaire(req, res, next) {
  try {
    const data = questionnaireService.upsertQuestionnaire(req.session.userId, req.body);
    return success(res, data);
  } catch (error) {
    return next(error);
  }
}

function getCompatibility(req, res, next) {
  try {
    const data = questionnaireService.getCompatibility(req.session.userId, req.params.userId);
    return success(res, data);
  } catch (error) {
    return next(error);
  }
}

module.exports = { getMyQuestionnaire, upsertQuestionnaire, getCompatibility };
