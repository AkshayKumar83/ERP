const express = require("express");
const router = express.Router("router");

const {
  updatePasswordDetails
  
} = require("../../../../controllers/adminModule/forms/ChangePassword");


router.post("/submit", updatePasswordDetails)

module.exports = router;