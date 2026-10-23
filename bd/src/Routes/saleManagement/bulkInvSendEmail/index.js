const express = require("express");
const { queueInvoices } = require("../../../controllers/saleManagement/bulkInvSendEmail");

const router = express.Router();

router.get("/send-invoice", queueInvoices);



module.exports = router;
