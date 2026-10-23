const { db } = require("../../../../config/dbConnection");

const catchAsync = require("../../../../utility/catchAsync");
const {
    generateSingleInsertQuery,
    cleanObject,
    cleanObjectGLMstr,
} = require("../../../../utility/query");
const {
    transformMasterToDbData,
    transformGlMasterDetailToDbData,
} = require("./presentation");

const TABLE_NAMES = {
    MHFMGLM_TABLE: "mhfmglm",
    MDFMGLM_TABLE: "mdfmglm",
    // MOFMTRANSPORT_TABLE: "mosmparm",
};

const getDataOnQuery = async (req, res) => {
    const { formStatus, appDivisionId, appFinYear, userId } = req.query;

    let whereClauses = [];

    // Define search keys that should be checked in WHERE clause
    let searchKeys = ["acc_no", "acc_desc"];

    // If any of these searchKeys exist in the query, add them to WHERE clause
    for (const key of searchKeys) {
        if (req.query[key] !== undefined && req.query[key] !== "") {
            whereClauses.push(`${key} = '${req.query[key]}'`);
        }
    }

    // Build WHERE clause dynamically
    let queryValues =
        whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

    let transYear = appFinYear || "2024";
    let divisionId = appDivisionId || 1;
    let user_id = userId || 583;

    try {
        let queryParameter = `ORDER BY acc_no LIMIT 1 OFFSET ${
            req.query.offset || 0
        }`;

        let dataCount;

        if (whereClauses.length > 0) {
            const getCount = await db.query(
                `SELECT COUNT(*) FROM ${TABLE_NAMES.MHFMGLM_TABLE} ${queryValues}`
            );
            dataCount = getCount.rows[0]?.count;
            queryParameter = `${queryValues} ${queryParameter}`;
        } else {
            switch (req?.query?.get_data) {
                case "Query":
                case "First": {
                    const getCount = await db.query(
                        `SELECT COUNT(*) FROM ${TABLE_NAMES.MHFMGLM_TABLE}`
                    );
                    dataCount = getCount.rows[0]?.count;
                    break;
                }

                case "Last": {
                    queryParameter = "ORDER BY acc_no DESC LIMIT 1";
                    break;
                }

                default:
                    queryParameter = `ORDER BY acc_no LIMIT 1 OFFSET ${
                        req.query.offset || 0
                    }`;
                    break;
            }
        }
        // Header  fetching Data Start Here
        const mhfmglmData = await db.query(
            `SELECT * FROM ${TABLE_NAMES.MHFMGLM_TABLE} ${queryParameter}`
        );

        if (mhfmglmData.rows.length === 0) {
            return res.send({
                type: "not found",
                message: "No data found",
                GlMasterHeader: null,
                GlMasterDetail: null,
                count: dataCount || 0,
            });
        }
        //  Header End Here

        // All RollUp Acc. Descreption Start Here
        const glHeader = mhfmglmData.rows[0];

        const level1desc = await db.query(
            `	select cat_desc as rollup_acc1_desc
     from mofmglrollup 
     where level1 = $1
     and level2 is null
     and level3 is null
     and level4 is null;`,
            [glHeader?.rollup_acc1]
        );

        glHeader.rollup_acc1_desc =
            level1desc.rows[0]?.rollup_acc1_desc || null;

        const level2desc = await db.query(
            `select cat_desc as rollup_acc2_desc
     from mofmglrollup 
     where level1 = $1
     and level2 = $2
     and level3 is null
     and level4 is null;`,
            [glHeader?.rollup_acc1, glHeader?.rollup_acc2]
        );

        glHeader.rollup_acc2_desc =
            level2desc.rows[0]?.rollup_acc2_desc || null;

        const level3desc = await db.query(
            `	select cat_desc as rollup_acc3_desc
     from mofmglrollup 
     where level1 = $1
     and level2 =$2
     and level3 = $3
     and level4 is null;`,
            [
                glHeader?.rollup_acc1,
                glHeader?.rollup_acc2,
                glHeader?.rollup_acc3,
            ]
        );

        glHeader.rollup_acc3_desc =
            level3desc.rows[0]?.rollup_acc3_desc || null;

        const level4desc = await db.query(
            `select cat_desc as rollup_acc4_desc
     from mofmglrollup 
     where level1 = $1
     and level2 = $2
     and level3 = $3
     and level4 = $4; `,
            [
                glHeader?.rollup_acc1,
                glHeader?.rollup_acc2,
                glHeader?.rollup_acc3,
                glHeader?.rollup_acc4,
            ]
        );

        glHeader.rollup_acc4_desc =
            level4desc.rows[0]?.rollup_acc4_desc || null;

        const level1Fcdesc = await db.query(
            ` select cat_desc as rollup_acc1_fc_desc
     from mofmglrollup_fc 
     where level1 = $1
     and level2 is null
     and level3 is null
     and level4 is null; `,
            [glHeader?.rollup_acc1_fc]
        );

        glHeader.rollup_acc1_fc_desc =
            level1Fcdesc.rows[0]?.rollup_acc1_fc_desc || null;

        const level2Fcdesc = await db.query(
            ` select cat_desc as rollup_acc2_fc_desc
     from mofmglrollup_fc 
     where level1 = $1
     and level2 = $2
     and level3 is null
     and level4 is null; `,
            [glHeader?.rollup_acc1_fc, glHeader?.rollup_acc2_fc]
        );

        glHeader.rollup_acc2_fc_desc =
            level2Fcdesc.rows[0]?.rollup_acc2_fc_desc || null;

        const level3Fcdesc = await db.query(
            ` select cat_desc as rollup_acc3_fc_desc
     from mofmglrollup_fc 
     where level1 = $1
     and level2 = $2
     and level3 = $3
     and level4 is null; `,
            [
                glHeader?.rollup_acc1_fc,
                glHeader?.rollup_acc2_fc,
                glHeader?.rollup_acc3_fc,
            ]
        );

        glHeader.rollup_acc3_fc_desc =
            level3Fcdesc.rows[0]?.rollup_acc3_fc_desc || null;

        const level4Fcdesc = await db.query(
            ` select cat_desc as rollup_acc4_fc_desc
     from mofmglrollup_fc 
     where level1 = $1
     and level2 = $2
     and level3 = $3
     and level4 = $4 ; `,
            [
                glHeader?.rollup_acc1_fc,
                glHeader?.rollup_acc2_fc,
                glHeader?.rollup_acc3_fc,
                glHeader?.rollup_acc4_fc,
            ]
        );

        glHeader.rollup_acc4_fc_desc =
            level4Fcdesc.rows[0]?.rollup_acc4_fc_desc || null;

        // RollUp   End Here

        // Detail Fetching  Data Start here
        const accNo = mhfmglmData.rows?.[0]?.acc_no;

        const mdfmglmData = await db.query(
            `SELECT * FROM ${TABLE_NAMES.MDFMGLM_TABLE} WHERE trans_year = $1 AND division_id = $2 AND acc_no = $3`,
            [appFinYear, appDivisionId, accNo]
        );

        const GlMasterDetailData = mdfmglmData.rows?.[0] || null;

        // Detail End Here

        const response = {
            type: "found",
            GlMasterHeader: mhfmglmData.rows?.[0] || {},
            GlMasterDetail: GlMasterDetailData,
            count: dataCount || 0,
        };
        return res.send(response);
    } catch (error) {
        return res
            .status(500)
            .send({ message: "Internal Server Error On Query" });
    }
};

// dropDownData
exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
    const genList = await db.query(
        ` SELECT description, code::text as gen_flag
    FROM mommcode
    WHERE cat_group = 'GLEXPS';
    `
    );

    const controlList = await db.query(
        ` select acc_desc , acc_no as controlacc from vwmhfmglm where ctrlprefix = 'Y' and division_id = '1' and active ='Y' order by 1 `
    );

    return res.status(200).json({
        genFlag: genList.rows,
        controlAcc: controlList.rows,
    });
});

const helpListData = async (req, res) => {
    const {
        form_status,
        help_list,
        appDivisionId,
        appFinYear,
        h_rollup_acc1,
        h_rollup_acc2,
        h_rollup_acc3,
        h_rollup_acc1_fc,
        h_rollup_acc2_fc,
        h_rollup_acc3_fc,
    } = req?.query;

    if (!["Insert", "Search", "Update"].includes(form_status)) {
        return res.status(200).send([]);
    }

    if (help_list === "rollUpAcc1") {
        const rollUpAcc1Result = await db.query(
            `SELECT cat_desc, level1
       FROM mofmglrollup AS b
       WHERE level1 IS NOT NULL
         AND level2 IS NULL
         AND level3 IS NULL
         AND level4 IS NULL
       ORDER BY level1;`
        );
        return res.status(200).json(rollUpAcc1Result.rows);
    }

    if (help_list === "rollUpAcc2") {
        const rollUpAcc2Result = await db.query(
            `SELECT cat_desc, level2
       FROM mofmglrollup AS b
       WHERE level1 = $1
         AND level2 IS NOT NULL
         AND level3 IS NULL
         AND level4 IS NULL
       ORDER BY level2;`,
            [h_rollup_acc1]
        );
        return res.status(200).json(rollUpAcc2Result.rows);
    }

    if (help_list === "rollUpAcc3") {
        const rollUpAcc3Result = await db.query(
            `SELECT cat_desc, level3
       FROM mofmglrollup AS b
       WHERE level1 = $1
         AND level2 = $2
         AND level3 IS NOT NULL
         AND level4 IS NULL
       ORDER BY level3;`,
            [h_rollup_acc1, h_rollup_acc2]
        );
        return res.status(200).json(rollUpAcc3Result.rows);
    }

    if (help_list === "rollUpAcc4") {
        const rollUpAcc4Result = await db.query(
            `SELECT cat_desc, level4
       FROM mofmglrollup AS b
       WHERE level1 = $1
         AND level2 = $2
         AND level3 = $3
         AND level4 IS NOT NULL
       ORDER BY level4;`,
            [h_rollup_acc1, h_rollup_acc2, h_rollup_acc3]
        );
        return res.status(200).json(rollUpAcc4Result.rows);
    }

    if (help_list === "rollUpAcc1Fc") {
        const rollUpAcc1Fc = await db.query(
            `SELECT cat_desc, level1
-- FROM mofmglrollup_FC AS b
FROM mofmglrollup_4_bspl AS b
WHERE level1 IS NOT NULL
  AND level2 IS NULL
  AND level3 IS NULL
  AND level4 IS NULL
ORDER BY level1;
`
        );
        return res.status(200).json(rollUpAcc1Fc.rows);
    }

    if (help_list === "rollUpAcc2Fc") {
        const rollUpAcc2Fc = await db.query(
            `SELECT cat_desc, level2
  -- FROM mofmglrollup_FC AS b
FROM mofmglrollup_4_bspl AS b
   WHERE level1 = $1
     AND level2 IS NOT NULL
     AND level3 IS NULL
     AND level4 IS NULL
   ORDER BY level1;`,
            [h_rollup_acc1_fc]
        );
        return res.status(200).json(rollUpAcc2Fc.rows);
    }

    if (help_list === "rollUpAcc3Fc") {
        const rollUpAcc3Fc = await db.query(
            `SELECT cat_desc, level3
    -- FROM mofmglrollup_FC AS b
FROM mofmglrollup_4_bspl AS b
      WHERE level1 = $1
        AND level2 = $2
        AND level3 IS NOT NULL
        AND level4 IS NULL
      ORDER BY cat_desc;`,
            [h_rollup_acc1_fc, h_rollup_acc2_fc]
        );
        return res.status(200).json(rollUpAcc3Fc.rows);
    }

    if (help_list === "rollUpAcc4Fc") {
        const rollUpAcc4Fc = await db.query(
            `SELECT cat_desc, level4
     -- FROM mofmglrollup_FC AS b
FROM mofmglrollup_4_bspl AS b
       WHERE level1 = $1
         AND level2 = $2
         AND level3 = $3
         AND level4 IS NOT NULL
       ORDER BY cat_desc;`,
            [h_rollup_acc1_fc, h_rollup_acc2_fc, h_rollup_acc3_fc]
        );
        return res.status(200).json(rollUpAcc4Fc.rows);
    }

    if (help_list === "accNo") {
        const accNo = await db.query(
            `select acc_desc, acc_no from  mhfmglm order by acc_desc`
        );
        return res.status(200).json(accNo.rows);
    }
    if (help_list === "accDesc") {
        const accDesc = await db.query(
            `select acc_desc, acc_no from  mhfmglm order by acc_desc`
        );
        return res.status(200).json(accDesc.rows);
    }
    return res.status(400).json({ message: "Invalid help_list value" });
};

const insertFormData = async (req, res) => {
    try {
        await db.query("begin");

        const { formHdrData, formDtlData } = req.body;
          // 🔹 Step 1: Call validation procedure before inserting
    await db.query(
      `CALL proc_validation_rollup(
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      )`,
      [
        formHdrData.rollup_acc1,
        formHdrData.rollup_acc1_desc,
        formHdrData.rollup_acc2,
        formHdrData.rollup_acc2_desc,
        formHdrData.rollup_acc3,
        formHdrData.rollup_acc3_desc,
        formHdrData.rollup_acc4,
        formHdrData.rollup_acc4_desc,
        formHdrData.controlacc || null,
        formHdrData.acc_exclusive_to_fc || 'N'
      ]
    );

        let mhfmglmData = transformMasterToDbData(formHdrData);

        const queryForInsert = generateSingleInsertQuery(
            TABLE_NAMES.MHFMGLM_TABLE,
            mhfmglmData
        );

        const valuesForInsertQuery = Object.values(mhfmglmData);

        // inserting header data
        await db.query(queryForInsert, valuesForInsertQuery);

        let mdfmglmData = transformGlMasterDetailToDbData(
            formDtlData,
            formHdrData?.acc_no
        );
        const dtlQueryForInsert = generateSingleInsertQuery(
            TABLE_NAMES.MDFMGLM_TABLE,
            mdfmglmData
        );

        const dtlValuesForInsertQuery = Object.values(mdfmglmData);

        // inserting header data
        await db.query(dtlQueryForInsert, dtlValuesForInsertQuery);

        await db.query("commit");
        res.status(200).json({type: "success", message: "Records inserted successfully"});
    } catch (error) {
        await db.query("rollback");
        console.error("Insert error:", error);
        res.status(500).json({ type: "error", message: error.message || "Internal Server Error",});
    }
};

     const updateFormData = async (req, res) => {
        const { formHdrData, formDtlData } = req.body;

        try {

            await db.query("BEGIN");
                await db.query(
        `CALL proc_validation_rollup(
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        )`,
        [
            formHdrData.rollup_acc1,
            formHdrData.rollup_acc1_desc,
            formHdrData.rollup_acc2,
            formHdrData.rollup_acc2_desc,
            formHdrData.rollup_acc3,
            formHdrData.rollup_acc3_desc,
            formHdrData.rollup_acc4,
            formHdrData.rollup_acc4_desc,
            formHdrData.controlacc || null,
            formHdrData.acc_exclusive_to_fc || 'N'
        ]
        );

        await db.query("CALL proc_active($1, $2, $3)", [
            formDtlData.active || 'Y',
            formHdrData.ctrlprefix || 'N',
            formHdrData.acc_no
            ]);
                    
            // -------- Update Header Table --------
            const cleanHdrData = cleanObjectGLMstr(
                transformMasterToDbData(formHdrData)
            );
            const hdrColumns = Object.keys(cleanHdrData);
            const hdrValues = Object.values(cleanHdrData);

            if (!formHdrData?.acc_no) {
                throw new Error("Missing acc_no.");
            }

            const hdrSetClause = hdrColumns
                .map((col, idx) => `${col} = $${idx + 1}`)
                .join(", ");

            const hdrQuery = `
        UPDATE ${TABLE_NAMES.MHFMGLM_TABLE}
        SET ${hdrSetClause}
        WHERE acc_no = $${hdrColumns.length + 1}
        `;

            await db.query(hdrQuery, [...hdrValues, formHdrData.acc_no]);

            // -------- Update Detail Table --------
            const cleanDtlData = cleanObject(
                transformGlMasterDetailToDbData(formDtlData, formHdrData.acc_no)
            );

            const { acc_no, division_id, trans_year, ...otherFields } =
                cleanDtlData;

            if (!acc_no || !division_id || !trans_year) {
                throw new Error(
                    "Missing composite key (acc_no, division_id, trans_year) in detail row"
                );
            }

            const dtlColumns = Object.keys(otherFields);
            const dtlValues = Object.values(otherFields);

            const dtlSetClause = dtlColumns
                .map((col, idx) => `${col} = $${idx + 1}`)
                .join(", ");

            const dtlQuery = `
        UPDATE ${TABLE_NAMES.MDFMGLM_TABLE}
        SET ${dtlSetClause}
        WHERE acc_no = $${dtlColumns.length + 1}
            AND division_id = $${dtlColumns.length + 2}
            AND trans_year = $${dtlColumns.length + 3}
        `;

            const result = await db.query(dtlQuery, [
                ...dtlValues,
                acc_no,
                division_id,
                trans_year,
            ]);

            // Agar update nahi hua (row exist nahi karta) -> INSERT
            if (result.rowCount === 0) {
                let mdfmglmData = transformGlMasterDetailToDbData(
                    formDtlData,
                    formHdrData.acc_no
                );
                const dtlInsertQuery = generateSingleInsertQuery(
                    TABLE_NAMES.MDFMGLM_TABLE,
                    mdfmglmData
                );
                const dtlInsertValues = Object.values(mdfmglmData);
                await db.query(dtlInsertQuery, dtlInsertValues);
            }

            await db.query("commit");

            return res.status(200) .json({ type: "success", message: "Record updated successfully" });
        } catch (error) {
            console.error("Update error:", error);
            await db.query("ROLLBACK");
            return res
                .status(500)
                .json({
                    type: "error",
                    message: error.message || "Internal Server Error",
                });
        }
    };

//  validation for RollupAc
const validateRollUpAcc = async (req, res) => {
    try {
        const {
            rollup_acc1: rollUpAcc1Raw,
            rollup_acc2: rollUpAcc2Raw,
            rollup_acc3: rollUpAcc3Raw,
            rollup_acc4: rollUpAcc4Raw,
            acc_no,
        } = req.query;

        const cleanAcc = (val) => (val && val !== "00" ? val : null);
        const rollUpAcc1 = cleanAcc(rollUpAcc1Raw);
        const rollUpAcc2 = cleanAcc(rollUpAcc2Raw);
        const rollUpAcc3 = cleanAcc(rollUpAcc3Raw);
        const rollUpAcc4 = cleanAcc(rollUpAcc4Raw);

        if (!rollUpAcc1) {
            return res
                .status(400)
                .json({ type: "error", message: "RollUpAcc1 cannot be null" });
        }

        // Validate account code (acc_no)
        const validateAccountCode = async (acc_no) => {
            try {
                const result = await db.query(
                    `SELECT acc_desc FROM mhfmglm WHERE acc_no = $1`,
                    [acc_no]
                );

                if (result.rowCount > 0) {
                    // Account code already exists
                    return {
                        isValid: false,
                        message: "Account Code is already in use.",
                    };
                }
                // Account code is available
                return {
                    isValid: true,
                    message: "Account Code is available for use.",
                };
            } catch (error) {
                console.error(error);
                return {
                    isValid: false,
                    message:
                        "An error occurred during account code validation.",
                };
            }
        };

        // Run account code validation
        const accountValidation = await validateAccountCode(acc_no);
        if (!accountValidation.isValid) {
            return res.status(400).json({
                type: "error",
                message: accountValidation.message,
            });
        }

        // Validate rollup_acc1
        const rollupAcc1Result = await db.query(
            `SELECT cat_desc FROM mofmglrollup
       WHERE level1 = $1 AND level2 IS NULL AND level3 IS NULL AND level4 IS NULL`,
            [rollUpAcc1]
        );
        if (rollupAcc1Result.rowCount === 0) {
            return res.status(404).json({
                type: "error",
                message:
                    "Invalid Account Code for RollUpAcc1, Please Select From Help List On Double Click",
            });
        }
        const rollupAcc1Desc = rollupAcc1Result.rows[0].cat_desc;

        // Control account check for rollup_acc1
        const controlAcc1Result = await db.query(
            `SELECT controlacc FROM mhfmglm WHERE rollup_acc1 = $1 AND rollup_acc2 IS NULL AND rollup_acc3 IS NULL AND rollup_acc4 IS NULL`,
            [rollUpAcc1]
        );
        if (
            controlAcc1Result.rowCount > 0 &&
            controlAcc1Result.rows[0].controlacc !== null
        ) {
            return res.status(400).json({
                type: "error",
                message:
                    "Cannot create roll-up account when control account is defined at level 1",
                data: {
                    rollup_acc1: null,
                    rollup_acc1_desc: null,
                },
            });
        }

        let rollupAcc2Desc = null;
        let rollupAcc3Desc = null;
        let rollupAcc4Desc = null;

        // Validate rollup_acc2
        if (rollUpAcc2) {
            const rollupAcc2Result = await db.query(
                `SELECT cat_desc FROM mofmglrollup
         WHERE level1 = $1 AND level2 = $2 AND level3 IS NULL AND level4 IS NULL`,
                [rollUpAcc1, rollUpAcc2]
            );
            if (rollupAcc2Result.rowCount === 0) {
                return res.status(404).json({
                    type: "error",
                    message:
                        "Invalid Account Code for RollUpAcc2, Please Select From Help List On Double Click",
                });
            }
            rollupAcc2Desc = rollupAcc2Result.rows[0].cat_desc;

            // Control account check for rollup_acc2
            const controlAcc2Result = await db.query(
                `SELECT controlacc FROM mhfmglm WHERE rollup_acc1 = $1 AND rollup_acc2 = $2 AND rollup_acc3 IS NULL AND rollup_acc4 IS NULL`,
                [rollUpAcc1, rollUpAcc2]
            );
            if (
                controlAcc2Result.rowCount > 0 &&
                controlAcc2Result.rows[0].controlacc !== null
            ) {
                return res.status(400).json({
                    type: "error",
                    message:
                        "Cannot create roll-up account when control account is defined at level 2",
                    data: {
                        rollup_acc2: null,
                        rollup_acc2_desc: null,
                    },
                });
            }
        }

        // Validate rollup_acc3
        if (rollUpAcc3) {
            if (!rollUpAcc2) {
                return res.status(400).json({
                    type: "error",
                    message: "RollUpAcc2 is required for RollUpAcc3 ",
                });
            }
            const rollupAcc3Result = await db.query(
                `SELECT cat_desc FROM mofmglrollup
         WHERE level1 = $1 AND level2 = $2 AND level3 = $3 AND level4 IS NULL`,
                [rollUpAcc1, rollUpAcc2, rollUpAcc3]
            );
            if (rollupAcc3Result.rowCount === 0) {
                return res.status(404).json({
                    type: "error",
                    message:
                        "Invalid Account Code for RollUpAcc3,Please Select From Help List On Double Click",
                });
            }
            rollupAcc3Desc = rollupAcc3Result.rows[0].cat_desc;

            // Control account check for rollup_acc3
            const controlAcc3Result = await db.query(
                `SELECT controlacc FROM mhfmglm WHERE rollup_acc1 = $1 AND rollup_acc2 = $2 AND rollup_acc3 = $3 AND rollup_acc4 IS NULL`,
                [rollUpAcc1, rollUpAcc2, rollUpAcc3]
            );
            if (
                controlAcc3Result.rowCount > 0 &&
                controlAcc3Result.rows[0].controlacc !== null
            ) {
                return res.status(400).json({
                    type: "error",
                    message:
                        "Cannot create roll-up account when control account is defined at level 3",
                    data: {
                        rollup_acc3: null,
                        rollup_acc3_desc: null,
                    },
                });
            }
        }

        // Validate rollup_acc4
        if (rollUpAcc4) {
            if (!rollUpAcc2 || !rollUpAcc3) {
                return res.status(400).json({
                    type: "error",
                    message:
                        "RollUpAcc2 and RollUpAcc3 are required for RollUpAcc4",
                });
            }
            const rollupAcc4Result = await db.query(
                `SELECT cat_desc FROM mofmglrollup
         WHERE level1 = $1 AND level2 = $2 AND level3 = $3 AND level4 = $4`,
                [rollUpAcc1, rollUpAcc2, rollUpAcc3, rollUpAcc4]
            );
            if (rollupAcc4Result.rowCount === 0) {
                return res.status(404).json({
                    type: "error",
                    message:
                        "Invalid Account Code for RollUpAcc4,Please Select From Help List On Double Click",
                });
            }
            rollupAcc4Desc = rollupAcc4Result.rows[0].cat_desc;

            // Control account check for rollup_acc4
            const controlAcc4Result = await db.query(
                `SELECT controlacc FROM mhfmglm WHERE rollup_acc1 = $1 AND rollup_acc2 = $2 AND rollup_acc3 = $3 AND rollup_acc4 = $4`,
                [rollUpAcc1, rollUpAcc2, rollUpAcc3, rollUpAcc4]
            );
            if (
                controlAcc4Result.rowCount > 0 &&
                controlAcc4Result.rows[0].controlacc !== null
            ) {
                return res.status(400).json({
                    type: "error",
                    message:
                        "Cannot create roll-up account when control account is defined at level 4",
                    data: {
                        rollup_acc4: null,
                        rollup_acc4_desc: null,
                    },
                });
            }
        }

        const rollup_acc = `${rollUpAcc1Raw || "00"}${rollUpAcc2Raw || "00"}${
            rollUpAcc3Raw || "00"
        }${rollUpAcc4Raw || "00"}`;
        const rollup_acc_fc = rollup_acc;

        res.status(200).json({
            type: "success",
            message: "Validation successful",
            data: {
                rollup_acc1_desc: rollupAcc1Desc,
                rollup_acc2_desc: rollupAcc2Desc,
                rollup_acc3_desc: rollupAcc3Desc,
                rollup_acc4_desc: rollupAcc4Desc,
                rollup_acc,
                rollup_acc_fc,
                rollup_acc2_fc: rollUpAcc2Raw || "",
                rollup_acc2_fc_desc: rollupAcc2Desc || "",
                rollup_acc3_fc: rollUpAcc3Raw || "",
                rollup_acc3_fc_desc: rollupAcc3Desc || "",
                rollup_acc4_fc: rollUpAcc4Raw || "",
                rollup_acc4_fc_desc: rollupAcc4Desc || "",
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            type: "error",
            message: error.message || "An error occurred",
        });
    }
};

exports.generateAccNo = catchAsync(async (req, res, next) => {
    const {
        rollup_acc1,
        rollup_acc2,
        rollup_acc3,
        rollup_acc4,
        acc_exclusive_to_fc = "N",
    } = req.query;

    try {
        const result = await db.query(
            `SELECT fm_glm_generate_acc_no($1, $2, $3, $4, $5) AS acc_no`,
            [
                rollup_acc1,
                rollup_acc2,
                rollup_acc3,
                rollup_acc4,
                acc_exclusive_to_fc,
            ]
        );

        const accNo = result.rows[0]?.acc_no;

        if (accNo) {
            res.json({ success: true, acc_no: accNo });
        } else {
            res.status(400).json({
                success: false,
                message: "Account number not generated",
            });
        }
    } catch (error) {
        console.error("DB Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});

exports.handleFormOperation = catchAsync(async (req, res, next) => {
    if (["Query", "Search"].includes(req?.query?.formStatus)) {
        await getDataOnQuery(req, res);
        return;
    }

    if (req?.query?.help_list) {
        await helpListData(req, res);
        return;
    }
});

exports.handleUpdateFormData = catchAsync(async (req, res, next) => {
    if (req?.query?.form_status && req?.query?.form_status === "Update") {
        await updateFormData(req, res);
    }
});

exports.handlePostFormData = catchAsync(async (req, res, next) => {
    if (req?.query?.form_status && req?.query?.form_status === "Insert") {
        await insertFormData(req, res);
    }
});

exports.handleValidation = catchAsync(async (req, res, next) => {
    if (req.query?.rollup_acc1) {
        await validateRollUpAcc(req, res);
        return;
    }
});

