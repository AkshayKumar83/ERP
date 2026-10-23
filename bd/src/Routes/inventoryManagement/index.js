const express = require("express");
const { fetchInventoryConfiguration, generateITCode, fetchInventoryBaseLevelConfiguration, fetchPurchaseStockUnits, upsertInventoryDetails } = require("../../controllers/inventoryManagement");
const router = express.Router("router");

router.get("/fetch", fetchInventoryConfiguration);
router.get("/gen-code", generateITCode);
router.get("/fetch-level", fetchInventoryBaseLevelConfiguration);
router.get("/fetch-stk-prchse-units", fetchPurchaseStockUnits);
router.post("/post-data", upsertInventoryDetails);

module.exports = router;
