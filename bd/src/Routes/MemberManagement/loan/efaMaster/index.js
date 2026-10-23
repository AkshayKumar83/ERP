const express = require("express");
const { handleFormOperation, handlePostFormData, handleUpdateFormData } = require("../../../../controllers/memberManangement/forms/loan/efaMaster");



const router = express.Router("router");

//  router.use(userAuth) // middleware

router.get("/form-data", handleFormOperation); // for Query
// router.get("/form-data", handleFormOperation); // for Query
router.post("/form-data", handlePostFormData); // for Insert
router.put("/form-data", handleUpdateFormData); // for Update

module.exports = router;




