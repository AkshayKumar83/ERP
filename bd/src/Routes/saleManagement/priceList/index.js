
const express = require("express");
// const { userAuth } = require("../../../../middleware/auth");

const { handleFormOperation, handleSubmitFormData,handleUpdateFormData } = require("../../../controllers/saleManagement/priceList");

const router = express.Router();

router.get("/form-data",handleFormOperation);
router.post("/form-data",handleSubmitFormData);
router.put("/form-data", handleUpdateFormData);


module.exports = router;