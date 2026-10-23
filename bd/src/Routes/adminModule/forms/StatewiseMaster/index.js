// const express = require("express");
const express = require("express");
const router = express.Router("router");  

const {
    handleFormOperation,
    handlePostFormData,
    getValidateData,
    getSearchedData,
    getQueryData
    
} = require("../../../../controllers/adminModule/forms/StatewiseMaster/index")

router.get("/state-data", handleFormOperation)
router.post("/submit", handlePostFormData)
router.get("/form-data", getValidateData)
router.get("/search-data", getSearchedData )
router.post("/query-data", getQueryData  )

module.exports = router; 