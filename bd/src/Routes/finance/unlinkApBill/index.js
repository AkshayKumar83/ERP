const express = require("express") 

const {handleFormOperation, updateUnlinkFormData ,checkUnlink } = require("../../../controllers/finance/forms/unlinkApBill") 

const router = express.Router();  

router.get("/form-data", handleFormOperation) 
router.put("/form-data", updateUnlinkFormData)
router.post("/check-unlink", checkUnlink)


module.exports = router