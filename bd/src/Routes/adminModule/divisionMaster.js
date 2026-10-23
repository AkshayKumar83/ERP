const express = require("express");
const {
  onQuery,
  nextPre_onQuery,
  empHelpListData,
  groupDropDownData,
  onSubmit,
  whenValidateCustCode,
  whenValidatBankCode,
  onUpdate,
} = require("../../controllers/adminModule/divisionMasterController");

const router = express.Router("router");

router.get("/query", onQuery);
router.get("/nextPre/query/:data", nextPre_onQuery);
router.get("/helpList/:data", empHelpListData);
router.get("/get_drpDwn_data", groupDropDownData);
router.post("/submit", onSubmit);
router.get("/get_custcd/:data", whenValidateCustCode);
router.get("/get_bankcd/:data", whenValidatBankCode);
router.put("/update_record", onUpdate);

module.exports = router;
