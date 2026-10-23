const express = require("express");
// const { userAuth } = require("../../../../middleware/auth");
const { handleFormOperation,handlePostFormData } = require("../../../../controllers/whManagement/forms/itemStockOpngMstr");


const router = express.Router("router");

// router.use(userAuth)

router.get("/form-data",handleFormOperation);
router.put("/form-data",handlePostFormData)



module.exports = router;
