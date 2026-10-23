const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");



  const helpListData = async (req, res) => {
    const {
      appDivisionId: divisionId, appUserId, help_list,appFinYear:trans_year,wc_id } = req?.query;

    console.log("req?.query:", req?.query);

    if (help_list === "store") {
      const storeList = await db.query(
        `  select DISTINCT ON (a.wc_id) a.description, a.wc_no, a.wc_id 
              from mommwc a, store s
              where a.wc_id = s.wc_id
              -- and user_id = $1
              and a.division_id =$1
             ORDER BY a.wc_id, a.description; `,
              [divisionId]
      );
        return res.status(200).send(storeList.rows);
    }
    if (help_list === "from") {
      const fromList = await db.query(
        `select doc_no, doc_date from thmmmain 
          where division_id = $1
          and trans_year = $2
          and WC_ID = $3
          order by doc_no
          `,[divisionId,trans_year,wc_id]
      
      );
      return res.status(200).send(fromList.rows);
    }
    if (help_list === "to") {
      const toList = await db.query(
        ` select doc_no, doc_date from thmmmain 
          where division_id = $1
          and trans_year = $2
          and WC_ID = $3
          order by doc_no
          `,[divisionId,trans_year,wc_id]
      
      );
      return res.status(200).send(toList.rows);
    }
  };

  exports.validateStore = async (req, res) => {
    try {
      const { wc_no } = req.query;

      if (!wc_no) {
        return res.status(400).json({
          success: false,
          message: "WC No is required",
        });
      }

      const result = await db.query(
        `SELECT 1 
        FROM mommwc 
        WHERE wc_no = $1 
          AND store_process = 'S' `,
        [wc_no]
      );

      if (result.rows.length === 0) {
        return res.status(200).json({
          success: false,
          message: "Store does not exist",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Store is valid",
      });

    } catch (error) {
      console.error("Store validation error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  };
 

  exports.handleFormOperation = catchAsync(async (req, res, next) => {
    if (req?.query?.help_list) {
      await helpListData(req, res);
      return;
    }
  });


  exports.handlePostFormData = catchAsync(async (req, res, next) => {
    try {
      const { wc_id, iss_no_from: fromDocNo, iss_no_to: toDocNo } = req.body;

      if (!wc_id) {
        return res.status(400).json({
          success: false,
          message: "wc_id is required",
        });
      }

      const query = `
        SELECT 
            a.doc_id,
            a.trans_code,
            a.doc_no,
            a.doc_date,
            d.it_code,
            c.it_name,
            a.wc_id,
            a.remark,
            d.um_code,
            d.qty,
            c.it_type,
            c.it_base,
            c.it_sub_c,
            p.catalog_code,
            a.create_id,
            a.kit_issued_to,
            a.kit_remarks,
            b.batch_no,
            b.batch_qty,
            b.ok_rej,
            b.expiry_date
        FROM thmmmain a
        JOIN tdmmmain d ON d.doc_id = a.doc_id
        JOIN mommitem c ON d.it_code = c.it_code
        LEFT JOIN mosmprod p ON c.it_code = p.it_code
        LEFT JOIN tdmmmain_batch b 
        ON b.doc_id = d.doc_id    --  batch join
        AND b.it_code = d.it_code 
        WHERE a.wc_id = $1
          AND a.doc_no BETWEEN COALESCE($2, a.doc_no)
                          AND COALESCE($3, a.doc_no)
        ORDER BY a.doc_no, b.batch_no;
      `;

      const params = [wc_id, fromDocNo, toDocNo];
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

