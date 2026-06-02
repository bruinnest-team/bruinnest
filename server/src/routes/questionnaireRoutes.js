const express = require("express");
const router = express.Router();
const questionnaireController = require("../controllers/questionnaireController");
const requireAuth = require("../middlewares/requireAuth");

router.get("/questionnaire/me", requireAuth, questionnaireController.getMyQuestionnaire);
router.put("/questionnaire/me", requireAuth, questionnaireController.upsertQuestionnaire);
router.get("/compatibility/:userId", requireAuth, questionnaireController.getCompatibility);

module.exports = router;
