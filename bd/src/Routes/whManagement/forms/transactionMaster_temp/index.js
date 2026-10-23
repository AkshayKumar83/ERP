const express = require("express");
const { handleFormOperation,handlePostFormData} = require("../../../../controllers/whManagement/forms/transactionMaster_temp");

const router = express.Router();

router.get("/form-data", handleFormOperation);  
router.post('/form-data',handlePostFormData);
router.put('/form-data',handlePostFormData);


module.exports = router;
