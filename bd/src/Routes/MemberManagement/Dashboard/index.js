const express = require("express");

const {  handleFormOperation,handleLoanMemberOperation } = require("../../../controllers/memberManangement/Dashboard/index");


const router = express.Router("router");

router.get("/dashboard-data", handleFormOperation); 
router.get("/loan-member-data", handleLoanMemberOperation); 

module.exports = router;
