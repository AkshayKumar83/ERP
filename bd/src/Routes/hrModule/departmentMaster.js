const express = require("express");
const { onQuery, onSubmit, onInsertOneRecord, onUpdate, onDelete, onDelete2, deleteOnCancel, deleteOnInsert, deleteOnQuery } = require("../../controllers/hrModule/departmentMaster");

const router = express.Router("router");

router.get("/query", onQuery);
router.post("/submit", onSubmit);
router.post("/insert_record", onInsertOneRecord);
router.put("/update", onUpdate );
router.delete("/delete_record/:value", deleteOnInsert);
router.delete("/delete_on_query/:value", deleteOnQuery );
router.delete("/delete/:dept_cd", deleteOnCancel );

module.exports = router;
