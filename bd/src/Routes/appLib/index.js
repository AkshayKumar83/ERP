const express = require("express");  
const { checkDateFinYear } = require("../../controllers/appLib");



const router = express.Router("router"); 
router.get("/check-dt-fin-yr", checkDateFinYear);  

module.exports = router;