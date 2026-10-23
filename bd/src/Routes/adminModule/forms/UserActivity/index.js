// const express = require("express");
const express = require("express");

const {
    getFormBaseConstants,
    handleFormOperation,
    getSubmoduleDataByModule,
    getUserName,
    handlePostFormData

} = require("../../../../controllers/adminModule/forms/UserActivity");

const router = express.Router("router");

router.get("/list-constants", getFormBaseConstants)
router.get("/form-data", handleFormOperation)
router.get("/list-submodule", getSubmoduleDataByModule)
//router.get("/form-user", getUserName)
router.post("/submit", handlePostFormData)



module.exports = router; 