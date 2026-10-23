const express = require("express")  

const { handleFormOperation,getFormBaseConstants} = require("../../../controllers/finance/forms/uploadedDocTracker")

const { userAuth } = require("../../../middleware/auth");

const router = express.Router("router"); 
// router.use(userAuth)

router.get('/list-constants',getFormBaseConstants);
router.get("/form-data", handleFormOperation);


module.exports = router