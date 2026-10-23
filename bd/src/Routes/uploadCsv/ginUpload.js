const express = require("express");
const {
    uploadCsvRecord,
    getCsvData,
    emptyTempVend,
    CheckException,
    getExceptionReport,
} = require("../../controllers/uploadCsv/ginUploadController");

const router = express.Router("router");

router.post("/gin_form", uploadCsvRecord);
router.get("/gin_form/query", getCsvData);
router.delete("/gin_form/cancel", emptyTempVend);
router.get("/gin_form/exception", CheckException);
router.get("/gin_form/report", getExceptionReport);

module.exports = router;
