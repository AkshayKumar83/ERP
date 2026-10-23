
const { tryCatch } = require("bullmq");
const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { generateSingleInsertQuery } = require("../../../../utility/query");



const TABLE_NAMES = {

  HDR_TABLE: "mhmmpo",

};


const getPoClosureDataOnQuery = async (req, res) => {
  try {

    const { v_code, c_code, po_no, limit = 20, offset = 0  } = req.query;

    let conditions = [];
    let values = [];

    //  Dynamic filters
    if (v_code) {
      values.push(v_code);
      conditions.push(`hdr.v_code = $${values.length}`);
    }

    if (c_code) {
      values.push(c_code);
      conditions.push(`hdr.c_code = $${values.length}`);
    }
    if (po_no) {
      values.push(po_no);
      conditions.push(`hdr.po_no = $${values.length}`);
    }

    //  WHERE build
    let whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(" AND ")}`
      : "";


      
    // Add limit and offset AFTER all filter values
    values.push(Number(limit));
    values.push(Number(offset));
    const limitIndex  = values.length - 1;  // $N
    const offsetIndex = values.length;       // $N+1



    const getData = await db.query(
      `
      SELECT 
        hdr.*,
        ven.v_name,
        cus.c_name,
        um.user_name AS closure_by,
        COUNT(*) OVER() AS total_count
      FROM ${TABLE_NAMES.HDR_TABLE} hdr
      LEFT JOIN mommvend ven 
        ON hdr.v_code = ven.v_code
      LEFT JOIN mosmcust cus 
        ON hdr.c_code = cus.c_code
      LEFT JOIN user_master um
        ON hdr.closure_by = um.user_id
      ${whereClause}
      ORDER BY hdr.po_no
       LIMIT $${limitIndex} 
       OFFSET $${offsetIndex}
      `,
      values
    );

    if (getData.rowCount > 0) {
      return res.status(200).json({
        type: "found",
        PoClosure: getData.rows,
        totalCount: getData.rows[0].total_count,
      });
    } else {
      return res.status(200).json({
        type: "not_found",
        PoClosure: [],
        totalCount: 0,
        message: "No data found",
      });
    }

  } catch (error) {
    console.error("Query Error:", error);
    return res.status(500).json({
      message: "Internal server error on Query",
    });
  }
};


const helpListData = async (req, res) => {
  const {
    form_status,
    help_list,
  } = req?.query;

  if (!["Insert", "Update", "Search"].includes(form_status)) {
    return res.status(200).send([]);
  }

  try {

    //  VENDOR HELP LIST
   if (help_list === "Vendor") {

  let vendorList;

  //  SEARCH MODE
  if (form_status === "Search") {
    vendorList = await db.query(`
      SELECT DISTINCT 
        hdr.v_code,
        ven.v_name
      FROM mhmmpo hdr
      LEFT JOIN MOMMVEND ven
        ON hdr.v_code = ven.v_code
      ORDER BY ven.v_name
    `);
  } 

  return res.status(200).send(vendorList.rows);
}


    else if (help_list === "shipTo" && form_status === "Search") {
      const itemList = await db.query(`
        select DISTINCT
        mh.c_code ,
        cu.c_name 
        from mhmmpo mh
         left join mosmcust cu 
         on mh.c_code = cu.c_code 
         order by c_name
      `);

      return res.status(200).json(itemList.rows);
    }

    else if (help_list === "PoNo" && form_status === "Search") {
      const itemList = await db.query(`
        select DISTINCT
        po_no
        from mhmmpo
         order by po_no
      `);

      return res.status(200).json(itemList.rows);
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};

exports.handleFormOperation = catchAsync(async (req, res, next) => {
  if (["Query", "Search"].includes(req?.query?.formStatus)) {
    await getPoClosureDataOnQuery(req, res);
    return;
  }

  if (req?.query?.help_list) {
    await helpListData(req, res);
    return;
  }
});

exports.handleSubmitPOClosure = catchAsync(async (req, res, next) => {
  const payload = req.body;

  try {
    for (const row of payload) {
      await db.query(
        `
        UPDATE mhmmpo
        SET
          closure_flag = $1,
          closure_date = $2,
          closure_by = $3
         WHERE po_id = $4
        `,
        [
          row.closure_flag,
          row.closure_date || null,
          row.closure_by || null,
          row.po_id,
        ]
      );
    }

    return res.status(200).json({
      type: "success",
      message: "PO Closure updated successfully.",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
});

exports.checkPOGateEntry = catchAsync(async (req, res) => {
  const { po_id } = req.query;

  if (!po_id) {
    return res.status(400).json({
      type: "error",
      message: "PO ID is required",
    });
  }

  const result = await db.query(
    `
      SELECT 1
      FROM tdmmrct
      WHERE po_id = $1
      LIMIT 1
    `,
    [po_id]
  );

  if (!result.rows.length) {
    return res.status(200).json({
      type: "error",
      can_close: false,
      message:
        "You cannot close this PO because gate entry is required.",
    });
  }

  return res.status(200).json({
    type: "success",
    can_close: true,
  });
});



