
const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { generateSingleInsertQuery } = require("../../../../utility/query");
const {  transformMasterToDbData } = require("../../../finance/forms/dlrSubsidyAccMstr/presentation");

const TABLE_NAMES = {
  HDR_TABLE: "mofmadvance_assist_exp_link",
};


const ExcelJS = require("exceljs");

exports.downloadExcelReport = async (req, res) => {
  try {

    // DB se data lao
    const result = await db.query(`
     select a.cr_acc_no, b.acc_desc as cr_acc_desc, a.dr_acc_no, c.acc_desc as dr_acc_desc, brand_code, m.description
      from mofmadvance_assist_exp_link a, mhfmglm b, mhfmglm c, mommcode m
      where a.cr_acc_no = b.acc_no
      and a.dr_acc_no = c.acc_no
      and a.brand_code = m.code
    `);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Report");

    worksheet.columns = [
    { header: "CR Acc No", key: "cr_acc_no", width: 20 },
    { header: "CR Acc Desc", key: "cr_acc_desc", width: 40 },

    { header: "DR Acc No", key: "dr_acc_no", width: 20 },
    { header: "DR Acc Desc", key: "dr_acc_desc", width: 40 },

    { header: "Brand Code", key: "brand_code", width: 20 },
    { header: "Brand Name", key: "description", width: 40 },
  ];

    worksheet.addRows(result.rows);
    console.log(result.rows);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=dlr_subsidy_report.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};




const getDataOnQuery = async (req, res) => {
  const { appDivisionId, appFinYear, userId } = req.query;

  let whereClauses = [];

  // searchable fields
  let searchKeys = ["cr_acc_no", "dr_acc_no"];

  for (const key of searchKeys) {
    if (
      req.query[key] !== undefined &&
      req.query[key] !== ""
    ) {
      whereClauses.push(
        `${key} = '${req.query[key]}'`
      );
    }
  }

  let queryValues =
    whereClauses.length > 0
      ? "WHERE " + whereClauses.join(" AND ")
      : "";

  let transYear = appFinYear || "2025";
  let divisionId = appDivisionId || 1;
  let user_id = userId || 583;

  console.log("req_payload ::", req?.query);

  try {
    let queryParameter = `ORDER BY cr_acc_no LIMIT 1 OFFSET ${
      parseInt(req.query.offset) || 0
    }`;

    let dataCount;

    // count logic
    if (whereClauses.length > 0) {
      const getCount = await db.query(
        `SELECT COUNT(*) 
         FROM ${TABLE_NAMES.HDR_TABLE}
         ${queryValues}`
      );

      dataCount = getCount.rows[0]?.count;
      queryParameter = `${queryValues} ${queryParameter}`;
    } else {
      switch (req?.query?.get_data) {
        case "First":
        case "Query": {
          const getCount = await db.query(
            `SELECT COUNT(*) 
             FROM ${TABLE_NAMES.HDR_TABLE}`
          );

          dataCount = getCount.rows[0]?.count;
          break;
        }

        case "Last": {
          queryParameter =
            "ORDER BY cr_acc_no DESC LIMIT 1";
          break;
        }
      }
    }


    // const getHdrData = await db.query(
    //   `SELECT *
    //    FROM ${TABLE_NAMES.HDR_TABLE}
    //    ${queryParameter}`
    // );

    const getHdrData = await db.query(`
  SELECT
      h.*,
      cr.acc_desc AS cr_name,
      dr.acc_desc AS dr_name
  FROM ${TABLE_NAMES.HDR_TABLE} h
  LEFT JOIN mhfmglm cr
    ON cr.acc_no = h.cr_acc_no
  LEFT JOIN mhfmglm dr
    ON dr.acc_no = h.dr_acc_no
  ${queryParameter}
`);

    if (getHdrData.rows.length === 0) {
      return res.status(200).json({
        type: "not found",
        dlrSubsidyAccountData: null,
        message: "No Query data found",
        count: dataCount || 0,
      });
    }

    const dlrSubsidyData = getHdrData.rows[0];

    const response = {
      type: "found",
      dlrSubsidyAccountData:{...dlrSubsidyData },
      count: dataCount || 0,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      type: "error",
      message: error.message || "Internal server error on query",
    });
  }
};

exports.getFormBaseConstants = catchAsync(async (req, res, next) => {

    const brandList = await db.query(
    `select code as brand_code, description from mommcode where cat_group= 'BRAND' `,
  );


    return res.status(200).json({
        brandList: brandList.rows,
    });
});

const helpListData = async (req, res) => {
  const { form_status, help_list } = req.query;

  if (!["Insert", "Search", "Update"].includes(form_status)) {
    return res.status(200).send([]);
  }

  let result;

  if (form_status === "Search") {
    if (help_list === "CR") {
      result = await db.query(`
        SELECT DISTINCT
               m.acc_no,
               m.acc_desc
        FROM mofmadvance_assist_exp_link a
        JOIN mhfmglm m
          ON m.acc_no = a.cr_acc_no
        ORDER BY m.acc_desc
      `);
    } else if (help_list === "DB") {
      result = await db.query(`
        SELECT DISTINCT
               m.acc_no,
               m.acc_desc
        FROM mofmadvance_assist_exp_link a
        JOIN mhfmglm m
          ON m.acc_no = a.dr_acc_no
        ORDER BY m.acc_desc
      `);
    }
  } else {
    result = await db.query(`
      SELECT
             acc_no,
             acc_desc
      FROM mhfmglm
      where acc_no NOT like 'CM%' 
       and acc_no NOT like 'S%'
      ORDER BY acc_desc
    `);
  }

  return res.status(200).json(result.rows);
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

exports.handleSubmitData = catchAsync(async (req, res) => {
  const { formHdrData } = req.body;
  const { form_status } = req.query;

  if (form_status !== "Insert") {
    return res.status(400).json({
      type: "error",
      message: "Cannot submit data please press Insert first",
    });
  }

  try {
    await db.query("BEGIN");


const transformedHdrData = transformMasterToDbData(formHdrData);

const duplicateCheck = await db.query(
  `
    SELECT 1
    FROM ${TABLE_NAMES.HDR_TABLE}
    WHERE cr_acc_no = $1
      AND dr_acc_no = $2
      AND brand_code = $3
  `,
  [
    transformedHdrData.cr_acc_no,
    transformedHdrData.dr_acc_no,
    transformedHdrData.brand_code,
  ]
);

if (duplicateCheck.rowCount > 0) {
  await db.query("ROLLBACK");

  return res.status(409).json({
    type: "error",
    message:
      "Record already exists for selected Credit Account, Debit Account and Brand.",
  });
}

    const insertHdrQuery = generateSingleInsertQuery(TABLE_NAMES.HDR_TABLE, transformedHdrData );

    await db.query( insertHdrQuery, Object.values(transformedHdrData));


    await db.query("COMMIT");

    return res.status(200).json({
      type: "success",
      message: "Record successfully saved",
    });
  } catch (error) {
    await db.query("ROLLBACK");

    console.error("Insert error:", error);

    return res.status(500).json({
      type: "error",
      message: error.message || "Internal server error",
    });
  }
});

exports.handleUpdateFormData = catchAsync(async (req, res) => {
  const { formHdrData, oldData } = req.body;
  const { form_status } = req.query;

  if (form_status !== "Update") {
    return res.status(400).json({
      type: "error",
      message: "Cannot submit data please press Update first",
    });
  }

  try {
    await db.query("BEGIN");

    const headerData = transformMasterToDbData(formHdrData);

    // Duplicate Check
    const duplicateCheck = await db.query(
      `
      SELECT 1
      FROM ${TABLE_NAMES.HDR_TABLE}
      WHERE cr_acc_no = $1
        AND dr_acc_no = $2
        AND brand_code = $3
        AND NOT (
          cr_acc_no = $4
          AND dr_acc_no = $5
          AND brand_code = $6
        )
      `,
      [
        headerData.cr_acc_no,
        headerData.dr_acc_no,
        headerData.brand_code,

        oldData.cr_acc_no,
        oldData.dr_acc_no,
        oldData.brand_code,
      ]
    );

    if (duplicateCheck.rowCount > 0) {
      await db.query("ROLLBACK");

      return res.status(409).json({
        type: "error",
        message:
          "Record already exists for selected Credit Account, Debit Account and Brand.",
      });
    }

    const updateResult = await db.query(
      `
      UPDATE ${TABLE_NAMES.HDR_TABLE}
      SET
          cr_acc_no = $1,
          dr_acc_no = $2,
          brand_code = $3
      WHERE
          cr_acc_no = $4
          AND dr_acc_no = $5
          AND brand_code = $6
      `,
      [
        headerData.cr_acc_no,
        headerData.dr_acc_no,
        headerData.brand_code,

        oldData.cr_acc_no,
        oldData.dr_acc_no,
        oldData.brand_code,
      ]
    );

    if (updateResult.rowCount === 0) {
      await db.query("ROLLBACK");

      return res.status(404).json({
        type: "error",
        message: "Record not found for update",
      });
    }

    await db.query("COMMIT");

    return res.status(200).json({
      type: "success",
      message: "Record successfully updated",
    });
  } catch (error) {
    await db.query("ROLLBACK");

    console.error("Update error:", error);

    return res.status(500).json({
      type: "error",
      message: error.message || "Internal server error",
    });
  }
});

