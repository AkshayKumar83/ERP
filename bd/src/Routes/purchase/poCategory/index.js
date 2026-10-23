const express = require("express");
const { handleFormOperation, handlePostFormData } = require("../../../controllers/purchase/forms/poCategory");


const router = express.Router("router");

router.post("/form-data", handlePostFormData); // new
router.get("/form-data", handleFormOperation); // new

module.exports = router;
