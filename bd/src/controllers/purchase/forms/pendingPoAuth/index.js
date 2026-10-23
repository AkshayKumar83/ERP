const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { generateSingleInsertQuery } = require("../../../../utility/query");
const { queuePOAuthorizationNotifications } = require("../../../adminModule/forms/emailNotification");
const { dateFormater } = require("../../../../utility/constant");

exports.getPendingPODataOnQuery = async (req, res) => {
  try {
    const { appDivisionId, appFinYear, userId, po_type } = req.query;

    // console.log("getPendingPODataOnQuery");

      // const getData = await db.query(
    //   `
    //     select hdr.* ,
    //             ven.v_name,
    //             cus.c_name,
    //             count(*) over() as total_count
    //       from mhmmpoamd hdr
    //       LEFT JOIN mommvend ven
    //         ON hdr.v_code = ven.v_code
    //       LEFT JOIN MOSMCUST cus
    //         ON hdr.c_code = cus.c_code
    //       where flag IN ('N','A','Y')
    //         and ($1 = 'ALL' OR hdr.po_type = $1)
    //       order by po_no
    //     `,
    //   [po_type],
    // );

    const getData = await db.query(
      `
        select hdr.* ,
                ven.v_name,
                cus.c_name,
                mo.member_date,
                count(*) over() as total_count
          from mhmmpoamd hdr
          LEFT JOIN mommvend ven
            ON hdr.v_code = ven.v_code
          LEFT JOIN MOSMCUST cus
            ON hdr.c_code = cus.c_code
          LEFT JOIN moedmember mo
            ON  cus.c_code = mo.member_no
          where flag IN ('A')
            and (hdr.po_type = $1)
          order by po_no
        `,
      [po_type],
    );

  const formattedRows = getData.rows.map(row => ({
  ...row,
  "po_date": dateFormater(row["po_date"]),
  "member_date": dateFormater(row["member_date"]),
}));

    if (getData.rowCount > 0) {
      return res.status(200).json({
        type: "found",
        pendingPO:formattedRows,
        totalCount: Number(getData.rows[0].total_count),
      });
    } else {
      return res.status(200).json({
        type: "not_found",
        pendingPO: [],
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


exports.handleAllPoAuthorization = catchAsync(async (req, res, next) => {
  const { po_ids, email_po_ids = [], userId } = req.body;

  if (!po_ids || po_ids.length === 0) {
    return res.status(400).json({
      type: "error",
      message: "Please select at least one PO",
    });
  }

const invalidEmailPOIds = email_po_ids.filter(
    (id) => !po_ids.includes(id)
);

if (invalidEmailPOIds.length > 0) {
    return res.status(400).json({
        type: "error",
        message: "Email notification can only be requested for authorized POs.",
    });
}

  try {
    await db.query("BEGIN");

    const authResult = await db.query(`
  SELECT DISTINCT auth_id3
  FROM moitauth
  WHERE doc_type IN ('PO', 'PA')
`);

    const authIds = authResult.rows.map((row) => Number(row.auth_id3));



    // if (authIds.length !== 1 || authIds[0] !== Number(userId)) {
    //   await db.query("ROLLBACK");

    //   return res.status(403).json({
    //     type: "error",
    //     message: "You have not right to authorise these Purchase",
    //   });
    // }

    await db.query(
      `UPDATE mhmmpoamd
       SET flag = 'F'
       WHERE po_id = ANY($1::bigint[])`,
      [po_ids],
    );

    for (const po_id of po_ids) {
      await db.query(
        `CALL create_po_in_mhmmpo($1::bigint,$2::smallint,$3::character varying)`,
        [po_id, 0, "F"],
      );
    }

    await db.query("COMMIT");


    // ## sending the mails to the vendor of there authorized po's
console.log('email_po_ids.length',email_po_ids.length)
    if (email_po_ids.length > 0) {
      console.log('email_po_ids for email from authorisation handler:: ', email_po_ids), 
      await queuePOAuthorizationNotifications(
          email_po_ids
      );
    }


    return res.status(200).json({
      type: "success",
      message: `${po_ids.length} PO authorized successfully`,
    });


  } catch (error) {

    await db.query("ROLLBACK");

    return res.status(500).json({
      type: "error",
      message: error.message,
    });

  }
});
