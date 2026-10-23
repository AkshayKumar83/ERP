const express = require("express");
const { getInvBulkMailFormConstant, genBulkInv, getEmiList, generateSelectedInvoices} = require("../../../controllers/memberManangement/forms/invoiceAndBulkMail");
// const upload = require("../../../../middleware/loan_master/upload");

const router = express.Router();


router.get("/list-constant", getInvBulkMailFormConstant); // for Insert
router.get("/bulk-inv-gen", genBulkInv); // for Insert

router.get("/emi-list", getEmiList);
router.post("/generate-selected-inv", generateSelectedInvoices);


module.exports = router;
