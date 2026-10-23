const express = require("express");

const {  handleFormOperation, } = require("../../../controllers/finance/Dashboard/index");


const router = express.Router("router");

router.get("/dashboard-data", handleFormOperation); 


module.exports = router;
