const express = require("express");
const { handleCreateEMI,handleCreateEMIFinal, handleFormOperation, getUploadedDocuments, getFormBaseConstants,getGSTRateDetail,getDocList, uploadDocuments, getNewLoanNumber, printRepaySch} = require("../../../../controllers/memberManangement/forms/loan/loanMaster");
const upload = require("../../../../middleware/loan_master/upload");

const router = express.Router();


router.post("/form-data/create_emi", handleCreateEMI); // for Insert
router.post("/form-data/create_emi_final", handleCreateEMIFinal); // for Insert
router.get("/form-data", handleFormOperation); // for Insert
router.get('/form-data/get-loan-no', getNewLoanNumber)
router.get("/list-constants", getFormBaseConstants); // for Insert
router.get("/form-data/get_state_code",getGSTRateDetail ); // for Insert
router.get("/form-data/doc-list", getDocList ); // for Insert
router.post("/form-data/upload-documents", upload.array("documents"), uploadDocuments);
router.get("/form-data/upload-documents", getUploadedDocuments);
router.post('/print-repay-schedule', printRepaySch) 

module.exports = router;




