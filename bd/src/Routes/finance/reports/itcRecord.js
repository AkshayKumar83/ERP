const express = require('express')

const {getFormBaseConstants,handlePostOperation} = require('../../../controllers/finance/reports/itcRecord')   


const router = express.Router("router")


 router.get("/list-constants",getFormBaseConstants);
 router.post("/form-data", handlePostOperation); 

module.exports = router;
