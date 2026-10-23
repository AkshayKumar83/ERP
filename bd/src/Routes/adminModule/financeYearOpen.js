const express = require("express");
const {
  onQuery,
  onSumbit,
  onUpdate,
  updateCurrentForm,
  deleteTranPeriod,
  deleteFinPeriod,
  whenValidateStDate,
  whenValidateEndDate,
  whenValidatePeriodSt,
  whenValidatePeriodEnd,
} = require("../../controllers/adminModule/financeYearOpenController");

const router = express.Router("router");

router.get("/query", onQuery);
router.post("/submit", onSumbit);
router.put("/update", onUpdate);
router.put("/update_current_form", updateCurrentForm);
router.delete("/delete_tranperiod/:value", deleteTranPeriod);
router.delete("/delete/fin_period", deleteFinPeriod);
router.get("/get_stdate/:data", whenValidateStDate);
router.get("/get_end_date/:data", whenValidateEndDate);
router.get("/get_periodst/:data", whenValidatePeriodSt);
router.get("/get_periodend/:data", whenValidatePeriodEnd);

module.exports = router;
