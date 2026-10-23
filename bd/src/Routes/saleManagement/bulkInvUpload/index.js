const express = require("express");
const { uploadInvoices, createBulkInvoice } = require("../../../controllers/saleManagement/bulkInvUpload");

const router = express.Router("router");

router.post("/temp-upload-all-vch", uploadInvoices);
router.post("/create-invoice", createBulkInvoice);



module.exports = router;
