const express = require("express");
const {
    getDealerList,
    getFormBaseConstants,
    fetchMembershipDetailsByDealerCode,
    handleFormOperation,
    handlePostFormData,
    handleValidateField,
} = require("../../../controllers/memberManangement/forms/memberOnBoarding/index");

// const { userAuth } = require("../../../middleware/auth");
const router = express.Router("router");

// router.use(userAuth) // middleware

router.get("/dealers", getDealerList);
router.get("/list-constants", getFormBaseConstants);
router.get("/member-data", fetchMembershipDetailsByDealerCode);
router.post("/member-data", handlePostFormData); // new
router.get("/form-data", handleFormOperation); // new
router.get("/form-data/validate", handleValidateField); // new

module.exports = router;
