
const express = require("express")  

const { handleFormOperation,getFormBaseConstants, handleShowItemBtn, validatePurchaseAccHead,validateSalesAccHead, handleFilterDataOnSelectValue,handleUpdateFormData} = require("../../../controllers/finance/forms/itemWiseAccEntry/index")

const { userAuth } = require("../../../middleware/auth");

const router = express.Router("router"); 
// router.use(userAuth)

router.get("/list-constants", getFormBaseConstants);
router.get("/form-data", handleFormOperation);
router.get("/form-data/show-item",handleShowItemBtn)
router.get('/validate-purchase-acc-head', validatePurchaseAccHead);
router.get('/validate-sales-acc-head', validateSalesAccHead);
router.get('/form-data/filter-selection',handleFilterDataOnSelectValue)
router.put("/form-data", handleUpdateFormData);


module.exports = router