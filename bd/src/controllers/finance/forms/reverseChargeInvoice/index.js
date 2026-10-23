const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");

const TABLE_NAMES = {
    MHSMINV_TABLE: `mhapbill_rc `,
    MDSMINV_TABLE: `mdapbill_rc `,
};

const getRCMDataOnQuery = async (req, res) => {
    const { formStatus, appDivisionId, appFinYear, userId } = req.query;

    let whereClauses = [];

    // Define search keys that should be checked in WHERE clause
    let searchKeys = ["inv_no"];

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
    console.log("req_payload:: ", req?.query);
    console.log("transformed transYr & divId::", transYear, divisionId);

    try {
        let queryParameter = `ORDER BY rc_inv_id LIMIT 1 OFFSET ${
            req.query.offset || 0
        }`;
        let dataCount;

        if (whereClauses.length > 0) {
            const getCount = await db.query(
                `SELECT COUNT(*) FROM ${TABLE_NAMES.MHSMINV_TABLE} WHERE trans_year = $1 AND division_id = $2
                   ${queryValues}`,
                [appFinYear, appDivisionId]
            );
            dataCount = getCount.rows[0]?.count;
            queryParameter = `${queryValues} ${queryParameter}`;
        } else {
            switch (req?.query?.get_data) {
                case "Query":
                case "First": {
                    const getCount = await db.query(
                        `SELECT COUNT(*) FROM ${TABLE_NAMES.MHSMINV_TABLE} 
           WHERE trans_year = $1 AND division_id = $2`,
                        [appFinYear, appDivisionId]
                    );
                    dataCount = getCount.rows[0]?.count || 0;
                    break;
                }

                case "Last": {
                    queryParameter = "ORDER BY rc_inv_id DESC LIMIT 1";
                    break;
                }
            }
        }

        // Fetch main header record
        const mhsminvResult = await db.query(
            `SELECT * FROM ${TABLE_NAMES.MHSMINV_TABLE} 
       WHERE trans_year = $1 AND division_id = $2 
       ${queryParameter}`,
            [appFinYear, appDivisionId]
        );

        if (mhsminvResult.rows.length === 0) {
            return res.status(200).json({
                type: "not found",
                mhsminvData: null,
                count: dataCount || 0,
            });
        }

        //=== Post query block data MHSMINV ====

        const mhsminvRow = mhsminvResult.rows[0];
        let finalDocNo = mhsminvRow.doc_no;
        const docType = mhsminvRow.doc_type;

        // === Handle doc_type: N, S, V, P ===
        if (["N", "S", "V", "P"].includes(docType) && mhsminvRow.order_id) {
            const orderResult = await db.query(
                `SELECT order_no FROM mhsmordr WHERE order_id = $1`,
                [mhsminvRow.order_id]
            );
            if (orderResult.rows.length > 0) {
                finalDocNo = orderResult.rows[0].order_no;
            }
        }

        // === Handle doc_type: R ===
        if (docType === "R" && mhsminvRow.rej_gp_id) {
            const rejResult = await db.query(
                `SELECT rej_gpno, 'N' AS flag FROM tommirej WHERE rej_gp_id = $1
         UNION
         SELECT rej_gpno, 'Y' AS flag FROM tommrmda_no_mrir WHERE rej_gp_id = $1`,
                [mhsminvRow.rej_gp_id]
            );
            if (rejResult.rows.length > 0) {
                finalDocNo = rejResult.rows[0].rej_gpno;
                mhsminvRow.tommrmda_no_mrir_flag = rejResult.rows[0].flag;
            }
        }

        // === Handle doc_type: D ===
        if (docType === "D" && mhsminvRow.doc_id) {
            const docResult = await db.query(
                `SELECT doc_no FROM thmmmchl WHERE doc_id = $1`,
                [mhsminvRow.doc_id]
            );
            if (docResult.rows.length > 0) {
                finalDocNo = docResult.rows[0].doc_no;
            }
        }

        // Set final doc_no
        mhsminvRow.doc_no = finalDocNo;

        // === Resolve divert_inv_no if present ===
        if (mhsminvRow.divert_inv_id) {
            try {
                const divertResult = await db.query(
                    `SELECT inv_no FROM mhsminv WHERE inv_id = $1`,
                    [mhsminvRow.divert_inv_id]
                );
                mhsminvRow.divert_inv_no = divertResult.rows[0]?.inv_no || null;
            } catch {
                mhsminvRow.divert_inv_no = null;
            }
        }

        // === Set party_code = v_code ===
        mhsminvRow.party_code = mhsminvRow.v_code;

        // === Resolve party_name, ship_to_name, bill_to_name ===
        try {
            const vendResult = await db.query(
                `SELECT 
            (SELECT v_name FROM mommvend WHERE v_code = $1) AS party_name,
            (SELECT v_name FROM mommvend WHERE v_code = $2) AS ship_to_name,
            (SELECT v_name FROM mommvend WHERE v_code = $3) AS bill_to_name`,
                [
                    mhsminvRow.v_code,
                    mhsminvRow.ship_to_code,
                    mhsminvRow.bill_to_code,
                ]
            );

            if (vendResult.rows.length > 0) {
                const vend = vendResult.rows[0];
                mhsminvRow.party_name = vend.party_name || null;
                mhsminvRow.ship_to_name = vend.ship_to_name || null;
                mhsminvRow.bill_to_name = vend.bill_to_name || null;
            }
        } catch (vendErr) {
            mhsminvRow.party_name = null;
            mhsminvRow.ship_to_name = null;
            mhsminvRow.bill_to_name = null;
        }

        // === Resolve c_po_no, currency description, conversion rate, and annual_flag ===
        if (mhsminvRow.order_id) {
            try {
                const orderCurrResult = await db.query(
                    `SELECT 
             o.c_po_no, 
             c.curr_desc AS so_curr_cd, 
             o.curr_conv AS so_c_ex_rate, 
             o.annual_flag
           FROM mhsmordr o
           LEFT JOIN currency c ON o.curr_cd = c.curr_code
           WHERE o.order_id = $1`,
                    [mhsminvRow.order_id]
                );

                if (orderCurrResult.rows.length > 0) {
                    const orderData = orderCurrResult.rows[0];
                    mhsminvRow.c_po_no = orderData.c_po_no || null;
                    mhsminvRow.so_curr_cd = orderData.so_curr_cd || null;
                    mhsminvRow.so_c_ex_rate = orderData.so_c_ex_rate || null;
                    mhsminvRow.annual_flag = orderData.annual_flag || null;
                }
            } catch (err) {
                mhsminvRow.c_po_no = null;
                mhsminvRow.so_curr_cd = null;
                mhsminvRow.so_c_ex_rate = null;
                mhsminvRow.annual_flag = null;
            }
        }

        // === Get commodity description ===
        if (mhsminvRow.commodity) {
            try {
                const commodityResult = await db.query(
                    `SELECT commodity_desc 
           FROM commodity 
           WHERE commodity_code = $1`,
                    [mhsminvRow.commodity]
                );

                if (commodityResult.rows.length > 0) {
                    mhsminvRow.commodity_desc =
                        commodityResult.rows[0].commodity_desc;
                } else {
                    mhsminvRow.commodity_desc = null;
                }
            } catch (err) {
                mhsminvRow.commodity_desc = null;
            }
        }

        // === Get voucher_id and voucher_no from thfmtran ===
        if (mhsminvRow.inv_id) {
            try {
                const voucherResult = await db.query(
                    `SELECT voucher_id, voucher_no 
           FROM thfmtran 
           WHERE trans_type LIKE 'S%' 
             AND bill_id = $1`,
                    [mhsminvRow.inv_id]
                );

                if (voucherResult.rows.length > 0) {
                    mhsminvRow.voucher_id = voucherResult.rows[0].voucher_id;
                    mhsminvRow.voucher_no = voucherResult.rows[0].voucher_no;
                } else {
                    mhsminvRow.voucher_id = null;
                    mhsminvRow.voucher_no = null;
                }
            } catch (err) {
                mhsminvRow.voucher_id = null;
                mhsminvRow.voucher_no = null;
            }
        }

        // === Credit Note  from thfmtran ===
        try {
            const creditNoteResult = await db.query(
                `SELECT voucher_id, voucher_no 
      FROM thfmtran 
      WHERE trans_type = 'RN' AND bill_id = $1`,
                [mhsminvRow.inv_id]
            );

            if (creditNoteResult.rows.length > 0) {
                mhsminvRow.credit_note_id = creditNoteResult.rows[0].voucher_id;
                mhsminvRow.credit_note = creditNoteResult.rows[0].voucher_no;
            } else {
                // equivalent of no_data_found in Oracle
                mhsminvRow.credit_note_id = null;
                mhsminvRow.credit_note = null;
            }
        } catch (err) {
            console.error("Error fetching credit note:", err);
            mhsminvRow.credit_note_id = null;
            mhsminvRow.credit_note = null;
        }
        // === Rmgp_no ======
        if (mhsminvRow.rmgp_id) {
            try {
                const result = await db.query(
                    `SELECT doc_no 
            FROM thmmmchl 
            WHERE division_id = $1
              AND chl_type = 'M'
              AND nonkardex_flag = 'N'
              AND COALESCE(print_ok, 'N') = 'Y'
              AND out_time IS NOT NULL
              AND doc_id = $2
              AND COALESCE(cancel_sdv, 'N') = 'N'`,
                    [mhsminvRow.division_id, mhsminvRow.rmgp_id]
                );

                if (result.rows.length > 0) {
                    mhsminvRow.rmgp_no = result.rows[0].doc_no;
                } else {
                    mhsminvRow.rmgp_no = null;
                }
            } catch (err) {
                console.error("Error fetching RMGP doc_no:", err);
                mhsminvRow.rmgp_no = null;
            }
        }

        // === Get excisable flag if DESPATCH_FR is not null ===
        if (mhsminvRow.despatch_fr) {
            try {
                const excisableResult = await db.query(
                    `SELECT COALESCE(excisable, 'N') AS excisable 
          FROM mosmdact 
          WHERE da_cat = $1`,
                    [mhsminvRow.inv_type]
                );

                mhsminvRow.excisable_flag =
                    excisableResult.rows[0]?.excisable || "N";
            } catch (err) {
                console.error("Error fetching excisable flag:", err);
                mhsminvRow.excisable_flag = "N";
            }
        }

        // === If excisable_flag is 'N', fetch wc_id from mommwc table ===
        if (mhsminvRow.excisable_flag === "N" && mhsminvRow.despatch_fr) {
            try {
                const wcResult = await db.query(
                    `SELECT wc_id 
       FROM mommwc 
       WHERE c_code = $1 
         AND store_process = 'S' 
         AND store_type IN ('G', 'D')`,
                    [mhsminvRow.despatch_fr]
                );

                //  Directly assign to mhsminvRow only for query
                mhsminvRow.wc_id = wcResult.rows[0]?.wc_id || null;
            } catch (err) {
                console.error("Error fetching wc_id:", err);
                mhsminvRow.wc_id = null;
            }
        }

        // === If excisable_flag is 'Y', fetch wc_id from mommwc with store_type = 'E' ===
        else if (mhsminvRow.excisable_flag === "Y" && mhsminvRow.despatch_fr) {
            try {
                const wcResult = await db.query(
                    `SELECT wc_id 
        FROM mommwc 
        WHERE c_code = $1 
          AND store_process = 'S' 
          AND store_type = 'E'`,
                    [mhsminvRow.despatch_fr]
                );

                // Assign directly to mhsminvRow only for query
                mhsminvRow.wc_id = wcResult.rows[0]?.wc_id || null;
            } catch (err) {
                console.error("Error fetching wc_id (E) from mommwc:", err);
                mhsminvRow.wc_id = null;
            }
        }

        // === Get Detail Records ===
        const rcInvoiceId = mhsminvRow.rc_inv_id;

        const mdapbillRcData = await db.query(
            `SELECT * FROM ${TABLE_NAMES.MDSMINV_TABLE} 
    WHERE rc_inv_id = $1 
    ORDER BY COALESCE(access_sr_no, sr_no), sr_no`,
            [rcInvoiceId]
        );

        const detailRows = mdapbillRcData.rows;

        // === Post-query block for each detail row
        for (const row of detailRows) {
            // 1. Get da_no if da_id exists
            if (row.da_id !== null) {
                const daResult = await db.query(
                    `SELECT da_no FROM mhsmda WHERE da_id = $1`,
                    [row.da_id]
                );
                row.doc_no = daResult.rows[0]?.da_no || null;
            } else {
                row.doc_no = null;
            }

            // 2. Get expiry_day_check from mommitem using it_code
            const expResult = await db.query(
                `SELECT COALESCE(expiry_day_check, 0) AS expdays FROM mommitem WHERE it_code = $1`,
                [row.it_code]
            );
            row.expdays = expResult.rows[0]?.expdays || 0;

            // 3. Get it_name as it_desc (with exception handling for no data)
            const itDescResult = await db.query(
                `SELECT it_name FROM mommitem WHERE it_code = $1`,
                [row.it_code]
            );
            row.it_desc =
                itDescResult.rows.length > 0
                    ? itDescResult.rows[0].it_name
                    : null;

            // 4. Get cus_it_desc from mosmpcus if cus_it_code exists
            if (row.cus_it_code !== null) {
                const cusDescResult = await db.query(
                    `SELECT cus_it_desc FROM mosmpcus 
       WHERE c_code = $1 AND cus_it_code = $2 AND it_code = $3`,
                    [mhsminvRow.c_code, row.cus_it_code, row.it_code]
                );
                row.cus_it_desc =
                    cusDescResult.rows.length > 0
                        ? cusDescResult.rows[0].cus_it_desc
                        : null;
            } else {
                row.cus_it_desc = null;
            }

            // 5. Get acc_desc for sale_ac_head
            try {
                const accDescResult = await db.query(
                    `SELECT h.acc_desc 
        FROM mdfmglm d
        JOIN mhfmglm h ON d.acc_no = h.acc_no
        WHERE d.acc_no = $1
          AND d.division_id = $2
          AND trans_year = $3`,
                    [row.sale_ac_head, appDivisionId, appFinYear]
                );
                row.sale_ac_desc = accDescResult.rows[0]?.acc_desc || null;
            } catch (err) {
                console.error("Error fetching sale_ac_desc:", err);
                row.sale_ac_desc = null;
            }
            // 6. Get catalog_code from mosmprod
            try {
                const catalogResult = await db.query(
                    `SELECT catalog_code 
        FROM mosmprod 
        WHERE it_code = $1`,
                    [row.it_code]
                );
                row.catalog_code = catalogResult.rows[0]?.catalog_code || null;
            } catch (err) {
                console.error("Error fetching catalog_code:", err);
                row.catalog_code = null;
            }

            // 7. Get description from mommwc
            try {
                const descResult = await db.query(
                    `SELECT description 
        FROM mommwc 
        WHERE wc_id = $1`,
                    [row.wc_id]
                );
                row.description = descResult.rows[0]?.description || null;
            } catch (err) {
                console.error("Error fetching description from mommwc:", err);
                row.description = null;
            }
            // 8. Get HSN_SAC_CODE from MOMMITEM
            try {
                const hsnResult = await db.query(
                    `SELECT HSN_SAC_CODE 
       FROM MOMMITEM 
       WHERE IT_CODE = $1`,
                    [row.it_code]
                );
                row.HSN_SAC_CODE = hsnResult.rows[0]?.hsn_sac_code || null;
            } catch (err) {
                console.error(
                    "Error fetching HSN_SAC_CODE from MOMMITEM:",
                    err
                );
                row.HSN_SAC_CODE = null;
            }
        }

        return res.status(200).json({
            type: "found",
            mhsminvData: mhsminvRow,
            mdapbillRcData: detailRows,
            count: dataCount || 0,
        });
    } catch (error) {
        console.error("Error in getRCMDataOnQuery:", error);
        return res.status(500).json({
            message: "Internal Server Error On Query",
        });
    }
};

// dropDown
exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
    const division = await db.query(`        
SELECT name, division_id
FROM moitdivision
ORDER BY name`);

    const despatch = await db.query(`
    select name ,c_code from moitdivision 
order by name`);

    const currency = await db.query(`
    select curr_desc, curr_code from currency order by 1`);

    const preShipmentNo = await db.query(`
    SELECT pre_inv_no, pre_id
      FROM themprin p
      JOIN mosmcust c ON p.c_code = c.c_code
      ORDER BY pre_inv_no
`);

    const modeOfTransport = await db.query(
        `select description from mommcode where cat_group = 'MOT' order by 1`
    );
    const priceBasis = await db.query(`
    select description  from mommcode where cat_group = 'PBASIS' order by 1`);

    const paymentTerm = await db.query(`
    select term_desc from mhmmterm where sale_or_purchase = 'S' order by term_desc`);

    const storageType = await db.query(`
    SELECT description , code 
       FROM mommcode
       WHERE cat_group = 'STORAG'
       `);

    return res.status(200).json({
        division: division.rows,
        despatch: despatch.rows,
        currency: currency.rows,
        preShipmentNo: preShipmentNo.rows,
        modeOfTransport: modeOfTransport.rows,
        priceBasis: priceBasis.rows,
        paymentTerm: paymentTerm.rows,
        storageType: storageType.rows,
    });
});

exports.handleFormOperation = catchAsync(async (req, res, next) => {
    console.log("from handleFormOperation", req?.query);
    if (["Query", "Search"].includes(req?.query?.formStatus)) {
        await getRCMDataOnQuery(req, res);
        return;
    }
});
