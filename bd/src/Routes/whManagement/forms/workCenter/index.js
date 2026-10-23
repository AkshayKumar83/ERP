const express = require("express");

const { handleFormOperation, getFormBaseConstants,handlePostFormData, handleGenWcId, validateMainWorkCenter} = require("../../../../controllers/whManagement/forms/workCenter");

const router = express.Router("router");


router.get("/list-constants", getFormBaseConstants);
router.get("/form-data",handleFormOperation)
router.post("/form-data",handlePostFormData)
router.put("/form-data",handlePostFormData)
router.get("/form-data/gen-wc-id",handleGenWcId)
router.get("/form-data/validate-main-work-center",validateMainWorkCenter)


module.exports = router;