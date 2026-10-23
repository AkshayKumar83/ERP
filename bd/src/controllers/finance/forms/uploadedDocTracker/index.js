const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");


// dropDown
exports.getFormBaseConstants = catchAsync(async (req, res) => {
 const { formStatus, appDivisionId, appFinYear, user_id:userId } = req.query;

    const uploadFile = await db.query(
        `select distinct upldd_filename from toit_upld_doc_track`);
  
  return res.status(200).json({
    uploadFile: uploadFile.rows,
   

  });
});

const getDataOnQuery = async (req, res) => {
  const { formStatus, appDivisionId, appFinYear, userId } = req.query;

  let whereClauses = [];

  // Define search keys that should be checked in WHERE clause
  let searchKeys = ["upldd_filename"];

  // If any of these searchKeys exist in the query, add them to WHERE clause
  for (const key of searchKeys) {
    if (req.query[key] !== undefined && req.query[key] !== "") {
    //   whereClauses.push(`${key} = '${req.query[key]}'`);
    whereClauses.push(`UPPER(${key}) = UPPER('${req.query[key]}')`);
    }
  }

  // Build WHERE clause dynamically
  let queryValues =
    whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

  let transYear = appFinYear || "2023";
  let divisionId = appDivisionId || 1;
  let user_id = userId || 583;


  try {
    let queryParameter = `ORDER BY upldd_filename LIMIT 1 OFFSET ${
      req.query.offset || 0
    }`;
    let dataCount = 0;

    // HEADER QUERY (fixed list)
    const Query = `
       select distinct upldd_filename from toit_upld_doc_track 
    `;

    if (whereClauses.length > 0) {
      const getCount = await db.query(
       `SELECT COUNT(*) FROM (${Query}) AS x ${queryValues}`
      );
      dataCount = getCount.rows[0]?.count;
      queryParameter = `${queryValues} ${queryParameter}`;
    } else {
      switch (req?.query?.get_data) {
        case "Query":
        case "First": {
          const getCount = await db.query(
            `SELECT COUNT(*) FROM (${Query}) AS x`
          );
          dataCount = getCount.rows[0]?.count || 0;
          break;
        }
        case "Last": {
          queryParameter = "ORDER BY upldd_filename DESC LIMIT 1";
          break;
        }
      }
    }

    // Get HEADER (single row)
        const headerResult = await db.query(`${Query} ${queryParameter}`);
        const header = headerResult.rows[0];

      // Agar header hi nahi mila
        if (!header) {
        return res.json({
            count: 0,
            header: { type: "not found" },
            detail: [],
        });
        }

    // Get DETAIL rows
  const detailResult = await db.query(
      `
      SELECT *
      FROM toit_upld_doc_track
      WHERE upldd_filename = $1
      AND UPPER(doc_type) <> 'AP BILL'
      ORDER BY doc_id
      `,
      [header.upldd_filename]
    );
     const detailRows = detailResult.rows;

        return res.status(200).json({
        count: dataCount,
        header,
        detail: detailRows
        });

  } catch (error) {
    console.error("Query Error:", error);
    return res.status(500).json({
      message: "Internal server error on Query",
    });
  }
};

exports.handleFormOperation = catchAsync(async (req, res, next) => {
//   console.log("handleoperation");

 if (["Query", "Search"].includes(req?.query?.formStatus)) {
    await getDataOnQuery(req, res);
    return;
  }
 
});