const express = require("express")  

const { handleFormOperation,handlePostFormData} = require("../../../controllers/finance/forms/outstandingPayment")

const { userAuth } = require("../../../middleware/auth");

const router = express.Router("router"); 
// router.use(userAuth)

router.get("/form-data", handleFormOperation);
router.post("/form-data",handlePostFormData);
router.put("/form-data",handlePostFormData);


module.exports = router