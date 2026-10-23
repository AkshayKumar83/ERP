const express = require("express");
const { getPendingPODataOnQuery,handleAllPoAuthorization
 } = require("../../../controllers/purchase/forms/pendingPoAuth");


const router = express.Router("router");
router.get("/form-data", getPendingPODataOnQuery); 
router.post("/all-po-auth", handleAllPoAuthorization); 


module.exports = router;
