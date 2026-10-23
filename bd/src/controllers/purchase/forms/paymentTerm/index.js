const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { generateSingleInsertQuery, cleanObject, removeKeysFromObject } = require("../../../../utility/query");

let TABLE_NAMES = {
    PAY_TERM_MASTER: `mhmmterm`,
    PAY_TERM_DETAIL: `mdmmterm`,
    PO_MASTER: 'mhmmpo',
};

const getpaymentTermDataOnQuery = async (req, res) => {
   const { formStatus, appDivisionId, appFinYear, userId } = req.query
   
let whereClauses = [];

  // Define search keys that should be checked in WHERE clause
  let searchKeys = ["term_code",];

  // If any of these searchKeys exist in the query, add them to WHERE clause
  for (const key of searchKeys) {
    if (req.query[key] !== undefined && req.query[key] !== "") {
      whereClauses.push(`${key} = '${req.query[key]}'`);
    }
  }
       
   
  // Build WHERE clause dynamically
  let queryValues = whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

  let transYear = appFinYear || "2023";
  let divisionId = appDivisionId || 1;

    try {
        let queryPerameter = `ORDER BY term_code LIMIT 1 OFFSET ${req.query.offset || 0}`;
        let dataCount;
        let saleOrPurchase;
        let paymentTermData={}

        console.log(req?.query)

    
      if(whereClauses.length > 0) {
        const getCount = await db.query(
            `SELECT COUNT(*) FROM ${TABLE_NAMES.PAY_TERM_MASTER} ${queryValues}`
          );
          dataCount = getCount.rows[0]?.count;
          queryPerameter = `${queryValues} ${queryPerameter}`;
         
       } else { 

        switch (req?.query?.get_data) {
            case 'Query':
            case 'First': {
                const getCount = await db.query(`SELECT COUNT(*) FROM ${TABLE_NAMES.PAY_TERM_MASTER}`);
                dataCount = getCount.rows[0]?.count;
                break;
            }
            case 'Last': {
                queryPerameter = 'ORDER BY term_code DESC LIMIT 1';
                break;
            }
            default: 
                queryPerameter = `ORDER BY term_code LIMIT 1 OFFSET ${req.query.offset || 0}`;
                break;
        }
      }

        const getPayTermData = await db.query(`SELECT * FROM ${TABLE_NAMES.PAY_TERM_MASTER} ${queryPerameter}`);
        
        // Ensure you have data before querying directories
        if (!getPayTermData.rows.length) {
            return res.status(404).json({ message: 'No payment Term data found' });
        }

        console.log('getPayTermData', getPayTermData.rows[0])
        saleOrPurchase = getPayTermData.rows[0]?.sale_or_purchase
        if(saleOrPurchase === 'P'){
            const getPoNo = await db.query(`select po_no from ${TABLE_NAMES.PO_MASTER} where po_id = $1`,[getPayTermData.rows[0]?.po_id])
            if(getPoNo.rows.length && getPoNo.rows[0].po_no){
                paymentTermData.po_no = getPoNo.rows[0].po_no
            }else{
                paymentTermData.po_no = ''
            }
        }else{
            const getPoNo = await db.query(`
                SELECT 
                    order_no as po_no, c_po_no as c_po_no, c_name AS party_name 
                FROM 
                    mhsmordr h, mosmcust c
                WHERE 
                    order_id = $1 
                    AND h.c_code = c.c_code;
            `,[getPayTermData.rows[0].po_id])
            if(getPoNo.rowCount>0){
                paymentTermData.po_no = getPoNo.rows[0].po_no;
                paymentTermData.c_po_no = getPoNo.rows[0].c_po_no;
                paymentTermData.party_name = getPoNo.rows[0].party_name;
            }
        }

        const paymentTermDetailData = await db.query(`select * from ${TABLE_NAMES.PAY_TERM_DETAIL} where term_code = $1`,
            [getPayTermData.rows[0].term_code]
        )

        const response = {
            type: "found",
            paymentTermData: {...paymentTermData, ...getPayTermData.rows[0]},
            paymentTermDetailData: paymentTermDetailData.rows,
            count: dataCount || 0,
        };

        return res.json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error on query' });
    }
};

const submitPaymentTerm = async(req,res)=>{
    const {payTerm, payTermDetail} = req?.body;

    if (!payTerm.term_desc) {
        return res.status(404).json({ message: "Term Description cannot be blank" });
    }
    try {
        await db.query("Begin");

           // Fetch the next term_code
        const getTermCode = await db.query(`SELECT coalesce(MAX(TERM_CODE),0)+1 as TERM_CODE FROM ${TABLE_NAMES.PAY_TERM_MASTER}`)
        payTerm.term_code = getTermCode.rows[0].term_code

        //  const getCleanPayTerm = cleanObject({...payTerm});
        //  const finalPayTermObj = removeKeysFromObject(getCleanPayTerm, 'total_perc');

          // Add sale_or_purchase to the payTerm object
        const getCleanPayTerm = cleanObject({
            ...payTerm,
            sale_or_purchase: 'P' // Set to 'P' for purchase 
        });
        const finalPayTermObj = removeKeysFromObject(getCleanPayTerm, 'total_perc');
          
        // Generate and execute the insert query for payTerm
        const payTermForinsert = generateSingleInsertQuery(TABLE_NAMES.PAY_TERM_MASTER, finalPayTermObj, 'currentData')
        const payTermValForInsertQuery = Object.values(finalPayTermObj);

        // Insert Head Data
        await db.query(payTermForinsert, [...payTermValForInsertQuery]);
             
        // Insert Detail Data
        for (const [index, record] of payTermDetail.entries()) {
            try {
             let payTermDetailRec = {
                    ...record,
                    term_code: getTermCode.rows[0].term_code,
                    sr_no: index + 1 // Add sr_no
                };
                delete payTermDetailRec.old_per_pamnt;

                const queryForInsert = generateSingleInsertQuery( TABLE_NAMES.PAY_TERM_DETAIL, payTermDetailRec, "create_date");
                const valuesForInsertQuery = Object.values(payTermDetailRec);

                //Insert Detail Data
                await db.query(queryForInsert, [...valuesForInsertQuery]);
            } catch (error) {
                console.error(`Error inserting record at index ${index}:`, error);
                throw Error(error);
            }
        }

        await db.query("commit"); // for the time being
        res.json({ type: "created" });
    } catch (error) {
        console.error(error);
        await db.query("ROLLBACK");
        res.status(500).json({ message: error.message });
    }
}

// const updatePayTerm = async (req, res) => {
//     const { payTerm } = req?.body;
//     const deletedRecords = req?.body?.deletedPayTermDetail || [];
//     const updatedRecords = req?.body?.updatedPayTermDetail || [];
//     const newRecords = req?.body?.newPayTermDetail || [];

//     try {
//         await db.query("BEGIN");

//         // Update PayTerm Head
//         const updatedPayTermHead = { term_desc: payTerm.term_desc, lc: payTerm.lc };
//         const columns = Object.keys(updatedPayTermHead);
//         const values = Object.values(updatedPayTermHead);
//         const setClause = columns.map((column, idx) => `${column} = $${idx + 1}`).join(", ");
//         const query = `UPDATE ${TABLE_NAMES.PAY_TERM_MASTER} SET ${setClause} WHERE term_code = $${columns.length + 1}`;

//         await db.query(query, [...values, payTerm.term_code]);

//         deletedRecords.forEach((row) => {
//             let newUpdatedRecords = updatedRecords.filter(
//                 (updtRow) => updtRow.sr_no != row.sr_no
//             );
//             updatedRecords = [...newUpdatedRecords];
//         });

//         // Delete Records
//         if (deletedRecords.length) {
//             for (const [index, record] of deletedRecords.entries()) {
//                 const deleteQuery = `DELETE FROM ${TABLE_NAMES.PAY_TERM_DETAIL} WHERE term_code = $1 AND sr_no = $2`;
//                 await db.query(deleteQuery, [record.term_code, record.sr_no]);
//                 }
//             }

//         // Insert New Records
//         if (newRecords.length) {
//             for (const [index, record] of newRecords.entries()) {
//                 const newRecordForInsert = { ...record, term_code: payTerm.term_code };
//                 delete newRecordForInsert?.old_per_pamnt;

//                 const queryForInsert = generateSingleInsertQuery(
//                     TABLE_NAMES.PAY_TERM_DETAIL,
//                     newRecordForInsert,
//                     "create_date"
//                 );
//                 const valuesForInsertQuery = Object.values(newRecordForInsert);

//                 await db.query(queryForInsert, valuesForInsertQuery);
//             }
//         }

//         // Update Existing Records
//         if (updatedRecords.length) {
//             for (const [index, record] of updatedRecords.entries()) {
//                 const newUpdatedRecord = cleanObject({ ...record });
//                 delete newUpdatedRecord.create_date;
//                 delete newUpdatedRecord.term_code;

//                 const columns = Object.keys(newUpdatedRecord);
//                 const values = Object.values(newUpdatedRecord);
//                 const setClause = columns.map((column, idx) => `${column} = $${idx + 1}`).join(", ");
//                 const query = `UPDATE ${TABLE_NAMES.PAY_TERM_DETAIL} SET ${setClause}, update_date = current_date WHERE term_code = $${columns.length + 1} and sr_no = $${columns.length + 2}`;

//                 await db.query(query, [...values, record.term_code, record.sr_no]);
//             }
//         }



//         await db.query("COMMIT");
//         res.status(200).json({ message: "Update successful" });
//     } catch (error) {
//         console.error(error);
//         await db.query("ROLLBACK");
//         res.status(500).json({ message: error.message || "Internal Server Error" });
//     }
// };


// const updatePayTerm = async (req, res) => {
//     const { payTerm } = req?.body;
//     const deletedRecords = req?.body?.deletedPayTermDetail || [];
//     let updatedRecords = req?.body?.updatedPayTermDetail || [];
//     const newRecords = req?.body?.newPayTermDetail || [];

//     try {
//         await db.query("BEGIN");

//         // Update PayTerm Head
//         const updatedPayTermHead = { term_desc: payTerm.term_desc, lc: payTerm.lc };
//         const columns = Object.keys(updatedPayTermHead);
//         const values = Object.values(updatedPayTermHead);
//         const setClause = columns.map((column, idx) => `${column} = $${idx + 1}`).join(", ");
//         const query = `UPDATE ${TABLE_NAMES.PAY_TERM_MASTER} SET ${setClause} WHERE term_code = $${columns.length + 1}`;

//         await db.query(query, [...values, payTerm.term_code]);

//         // Filter out updated records that have been deleted
//         const filteredUpdatedRecords = updatedRecords.filter(
//             (updtRow) => !deletedRecords.some((row) => row.sr_no === updtRow.sr_no)
//         );

//         // Delete Records
//         if (deletedRecords.length) {
//             for (const [index, record] of deletedRecords.entries()) {
//                 const deleteQuery = `DELETE FROM ${TABLE_NAMES.PAY_TERM_DETAIL} WHERE term_code = $1 AND sr_no = $2`;
//                 await db.query(deleteQuery, [record.term_code, record.sr_no]);
//             }
//         }

//         // Insert New Records
//         if (newRecords.length) {
//             for (const [index, record] of newRecords.entries()) {
//                 const newRecordForInsert = { ...record, term_code: payTerm.term_code };
//                 delete newRecordForInsert?.old_per_pamnt;

//                 const queryForInsert = generateSingleInsertQuery(
//                     TABLE_NAMES.PAY_TERM_DETAIL,
//                     newRecordForInsert,
//                     "create_date"
//                 );
//                 const valuesForInsertQuery = Object.values(newRecordForInsert);

//                 await db.query(queryForInsert, valuesForInsertQuery);
//             }
//         }

//         // Update Existing Records
//         if (filteredUpdatedRecords.length) {
//             for (const [index, record] of filteredUpdatedRecords.entries()) {
//                 const newUpdatedRecord = cleanObject({ ...record });
//                 delete newUpdatedRecord.create_date;
//                 delete newUpdatedRecord.term_code;

//                 const columns = Object.keys(newUpdatedRecord);
//                 const values = Object.values(newUpdatedRecord);
//                 const setClause = columns.map((column, idx) => `${column} = $${idx + 1}`).join(", ");
//                 const query = `UPDATE ${TABLE_NAMES.PAY_TERM_DETAIL} SET ${setClause}, update_date = current_date WHERE term_code = $${columns.length + 1} and sr_no = $${columns.length + 2}`;

//                 await db.query(query, [...values, record.term_code, record.sr_no]);
//             }
//         }

//         await db.query("COMMIT");
//         res.status(200).json({ message: "Update successful" });
//     } catch (error) {
//         console.error(error);
//         await db.query("ROLLBACK");
//         res.status(500).json({ message: error.message || "Internal Server Error" });
//     }
// };

const updatePayTerm = async (req, res) => {
  const { payTerm, deletedPayTermDetail = [], updatedPayTermDetail = [], newPayTermDetail = [] } = req?.body;

  if (!payTerm.term_desc) {
    return res.status(400).json({ message: "Term Description cannot be blank" });
  }
  if (!payTerm.term_code) {
    return res.status(400).json({ message: "Term Code is required for update" });
  }

  try {
    await db.query("BEGIN");

    const updatedPayTermHead = cleanObject({ term_desc: payTerm.term_desc, lc: payTerm.lc || "N" });
    const headColumns = Object.keys(updatedPayTermHead);
    const headValues = Object.values(updatedPayTermHead);
    const headSetClause = headColumns.map((column, idx) => `${column} = $${idx + 1}`).join(", ");
    const headQuery = `UPDATE ${TABLE_NAMES.PAY_TERM_MASTER} SET ${headSetClause} WHERE term_code = $${headColumns.length + 1}`;

    console.log("Head Update Query:", headQuery, [...headValues, payTerm.term_code]);
    await db.query(headQuery, [...headValues, payTerm.term_code]);

    if (deletedPayTermDetail.length) {
      for (const [index, record] of deletedPayTermDetail.entries()) {
        if (!record.term_code || !record.sr_no) {
          throw new Error(`Invalid delete record at index ${index}: term_code and sr_no are required`);
        }
        const deleteQuery = `DELETE FROM ${TABLE_NAMES.PAY_TERM_DETAIL} WHERE term_code = $1 AND sr_no = $2`;
        console.log(`Delete Query [${index}]:`, deleteQuery, [record.term_code, record.sr_no]);
        await db.query(deleteQuery, [record.term_code, record.sr_no]);
      }
    }

    if (newPayTermDetail.length) {
      for (const [index, record] of newPayTermDetail.entries()) {
        if (!record.per_pamnt || !record.term_desc || !record.po_cr_days || !record.eff_code || !record.sr_no) {
          throw new Error(`Invalid new record at index ${index}: missing required fields`);
        }
        const newRecordForInsert = cleanObject({ ...record, term_code: payTerm.term_code });
        delete newRecordForInsert?.old_per_pamnt;

        const queryForInsert = generateSingleInsertQuery(TABLE_NAMES.PAY_TERM_DETAIL, newRecordForInsert, "create_date");
        const valuesForInsertQuery = Object.values(newRecordForInsert);

        console.log(`New Insert Query [${index}]:`, queryForInsert, valuesForInsertQuery);
        await db.query(queryForInsert, valuesForInsertQuery);
      }
    }

    if (updatedPayTermDetail.length) {
      for (const [index, record] of updatedPayTermDetail.entries()) {
        if (!record.per_pamnt || !record.term_desc || !record.po_cr_days || !record.eff_code || !record.sr_no) {
          throw new Error(`Invalid update record at index ${index}: missing required fields`);
        }
        const newUpdatedRecord = cleanObject({
          per_pamnt: record.per_pamnt,
          term_desc: record.term_desc,
          po_cr_days: record.po_cr_days,
          eff_code: record.eff_code,
          sr_no: record.sr_no,
        });

        const columns = Object.keys(newUpdatedRecord);
        const values = Object.values(newUpdatedRecord);
        const setClause = columns.map((column, idx) => `${column} = $${idx + 1}`).join(", ");
        const updateQuery = `UPDATE ${TABLE_NAMES.PAY_TERM_DETAIL} SET ${setClause}, update_date = current_date WHERE term_code = $${columns.length + 1} AND sr_no = $${columns.length + 2}`;

        // console.log(`Update Query [${index}]:`, updateQuery, [...values, record.term_code, record.sr_no]);
        const result = await db.query(updateQuery, [...values, record.term_code, record.sr_no]);

        if (result.rowCount === 0) {
          console.warn(`No records updated for term_code=${record.term_code}, sr_no=${record.sr_no}`);
        }
      }
    }

    await db.query("COMMIT");
    res.status(200).json({ message: "Update successful" });
  } catch (error) {
    console.error("Update Error:", error);
    await db.query("ROLLBACK");
    return res.status(500).json({ message: error.message || "Failed to update payment term" });
  }
};

const helpListData = async (req, res) => {
    const { help_list, form_status } = req.query; // Make sure these are extracted from the request
    console.log()

    if (!["Search"].includes(form_status)) {
    return res.status(200).send([]);
  }

    if (help_list === "Code") {
            const CodeList = await db.query(`
               select term_code , term_desc from mhmmterm order by term_code
            `);
            return res.status(200).json(CodeList.rows); // Use json to send response

            }
    
};

exports.getBaseConstants = catchAsync(async(req,res, next)=>{
    const effectiveCode = await db.query(
        `select description, code from mommcode where cat_group = $1 order by 1`
    ,['EFFCD']);
    return res.status(200).json({
        effectiveCode: effectiveCode.rows,
    });
})

exports.handleFormOperation = catchAsync(async (req, res, next) => {
    if (['Query','Search'].includes(req?.query?.formStatus)) {
        await getpaymentTermDataOnQuery(req, res);
        return;
    }
     if(req?.query?.help_list){
        await helpListData(req, res)
        return;
    }
});

exports.handleSubmitFormData = catchAsync(async (req, res, next) => {
    if (req?.query?.form_status && req?.query?.form_status === "Update") {
        await updatePayTerm(req, res);
        return;
    }
    if (req?.query?.form_status === "Insert") {
        await submitPaymentTerm(req, res);
        return;
    }
});
