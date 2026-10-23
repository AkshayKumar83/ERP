const express = require("express");
const { getModuleRights, getMenuRights, getFormRights } = require("../../../controllers/adminModule/authorization");

const router = express.Router();

router.get("/module", getModuleRights);
router.get("/menu", getMenuRights);
router.get("/form", getFormRights);



module.exports = router;
