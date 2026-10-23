const express = require("express");
const {handleFormOperation, handlePostFormData, handleUpdateFormData, CheckRecordDeletable } = require("../../../../controllers/whManagement/forms/itemCodeCtgCls");


const router = express.Router();

router.get("/form-data", handleFormOperation);  
router.post("/form-data", handlePostFormData);   
router.put("/form-data", handleUpdateFormData);
router.get("/check-delete",CheckRecordDeletable)


module.exports = router;