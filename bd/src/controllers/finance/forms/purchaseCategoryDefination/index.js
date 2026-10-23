const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { generateSingleInsertQuery } = require("../../../../utility/query");
const { transformPurchCtgyDfntToDbData } = require("./presentation");

   
   
   let TABLE_NAMES = {
        PURCH_CTGY_DFNT: `MOFMPCAT`,
};
   
     /// For Query Data

        const getDataOnQuery = async (req, res) => { 
            const { formStatus, appDivisionId, appFinYear, userId } = req.query;

            try {
                // Step 1: Main query
                const getData = await db.query(`
                    SELECT *, COUNT(*) OVER() AS total_count 
                    FROM MOFMPCAT m1
                    WHERE EXISTS (
                        SELECT 1
                        FROM MOMMPCAT m2
                        WHERE m2.PO_CAT_PREFIX = m1.PO_CAT_PREFIX
                    )ORDER BY m1.trans_code;
                `);

                if (getData.rowCount > 0) {
                    // Post Query
                    // Step 2: All po_cat_prefix ke liye description find
                    const withDescriptions = await Promise.all(
                        getData.rows.map(async (row) => {
                            const descResult = await db.query(
                                `SELECT PO_CAT_DESCRIPTION 
                                 FROM MOMMPCAT 
                                 WHERE PO_CAT_PREFIX = $1`,
                                [row.po_cat_prefix]
                            );

                              // --- ACC_DESC nikalna (row.frt_acc_no se)
                            const accDescResult = await db.query(
                                `SELECT h.acc_desc
                                   FROM mhfmglm h
                                   JOIN mdfmglm d ON h.acc_no = d.acc_no
                                  WHERE h.acc_no = $1
                                    AND d.division_id = $2
                                    AND d.trans_year = $3`,
                                [row.frt_acc_no, appDivisionId, appFinYear]
                            );

                            return {
                                ...row,
                                po_cat_prefix_desc: descResult.rows[0]?.po_cat_description || null,
                                acc_desc: accDescResult.rows[0]?.acc_desc || null
                            };
                        })
                    );

                    // Step 3: Response 
                    return res.status(200).json({
                        type: "found",
                        purchCtgyDfnt: withDescriptions,
                        count: getData.rows[0].total_count, 
                    });
                } else {
                    return res.status(404).json({
                        type: "not_found",
                        message: "No data found",
                        count: 0,
                    });
                }
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Internal server error on query" });
            }
        };
      
  

    // helpList Function
    const helpListData = async (req, res) => {


    const { help_list,formStatus, appDivisionId, appFinYear, userId } = req.query;



    if (help_list === "POCat") {
        const POCatList = await db.query(
        `select po_cat_description, 
        po_cat_prefix  from MOMMPCAT h
        where 
        not exists (select 1 from MOFMPCAT d where h.po_cat_prefix= d.po_cat_prefix)`
        );
 
        return res.status(200).send(POCatList.rows);
    }
    if (help_list === "frtAccNo") {
        const frtAccNoList = await db.query(
        ` select acc_desc, h.acc_no 
            from mhfmglm h , mdfmglm d
            where h.acc_no = d.ACC_NO
            and d.division_id = $1
            and d.trans_year = $2
            order by 1`,[appDivisionId ,appFinYear]
        );
    
        return res.status(200).send(frtAccNoList.rows);
    }

    };



    const postPurchCtgyDfntData = async (req, res) => {
      const { formData } = req.body;

      await db.query("BEGIN");
      try {

         const hasInsert = Array.isArray(formData) && formData.some(row => row.isStatus === "insert");
         if (!hasInsert) {
      return res.status(400).json({
        type: "error",
        message: "No new record added. Please insert at least one row before submitting."
      });
    }


        for (const row of formData) {
          if (row.isStatus === "insert") {
            //  Step 1: Generate unique trans_code from DB function
            const { rows: transRows } = await db.query(
              "SELECT gen_trans_code($1) AS trans_code",
              [row.division_id]
            );

            const trans_code = transRows[0]?.trans_code;
            
            if (!trans_code) {
              throw new Error("Failed to generate transaction code");
            }

            //  Step 2: Transform + inject trans_code
            const insertRow = {...transformPurchCtgyDfntToDbData(row),trans_code, };

            //  Step 3: Insert
            const insertQuery = generateSingleInsertQuery(TABLE_NAMES.PURCH_CTGY_DFNT, insertRow);
            const valuesForInsertQuery = Object.values(insertRow);

            await db.query(insertQuery, valuesForInsertQuery);
          }
        }

        await db.query("COMMIT");
        res.status(200).json({ type:'success', message: "Insert rows processed successfully" });
      } catch (error) {
        await db.query("ROLLBACK");
        console.error("Insert error:", error);
        res.status(500).json({ type:'error', message: error.message || 'Internal Server Error'});
      }
    };


  const updatePurchCtgyDfntData = async (req, res) => {
  const { formData = [], deleteRecord = [] } = req.body;

  await db.query("BEGIN");
  try {

     const hasInsert = Array.isArray(formData) && formData.some(row => row.isStatus === "insert");
    const hasUpdate = Array.isArray(formData) && formData.some(row => row.isStatus === "update");
    const hasDelete = Array.isArray(deleteRecord) && deleteRecord.length > 0;

     if (!hasInsert && !hasUpdate && !hasDelete) {
      return res.status(400).json({
        type: "error",
        message: "No changes received. Please add/modify/delete records before submitting."
      });
    }

    // ========== 1. Handle Insert ==========
    for (const row of formData.filter((r) => r.isStatus === "insert")) {
      // Generate trans_code
      const { rows: transRows } = await db.query(
        "SELECT gen_trans_code($1) AS trans_code",
        [row.division_id]
      );
      const trans_code = transRows[0]?.trans_code;
      if (!trans_code) throw new Error("Failed to generate transaction code");

      const insertRow = { ...transformPurchCtgyDfntToDbData(row),trans_code, };

      const insertQuery = generateSingleInsertQuery( TABLE_NAMES.PURCH_CTGY_DFNT,insertRow);
      await db.query(insertQuery, Object.values(insertRow));
    }

    // ========== 2. Handle Update ==========
    for (const row of formData.filter((r) => r.isStatus === "update")) {
      const updateRow = transformPurchCtgyDfntToDbData(row);

      const keys = Object.keys(updateRow).filter((k) => k !== "trans_code");
      const values = keys.map((k) => updateRow[k]);
      const setClause = keys.map((col, idx) => `${col} = $${idx + 1}`).join(", ");

      const updateQuery = `
        UPDATE ${TABLE_NAMES.PURCH_CTGY_DFNT}
        SET ${setClause}
        WHERE trans_code = '${row.trans_code}'
      `;

      await db.query(updateQuery, values);
    }

    // ========== 3. Handle Delete ==========
    if (deleteRecord.length > 0) {
      const transCodes = deleteRecord.map((r) => `'${r.trans_code}'`).join(", ");
      const deleteQuery = `
        DELETE FROM ${TABLE_NAMES.PURCH_CTGY_DFNT}
        WHERE trans_code IN (${transCodes})
      `;
      await db.query(deleteQuery);
    }

    await db.query("COMMIT");
    res.status(200).json({type:'success', message: "Update processed successfully" });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Update error:", error);
    res.status(500).json({type: 'error' , message: error.message || "Internal Server Error" });
  }
    };




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

    exports.handlePostFormData = catchAsync(async (req, res, next) => {
        if (req?.query?.form_status && req?.query?.form_status === "Update") {
            await updatePurchCtgyDfntData(req, res);
            return;
        }
        if (req?.query?.form_status) {
            await postPurchCtgyDfntData(req, res);
            return;
        }
    });
    
  exports.handleCheckDuplicate = catchAsync(async (req, res, next) => {
  try {
    const { po_cat_prefix } = req.query;

    if (!po_cat_prefix) {
      return res.status(400).json({
        success: false,
        message: "po_cat_prefix is required",
      });
    }

    const result = await db.query(
      `SELECT po_cat_prefix 
       FROM mofmpcat 
       WHERE po_cat_prefix = $1 
       LIMIT 1`,
      [po_cat_prefix]
    );

    if (result.rows.length > 0) {
      return res.status(409).json({
        exists: true,
        message: "Duplicate PO Cat Prefix found",
      });
    }

    return res.status(200).json({
      exists: false,
      message: "No duplicate",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});
