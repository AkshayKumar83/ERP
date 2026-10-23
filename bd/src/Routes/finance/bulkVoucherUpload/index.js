const express = require("express");

const {
  uploadVouchers,
} = require("../../../controllers/finance/forms/bulkUploadVoucher");

const router = express.Router("router");


router.post("/temp-upload-all-vch", uploadVouchers);
// router.get("/upl_in_main", uploadInMainDealer);

module.exports = router;
