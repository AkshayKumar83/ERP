const express = require("express");
const {
  onQuery,
  nextPre_onQuery,
  onSubmit,
  onSearch,
  onUpdate,
  whenValidateEmpCd,
  fetchCorespondingData,
  getAllowanceData,
  getHelpListData,
  whenValidateMonthNo,
  whenValidateCategory,
  whenValidateGrade,
  whenValidateCostCentr,
  whenValidateDepartment,
  whenValidatePfPayble,
  whenValidatePfNo,
  whenValidateGrpDesc,
  whenValidateEpsPayable,
  whenValidateLeaseInd,
  whenValidateModeCd,
  whenValidateChequeMode,
  whenValidateMhpmempSal,
} = require("../../controllers/hrModule/empSalDetailController");

const router = express.Router("router");

router.get("/query", onQuery);
router.get("/nextPre/query/:data", nextPre_onQuery);
router.post("/submit", onSubmit);
router.post("/search_rec", onSearch);
router.put("/update_rec", onUpdate);
router.get("/get_emp_cd/:data", whenValidateEmpCd);
router.get("/get_month_no/:data", whenValidateMonthNo);
router.get("/get_category/:data", whenValidateCategory);
router.get("/get_grade/:data", whenValidateGrade);
router.get("/get_cost_center/:data", whenValidateCostCentr);
router.get("/get_dept/:data", whenValidateDepartment);
router.post("/get_pf_payble/:data", whenValidatePfPayble);
router.post("/get_pf_no/:data", whenValidatePfNo);
router.post("/get_group_desc", whenValidateGrpDesc);
// router.get("/get_desig_desc/:data",);
router.post('/get_eps_payable',whenValidateEpsPayable)
router.post('/get_lease_ind',whenValidateLeaseInd)
router.post('/get_mode_cd',whenValidateModeCd)
router.post('/get_cheque_mode',whenValidateChequeMode)
router.post('/is_head_rec_exist',whenValidateMhpmempSal) // validate head block

router.post("/coresponding_data", fetchCorespondingData);
router.post("get_allowance_data", getAllowanceData);
router.get("/helpList/:data", getHelpListData);

module.exports = router;
