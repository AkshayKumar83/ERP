const express = require("express");
const { handleFormOperation, handlePostFormData } = require("../../../../controllers/adminModule/forms/dashBoardUserRight/index");

const router = express.Router("router");


router.get("/form-data",handleFormOperation);
router.post("/form-data",handlePostFormData);
router.put("/form-data",handlePostFormData);


module.exports = router;
