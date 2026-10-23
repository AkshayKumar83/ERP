const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { generateSingleInsertQuery } = require("../../../../utility/query");
const { transformOutstandingDetailToDbData, transformOutstandingHeaderToDbData } = require("./presentation");


const TABLE_NAMES = {
  TABLE_HDR: `THFMOUTS`,
  TABLE_DTL: `TDFMOUTS`,
}

  const getDataOnQuery = async (req, res) => {
    const { formStatus, appDivisionId, appFinYear, userId } = req.query;

  let whereClauses = [];

    // Define search keys that should be checked in WHERE clause
    let searchKeys = ["acc_no","voucher_no" ];

    // If any of these searchKeys exist in the query, add them to WHERE clause
    for (const key of searchKeys) {
      if (req.query[key] !== undefined && req.query[key] !== "") {
        whereClauses.push(`${key} = '${req.query[key]}'`);
      }
    }

    // Build WHERE clause dynamically
    let queryValues =
      whereClauses.length > 0 ? "and " + whereClauses.join(" AND ") : "";

    let transYear = appFinYear || "2023";
    let divisionId = appDivisionId || 1;
    let user_id = userId || 583;

    

    try {
      let queryParameter = `ORDER BY outs_id LIMIT 1 OFFSET ${req.query.offset || 0}`;
      let dataCount;

      if (whereClauses.length > 0) {
        const getCount = await db.query(
          `SELECT COUNT(*) FROM  ${TABLE_NAMES.TABLE_HDR} WHERE division_id = $1
            ${queryValues}`, [appDivisionId] );
        dataCount = getCount.rows[0]?.count;
        queryParameter = `${queryValues} ${queryParameter}`;
      } else {

      switch (req?.query?.get_data) {
        case "Query":
        case "First": {
          const getCount = await db.query(
            `SELECT COUNT(*) FROM ${TABLE_NAMES.TABLE_HDR} WHERE division_id = $1`,
            [appDivisionId]
          );
          dataCount = getCount.rows[0]?.count;
          break;
        }

        case "Last": {
          queryParameter = "ORDER BY outs_id DESC LIMIT 1";
          break;
        }

        default:
          queryParameter = `ORDER BY outs_id LIMIT 1 OFFSET ${req.query.offset || 0}`;
          break;
      }
    }

      // --- Header fetching Data ---
      const getHeaderData = await db.query(
        `SELECT * FROM ${TABLE_NAMES.TABLE_HDR} WHERE division_id = $1 ${queryParameter}`,
        [appDivisionId]
      );

     if (getHeaderData.rows.length === 0) {
        return res.status(200).json({
          headerData: null,
          detailData: [],
          count: 0,
          message: "No Data Found",
        });
      }


      let headerRow = getHeaderData.rows[0];
      const outsId = headerRow.outs_id;

      // --- Header Post Query (ACC_DESC from MHFMGLM) ---
      if (headerRow?.acc_no) {
        const accResult = await db.query(
          `SELECT acc_desc FROM MHFMGLM WHERE acc_no = $1 LIMIT 1`,
          [headerRow.acc_no]
        );

        headerRow.party_desc = accResult.rows.length > 0 ? accResult.rows[0].acc_desc : null;
      }

      // === Detail record fetch ===
      const detailResult = await db.query(
        `SELECT * FROM ${TABLE_NAMES.TABLE_DTL} WHERE outs_id = $1`,
        [outsId]
      );

      let detailRows = detailResult.rows;

      // --- Detail Post Query (ACC_DESC from VWMDFMGLM) ---
      for (let row of detailRows) {
        if (row.party_acc) {
          const descRes = await db.query(
            `SELECT acc_desc 
              FROM VWMDFMGLM 
              WHERE acc_no = $1 
                AND division_id = $2 
                AND trans_year = $3
              LIMIT 1`,
            [row.party_acc, appDivisionId, appFinYear]
          );

          row.party_acc_desc = descRes.rows.length > 0 ? descRes.rows[0].acc_desc : null;
        } else {
          row.party_acc_desc = null;
        }
      }

      return res.status(200).json({
        headerData: headerRow,
        detailData: detailRows,
        count: dataCount || 0,
      });
    } catch (error) {
      console.error("Error in getDataOnQuery:", error);
      return res.status(500).json({ message: "Internal server error on query" });
    }
 };

    // helpList Function
  const helpListData = async (req, res) => {

    const { help_list, appDivisionId, appFinYear, trans_year, debt_cred:debtCred,form_status } = req?.query;

    if (help_list === "PartyCode") {
      let partyCodeList;
       if (form_status === "Search") {
      partyCodeList = await db.query(
        `SELECT DISTINCT a.acc_no, b.acc_desc
         FROM THFMOUTS a
         JOIN vwmdfmglm b ON b.acc_no = a.acc_no
         ORDER BY a.acc_no`
      );
      return res.status(200).send(partyCodeList.rows);
    }

      if (debtCred === "D") {
        // -------------------- Debit query --------------------
        partyCodeList = await db.query(
          `select acc_desc, acc_no, 
                  substr(get_from_state(c_city,'C','N'),1,20) City 
          from vwmdfmglm m 
          join mosmcust c on substr(acc_no,2) = c.c_code
          where controlacc in (
                select acc_no from mofmptax 
                where tax_code in ('SDCI', 'SDCE')
          ) 
          and COALESCE(ctrlprefix, 'N') = 'N' 
          and division_id = $1
          and trans_year = $2
          and m.active = 'Y' 
          order by 1`,
          [appDivisionId, trans_year]
        );
      } else if (debtCred === "C") {
        // -------------------- Credit query --------------------
        partyCodeList = await db.query(
          `select acc_desc, acc_no , 
                  substr(get_from_state(v_city,'C','N'),1,20) City 
          from vwmdfmglm M 
          join mommvend v on substr(acc_no,2) = v.v_code
          where controlacc in (
                select acc_no from mofmptax 
                where tax_code in ('SCCI', 'SCCE', 'CRDT','CRDE','CRDTR','CRDTO')
          )
          and division_id = $1
          and trans_year = $2
          and COALESCE(ctrlprefix, 'N') = 'N' 
          and M.active = 'Y' 
          order by 1`,
          [appDivisionId, trans_year]
        );
      } else {
        return res.status(400).send({ message: "Invalid debtCred value" });
      }

      return res.status(200).send(partyCodeList.rows);
    }

    if (help_list === "AccNo") {
      const accNoList = await db.query(
        `SELECT acc_desc, acc_no
          FROM vwmdfmglm h
          WHERE division_id = $1
            AND trans_year = $2
            AND NOT EXISTS (
                  SELECT 1
                    FROM mhfmbank d
                  WHERE division_id = $3
                    AND h.acc_no = d.acc_no
            )
          ORDER BY 1`,
        [appDivisionId, appFinYear, appDivisionId]
      );
   
      return res.status(200).send(accNoList.rows);
    }
  };

   // === Voucher Date Validation ===
   const validateVoucherDate = async (req, res) => {
    const { trans_year, voucher_dt } = req.query;

    try {
      const result = await db.query(
        `SELECT st_date, end_date 
          FROM moitfinyear 
          WHERE year_code = $1`,
        [trans_year]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No such Financial Year exists.",
        });
      }

      const { st_date, end_date } = result.rows[0];
      const vDate = new Date(voucher_dt);
      const stDate = new Date(st_date);
      const endDate = new Date(end_date);

      if (vDate < stDate || vDate > endDate) {
        return res.status(400).json({
          success: false,
          message: `Voucher Date must be within the Financial Year (${trans_year}).`,
        });
      }

      return res.json({
        success: true,
        message: "Voucher date is valid.",
      });
    } catch (error) {
      console.error("Error in validateVoucherDate:", error);
      return res.status(500).json({ message: "Server error during validation" });
    }
  };

// === Document Date Validation ===
  const validateDocDate = async (req, res) => {
    const { trans_year, doc_dt } = req.query;

    try {
      const result = await db.query(
        `SELECT st_date, end_date 
          FROM moitfinyear 
          WHERE year_code = $1`,
        [trans_year]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No such Financial Year exists.",
        });
      }

      const { st_date, end_date } = result.rows[0];
      const dDate = new Date(doc_dt);
      const stDate = new Date(st_date);
      const endDate = new Date(end_date);

      if (dDate < stDate || dDate > endDate) {
        return res.status(400).json({
          success: false,
          message: `Document Date must be within the Financial Year (${trans_year}).`,
        });
      }

      // agar date valid hai to DUE_DATE same DOC_DT hi set karenge
      return res.json({
        success: true,
        message: "Document date is valid.",
        due_date: dDate, // ye frontend ko bhej rahe
      });
    } catch (error) {
      console.error("Error in validateDocDate:", error);
      return res.status(500).json({ message: "Server error during validation" });
    }
  };


//  const postOutstndPymtData = async (req, res) => {
//   const payload = req.body; 

//   try {
//     await db.query("BEGIN");

//     // ===== 1. Generate Outs_Id from sequence =====
//     const seqRes = await db.query(`SELECT nextval('s_thfmouts_outs_id') as next_id`);
//     const outsId = seqRes.rows[0].next_id;

//     // ===== 2. PreInsert Header Logic =====
//     let headerPayload = { ...payload.header };

//     if (!headerPayload.voucher_no) {
//       headerPayload.voucher_no = `~${outsId}`;
//     }

//     // ===== 3. Insert Header =====
//     const headerData = transformOutstandingHeaderToDbData({
//       ...headerPayload,
//       outs_id: outsId,   
//     });
//     const headerInsertQuery = generateSingleInsertQuery(TABLE_NAMES.TABLE_HDR, headerData);
//     await db.query(headerInsertQuery, Object.values(headerData));

//     // ===== 4. Insert Details =====
//     for (let detail of payload.details) {
//       const detailPayload = { ...detail, outs_id: outsId };
//       const detailData = transformOutstandingDetailToDbData(detailPayload);
//       const detailInsertQuery = generateSingleInsertQuery(TABLE_NAMES.TABLE_DTL, detailData);
//       await db.query(detailInsertQuery, Object.values(detailData));
//     }

//     // ===== 5. Voucher Number Generation =====
//     let finalVoucherNo = headerPayload.voucher_no;
//     if (finalVoucherNo.startsWith("~")) {
//       const vchRes = await db.query(
//         `SELECT GENOSVOUCHER('OS', $1, $2) as vch_no`, 
//         [headerPayload.trans_year, headerPayload.division_id]
//       );

//       finalVoucherNo = vchRes.rows[0]?.vch_no || finalVoucherNo;

//       await db.query(
//         `UPDATE ${TABLE_NAMES.TABLE_HDR} 
//          SET voucher_no = $1 
//          WHERE outs_id = $2`,
//         [finalVoucherNo, outsId]
//       );
//     }

//     // ===== 6. Call Tdfmouts_ins_upd_yr_op =====
  
    
//     await db.query(
//       `CALL tdfmouts_ins_upd_yr_op($1::character varying, $2::smallint, $3::character varying)`,
//       [headerPayload.acc_no, Number(headerPayload.division_id), headerPayload.finYear]
//     );

//     // ===== 7. Call Update_Tdfmouts_Status =====
//     await db.query(
//       `CALL Update_Tdfmouts_Status($1)`,
//       [outsId]
//     );

//       // ===== 8. Call proc_upd_tofmduepaym =====
//     await db.query(
//       `CALL proc_upd_tofmduepaym($1, $2, $3)`,
//       [outsId, headerPayload.acc_no, headerPayload.debt_cred]
//     );


//     // ===== 9. Commit =====
//     await db.query("COMMIT");

//     return res.status(200).json({
//       success: true,
//       message: "Outstanding Payment Inserted Successfully",
//       outs_id: outsId,
//       voucher_no: finalVoucherNo,
//     });

//   } catch (error) {
//     await db.query("ROLLBACK");
//     console.error("Error in postOutstndPymtData:", error);
//     return res.status(500).json({
//       success: false,
//       message:error.message || "Failed to Outstanding Payment",
//     });
//   }
// };

   const postOutstndPymtData = async (req, res) => {
  const payload = req.body;

  try {
    await db.query("BEGIN");

    // =====  Generate Outs_Id from sequence =====
    const seqRes = await db.query(`SELECT nextval('s_thfmouts_outs_id') as next_id`);
    const outsId = seqRes.rows[0].next_id;

    // =====  PreInsert Header Logic =====
    let headerPayload = { ...payload.header };

    if (!headerPayload.voucher_no) {
      headerPayload.voucher_no = `~${outsId}`;
    }

    // =====  Insert Header =====
    const headerData = transformOutstandingHeaderToDbData({
      ...headerPayload,
      outs_id: outsId,
    });

    const headerInsertQuery = generateSingleInsertQuery(TABLE_NAMES.TABLE_HDR, headerData);
    await db.query(headerInsertQuery, Object.values(headerData));

    // =====  Insert Details with Duplicate Doc_No Check =====
    for (let detail of payload.details) {
      const detailPayload = { ...detail, outs_id: outsId };
      const detailData = transformOutstandingDetailToDbData(detailPayload);

      //  Duplicate Check for doc_no
      const duplicateCheck = await db.query(
        `SELECT 1 FROM ${TABLE_NAMES.TABLE_DTL}
         WHERE acc_no = $1 AND doc_no = $2`,
        [detailData.acc_no, detailData.doc_no]
      );

      if (duplicateCheck.rows.length > 0) {
        await db.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          message: `Duplicate Document Number "${detailData.doc_no}" found for Account "${detailData.acc_no}". Please use a unique Doc No.`,
        });
      }

      //  If no duplicate found, insert detail row
      const detailInsertQuery = generateSingleInsertQuery(TABLE_NAMES.TABLE_DTL, detailData);
      await db.query(detailInsertQuery, Object.values(detailData));
    }

    // =====  Voucher Number Generation =====
    let finalVoucherNo = headerPayload.voucher_no;
    if (finalVoucherNo.startsWith("~")) {
      const vchRes = await db.query(
        `SELECT GENOSVOUCHER('OS', $1, $2) as vch_no`,
        [headerPayload.trans_year, headerPayload.division_id]
      );

      finalVoucherNo = vchRes.rows[0]?.vch_no || finalVoucherNo;

      await db.query(
        `UPDATE ${TABLE_NAMES.TABLE_HDR}
         SET voucher_no = $1
         WHERE outs_id = $2`,
        [finalVoucherNo, outsId]
      );
    }

    // =====  Call Tdfmouts_ins_upd_yr_op =====
    await db.query(
      `CALL tdfmouts_ins_upd_yr_op($1::character varying, $2::smallint, $3::character varying)`,
      [headerPayload.acc_no, Number(headerPayload.division_id), headerPayload.finYear]
    );

    // =====  Call Update_Tdfmouts_Status =====
    await db.query(`CALL Update_Tdfmouts_Status($1)`, [outsId]);

    // =====  Call proc_upd_tofmduepaym =====
    await db.query(
      `CALL proc_upd_tofmduepaym($1, $2, $3)`,
      [outsId, headerPayload.acc_no, headerPayload.debt_cred]
    );

    // =====  Commit =====
    await db.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Outstanding Payment Inserted Successfully",
      outs_id: outsId,
      voucher_no: finalVoucherNo,
    });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Error in postOutstndPymtData:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to Insert Outstanding Payment",
    });
  }
};




//   const updateOutstndPymtData = async (req, res) => {
//   const payload = req.body;

//   try {
//     await db.query("BEGIN");

//     const { header, details, deleteRecords } = payload;
//     const outsId = header.outs_id; // existing record ka ID

 

//     // ===== 1. Update Header =====
//     const headerData = transformOutstandingHeaderToDbData(header);
//     const headerKeys = Object.keys(headerData).filter(k => k !== "outs_id");
//     const headerValues = headerKeys.map(k => headerData[k]);
//     const setClause = headerKeys.map((col, idx) => `${col} = $${idx + 1}`).join(", ");

//     await db.query(
//       `UPDATE ${TABLE_NAMES.TABLE_HDR} 
//        SET ${setClause} 
//        WHERE outs_id = $${headerKeys.length + 1}`,
//       [...headerValues, outsId]
//     );

//     // ===== 2. Delete Details =====
//     if (deleteRecords && deleteRecords.length > 0) {
//       for (let del of deleteRecords) {
//         await db.query(
//           `DELETE FROM ${TABLE_NAMES.TABLE_DTL} 
//            WHERE outs_id = $1 
//              AND acc_no = $2 
//              AND doc_no = $3
//              AND doc_dt = $4
//              AND amount = $5
//              AND db_cr = $6
//              AND due_date = $7
//              AND party_acc = $8,
//              AND explanation = $9`,
//           [
//             del.outs_id,
//             del.acc_no,
//             del.doc_no,
//             del.doc_dt,
//             del.amount,
//             del.db_cr,
//             del.due_date,
//             del.party_acc,
//             del.explanation,
//           ]
//         );
//       }
//     }

//     // ===== 3. Insert / Update / Skip Details =====
//     for (let detail of details) {
     
//       if (detail.isNewStatus === "insert" || detail.id === 1) {
        
        
//         const detailPayload = { ...detail, outs_id: outsId, acc_no: header.acc_no };
//         const detailData = transformOutstandingDetailToDbData(detailPayload);
//         const detailInsertQuery = generateSingleInsertQuery(TABLE_NAMES.TABLE_DTL, detailData);
//         await db.query(detailInsertQuery, Object.values(detailData));

//      } else if (detail.isNewStatus === "update") {
    
      
//         const detailPayload = { ...detail, outs_id: outsId, acc_no: header.acc_no };
//         const detailData = transformOutstandingDetailToDbData(detailPayload);

//         // outs_id ko SET clause se hatao
//         const detailKeys = Object.keys(detailData).filter(k => k !== "outs_id");
//         const detailValues = detailKeys.map(k => detailData[k]);

//         const setClauseDtl = detailKeys
//           .map((col, idx) => `${col} = $${idx + 1}`)
//           .join(", ");

//         const params = [
//           ...detailValues,
//           outsId,
//           detail.old_acc_no,   //  purana acc_no
//           detail.old_doc_no,   //  purana doc_no
//           // detail.old_party_acc //  purana party_acc
//         ];

//         await db.query(
//           `UPDATE ${TABLE_NAMES.TABLE_DTL}
//             SET ${setClauseDtl}
//           WHERE outs_id = $${detailValues.length + 1}
//             AND acc_no = $${detailValues.length + 2}
//             AND doc_no = $${detailValues.length + 3}`,
//             // AND party_acc = $${detailValues.length + 4}, 
//           params
//         );
//       }


//    else if (detail.isNewStatus === "unchanged") {

    
//     // sirf acc_no sync karenge agar header acc_no change hua hai
//      if (detail.old_acc_no && detail.old_acc_no !== header.acc_no) {
//         await db.query(
//           `UPDATE ${TABLE_NAMES.TABLE_DTL}
//           SET acc_no = $1
//           WHERE outs_id = $2
//             AND acc_no = $3
//             AND doc_no = $4`,
//           [header.acc_no, outsId, detail.old_acc_no, detail.old_doc_no]
//         );
//     }
//   }
// }




//             // ===== 4. Call Only Update Procedures =====
//     await db.query(
//       `CALL tdfmouts_ins_upd_yr_op($1::character varying, $2::smallint, $3::character varying)`,
//       [header.acc_no, Number(header.division_id), header.finYear]
//     );

//     await db.query(`CALL Update_Tdfmouts_Status($1)`, [outsId]);

//     await db.query(
//       `CALL proc_upd_tofmduepaym($1, $2, $3)`,
//       [outsId, header.acc_no, header.debt_cred]
//     );

//     // ===== 4. Commit Transaction =====
//     await db.query("COMMIT");

//     return res.status(200).json({
//       success: true,
//       message: "Outstanding Payment updated successfully"
//     });

//   } catch (error) {
//     await db.query("ROLLBACK");
//     console.error(" Outstanding Payment update failed:", error);
//     return res.status(500).json({
//       success: false,
//       message:  error.message || "Failed to update Outstanding Payment.",
      
//     });
//    }
//     };
   
const updateOutstndPymtData = async (req, res) => {
  const payload = req.body;

  try {
    await db.query("BEGIN");

    const { header, details, deleteRecords } = payload;
    const outsId = header.outs_id;

    // =====  Update Header =====
    const headerData = transformOutstandingHeaderToDbData(header);
    const headerKeys = Object.keys(headerData).filter(k => k !== "outs_id");
    const headerValues = headerKeys.map(k => headerData[k]);
    const setClause = headerKeys.map((col, idx) => `${col} = $${idx + 1}`).join(", ");

    await db.query(
      `UPDATE ${TABLE_NAMES.TABLE_HDR} 
       SET ${setClause} 
       WHERE outs_id = $${headerKeys.length + 1}`,
      [...headerValues, outsId]
    );

    // ==== Delete Removed Detail Records =====
    if (deleteRecords?.length > 0) {
  for (const del of deleteRecords) {
    await db.query(
      `DELETE FROM ${TABLE_NAMES.TABLE_DTL} 
       WHERE outs_id = $1 
         AND acc_no = $2 
         AND doc_no = $3`,
      [
        del.outs_id,
        del.old_acc_no || del.acc_no,
        del.old_doc_no || del.doc_no,
      ]
    );
  }
}

    // =====  Insert / Update / Skip Details =====
    for (const detail of details) {
      const detailPayload = { ...detail, outs_id: outsId, acc_no: header.acc_no };
      const detailData = transformOutstandingDetailToDbData(detailPayload);

      // ---- INSERT CASE ----
      if (detail.isNewStatus === "insert") {
        const { rows: existing } = await db.query(
          `SELECT 1 FROM ${TABLE_NAMES.TABLE_DTL}
           WHERE outs_id = $1 AND doc_no = $2`,
          [outsId, detail.doc_no]
        );

        if (existing.length > 0) {
          throw new Error(`Duplicate doc_no '${detail.doc_no}' found for insert.`);
        }

        const detailInsertQuery = generateSingleInsertQuery(TABLE_NAMES.TABLE_DTL, detailData);
        await db.query(detailInsertQuery, Object.values(detailData));
      }

      // ---- UPDATE CASE ----
      else if (detail.isNewStatus === "update") {
        // Duplicate check ignoring self-row
        const { rows: existing } = await db.query(
          `SELECT 1 FROM ${TABLE_NAMES.TABLE_DTL}
           WHERE outs_id = $1 AND doc_no = $2
             AND NOT (acc_no = $3 AND doc_no = $4)`,
          [outsId, detail.doc_no, detail.old_acc_no, detail.old_doc_no]
        );

        if (existing.length > 0) {
          throw new Error(`Duplicate doc_no '${detail.doc_no}' found for update.`);
        }

        const detailKeys = Object.keys(detailData).filter(k => k !== "outs_id");
        const detailValues = detailKeys.map(k => detailData[k]);
        const setClauseDtl = detailKeys
          .map((col, idx) => `${col} = $${idx + 1}`)
          .join(", ");

        const params = [
          ...detailValues,
          outsId,
          detail.old_acc_no,
          detail.old_doc_no,
        ];

        await db.query(
          `UPDATE ${TABLE_NAMES.TABLE_DTL}
            SET ${setClauseDtl}
           WHERE outs_id = $${detailValues.length + 1}
             AND acc_no = $${detailValues.length + 2}
             AND doc_no = $${detailValues.length + 3}`,
          params
        );
      }

      // ---- UNCHANGED CASE ----
      else if (detail.isNewStatus === "unchanged") {
        // Only sync acc_no if header acc_no changed
        if (detail.old_acc_no && detail.old_acc_no !== header.acc_no) {
          await db.query(
            `UPDATE ${TABLE_NAMES.TABLE_DTL}
             SET acc_no = $1
             WHERE outs_id = $2
               AND acc_no = $3
               AND doc_no = $4`,
            [header.acc_no, outsId, detail.old_acc_no, detail.old_doc_no]
          );
        }
      }
    }

    // =====  Post-Update Procedures =====
    await db.query(
      `CALL tdfmouts_ins_upd_yr_op($1::character varying, $2::smallint, $3::character varying)`,
      [header.acc_no, Number(header.division_id), header.finYear]
    );

    await db.query(`CALL Update_Tdfmouts_Status($1)`, [outsId]);

    await db.query(
      `CALL proc_upd_tofmduepaym($1, $2, $3)`,
      [outsId, header.acc_no, header.debt_cred]
    );

    // =====  Commit Transaction =====
    await db.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Outstanding Payment updated successfully",
    });

  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Outstanding Payment update failed:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update Outstanding Payment.",
    });
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
    
    if (req?.query?.validate === "voucherDate") {
      await validateVoucherDate(req, res);
      return;
    }

    if (req?.query?.validate === "docDate") {
    await validateDocDate(req, res);
    return;
  }
  });

  exports.handlePostFormData = catchAsync(async (req, res, next) => {
      if (req?.query?.form_status && req?.query?.form_status === "Update") {
          await updateOutstndPymtData(req, res);
          return;
      }
      if (req?.query?.form_status === "Insert") {
          await postOutstndPymtData(req, res);
          return;
      }
  });