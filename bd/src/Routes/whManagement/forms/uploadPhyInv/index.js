const express = require("express");
// const { userAuth } = require("../../../../middleware/auth");
const { handleFormOperation,getFormBaseConstants ,uploadExcelToTempTable,handleShowUploadData,handlePostFormData,generateExceptionCSV} = require("../../../../controllers/whManagement/forms/uploadPhyInv");

const multer = require("multer");
const router = express.Router();
const upload = multer({ dest: "uploads/" });

// router.use(userAuth)

router.get("/list-constants", getFormBaseConstants);
router.get("/form-data", handleFormOperation);
router.post("/form-data", handlePostFormData);   
router.post("/upload-phyinv-excel", upload.single("file"), uploadExcelToTempTable);
router.post("/get-uploaded-phyinv",handleShowUploadData);
 router.post("/generate-exception-csv", generateExceptionCSV);




module.exports = router;
