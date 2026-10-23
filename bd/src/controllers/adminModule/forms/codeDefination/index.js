const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");

const { generateSingleInsertQuery, removeKeysFromObject } = require("../../../../utility/query");

const TABLE_NAMES = {
    CATEGORY_TABLE: "MHMMCODE",
    CAT_TYPE_TABLE: "MOMMCODE",
};

exports.getCategoryList = catchAsync(async (req, res, next) => {
    //console.log('category function call')
    const categoryList =
        await db.query(`SELECT CAT_DESC, CAT_GROUP FROM ${TABLE_NAMES.CATEGORY_TABLE} H
        WHERE COALESCE(NULL, H.CAT_TYPE) = H.CAT_TYPE ORDER BY CAT_DESC`);
    return res.status(200).send(categoryList.rows);
});

exports.getCategoryTypeDataByCatGroup = catchAsync(async (req, res, next) => {
    if (!req.query.cat_group) {
        return next("category required");
    }

    let response = {};
    const categoryData = await db.query(
        `select cat_desc, cat_group from integral.mhmmcode where cat_group = $1`,
        [req.query.cat_group]
    );
    // const categoryTypeData = await db.query(
    //     `SELECT * from ${TABLE_NAMES.CAT_TYPE_TABLE} where cat_group = $1`,
    //     [req.query.cat_group]
    // );

    const page = Number(req.query.page) || 1;
const limit = Number(req.query.limit) || 50;
const offset = (page - 1) * limit;

//  Total Count (for totalPages)
const totalCountResult = await db.query(
  `SELECT COUNT(*) FROM ${TABLE_NAMES.CAT_TYPE_TABLE} WHERE cat_group = $1`,
  [req.query.cat_group]
);

const totalRecords = Number(totalCountResult.rows[0].count);
const totalPages = Math.ceil(totalRecords / limit);

//  Actual Data Query
const categoryTypeData = await db.query(
  `SELECT * 
   FROM ${TABLE_NAMES.CAT_TYPE_TABLE} 
   WHERE cat_group = $1
   ORDER BY code
   LIMIT $2 OFFSET $3`,
  [req.query.cat_group, limit, offset]
);
    response = {
        type: "found",
        category: { ...categoryData.rows[0] },
        catTypeData: categoryTypeData.rows || [],
        totalPages,              // ✅ IMPORTANT
        totalRecords
    };

    return res.send(response);
});

const postCodeDefination = async(req, res)=>{
    let selectedCatGroup = req?.body.cat_group;
    let categoryTypeDetails = [...req?.body.newCatType]
    // console.log('selectedCatGroup: ', selectedCatGroup, categoryTypeDetails)
    if (!categoryTypeDetails.length) {
        return res.status(404).json({ message: "please insert atleast a new Record" });
    }
    try {
        await db.query("Begin");

        for (const [index, record] of categoryTypeDetails.entries()) {
            try {
                const getCode = await db.query(`SELECT nextval('integral.s_mommcode_code')`);
                const code = getCode.rows[0].nextval;
                record.code = code;
                record.cat_group = selectedCatGroup;
                const queryForInsert = generateSingleInsertQuery(TABLE_NAMES.CAT_TYPE_TABLE, record, "create_date");

                const valuesForInsertQuery = Object.values(record);
               // console.log("cat_type detail query", queryForInsert);
               // console.log("catType detail value of insert query", valuesForInsertQuery);
                await db.query(queryForInsert, [...valuesForInsertQuery]);
            } catch (error) {
                console.error(`Error inserting record at index ${index}:`, error);
                throw Error(error);
            }
        }
        await db.query("COMMIT"); // for the time being
        res.send({ type: "created" });
    } catch (error) {
        console.error(error);
        await db.query("ROLLBACK");
        res.status(500).json({ message: error.message });
    }
}

const updateCodeDefination = async(req, res)=>{
    let selectedCatGroup = req?.body.cat_group;
    const deletedRecords = req?.body?.deletedCatType || [];
    const updatedRecords = req?.body?.updatedCatType || [];
    const newRecords = req?.body?.newCatType || [];

    try {
        await db.query("BEGIN");

        // Insert New Records
        if (newRecords.length) {
            for (const [index, record] of newRecords.entries()) {
                try {
                    const getCode = await db.query(`SELECT nextval('integral.s_mommcode_code')`);
                    const code = getCode.rows[0].nextval;
                    record.code = code;
                    record.cat_group = selectedCatGroup;
                    const queryForInsert = generateSingleInsertQuery( TABLE_NAMES.CAT_TYPE_TABLE, record,"create_date");

                    const valuesForInsertQuery = Object.values(record);
                   // console.log("cat_type detail query", queryForInsert);
                   // console.log("catType detail value of insert query", valuesForInsertQuery);
                    await db.query(queryForInsert, [...valuesForInsertQuery]);
                } catch (error) {
                    console.error(`Error inserting record at index ${index}:`, error);
                    throw Error(error);
                }
            }
        }

        // Update Existing Records
        if (updatedRecords.length) {
            for (const [index, record] of updatedRecords.entries()) {
                const code = record.code
                let newRecord = removeKeysFromObject(record, ['code', 'create_date', 'update_date', 'create_id', 'update_id' ])
                const columns = Object.keys(newRecord);
                const values = Object.values(newRecord);

                // Create SET clause for SQL UPDATE query
                const setClause = columns
                    .map((column, idx) => `${column} = $${idx + 1}`)
                    .join(", ");
                const query = `UPDATE ${TABLE_NAMES.CAT_TYPE_TABLE} SET ${setClause} WHERE code = $${columns.length + 1}`;

                try {
                    await db.query(query, [...values, code]);
                } catch (error) {
                    console.error(`Error updating record at index ${index}:`, error);
                    throw error
                }
            }
        }

        // Delete Records
        if (deletedRecords.length) { 
            console.log("deleterecords", deletedRecords)
            for (const [index, record] of deletedRecords.entries()) {
                const deleteQuery = `DELETE FROM ${TABLE_NAMES.CAT_TYPE_TABLE} WHERE code = $1 and cat_group =$2`;
                try {
                    await db.query(deleteQuery, [record.code, record.cat_group]);
                } catch (error) {
                   // console.error(`Error deleting record at index ${index}:`, error);
                    throw error
                }
            }
        }

        await db.query("COMMIT"); // Commit if everything succeeds
        res.status(200).json({ message: "Update successful" });
    } catch (error) {
        console.error(error);
        await db.query("ROLLBACK"); // Rollback if something fails
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
}

exports.handleCheckDuplicateDesc = catchAsync(async (req, res, next) => {
    const { cat, desc } = req.query;  
    if (!cat || !desc) {
        return res.status(400).json({ message: "cat and desc are required" });
    }

    const checkDuplicate = await db.query(
        `SELECT COUNT(*) FROM ${TABLE_NAMES.CAT_TYPE_TABLE} WHERE cat_group = $1 AND description = $2`,
        [cat, desc]
    );

    const isDuplicate = checkDuplicate.rows[0].count > 0;
    res.status(200).json({ isDuplicate });
});

exports.handleSaveCodeDefination = catchAsync(async (req, res, next) => {
    if (req?.query?.form_status && req?.query?.form_status === "Update") {
        await updateCodeDefination(req, res);
        return;
    }
    if (req?.query?.form_status === "Insert") {
        await postCodeDefination(req, res);
        return;
    }
});
