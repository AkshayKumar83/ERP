const express = require("express");
// const { userAuth } = require("../../../../middleware/auth");
const { getFormBaseConstants,handleFormOperation,handlePostFormData } = require("../../../../controllers/whManagement/forms/physicalInventory");


const router = express.Router("router");

// router.use(userAuth)

router.get("/list-constants", getFormBaseConstants);
router.get("/form-data", handleFormOperation);
router.post("/form-data", handlePostFormData);   
router.put("/form-data", handlePostFormData);




module.exports = router;
