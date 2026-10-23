const express = require("express");
const { handleFormOperation,handlePostFormData } = require("../../../../controllers/adminModule/forms/dashboardLinkRights");



const router = express.Router('router');

router.get("/form-data",handleFormOperation)
router.put("/form-data",handlePostFormData)


module.exports = router;