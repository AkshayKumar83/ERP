const express = require("express")  

const {getFormBaseConstants, handlePostFormData, handleFormOperation, validateForVcode, validateForGeNo, validateForInvData, validateForItemcode, validateForHsncode, authorizedItcData, deleteItcData, validateForDuplicate} = require("../../../controllers/finance/forms/ItcEntry")

const router = express.Router("router");    

router.get("/list-constants", getFormBaseConstants )
router.get("/form-data", handleFormOperation )
router.get("/validate-data/v_code", validateForVcode)
router.get("/validate-data/ge_no", validateForGeNo)
router.get("/validate-data/doc_no", validateForInvData) 
router.get("/validate-data/it_code", validateForItemcode) 
router.get("/validate-data/hsn_sac_code", validateForHsncode)
router.post("/submit", handlePostFormData)
router.put("/auth_itc", authorizedItcData)
router.put("/delete", deleteItcData) 
router.get("/validate-data", validateForDuplicate)




module.exports = router