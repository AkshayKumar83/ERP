const express = require("express"); 

const { 
    getFormBaseConstants,
    fetchUserDetails,
    getHelpListData,
    startTransaction,
    handleTransaction,
    handlePostFormData,
    getValidateData,
    commitTransaction,
    handleFormOperation,
    getHelpSuggestion
} = require("../../../../controllers/adminModule/forms/userMaster");

//const { commitTransaction } = require("../../../controllers/formModule/temp");


const router = express.Router("router");


router.get("/list-constants", getFormBaseConstants);
router.get("/user-data", handleFormOperation);
router.get("/form-data", handleTransaction);//handling all kind of parametric validation
router.get("/help", getHelpListData);//handling all kind of parametric validation 
router.get("/validdata", getValidateData);
router.post("/new-user", handlePostFormData);
router.post("/submit", commitTransaction)
router.get("/autocomplete", getHelpSuggestion)

module.exports = router;