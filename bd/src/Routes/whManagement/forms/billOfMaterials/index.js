const express = require("express");
const router = express.Router();

const { handleFormOperation ,handlePostFormData } = require("../../../../controllers/whManagement/forms/billOfMaterials");


router.get("/form-data",handleFormOperation)
router.post("/form-data",handlePostFormData)
router.put("/form-data",handlePostFormData)

module.exports = router;





