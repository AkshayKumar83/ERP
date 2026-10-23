const express = require("express");
const {bulkUploadJV, buildJvFromTempTableData, downloadBulkJVTemplate } = require("../../../controllers/finance/forms/bulkUploadJV");


const router = express.Router();

router.post("/upload-in-temp", bulkUploadJV);
router.post("/build-jv", buildJvFromTempTableData);
router.get("/get-template", downloadBulkJVTemplate);
module.exports = router;
