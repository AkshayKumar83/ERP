const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const {
  generateSingleInsertQuery,
  makeNullValue,
  removeKeysFromObject,
  cleanObject,
} = require("../../../../utility/query");

const { dateFormater } = require("../../../../utility/constant");
const { transTofmBlockPaymentToDbData } = require("./presentation");

const TABLE_NAMES = {
  block_payment: "tofmblockpayment",
};

const getDataOnQuery = async (req, res) => {
  try {
    let queryParameter = `ORDER BY  acc_no OFFSET ${req.query.offset || 0}`;
    let dataCount;

    let whereClauses = [];

    // Define search keys that should be checked in WHERE clause
    let searchKeys = [
      "acc_no",
      "doc_no"
     
    ];

    // If any of these searchKeys exist in the query, add them to WHERE clause
    for (const key of searchKeys) {
      if (req.query[key] !== undefined && req.query[key] !== "") {
        whereClauses.push(`${key} = '${req.query[key]}'`);
      }
    }

    console.log("whereClauses", whereClauses);

    // Build WHERE clause dynamically
    let queryValues =
      whereClauses.length > 0 ? "where " + whereClauses.join(" AND ") : "";

    console.log("quey:", req?.query);
    console.log("Offset value:", req.query.offset);

    // If search parameters exist, count results accordingly
    if (whereClauses.length > 0) {
      const getCount = await db.query(
        `SELECT COUNT(*) FROM ${TABLE_NAMES.block_payment} ${queryValues}`
      );
      dataCount = getCount.rows[0]?.count;
      queryParameter = `${queryValues} ${queryParameter}`;
    } else {
      const getCount = await db.query(
        `SELECT COUNT(*) FROM ${TABLE_NAMES.block_payment}`
      );
      dataCount = getCount.rows[0]?.count;
    }

    console.log(
      `select * from ${TABLE_NAMES.block_payment} ${queryParameter} `
    );
    const blockPaymentData = await db.query(
      `select * from ${TABLE_NAMES.block_payment} ${queryParameter} `
    );

    if (blockPaymentData.rows.length > 0) {
      await Promise.all(
        blockPaymentData.rows.map(async (item) => {
          if (item.acc_no !== null) {
            const accData = await db.query(
              ` SELECT ACC_DESC
  FROM MHFMGLM
  WHERE ACC_NO = $1`,
              [item.acc_no]
            );

            item.acc_desc =
              accData.rowCount > 0 ? accData.rows[0].acc_desc : "";
          }

          if (item.doc_dt !== null) {
            item.doc_dt = dateFormater(item.doc_dt);
          }
        })
      );
    }

    const response = {
      blockPaymentData: blockPaymentData.rows,
      count: dataCount || 0,
    };
    return res.send(response);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal server error on query" });
  }
};

const helpListData = async (req, res) => {
  const {
    appDivisionId,
    appFinYear,
    appUserId,
    form_status,
    help_list,
    acc_no,
  } = req?.query;
  if (!["Insert", "Update"].includes(form_status)) {
    return res.status(200).send([]);
  }

  if (help_list === "acc") {
    const acc = await db.query(
      `	  select v_name, 'S'||v_code v_code from mommvend v
where exists (select 'x' from tdfmouts t where t.acc_no = ('S'||v.v_code))
order by v_name  
`
    );

    return res.status(200).json(acc.rows);
  } else if (help_list === "doc") {
    const doc = await db.query(
      ` 
 SELECT 
    t.doc_no,
    t.doc_dt,
    SUM(
        CASE 
            WHEN t.db_cr = 'C' THEN t.amount
            ELSE -t.amount
        END
    ) AS amount
FROM tdfmouts t
WHERE t.acc_no = $1
GROUP BY t.doc_no, t.doc_dt
HAVING SUM(
        CASE 
            WHEN t.db_cr = 'C' THEN t.amount
            ELSE -t.amount
        END
    ) <> 0; `,
      [acc_no]
    );

    return res.status(200).json(doc.rows);
  }
};

const postBlockPaymentData = async (req, res) => {
  try {
    const { formData, appUserId } = req.body;
    console.log("Received body:", req.body);

    if (formData) {
      const formArray = Array.isArray(formData) ? formData : [formData];

      //  Keep only rows that HAVE an id
      const recordsWithId = formArray.filter(record => record.id);

      for (const record of recordsWithId) {
        console.log("Inserting record with id:", record.id);

        // Transform record to DB-ready data
        const tofmData = transTofmBlockPaymentToDbData(record, appUserId);

        // Remove UI-only fields
        delete tofmData.id;
        delete tofmData.acc_desc;
        delete tofmData.init_acc_no;

        // Build and execute insert query
        const insertQuery = generateSingleInsertQuery(
          TABLE_NAMES.block_payment,
          tofmData
        );
        await db.query(insertQuery, Object.values(tofmData));
      }
    }

    res.status(200).json({ message: "Records inserted successfully" });
  } catch (error) {
    console.error("Transaction error:", error);
    res.status(500).json({ error: error.message });
  }
};



const updateBlockPaymentDetails = async (req, res) => {
  console.log("for update:", req.body);
  const { formData, deletedData, appUserId } = req.body;

  try {
    await db.query("BEGIN");

    // === INSERT or UPDATE ===
    if (Array.isArray(formData) && formData.length > 0) {
      for (const [index, record] of formData.entries()) {
        // ---------- UPDATE ----------
        if (!record.id) {
          delete record.id;
          delete record.acc_desc;

          const { init_acc_no, ...restOfrecord } = record;

          const formDataForUpdate = cleanObject(restOfrecord);
          const columns = Object.keys(formDataForUpdate);
          const values = Object.values(formDataForUpdate);

          const setClause = columns
            .map((column, idx) => `${column} = $${idx + 1}`)
            .join(", ");

          const query = `
            UPDATE ${TABLE_NAMES.block_payment}
            SET ${setClause}
            WHERE acc_no = $${columns.length + 1}
          `;

          await db.query(query, [...values, record.init_acc_no]);
        }

        // ---------- INSERT ----------
        else if (record.id) {
          console.log("Inserting new record");

          //  Transform record to DB-ready data first
          const tofmData = transTofmBlockPaymentToDbData(record, appUserId);

          // Remove any UI-only fields that shouldn't be in DB
          delete tofmData.id;
          delete tofmData.acc_desc;
          delete tofmData.init_acc_no;

          const insertQuery = generateSingleInsertQuery(
            TABLE_NAMES.block_payment,
            tofmData
          );

          await db.query(insertQuery, Object.values(tofmData));
        }
      }
    }

    // === DELETE ===
    if (Array.isArray(deletedData) && deletedData.length > 0) {
      const deleteCodes = deletedData.map((item) => item.acc_no);
      const placeholders = deleteCodes.map((_, i) => `$${i + 1}`).join(", ");

      const deleteQuery = `
        DELETE FROM ${TABLE_NAMES.block_payment}
        WHERE acc_no IN (${placeholders})
      `;

      await db.query(deleteQuery, deleteCodes);
    }

    await db.query("COMMIT");
    return res.status(200).send({ status: "Successfully updated" });
  } catch (error) {
    console.error("Error:", error);
    await db.query("ROLLBACK");
    return res.status(500).send({ message: "Failed to update period details" });
  }
};

const getValidateAccData = async (req, res) => {
  const { acc_no } = req.query; 

  if(!acc_no) {
    return
  }

  const result = await db.query(
    `	select v_name
			from mommvend v
	    where v_code = substr($1,2)
      	and exists (select 'x' from tdfmouts t where t.acc_no = ('S'||v.v_code));
`,
    [acc_no]
  );

  if (result.rowCount === 0) {
    return res.status(400).json({
      error:
        "Either Party does not exist or Bills does not exist for this party",
    });
  }

  return res.status(200).json({
    message: "Account no validate successfully",
    data: result.rows[0],
  });
};

const getValidateDocData = async (req, res) => {
  const { acc_no, doc_no, doc_dt } = req.query; 

  if(!acc_no || !doc_no || !doc_dt) {
    return
  }

  const result = await db.query(
    `	SELECT t.doc_dt
FROM tdfmouts t
WHERE t.acc_no = $1
  AND t.doc_no = $2
  AND t.doc_dt = COALESCE($3, t.doc_dt)
GROUP BY t.doc_no, t.doc_dt
HAVING SUM(
          CASE WHEN t.db_cr = 'C'
               THEN t.amount
               ELSE -t.amount
          END
       ) <> 0;

`,
    [acc_no, doc_no, doc_dt]
  );

  if (result.rowCount === 0) {
    return res.status(400).json({
      error: "'Either Bill does not exist or not pending",
    });
  }

  if (result.rowCount > 1) {
    return res.status(200).json({
      message: "'More than one bill exists, Please select from List of Values",
    });
  }

  return res.status(200).json({
    message: "doc no validate successfully",
    data: result.rows[0],
  });
};

exports.handleValidateData = catchAsync(async (req, res, next) => {
  const { param } = req.query;
  if (param === "acc_no") {
    await getValidateAccData(req, res);
    return;
  }

  if (param === "doc_no") {
    await getValidateDocData(req, res);
  }
});

exports.handleFormOperation = catchAsync(async (req, res, next) => {
  // if (req?.query?.get_data) {
  //   await getDataOnQuery(req, res);
  //   return;
  // }

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
  const { step } = req.query;

  if (req.query.form_status === "Update") {
    await updateBlockPaymentDetails(req, res);
    return;
  }

  if (step === "submit") {
    await postBlockPaymentData(req, res);
    return;
  }

  return res.status(400).json({ message: "Invalid step parameter" });
});
