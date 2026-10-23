const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { dateFormater } = require("../../../../utility/constant");
const { generateSingleInsertQuery } = require("../../../../utility/query");

const TABLE_NAMES = {
    PYMNT_RVRS: `TOFMPMTREVERSE`,
};

const getPaymentRvrsDataOnQuery = async (req, res) => {
    const { appDivisionId, appFinYear, userId } = req.query;

    let whereClauses = [];
    let searchKeys = ["acc_no"];

    for (const key of searchKeys) {
        if (req.query[key] !== undefined && req.query[key] !== "") {
            whereClauses.push(`${key} = '${req.query[key]}'`);
        }
    }

    let queryValues =
        whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";
    let transYear = appFinYear || "2023";
    let divisionId = appDivisionId || 1;
    let user_id = userId || 583;

    try {
        const offset = parseInt(req.query.offset) || 0;
        const getDataType = req?.query?.get_data;

        let queryParameter = `ORDER BY voucher_id LIMIT 1 OFFSET ${offset}`;
        let dataCount = 0;

        if (whereClauses.length > 0) {
            const getCount = await db.query(
                `SELECT COUNT(*) FROM ${TABLE_NAMES.PYMNT_RVRS} ${queryValues}`
            );
            dataCount = Number(getCount.rows[0]?.count || 0);
            queryParameter = `${queryValues} ${queryParameter}`;
        } else {
            switch (getDataType) {
                case "First":
                case "Query": {
                    const getCount = await db.query(
                        `SELECT COUNT(*) FROM ${TABLE_NAMES.PYMNT_RVRS}`
                    );
                    dataCount = Number(getCount.rows[0]?.count || 0);
                    break;
                }
                case "Last": {
                    queryParameter = "ORDER BY voucher_id DESC LIMIT 1"; // order by as per jsb sir
                    break;
                }
            }
        }

        // 🔹 Get main record
        const getData = await db.query(
            `SELECT * FROM ${TABLE_NAMES.PYMNT_RVRS} ${queryParameter}`
        );

        if (getData.rowCount === 0) {
            return res.status(200).json({
                type: "not_found",
                pymntRvrs: null,
                totalCount: dataCount,
                message: "No data found",
            });
        }

        const row = getData.rows[0];

        const accResult1 = await db.query(
            `SELECT bank_name as acc_desc FROM mhfmbank WHERE acc_no = $1`,
            [row.acc_no]
        );

        const accResult2 = await db.query(
            `SELECT acc_desc as party_desc FROM mhfmglm WHERE acc_no = $1`,
            [row.party_code]
        );

        const accResult3 = await db.query(
            `SELECT voucher_no as old_voucher_no FROM thfmtran WHERE voucher_id = $1`,
            [row.old_voucher_id]
        );

        const accResult4 = await db.query(
            `SELECT voucher_no as voucher_no FROM thfmtran WHERE voucher_id = $1`,
            [row.voucher_id]
        );

        return res.status(200).json({
            type: "found",
            pymntRvrs: {
                ...row,
                acc_desc: accResult1.rows[0]?.acc_desc,
                party_desc: accResult2.rows[0]?.party_desc,
                old_voucher_no: accResult3.rows[0]?.old_voucher_no,
                voucher_no: accResult4.rows[0]?.voucher_no,
                pay_rec: String(row.pay_rec),
            },
            totalCount: dataCount,
        });
    } catch (error) {
        console.error("Error in getPaymentRvrsDataOnQuery:", error);
        return res
            .status(500)
            .json({ message: "Internal server error on query" });
    }
};

const helpListData = async (req, res) => {
    const {
        appDivisionId,
        form_status,
        help_list,
        h_acc_no,
        h_chq_no,
        h_chq_dt,
        h_pay_rec,
    } = req?.query;

    if (!["Insert", "Search"].includes(form_status)) {
        return res.status(200).send([]);
    }

    // for party code help list
    if (help_list === "AccNo") {
        if(form_status === 'Search'){
            const acc = await db.query(
                `SELECT DISTINCT 
                 a.acc_no,  b.bank_name AS acc_desc
                FROM TOFMPMTREVERSE a
                JOIN mhfmbank b 
                ON b.acc_no = a.acc_no;`);
             return res.status(200).json(acc.rows);
        } else {
             const acc = await db.query(
            `select bank_name as acc_desc, acc_no from mhfmbank where division_id = $1  order by 1`,
            [appDivisionId]
        );
        return res.status(200).json(acc.rows);
    }
    } else if (help_list === "ChqNo") {
        const chqNo = await db.query(
            `SELECT 
    d.chq_no, 
    d.chq_dt::date, 
    ABS(SUM(CASE d.db_cr 
             WHEN 'C' THEN d.amount 
             ELSE d.amount * -1 
            END)) AS chq_amt, 
    h.voucher_no, 
    h.voucher_id
FROM thfmtran h, tdfmtran d
WHERE h.voucher_id = d.voucher_id
  AND d.acc_no = $1
  AND h.division_id = $2
  AND d.db_cr = CASE WHEN $3 = 0 THEN 'C' ELSE 'D' END
  AND COALESCE(h.cancel, 'N') = 'N'
GROUP BY d.chq_no, d.chq_dt, h.voucher_no, h.voucher_id
ORDER BY d.chq_no, d.chq_dt;
`,
            [h_acc_no, appDivisionId, h_pay_rec]
        );

        return res.status(200).send(
            chqNo.rows.map((item) => ({
                ...item,
                chq_dt: dateFormater(item.chq_dt),
            }))
        );
    } else if (help_list === "OldVchrNo") {
        const OldVchrNo = await db.query(
            `SELECT 
    d.chq_dt,
    h.voucher_id,
    h.voucher_no,
    ABS(SUM(CASE d.db_cr 
             WHEN 'C' THEN d.amount 
             ELSE -d.amount 
            END)) AS amount
FROM thfmtran h
JOIN tdfmtran d ON h.voucher_id = d.voucher_id
WHERE d.chq_no = $1
  AND d.chq_dt = $2
  AND h.division_id = $3
  AND COALESCE(h.cancel, 'N') = 'N'
  AND COALESCE(d.flag, 'N') = 'N'
  AND EXISTS (
      SELECT 1 
      FROM tdfmtran c
      WHERE c.voucher_id = h.voucher_id
        AND c.acc_no = $4
        AND c.db_cr = CASE WHEN $5 = 0 THEN 'C' ELSE 'D' END
  )
GROUP BY d.chq_dt, h.voucher_id, h.voucher_no;
`,
            [h_chq_no, h_chq_dt, appDivisionId, h_acc_no, h_pay_rec]
        );
        return res.status(200).send(OldVchrNo.rows);
    }
};

const validateParty = async (req, res) => {
    console.log(req.query);

    try {
        const { old_voucher_id, chq_no } = req.query;

        if (!old_voucher_id || !chq_no) {
            return res
                .status(400)
                .json({ message: "Missing required parameters" });
        }

        const partyResult = await db.query(
            `SELECT 
          m.acc_no as party_code, 
          m.acc_desc as party_desc
        FROM tdfmtran t
        JOIN mhfmglm m ON m.acc_no = t.acc_no
        WHERE t.voucher_id = $1
          AND t.chq_no = $2
          AND (m.acc_no LIKE 'C%' OR m.acc_no LIKE 'S%')
        LIMIT 1`,
            [old_voucher_id, chq_no]
        );

        console.log(partyResult.rows);

        if (partyResult.rowCount === 0) {
            return res.status(404).json({ message: "No party found" });
        }

        res.status(200).json(partyResult.rows[0]);
    } catch (error) {
        console.error("Error in validateParty:", error);
        res.status(500).json({
            message: "Internal server error during party validation",
        });
    }
};

const insertFormData = async (req, res) => {
    try {
        await db.query("begin");
        const { formData } = req.body;

        console.log("req body:", req.body);
        const {
            division_id,
            trans_year,
            old_voucher_id,
            chq_no,
            reverse_date,
            chq_dt,
            type_reversal,
            pay_rec,
            acc_no,
            chq_amt,
        } = formData;

        let safeOldVoucherId =
            old_voucher_id && old_voucher_id !== ""
                ? Number(old_voucher_id)
                : null;

        const sanitize = (val) =>
            val === "" || val === undefined ? null : val;

        formData.chq_amt = sanitize(formData?.chq_amt)
            ? Number(formData?.chq_amt)
            : null;
        formData.chq_dt = sanitize(formData.chq_dt);

        //REVERT_BEFORE_CHK logic
        const isVoucherExist = await db.query(
            `
      SELECT H.VOUCHER_NO
      as VOU_NO
      FROM TOFMPMTREVERSE T, TDFMTRAN D, THFMTRAN H
      WHERE H.VOUCHER_ID = T.VOUCHER_ID
        AND H.VOUCHER_ID = D.VOUCHER_ID
        AND T.OLD_VOUCHER_ID = $1
        AND D.CHQ_NO = $2
        AND COALESCE(H.CANCEL, 'N') = 'N'
      LIMIT 1;
    `,
            [safeOldVoucherId, chq_no]
        );

        if (isVoucherExist.rowCount) {
            return res
                .status(400)
                .json({
                    type: "error",
                    message: `This Cheque has been already reverted with ${isVoucherExist.rows[0].vou_no}`,
                });
        }

        console.log("Received division_id:", division_id);
        console.log("Received trans_year:", trans_year);

        // Select voucher_id first
        const oldVoucherNo = formData.old_voucher_no;
        delete formData.old_voucher_no;
        delete formData.acc_desc;
        delete formData.voucher_no;
        delete formData.voucher_id;
        delete formData.party_desc;

        formData.pay_rec = Number(formData?.pay_rec);

        let oldVoucherId = 99999; //todo we need to implement this ask to pm sir
        const voucherIdResult = await db.query(
            `SELECT voucher_id FROM thfmtran WHERE voucher_no = $1`,
            [oldVoucherNo]
        );

        if (voucherIdResult.rowCount > 0) {
            oldVoucherId = voucherIdResult.rows[0]?.voucher_id;
        }

        // oldVoucherId = voucherIdResult.rows[0]?.voucher_id;
        console.log("Fetched voucher_id:", oldVoucherId);

        formData.old_voucher_id = Number(oldVoucherId);

        const queryForInsert = generateSingleInsertQuery(
            TABLE_NAMES.PYMNT_RVRS,
            formData
        );

        const valuesForInsertQuery = Object.values(formData);

        console.log(queryForInsert);
        console.log(valuesForInsertQuery);

        try {
            await db.query(queryForInsert, valuesForInsertQuery);
        } catch (error) {
            console.error("Error inserting record:", error);
            throw new Error(`Insert error: ${error.message}`);
        }

        // AFTER SUCCESSFULLY INSERTED NEW RECORD IN PAYMENT REVERSAL NEED TO CREATE NEW VOUCHER_ID IN THFMTRAN & TDFMTRAN
        try {
            const result = await db.query(
                `CALL proc_create_bv_reversal($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
                [
                    sanitize(old_voucher_id), // pold_voucher_id
                    division_id, // pdivision_id
                    sanitize(chq_no), // pChq_no
                    sanitize(chq_dt), // pChq_dt
                    pay_rec, // pPay_rec
                    reverse_date, // pRev_date
                    trans_year, // ptrans_year
                    type_reversal, // pRev_type
                    2, // psection
                    sanitize(acc_no), // pacc
                    Number(chq_amt), // pchqAmt
                    "1",
                    1,
                ]
            );
        } catch (error) {
            throw new Error(error.message);
        }

        const getVoucherNo = await db.query(
            `select voucher_no from TOFMPMTREVERSE r,thfmtran t
        where r.old_voucher_id =$1
        and t.voucher_id = r.voucher_id
        `,
            [safeOldVoucherId]
        );
        if (!getVoucherNo.rowCount) {
            return res
                .status(400)
                .json({
                    type: "error",
                    message: "Error while generting new Voucher No.",
                });
        }

        await db.query("commit");
        res.status(200).json({
            type: "success",
            new_voucher_no: getVoucherNo.rows[0]?.voucher_no,
            message: "Records inserted successfully",
        });
    } catch (error) {
        await db.query("rollback");
        console.error("Insert error:", error);
        res.status(500).json({type:"error", message: error.message || 'Insertion failed on submit'});
    }
};


exports.handleFormOperation = catchAsync(async (req, res, next) => {
    console.log("from handleFormOperation", req?.query);
    if (["Query", "Search"].includes(req?.query?.formStatus)) {
        await getPaymentRvrsDataOnQuery(req, res);
        return;
    }

    if (req?.query?.help_list) {
        await helpListData(req, res);
        return;
    }
});

exports.handlePostFormData = catchAsync(async (req, res, next) => {
    if (req?.query?.form_status && req?.query?.form_status === "Update") {
        await updateBankDetails(req, res);
        return;
    } else {
        await insertFormData(req, res);
        return;
    }
});

exports.handleValidation = catchAsync(async (req, res, next) => {
    if (req.query?.old_voucher_id) {
        await validateParty(req, res);
        return;
    }
});
