const express = require("express");
// const { userAuth } = require("../../../../middleware/auth");
const { handleFormOperation, handlePostFormData } = require("../../../../controllers/whManagement/forms/itemOpeningRateMstr");


const router = express.Router("router");

// router.use(userAuth)

router.get("/form-data",handleFormOperation);
router.post("/submit",handlePostFormData)



module.exports = router;
