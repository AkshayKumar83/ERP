const express = require("express");
const {
    getCategoryList,
    getCategoryTypeDataByCatGroup,
    handleSaveCodeDefination,
    handleCheckDuplicateDesc
    
} = require("../../../../controllers/adminModule/forms/codeDefination");

const router = express.Router("router");

router.get("/category", getCategoryList);
router.get("/category-type", getCategoryTypeDataByCatGroup);
router.post("/form-data", handleSaveCodeDefination);
router.get("/check-duplicate", handleCheckDuplicateDesc);


module.exports = router;
