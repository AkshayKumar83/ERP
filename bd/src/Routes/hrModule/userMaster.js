const express = require("express");
const {
  dropDownData,
  userMasterHelp,
  onQuery,
  nextPre_onQuery,
  queryOnUserMasterIndex,
  whenValidateLoginName,
  whenValidateEmpCd,
  whenValidateDivCd,
  whenValidateLocationCd,
  onSumbit,
  onDelete,
  onUpdate,
  onQueryUserList,
  UserListDropDownData,
} = require("../../controllers/hrModule/userMasterController");

// -------  making instance of router  --------
const router = express.Router("router");

router.get("/get_dropdata", dropDownData);
router.get("/fetch_user_master/helplist/:data", userMasterHelp);
router.get("/query", onQuery);
router.get("/nextPre/query/:data", nextPre_onQuery);
router.get("/query_user_mstr_index/:data", queryOnUserMasterIndex);
router.get("/get_login/:data", whenValidateLoginName);
router.get("/get_empcd/:data", whenValidateEmpCd);
router.get("/get_divisioncd/:data", whenValidateDivCd);
router.get("/get_locationcd/:data", whenValidateLocationCd);
router.post("/sumbit", onSumbit);
router.delete("/delete_division/:value", onDelete);
router.put("/update_record", onUpdate);

router.get("/user_list/query", onQueryUserList);
router.get("/user_list/get_listdata", UserListDropDownData);


module.exports = router;
