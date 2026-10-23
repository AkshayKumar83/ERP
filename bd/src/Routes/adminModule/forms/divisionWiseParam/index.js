const express = require("express");
const { userAuth } = require("../../../../middleware/auth");
 const { handleFormOperation, handlePostFormData,getFormBaseConstants  } = require("../../../../controllers/adminModule/forms/divisionWiseParam/index");



const router = express.Router("router");

//router.use(userAuth)

router.get("/form-data",handleFormOperation); 
router.get("/list-constants", getFormBaseConstants);
router.post("/submit",handlePostFormData);



module.exports = router;
