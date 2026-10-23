const express = require("express");
const {
  handleFormOperation,
  handleValidateData,
  handlePostFormData,
  authorisedWorInternalDetails,
  cancelWorInternalDetails
} = require("../../../controllers/purchase/forms/worInternal");

const router = express.Router("router");

router.post("/submit", handlePostFormData);
router.get("/form-data", handleFormOperation);
//router.get("/list-constants", getFormBaseConstants);
router.get("/valid-data", handleValidateData);
router.put("/auth", authorisedWorInternalDetails);
router.put("/cancel", cancelWorInternalDetails);
// router.put("/check_date", checkDateInFinyear);// new

module.exports = router;
