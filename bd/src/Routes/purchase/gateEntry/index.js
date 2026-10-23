const express = require("express");
const {
  getFormBaseConstants,
  handleFormOperation,
  getChallanItems,
  handleValidation,
  handleSubmitGEData,
  updateGateEntry,
  validateVendorChallanNo,
  printGE

} = require("../../../controllers/purchase/forms/gateEntry");

const router = express.Router("router");
router.get("/list-constants", getFormBaseConstants);
router.get("/form-data", handleFormOperation);
router.get("/fill-item", getChallanItems);
router.get("/validate", handleValidation);
router.post("/submit", handleSubmitGEData);
router.put("/submit", updateGateEntry); 
router.post("/validate-vndr-chln", validateVendorChallanNo); 
 router.post('/print-ge', printGE)


module.exports = router;
