const express = require("express");
const {
  uploadMemberDetailintoTemp,
  updateMemberIntoMainTable,
  downloadMemberUpdateTemplate,
} = require("../../../controllers/memberManangement/forms/updateMemberDetailUpload");

const router = express.Router("router");

router.post("/temp-upload", uploadMemberDetailintoTemp);
router.post("/final-main-update", updateMemberIntoMainTable);
router.get("/excel-template", downloadMemberUpdateTemplate );

module.exports = router;
