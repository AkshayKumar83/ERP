const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { dateFormater } = require("../../../../utility/constant");


exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
  try {
    const { level1, level2 } = req.query;

    let itemType = [];
    let itemBase = [];
    let itemSubCat = [];
    let destList = [];

    // PO Category List
    // const poCategoryResult = await db.query(`
    //   SELECT po_cat_description, po_cat_prefix 
    //   FROM mommpcat
    //   UNION
    //   SELECT 'CUSTOMER', 'C'
    //   UNION
    //   SELECT ' ', NULL;
    // `);
    // const poCategoryList = poCategoryResult.rows;



    // LEVEL 1 (Item Type)
    const l1Res = await db.query(`
      select cat_desc, level1 
      from moitbase 
      where level2 = '00' and level3 = '00'
      ORDER BY cat_desc;
    `);

    itemType = l1Res.rows;


  // LEVEL 2 (Item Base)
if (level1) {
  const l2Res = await db.query(
    `
    select cat_desc, level2 
    from moitbase 
    where level1 = $1 
      and level3 = '00' 
      and level2 != '00'
    union 
    select ' ', '00'
    ORDER BY cat_desc;
    `,
    [level1]
  );
  itemBase = l2Res.rows;
}

// LEVEL 3 (Sub Category)
if (level1 && level2) {
  const l3Res = await db.query(
    `
    select cat_desc, level3 
    from moitbase 
    where level1 = $1 
      and level2 = $2 
      and level3 != '00'
    ORDER BY cat_desc;
    `,
    [level1, level2]
  );
  itemSubCat = l3Res.rows;
}



    return res.status(200).json({
      success: true,
    //   poCategoryList,
      level1: itemType,
      level2: itemBase,
      level3: itemSubCat,
    });

  } catch (error) {
    console.error("Error fetching dropdown data:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dropdown data",
      error: error.message,
    });
  }
});

const helpListData = async (req, res) => {
  const {
    appFinYear: transYear,
    appDivisionId: divisionId,
    help_list,
    wc_id,
    to_wc_id,
    it_type,
    it_base,
    it_sub_c
  } = req?.query;

  console.log("req?.query:", req?.query);

  if (help_list === "FromStore" || help_list === "ToStore") {
     const vendorList = await db.query(
      ` select a.wc_id, a.wc_no, a.description  
        from vwWorkCenterStore a WHERE DIVISION_ID=$1
        order by 1 `,[divisionId]
     
    );
    return res.status(200).send(vendorList.rows);
  }

 if (help_list === "FromItem") {
  const itemList = await db.query(
    `SELECT 
        a.it_name, 
        a.it_code
     FROM mommitem a
     JOIN mommstok b 
       ON a.it_code = b.it_code
     WHERE b.wc_id = $1
       AND a.it_type = COALESCE(NULLIF($2, ''), a.it_type)
       AND a.it_base = COALESCE(NULLIF($3, ''), a.it_base)
       AND a.it_sub_c = COALESCE(NULLIF($4, ''), a.it_sub_c)`,
    [wc_id, it_type, it_base, it_sub_c]
  );

  return res.status(200).send(itemList.rows);
}
 if (help_list === "ToItem") {
  const itemList = await db.query(
    `SELECT 
        a.it_name, 
        a.it_code
     FROM mommitem a
     JOIN mommstok b 
       ON a.it_code = b.it_code
     WHERE b.wc_id = $1
       AND a.it_type = COALESCE(NULLIF($2, ''), a.it_type)
       AND a.it_base = COALESCE(NULLIF($3, ''), a.it_base)
       AND a.it_sub_c = COALESCE(NULLIF($4, ''), a.it_sub_c)`,
    [to_wc_id, it_type, it_base, it_sub_c]
  );

  return res.status(200).send(itemList.rows);
}

};

exports.handleFormOperation = catchAsync(async (req, res, next) => {
  if (req?.query?.help_list) {
    await helpListData(req, res);
    return;
  }
});


exports.validateWcNoAndToWcNo = async (req, res) => {
  try {
    const { wc_no} = req.query;

    if (!wc_no) {
      return res.status(400).json({
        success: false,
        message: "WC No is required",
      });
    }

    const query = `
      SELECT 'X' AS check_flag
      FROM mommwc
      WHERE wc_no = $1
      AND store_process = 'S'
    `;

    const result = await db.query(query, [wc_no]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Store does not exist",
      });
    }

    return res.status(200).json({
      success: true,
    });

  } catch (err) {
    console.error("validateWcNo error:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


exports.validateAllItems = async (req, res) => {
  try {

    const query = `
      SELECT 
        MIN(it_code) AS min_it_code,
        MAX(it_code) AS max_it_code
      FROM mommitem
    `;

    const result = await db.query(query);

    const row = result.rows[0];

    return res.status(200).json({
      success: true,
      min_it_code: row.min_it_code,
      max_it_code: row.max_it_code,
    });

  } catch (err) {

    console.error("validateAllItems error:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


  exports.handlePostFormData = catchAsync(async (req, res, next) => {
    try {
      const { ok_rej,all_item,active_flag, wc_id, to_wc_id,wc_no, to_wc_no,it_code,it_code1,  it_type, it_base, it_sub_c, 
        from_date, to_date, division_id,trans_year,user_id } = req.body;


const query = `

SELECT

    c.wc_no                                                AS "Wc No",

    c.description                                          AS "Store",

    divi.name                                              AS "Division Name",

    CASE
        WHEN COALESCE($4,'0') <> '0'
         AND COALESCE($5,'00') = '00'
         AND COALESCE($6,'00') = '00'

        THEN 'Category : ' || COALESCE(typebase.cat_desc,'')

        WHEN COALESCE($4,'0') <> '0'
         AND COALESCE($5,'00') <> '00'
         AND COALESCE($6,'00') = '00'

        THEN 'Category : ' ||
             COALESCE(typebase.cat_desc,'') || ' - ' ||
             COALESCE(basebase.cat_desc,'')

        WHEN COALESCE($4,'0') <> '0'
         AND COALESCE($5,'00') <> '00'
         AND COALESCE($6,'00') <> '00'

        THEN 'Category : ' ||
             COALESCE(typebase.cat_desc,'') || ' - ' ||
             COALESCE(basebase.cat_desc,'') || ' - ' ||
             COALESCE(subbase.cat_desc,'')

        ELSE 'Category : ALL'

    END                                                     AS "Category",

    a.it_code                                               AS "Item Code",

    REPLACE(REPLACE(a.it_name, ',', ' '), '"', ' ')        AS "Item Description",

    typebase.cat_desc                                       AS "Item Type",

    basebase.cat_desc                                       AS "Item Base",

    subbase.cat_desc                                        AS "Item Sub Category",

    a.um_code                                               AS "UOM",

    COALESCE(
        item_current_opening_bal(
            b.wc_id::smallint,
            a.it_code::varchar,
            ($13::date - INTERVAL '1 day')::date,
            $8::varchar,
            $9::varchar
        ),
        0
    )                                                       AS "Opening Balance As on",

    COALESCE(rcpt.rcpt_qty,0)                               AS "Total Receipt Quantity",

    COALESCE(issue.issu_qty,0)                              AS "Total Issue Quantity",

    (
        COALESCE(
            item_current_opening_bal(
                b.wc_id::smallint,
                a.it_code::varchar,
                ($13::date - INTERVAL '1 day')::date,
                $8::varchar,
                $9::varchar
            ),
            0
        )

        + COALESCE(rcpt.rcpt_qty,0)

        - COALESCE(issue.issu_qty,0)

    )                                                       AS "Closing Balance As on",

    get_item_war(
        a.it_code::varchar,
        $10::bigint,
        $11::varchar,
        EXTRACT(MONTH FROM ($12::date - INTERVAL '3 month'))::bigint,
        'N'::varchar
    )                                                       AS "Rate",

    (
        (
            COALESCE(
                item_current_opening_bal(
                    b.wc_id::smallint,
                    a.it_code::varchar,
                    ($13::date - INTERVAL '1 day')::date,
                    $8::varchar,
                    $9::varchar
                ),
                0
            )

            + COALESCE(rcpt.rcpt_qty,0)

            - COALESCE(issue.issu_qty,0)

        )

        *

        get_item_war(
            a.it_code::varchar,
            $10::bigint,
            $11::varchar,
            EXTRACT(MONTH FROM ($12::date - INTERVAL '3 month'))::bigint,
            'N'::varchar
        )

    )                                                       AS "Value",

    COALESCE(gate.qty,0)                                    AS "At Gate",

    COALESCE(inspection.qty,0)                              AS "Under Inspection",

    COALESCE(cleared.qty,0)                                 AS "Cleared But not Recd. in Store"

FROM mommitem a

JOIN mommstok b
    ON a.it_code = b.it_code

JOIN mommwc c
    ON b.wc_id = c.wc_id

LEFT JOIN moitdivision divi
    ON divi.division_id = c.division_id

LEFT JOIN moitbase typebase
    ON typebase.level1 = a.it_type
   AND typebase.level2 = '00'
   AND typebase.level3 = '00'

LEFT JOIN moitbase basebase
    ON basebase.level1 = a.it_type
   AND basebase.level2 = a.it_base
   AND basebase.level3 = '00'

LEFT JOIN moitbase subbase
    ON subbase.level1 = a.it_type
   AND subbase.level2 = a.it_base
   AND subbase.level3 = a.it_sub_c

LEFT JOIN (

    SELECT
        a.it_code,
        a.wc_id,
        SUM(a.qty) AS rcpt_qty

    FROM tommmain a
    JOIN mommtrty b
        ON a.trans_code = b.trans_code

    WHERE
        b.receive_issue_flag = 'R'
        AND a.doc_date BETWEEN $13 AND $14
        AND a.ok_rej = $9

    GROUP BY a.it_code, a.wc_id

) rcpt
    ON rcpt.it_code = a.it_code
   AND rcpt.wc_id = b.wc_id

LEFT JOIN (

    SELECT
        a.it_code,
        a.wc_id,
        SUM(a.qty) AS issu_qty

    FROM tommmain a
    JOIN mommtrty b
        ON a.trans_code = b.trans_code

    WHERE
        b.receive_issue_flag = 'I'
        AND a.doc_date BETWEEN $13 AND $14
        AND a.ok_rej = $9

    GROUP BY a.it_code, a.wc_id

) issue
    ON issue.it_code = a.it_code
   AND issue.wc_id = b.wc_id

LEFT JOIN (

    SELECT
        d.it_code,
        h.division_id,
        SUM(d.qty_recd) AS qty

    FROM tdmmrct d
    JOIN thmmrct h
        ON d.ge_id = h.ge_id

    WHERE d.status_flg = 'G'

    GROUP BY d.it_code, h.division_id

) gate
    ON gate.it_code = a.it_code
   AND gate.division_id = c.division_id

LEFT JOIN (

    SELECT
        d.it_code,
        h.division_id,
        SUM(d.qty_recd) AS qty

    FROM tdmmrct d
    JOIN thmmrct h
        ON d.ge_id = h.ge_id

    WHERE d.status_flg = 'I'

    GROUP BY d.it_code, h.division_id

) inspection
    ON inspection.it_code = a.it_code
   AND inspection.division_id = c.division_id

LEFT JOIN (

    SELECT
        d.it_code,
        h.division_id,
        SUM(d.qty_accptd) AS qty

    FROM tdmmrct d
    JOIN thmmrct h
        ON d.ge_id = h.ge_id

    WHERE d.status_flg = 'C'

    GROUP BY d.it_code, h.division_id

) cleared
    ON cleared.it_code = a.it_code
   AND cleared.division_id = c.division_id

WHERE

      b.wc_id >= COALESCE($1, b.wc_id)

  AND b.wc_id <= COALESCE($2, b.wc_id)

  AND a.it_code >= COALESCE($3, a.it_code)

  AND a.it_code <= COALESCE($15, a.it_code)

  AND a.it_type = COALESCE($4, a.it_type)

  AND a.it_base = COALESCE($5, a.it_base)

  AND a.it_sub_c = COALESCE($6, a.it_sub_c)

  AND b.active =
      CASE
          WHEN $7 = 'B' THEN b.active
          ELSE $7
      END

  AND b.trans_year = $8

ORDER BY 1,6,8,10

`;

  const params = [
  wc_id || null,          // $1
  to_wc_id || null,       // $2
  it_code || null,        // $3
  it_type || null,        // $4
  it_base || null,        // $5
  it_sub_c || null,       // $6
  active_flag || 'B',     // $7
  trans_year,             // $8
  ok_rej || 'O',          // $9
  division_id,            // $10
  trans_year,             // $11
  to_date,                // $12
  from_date,              // $13
  to_date,                // $14
  it_code1 || null        // $15
];

      const result = await db.query(query, params);

      // Extract column names from the result metadata
      const columns = result.fields.map(f => f.name);

      return res.status(200).json({
        success: true,
        data: result.rows,
        columns: columns,
      });

    } catch (error) {
      console.error("handlePostFormData error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  });


