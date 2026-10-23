
const express = require("express")

const {getFormBaseConstants, handleFormOperation,handleShowItemBtn,handleFilterDataOnSelectValue,handleUpdateFormData} = require("../../../../controllers/whManagement/forms/itemMinMaxStkLevel")

const router = express.Router("router"); 


router.get("/list-constants", getFormBaseConstants);
router.get("/form-data", handleFormOperation);
router.get("/form-data/show-item",handleShowItemBtn)
router.get('/form-data/filter-selection',handleFilterDataOnSelectValue)
router.put("/form-data", handleUpdateFormData);


module.exports = router