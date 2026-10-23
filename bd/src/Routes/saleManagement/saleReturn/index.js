
const express = require("express");
// const { userAuth } = require("../../../../middleware/auth");

const { handleFormOperation ,verifyHSNCode,handleSubmitFormData,authSaleReturn} = require("../../../controllers/saleManagement/saleReturn");

const router = express.Router();

router.get("/form-data",handleFormOperation);
router.get("/verify-hsn-code",verifyHSNCode);
router.post("/form-data",handleSubmitFormData)
router.put("/form-data",handleSubmitFormData)
router.put('/auth-inv', authSaleReturn) 



module.exports = router;