const express = require("express");
const { handleFormOperation, handlePostFormData,handleUpdateFormData } = require("../../../controllers/finance/forms/stnadardRemark");


const router = express.Router();

// ✅ Ensure these routes match frontend requests
router.get("/form-data", handleFormOperation);  // for Query
router.post("/form-data", handlePostFormData); // for Insert
router.put("/form-data", handleUpdateFormData); // for Update


module.exports = router;