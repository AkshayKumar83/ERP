const express = require("express");
const { handleFormOperation, getBaseConstants,handlePostFormData,checkDuplicate } = require("../../../../controllers/whManagement/forms/unitConvMstr");
const { userAuth } = require("../../../../middleware/auth");

const router = express.Router();

// router.use(userAuth)

router.get("/form-data", handleFormOperation); 
router.get("/list-constants",getBaseConstants);
router.post("/form-data",handlePostFormData);
router.put("/form-data",handlePostFormData);
router.get("/form-data/check_duplicate",checkDuplicate);



module.exports = router;
