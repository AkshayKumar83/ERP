const express = require("express");
const { userAuth } = require("../../../../middleware/auth");
 const { handleFormOperation, handlePostFormData,getFormBaseConstants  } = require("../../../../controllers/adminModule/forms/currencyMaster");



const router = express.Router("router");

//router.use(userAuth)

router.get("/form-data",handleFormOperation); 
router.post("/submit",handlePostFormData);
router.put("/submit",handlePostFormData);



module.exports = router;
