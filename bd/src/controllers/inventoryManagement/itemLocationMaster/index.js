const { response } = require("express");
const { db } = require("../../../config/dbConnection");
const catchAsync = require("../../../utility/catchAsync");
const { dateFormater, dateFormate } = require("../../../utility/constant");

const {
  generateSingleInsertQuery,
  generateInsertQuery,
  buildSearchQuery,
  convertStringsToBooleans,
  cleanObject,
} = require("../../../utility/query");
//const { SnowDeviceManagement } = require("aws-sdk");
const {
  transToMdmmstokLocationDbData,
  transToMommwcDbData,
} = require("./presentation");

const TABLE_NAMES = {
  MOMMWC: "mommwc",
  MDMMSTOK: "mdmmstok_location",
};

const getDataOnQuery = async (req, res) => {
  const { formStatus, appDivisionId, appFinYear, userId } = req?.query;

  //console.log("getQuery:", req.query )
  let transYear = appFinYear || "2023";
  let divisionId = appDivisionId || 1;
  console.log("userId", userId, appFinYear);

  try {
    let queryParameter = `ORDER BY description LIMIT 1 OFFSET ${
      req.query.offset || 0
    }`;
    let recordCount;

    let whereClauses = [];

    // Define search keys that should be checked in WHERE clause
    let searchKeys = ["wc_id"];

    // If any of these searchKeys exist in the query, add them to WHERE clause
    for (const key of searchKeys) {
      if (req.query[key] !== undefined && req.query[key] !== "") {
        whereClauses.push(`${key} = '${req.query[key]}'`);
      }
    }  

     console.log("whereClauses", whereClauses);
      

    // Build WHERE clause dynamically
    let queryValues =
      whereClauses.length > 0 ?  "AND " + whereClauses.join(" AND ") : "";

    console.log("quey:", req?.query);
    console.log("Offset value:", req.query.offset);


    //          const getCount = await db.query(
    //           `SELECT COUNT(wc_id) FROM ${TABLE_NAMES.MOMMWC} where EXISTS (SELECT 'X' FROM MOMMSTOK S
    // WHERE S.WC_ID = MOMMWC.WC_ID)
    // AND DIVISION_ID = $1;
    //                       `,
    //           [divisionId]

    if (whereClauses.length > 0) {
      const getCount = await db.query(
        `SELECT COUNT(wc_id) FROM ${TABLE_NAMES.MOMMWC} where EXISTS (SELECT 'X' FROM MOMMSTOK S
WHERE S.WC_ID = MOMMWC.WC_ID)
AND DIVISION_ID = $1 ${queryValues};
                      `,
        [divisionId]
      );
      recordCount = getCount.rows[0]?.count;
      queryParameter = `${queryValues} ${queryParameter}`;
    } else {
      const getCount = await db.query(
        `SELECT COUNT(wc_id) FROM ${TABLE_NAMES.MOMMWC} where EXISTS (SELECT 'X' FROM MOMMSTOK S
WHERE S.WC_ID = MOMMWC.WC_ID)
AND DIVISION_ID = $1;
                      `,
        [divisionId]
      );
      recordCount = getCount.rows[0]?.count;
    }

    //     switch (req?.query?.get_data) {
    //       case "Query":
    //       case "First": {
    //         const getCount = await db.query(
    //           `SELECT COUNT(wc_id) FROM ${TABLE_NAMES.MOMMWC} where EXISTS (SELECT 'X' FROM MOMMSTOK S
    // WHERE S.WC_ID = MOMMWC.WC_ID)
    // AND DIVISION_ID = $1;
    //                       `,
    //           [divisionId]
    //         );
    //         recordCount = getCount.rows[0]?.count;
    //         break;
    //       }

    //       case "Last": {
    //         queryParameter = "ORDER BY description  DESC LIMIT 1";
    //         break;
    //       }

    //       default:
    //         queryParameter = `ORDER BY description LIMIT 1 OFFSET ${
    //           req.query.offset || 0
    //         }`;
    //         break;
    //     }

    const mommwcData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.MOMMWC} where EXISTS (SELECT 'X' FROM MOMMSTOK S
WHERE S.WC_ID = MOMMWC.WC_ID)
AND DIVISION_ID = $1
         ${queryParameter}
                    `,
      [divisionId]
    );

    // POST QUERY DATA

    const mdmmStokData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.MDMMSTOK}
 WHERE trans_year = $1
 `,
      [transYear]
    );

    // POST-QUERY DATA
    if (mdmmStokData.rows.length > 0) {
      await Promise.all(
        mdmmStokData.rows.map(async (item) => {
          if (item.it_code !== null) {
            const descDtl = await db.query(
              `  SELECT C.IT_NAME
        FROM MOMMITEM C
        WHERE C.IT_CODE=$1 `,
              [item.it_code]
            );

            item.description = descDtl.rows[0]?.it_name || null;
          }
        })
      );
    }

    const responseData = {
      mommwcData: mommwcData.rows[0],
      mdmmStokData: mdmmStokData.rows,
      count: recordCount || 0,
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      type: "error",
      message: error.message || "Internal Server Error",
    });
  }
};

const helpListData = async (req, res) => {
  let {
    appDivisionId,
    appFinYear,
    appUserId,
    form_status,
    help_list,
    wc_id,
    physical_loca,
    rack_no,
  } = req.query;

  if (!["Insert", "Update"].includes(form_status)) {
    return res.status(200).send([]);
  }

  if (help_list === "item") {
    try {
      const itemData = await db.query(
        `select i.it_code, g.it_name 
 from mommstok i, mommitem g
 where i.trans_year = $1
and i.wc_id = $2
and i.it_code = g.it_code
 order by it_code  
         `,
        [appFinYear, wc_id]
      );

      return res.status(200).json(itemData.rows);
    } catch (error) {
      console.error("Database query error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (help_list === "rack") {
    try {
      const rackData = await db.query(
        ` SELECT DISTINCT RACK_NO FROM MOMMITEM_LOCATIONS WHERE PHYSICAL_LOCA = $1 ORDER BY RACK_NO  

         `,
        [physical_loca]
      );

      return res.status(200).json(rackData.rows);
    } catch (error) {
      console.error("Database query error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (help_list === "bin") {
    try {
      const binData = await db.query(
        ` SELECT DISTINCT BIN_NO FROM MOMMITEM_LOCATIONS WHERE PHYSICAL_LOCA = $1 AND RACK_NO = $2 

         `,
        [physical_loca, rack_no]
      );

      return res.status(200).json(binData.rows);
    } catch (error) {
      console.error("Database query error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (help_list === "physical") {
    try {
      const physicalData = await db.query(
        ` SELECT DISTINCT PHYSICAL_LOCA FROM MOMMITEM_LOCATIONS

         `
      );

      return res.status(200).json(physicalData.rows);
    } catch (error) {
      console.error("Database query error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(200).json([]);
};

const postItemLocationData = async (req, res) => {
  try {
    const { formData, formDetailData, transYear } = req.body;
    console.log("Received body:", req.body);

    const wcId = formData.wc_id;

    if (formDetailData) {
      const formArray = Array.isArray(formDetailData)
        ? formDetailData
        : [formDetailData];

      // Only take records that have an 'id' field
      const filteredRecords = formArray.filter((record) => record.id);

      for (const [index, record] of filteredRecords.entries()) {
        // Duplicate check...
        const duplicateCheckQuery = `
    SELECT 1 FROM mdmmstok_location
    WHERE wc_id = $1 AND it_code = $2 AND physical_loca  = $3 AND bin_no = $4
  `;
        const duplicateResult = await db.query(duplicateCheckQuery, [
          wcId,
          record.it_code,
          record.physical_loca,
          record.bin_no,
        ]);
        if (duplicateResult.rowCount > 0) {
          return res.status(400).json({
            error:
              "Item Linked with this Physical Location No, BIN no, Rack No already exists",
          });
        }

        // Set trans_year and wc_id before transformation
        record.wc_id = wcId;
        record.trans_year = transYear;

        // Remove unwanted keys before transformation
        delete record.id;
        delete record.init_it_code;
        delete record.init_bin_no;
        delete record.init_physical_loca;

        // Transform record to DB-ready data
        const mommstokLocData = transToMdmmstokLocationDbData(record);

        const queryForInsert = generateSingleInsertQuery(
          TABLE_NAMES.MDMMSTOK,
          mommstokLocData
        );
        const valuesForInsertQuery = Object.values(mommstokLocData);

        try {
          await db.query(queryForInsert, valuesForInsertQuery);
        } catch (error) {
          throw new Error(`Insert error at index ${index}: ${error.message}`);
        }
      }
    }

    res.status(200).json({ message: "Records inserted successfully" });
  } catch (error) {
    console.error("Transaction error:", error);
    res.status(500).json({ error: error.message });
  }
};

const updateItemLocationData = async (req, res) => {
  const { formData, formDetailData, deletedData, transYear } = req.body;
  console.log("formDetailData", formDetailData);

  try {
    await db.query("BEGIN");

    // Define required variables
    const wcId = formData?.wc_id;
    const year = transYear;

    // Handle INSERT or UPDATE
    if (Array.isArray(formDetailData) && formDetailData.length) {
      for (const record of formDetailData) {
        // Transform to DB-ready object
        const mapped = transToMdmmstokLocationDbData(record);

        // Remove UI-only fields
        const {
          id,
          description,
          init_it_code,
          init_physical_loca,
          init_bin_no,
          init_rack_no,
          ...dbRecord
        } = mapped;

        dbRecord.wc_id = wcId;
        dbRecord.trans_year = year;

        // CASE 1: Update
        if (!record.id) {
          const columns = Object.keys(dbRecord);
          const values = Object.values(dbRecord);

          const setClause = columns
            .map((col, i) => `${col} = $${i + 1}`)
            .join(", ");

          const query = `
            UPDATE ${TABLE_NAMES.MDMMSTOK}
               SET ${setClause}
             WHERE wc_id = $${columns.length + 1}
               AND it_code = $${columns.length + 2}
               AND physical_loca = $${columns.length + 3}
               AND rack_no = $${columns.length + 4}
               AND bin_no = $${columns.length + 5}
          `;

          await db.query(query, [
            ...values,
            wcId,
            record.init_it_code,
            record.init_physical_loca,
            record.init_rack_no,
            record.init_bin_no,
          ]);
        }
        //  CASE 2: no id → INSERT new record
        else {
          //  Duplicate check
          const duplicateCheckQuery = `
            SELECT 1 FROM mdmmstok_location
            WHERE wc_id = $1 AND it_code = $2 AND physical_loca = $3 AND bin_no = $4 AND rack_no = $5
          `;
          const duplicateResult = await db.query(duplicateCheckQuery, [
            wcId,
            record.it_code,
            record.physical_loca,
            record.bin_no,
            record.rack_no,
          ]);

          if (duplicateResult.rowCount > 0) {
            return res.status(400).json({
              error:
                "Item linked with this Physical Location, BIN no, and Rack No already exists.",
            });
          }

          const insertQuery = generateSingleInsertQuery(
            TABLE_NAMES.MDMMSTOK,
            dbRecord
          );
          const insertValues = Object.values(dbRecord);

          await db.query(insertQuery, insertValues);
        }
      }
    }

    // Handle DELETE
    if (Array.isArray(deletedData) && deletedData.length) {
      for (const d of deletedData) {
        await db.query(
          `DELETE FROM ${TABLE_NAMES.MDMMSTOK}
            WHERE wc_id = $1 AND it_code = $2 AND physical_loca = $3`,
          [d.wc_id, d.it_code, d.physical_loca]
        );
      }
    } else if (deletedData) {
      await db.query(
        `DELETE FROM ${TABLE_NAMES.MDMMSTOK}
          WHERE wc_id = $1 AND it_code = $2 AND physical_loca = $3`,
        [deletedData.wc_id, deletedData.it_code, deletedData.physical_loca]
      );
    }

    await db.query("COMMIT");
    res.status(200).send({ status: "Successfully updated" });
  } catch (err) {
    await db.query("ROLLBACK");
    console.error(" Error updating mdmmstok_location:", err);
    res.status(500).send({ error: err.message });
  }
};

const getValidateItemData = async (req, res) => {
  const { it_code, appFinYear, wc_id } = req.query;

  const result = await db.query(
    ` select it_name 
		    from mommstok m, mommitem i
	  where m.trans_year = $1
		    and m.wc_id =  $2
	    and i.it_code = $3
		    and i.it_code = m.it_code`,
    [appFinYear, wc_id, it_code]
  );

  if (result.rowCount === 0) {
    return res.status(400).json({
      error:
        "Either Item not linked with this store in this Fin year or invalid Item code",
    });
  }

  return res.status(200).json({
    message: "item validation successful",
    data: result.rows[0],
  });
};

const getValidatePhysicalData = async (req, res) => {
  const { physical_loca, appFinYear } = req.query;

  const result = await db.query(
    `select 1
				  from mommitem_locations
			where physical_loca = $1`,
    [physical_loca]
  );

  if (result.rowCount === 0) {
    return res.status(400).json({
      error: "Invalid Physical location... select from list",
    });
  }

  return res.status(200).json({
    message: "Physical location validation successful",
    data: result.rows[0],
  });
};

const getValidateBinData = async (req, res) => {
  const { physical_loca, rack_no, bin_no } = req.query;

  const result = await db.query(
    `select 1
					  from mommitem_locations
				where physical_loca = $1
					  and rack_no = $2
				  and bin_no = $3`,
    [physical_loca, rack_no, bin_no]
  );

  if (result.rowCount === 0) {
    return res.status(400).json({
      error:
        "Invalid BIN no/Not linked with physical location/rack no in Location master... select from list",
    });
  }

  return res.status(200).json({
    message: "Physical location validation successful",
    data: result.rows[0],
  });
};

const getValidateRackData = async (req, res) => {
  const { physical_loca, rack_no } = req.query;

  const result = await db.query(
    `select 1
				  from mommitem_locations
				where physical_loca = $1
					and rack_no = $2`,
    [physical_loca, rack_no]
  );

  if (result.rowCount === 0) {
    return res.status(400).json({
      error:
        "Invalid BIN no/Not linked with physical location/rack no in Location master... select from list",
    });
  }

  return res.status(200).json({
    message: "Rack validation successful",
    data: result.rows[0],
  });
};

exports.handleValidateData = catchAsync(async (req, res, next) => {
  const { param } = req.query;
  if (param === "it_code") {
    await getValidateItemData(req, res);
    return;
  }

  if (param === "physical_loca") {
    await getValidatePhysicalData(req, res);
  }

  if (param === "bin_no") {
    await getValidateBinData(req, res);
  }

  if (param === "rack_no") {
    await getValidateRackData(req, res);
  }
});

// exports.handleFormOperation = catchAsync(async (req, res, next) => {
//   if (req?.query?.get_data) {
//     await getDataOnQuery(req, res);
//     return;
//   }

//   //   if (["Query", "Search"].includes(req?.query?.formStatus)) {
//   //     await getDataOnQuery(req, res);
//   //     return;
//   //   }
//   if (req?.query?.help_list) {
//     await helpListData(req, res);
//     return;
//   }
// });  

exports.handleFormOperation = catchAsync(async (req, res, next) => {
  if (req?.query?.help_list) {
    await helpListData(req, res);
    return;
  }

  // if (req?.query?.get_data) {
  // await getDataOnQuery(req, res);
  // return;
  if (["Query", "Search"].includes(req?.query?.formStatus)) {
    await getDataOnQuery(req, res);
    return;
  }
});

exports.handlePostFormData = catchAsync(async (req, res, next) => {
  if (req?.query?.form_status && req?.query?.form_status === "Update") {
    await updateItemLocationData(req, res);
    return;
  } else {
    await postItemLocationData(req, res);
    return;
  }
});
