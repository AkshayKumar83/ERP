const express = require("express");
const router = express.Router("router");

const {
  postUserDetails
  
} = require("../../../../controllers/adminModule/forms/userCreation");


router.post("/submit", postUserDetails)

module.exports = router;