const express = require("express");

const { userAuth } = require("../../../middleware/auth");

const {getFormBaseConstants, handleFormOperation, handlePostFormData} = require("../../../controllers/saleManagement/productMaster") 

const router = express.Router("router");

// router.use(userAuth)

router.get("/list-constants", getFormBaseConstants);
router.get("/form-data", handleFormOperation)
router.post("/submit", handlePostFormData)

module.exports = router;
