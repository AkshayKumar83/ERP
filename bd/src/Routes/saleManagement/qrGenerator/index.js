const express = require("express");

const router = express.Router();

const { searchInvoiceForQR, generateInvoiceQR } = require("../../../controllers/saleManagement/qrGenerator");

router.get("/search", searchInvoiceForQR);

router.post("/generate", generateInvoiceQR);

module.exports = router;
