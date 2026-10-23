const express = require("express");
const {
  handleFormOperation,
  fetchDropdownData,
  helpListData,
  handlePostFormData,
  fetchCustomerDependentData,
  verifyItemCode,
  verifyHSNCode,
  handleUpdateFormData,
  handleDeleteFormData,
} = require("../../../controllers/saleManagement/salesOrder/index");
const { verify } = require("jsonwebtoken");

const router = express.Router("router");

router.get("/form-data", handleFormOperation);
router.get("/dropdown-data", fetchDropdownData);
router.get("/help-list-data", helpListData);
router.post("/form-data", handlePostFormData);
router.put("/form-data", handleUpdateFormData);
router.delete("/form-data", handleDeleteFormData);
router.get("/customer-dependent-data", fetchCustomerDependentData);
router.get("/verify-item-code", verifyItemCode);
router.get("/verify-hsn-code", verifyHSNCode);

module.exports = router;
