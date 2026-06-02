const express = require("express");
const housingController = require("../controllers/housingController");
const requireAuth = require("../middlewares/requireAuth");

const router = express.Router();

router.use(requireAuth);

router.get("/search", housingController.searchHousing);
router.get("/me/link", housingController.getMyLinkedHousing);
router.put("/me/link", housingController.linkMyHousing);
router.delete("/me/link", housingController.unlinkMyHousing);

module.exports = router;
