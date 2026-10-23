const { db } = require("../config/dbConnection"); // update path according to your project

/**
 * Fetch latest Pending PO details
 */


exports.getPendingPOById = async (po_id) => {
  console.log("Fetching Pending PO details for po_id:", po_id);
 const query = `
   	   SELECT
        h.po_id,
        h.po_no,
        h.po_date,
        CASE
            WHEN h.po_type = 'O' THEN 'ORDER'
            WHEN h.po_type = 'A' THEN 'ADVICE'
            ELSE h.po_type
        END AS po_type,
        h.po_eff_dt,
        h.po_end_dt,
        (CURRENT_DATE - h.po_date) AS pending_age,
        c.c_code,
        c.c_name,
		d.dealer_code as dealer_code,
		d.city as dlr_location,
        v.v_code,
        v.v_name,
        v.email || ',' || u1.email_id ||',' || u2.email_id ||',' || 'info.eddal@escortskubota.com' as email
      --  'sahil@escortskubota.com' AS email

    FROM mhmmpo h
    LEFT JOIN mommvend v
        ON v.v_code = h.v_code
    LEFT JOIN mosmcust_master c
        ON c.c_code = h.c_code
    LEFT JOIN moedmember m
    ON m.member_no = c.c_code
	LEFT JOIN moeddealer d
    ON d.dealer_code = m.dealer_code,
	user_master u1 ,
	user_master u2 ,
	moitauth a

    WHERE h.po_id = $1
	and h.create_id = u1.user_id
	and a.auth_id1 = h.create_id
	and a.active ='Y'
	and a.doc_type = 'P'|| h.po_type
	and a.auth_id2 = u2.user_id
`;

  let { rows } = await db.query(query, [po_id]);

  console.log(" rows from getPendingPOById", rows);

  if (rows.length) {
    rows[0].po_date = new Date(rows[0].po_date).toDateString();
  }

  return rows.length ? rows[0] : null;
};

exports.saveEmailHistory = async (data) => {
  const { rows } = await db.query(
    `
        SELECT COALESCE(MAX(sent_count),0) + 1 AS next_count
        FROM integral.email_notification_center
        WHERE doc_no = $1
          AND doc_type = $2
        `,
    [data.po_no, "Pending PO"],
  );

  const nextCount = rows[0].next_count;

  await db.query(
    `
        INSERT INTO integral.email_notification_center
        (
            party_cd,
            member_no,
            doc_no,
            doc_dt,
            email_sent_to,
            sent_count,
            email_sent_by,
            doc_type,
            status
        )
        VALUES
        (
            $1,$2,$3,$4,$5,$6,$7,$8,$9
        )
        `,
    [
      data.v_code,
      data.dealer_code,
      data.po_no,
      data.po_dt,
      data.email,
      nextCount,
      data.user_id ?? 0,
      "Pending PO",
      "SUCCESS",
    ],
  );
};


// ------------------------------- authorized po ---------------------------------------------------


exports.getPOAuthorizationEmailRecords = async (po_ids) => {
  const query = `
 SELECT
        h.po_id,
        h.po_no,
        h.po_date,
        CASE
            WHEN h.po_type = 'O' THEN 'ORDER'
            WHEN h.po_type = 'A' THEN 'ADVICE'
            ELSE h.po_type
        END AS po_type,

        h.po_eff_dt,
        h.po_end_dt,

        c.c_code,
        c.c_name,

        d.dealer_code,
        d.city AS dlr_location,

        v.v_code,
        v.v_name,
        v.email || ',' || u1.email_id ||',' || u2.email_id || ',' || 'info.eddal@escortskubota.com' as email
       -- 'sahil@escortskubota.com' as email
    FROM mhmmpo h
    LEFT JOIN mommvend v
        ON v.v_code = h.v_code
    LEFT JOIN mosmcust_master c
        ON c.c_code = h.c_code
    LEFT JOIN moedmember m
        ON m.member_no = c.c_code
    LEFT JOIN moeddealer d
        ON d.dealer_code = m.dealer_code,
	user_master u1 ,
	user_master u2 ,
	moitauth a
	
  WHERE h.po_id = ANY($1::bigint[])
	and h.create_id = u1.user_id
	and a.auth_id1 = h.create_id
	and a.active ='Y'
	and a.doc_type = 'P'|| h.po_type
	and a.auth_id2 = u2.user_id
  ORDER BY h.v_code, h.po_no
  `;

  const { rows } = await db.query(query, [po_ids]);

  return rows;
};



// ----------------------------- pending po bulk---------------------------------------------------------
exports.getPendingPOsByVendor = async ({
  v_code,
  division,
  transYear,
  fromDate,
  toDate,
  aging,
  poType,
}) => {
  console.log("Fetching bulk pending POs for vendor:", v_code);

  const params = [
    division,
    transYear,
    v_code,
  ];

  let index = 4;

  const whereClause = [];

  // -----------------------------
  // Date Filters
  // -----------------------------

  if (fromDate) {
    whereClause.push(`h.po_date >= $${index++}`);
    params.push(fromDate);
  }

  if (toDate) {
    whereClause.push(`h.po_date <= $${index++}`);
    params.push(toDate);
  }

  // -----------------------------
  // PO Type
  // -----------------------------

  if (poType && poType !== "ALL") {
    whereClause.push(`h.po_type = $${index++}`);
    params.push(poType);
  }

  // -----------------------------
  // Aging
  // -----------------------------

  const ageExpr = `(CURRENT_DATE - h.po_date)`;

  switch (aging) {
    case "0_7":
      whereClause.push(`${ageExpr} BETWEEN 0 AND 7`);
      break;

    case "8_15":
      whereClause.push(`${ageExpr} BETWEEN 8 AND 15`);
      break;

    case "16_30":
      whereClause.push(`${ageExpr} BETWEEN 16 AND 30`);
      break;

    case "31_45":
      whereClause.push(`${ageExpr} BETWEEN 31 AND 45`);
      break;

    case "46_60":
      whereClause.push(`${ageExpr} BETWEEN 46 AND 60`);
      break;

    case "60_PLUS":
      whereClause.push(`${ageExpr} > 60`);
      break;

    default:
      break;
  }

  console.log(
    "whereClause pending po bulk:",
    whereClause
  );

  const query = `
    SELECT DISTINCT

        -- PO Details
        h.po_id,
        h.po_no,

        CASE
            WHEN h.po_type = 'O' THEN 'ORDER'
            WHEN h.po_type = 'A' THEN 'ADVICE'
            ELSE h.po_type
        END AS po_type,

        h.po_date,
        h.po_eff_dt,

        (CURRENT_DATE - h.po_date) AS pending_age,

        -- Customer
        c.c_code AS customer_code,

        -- Dealer
        d.dealer_code,
          CASE
        WHEN h.po_type = 'O'
            AND h.c_code IS NULL
        THEN 'ESCORTS DEALERS DEVELOPMENT ASSOCIATION LIMITED'
        ELSE c.c_name
    END AS dealer_name,
    	CASE
    WHEN h.po_type = 'O'
         AND h.c_code IS NULL
    THEN 'FARIDABAD'
    ELSE d.city
END AS dlr_location,

CASE
    WHEN h.po_type = 'O'
         AND h.c_code IS NULL
    THEN 'HARYANA'
    ELSE d.state
END AS dlr_state,
        -- Vendor
        v.v_code,
        v.v_name,

    --   'sahil@escortskubota.com' as email,
    --  'sahil@escortskubota.com, jatinder1710@gmail.com, kumarakshay.b10@gmail.com' as email,

     v.email || ',' || u1.email_id || ',' || u2.email_id || ',' || 'info.eddal@escortskubota.com' AS email,
   

        -- Amounts
        COALESCE(h.total_amount, 0) AS total_amount,

        (
            COALESCE(h.t_gst_cgst_amt, 0)
            + COALESCE(h.t_gst_sgst_amt, 0)
            + COALESCE(h.t_gst_igst_amt, 0)
        ) AS gst_value,

        (
            COALESCE(h.total_amount, 0)
            -
            (
                COALESCE(h.t_gst_cgst_amt, 0)
                + COALESCE(h.t_gst_sgst_amt, 0)
                + COALESCE(h.t_gst_igst_amt, 0)
            )
        ) AS basic_value

    FROM mhmmpo h

    LEFT JOIN mommvend v
        ON v.v_code = h.v_code

    LEFT JOIN mosmcust_master c
        ON c.c_code = h.c_code

    LEFT JOIN moedmember m
        ON m.member_no = c.c_code

    LEFT JOIN moeddealer d
        ON d.dealer_code = m.dealer_code
        
   LEFT JOIN user_master u1
      ON h.create_id = u1.user_id

   LEFT JOIN moitauth a
      ON a.auth_id1 = h.create_id
      AND a.active = 'Y'
      AND a.doc_type = 'P' || h.po_type

  LEFT JOIN user_master u2
     ON a.auth_id2 = u2.user_id

    WHERE
        h.po_id IS NOT NULL

        AND h.v_code = $3

        AND h.division_id = $1
        AND h.trans_year = $2

        AND h.po_type IN ('O', 'A')
        AND h.cancel_flag = 'N'
        AND h.flag = 'F'
        AND h.po_end_dt > CURRENT_DATE

        ${
          whereClause.length
            ? `AND ${whereClause.join(" AND ")}`
            : ""
        }

        -- Exclude completely received POs
        AND NOT EXISTS (
            SELECT 1
            FROM mdmmpoit d
            WHERE d.po_id = h.po_id
              AND d.po_id IN (
                    SELECT d1.po_id

                    FROM mdmmpoit d1

                    JOIN tdmmrct r
                      ON r.po_id = d1.po_id
                     AND r.it_code = d1.it_code

                    JOIN mhmmpo h1
                      ON h1.po_id = d1.po_id

                    WHERE
                        d1.po_qty_ord - r.qty_recd = 0
                        AND h1.po_end_dt > CURRENT_DATE

                    GROUP BY d1.po_id

                    HAVING COUNT(*) = (
                        SELECT COUNT(*)
                        FROM mdmmpoit d2
                        WHERE d2.po_id = d1.po_id
                          AND d2.active = 'Y'
                    )
              )
        )

    ORDER BY h.po_date DESC
  `;

  console.log(
    "Bulk PO Query Params:",
    params
  );

  const { rows } = await db.query(query, params);

  console.log(
    `Found ${rows.length} pending POs for vendor ${v_code}`
  );

  return rows;
};


// ### **************************** Loan  Statement **************************** ###
exports.saveLoanStatementHistory = async (data) => {
  const { rows } = await db.query(
    `
        SELECT COALESCE(MAX(sent_count),0) + 1 AS next_count
        FROM integral.email_notification_center
        WHERE doc_no = $1
          AND doc_type = $2
        `,
    [data.loan_no, "Loan Statement"],
  );

  const nextCount = rows[0].next_count;

  await db.query(
    `
        INSERT INTO integral.email_notification_center
        (
            party_cd,
            member_no,
            doc_no,
            doc_dt,
            email_sent_to,
            sent_count,
            email_sent_by,
            doc_type,
            status
        )
        VALUES
        (
            $1,$2,$3,$4,$5,$6,$7,$8,$9
        )
        `,
    [
      data.dealer_code,
      data.member_no,
      data.loan_no,
      data.loan_date,
      data.email,
      nextCount,
      data.user_id ?? 0,
      "Loan Statement",
      "SUCCESS",
    ],
  );
};


exports.getLoanStatementById = async (efa_id) => {
  const query = `
       select
    h.efa_id,
    m.dealer_code,
    m.member_no,
    m.dlr_name,
    h.efa_ctrl_id as loan_no,
    h.efa_amount as loan_amt,
    no_of_install,
    efa_application_date as loan_date,
    lt.loan_purpose_desc as loan_type,
    dl.email_id ||','||'info.eddal@escortskubota.com' AS email,
	  dl.alternate_email_id AS alternate_email,
	COALESCE(ENC.sent_count,0) sent_count,
	ENC.last_email_sent_on
from thlnefatran h
join moedmember m on h.member_id = m.member_id
join mhedloan lt on h.loan_id = lt.loan_id
join moeddealer dl on m.dealer_code = dl.dealer_code
and h.efa_id = $1
LEFT JOIN (
    SELECT
        doc_no,
        doc_type,
        MAX(email_sent_on) last_email_sent_on,
        MAX(sent_count) sent_count
    FROM email_notification_center
    GROUP BY doc_no, doc_type
) ENC
ON ENC.doc_no = h.efa_ctrl_id
AND ENC.doc_type = 'Loan Statement'
    `;

  const { rows } = await db.query(query, [efa_id]);

  return rows.length ? rows[0] : null;
};

exports.getNextReportId = async () => {
  const { rows } = await db.query(`
        SELECT nextval('s_report_ref_id') AS rep_id
    `);

  return rows[0].rep_id;
};

exports.prepareLoanLedger = async (efa_id, user_id, rep_id) => {
  await db.query(
    `
        CALL integral.proc_loan_ledger_all_mem(
            $1,
            $2,
            $3
        )
        `,
    [efa_id, user_id, rep_id],
  );
};

exports.getLoanLedgerData = async (efa_id) => {
  const query = `
			select level,efa_id,dealer_code, member_no, dealership_name,station,scheme,efa_number,efa_application_date,efa_amount
			,emi_date, coalesce(initial_emi_amount,0) initial_emi_amount, coalesce(actual_emi_amount,0) actual_emi_amount, bal_amt,
			receipt_number,
			receipt_date,coalesce(amount_recd,0) amount_recd,emi_sno
			from
			(
			select level,efa_id,dealer_code,member_no,dealership_name,station,scheme,efa_number,efa_application_date,efa_amount
			,emi_date,coalesce(initial_emi_amount,0) initial_emi_amount, coalesce(actual_emi_amount,0) actual_emi_amount, 
			 bal_amt,
			receipt_number,
			receipt_date,coalesce(amount_recd,0) amount_recd,emi_sno
			from temp_loan_ledger l where efa_id = coalesce($1,efa_id) and  l.level is null 
            union
			select level,efa_id,dealer_code,member_no,dealership_name,station,scheme,efa_number,efa_application_date,efa_amount
			,emi_date,coalesce(initial_emi_amount,0) initial_emi_amount, coalesce(actual_emi_amount,0) actual_emi_amount,
			 bal_amt,
			receipt_number,
			receipt_date,coalesce(amount_recd,0) amount_recd,emi_sno
			from temp_loan_ledger l where efa_id = coalesce($1,efa_id) and l.level = 'Loan'
	        ) as ledger_date
			order by  efa_application_date, efa_number, member_no, emi_sno, receipt_date
    `;

  const { rows } = await db.query(query, [efa_id]);

  return rows;
};

// ### **************************** Loan Overdue **************************** ###
exports.getLoanOverdueByDealer = async (dealer_code) => {
  const query = `
        SELECT
            m.dealer_code,
            m.member_no,
            m.dlr_name AS dealer_name,

            dl.city,
            dl.email_id ||','|| 'info.eddal@escortskubota.com' AS email,
	          dl.alternate_email_id AS alternate_email,

            COALESCE(enc.sent_count,0) AS sent_count,
            enc.last_email_sent_on

        FROM moedmember m

        JOIN moeddealer dl
            ON dl.dealer_code = m.dealer_code

        LEFT JOIN
        (
            SELECT
                doc_no,
                MAX(email_sent_on) AS last_email_sent_on,
                MAX(sent_count) AS sent_count
            FROM email_notification_center
            WHERE doc_type = 'Loan Overdue'
            GROUP BY doc_no
        ) enc
            ON enc.doc_no = m.dealer_code

        WHERE
            m.dealer_code = $1
    `;

  const { rows } = await db.query(query, [dealer_code]);

  return rows.length ? rows[0] : null;
};

exports.saveLoanOverdueHistory = async (data) => {
  const { rows } = await db.query(
    `
        SELECT COALESCE(MAX(sent_count),0) + 1 AS next_count
        FROM integral.email_notification_center
        WHERE doc_no = $1
          AND doc_type = $2
        `,
    [data.dealer_code, "Loan Overdue"],
  );

  const nextCount = rows[0].next_count;

  await db.query(
    `
        INSERT INTO integral.email_notification_center
        (
            party_cd,
            member_no,
            doc_no,
            doc_dt,
            email_sent_to,
            sent_count,
            email_sent_by,
            doc_type,
            status,
            remarks
        )
        VALUES
        (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10
        )
        `,
    [
      data.dealer_code,
      data.member_no,
      data.dealer_code, // doc_no is now dealer_code
      new Date(),
      data.email,
      nextCount,
      data.user_id ?? 0,
      "Loan Overdue",
      "SUCCESS",
      data.remarks ?? null,
    ],
  );
};

exports.getDealerOverdueLoans = async (dealer_code) => {
  const query = `
        SELECT
            h.efa_id,
            h.efa_ctrl_id AS loan_no,
            h.efa_application_date AS loan_date,

            lt.loan_purpose_desc AS scheme,

            t.emi_sno,
            t.emi_date,

            (
                COALESCE(t.principal_amt,0)
              + COALESCE(t.interest_amt,0)
              + COALESCE(t.service_chg_ded,0)
              + COALESCE(t.igst_amt,0)
              + COALESCE(t.cgst_amt,0)
              + COALESCE(t.sgst_amt,0)
            ) AS emi_amt,

            COALESCE(r.amount_received,0) AS amount_received,

            (
                (
                    COALESCE(t.principal_amt,0)
                  + COALESCE(t.interest_amt,0)
                  + COALESCE(t.service_chg_ded,0)
                  + COALESCE(t.igst_amt,0)
                  + COALESCE(t.cgst_amt,0)
                  + COALESCE(t.sgst_amt,0)
                )
                - COALESCE(r.amount_received,0)
            ) AS bal_amt,

            DATE_PART(
                'day',
                AGE(CURRENT_DATE, t.emi_date)
            )::INT AS overdue_days

        FROM tdlnefatran t

        JOIN thlnefatran h
            ON h.efa_id = t.efa_id

        JOIN moedmember m
            ON m.member_id = h.member_id

        JOIN mhedloan lt
            ON lt.loan_id = h.loan_id

        LEFT JOIN
        (
            SELECT
                efa_id,
                emi_sno,
                SUM(amount_recd) AS amount_received
            FROM tolnemi_receipts
            GROUP BY
                efa_id,
                emi_sno
        ) r
            ON r.efa_id = t.efa_id
           AND r.emi_sno = t.emi_sno

        WHERE
            m.dealer_code = $1
        AND
            t.emi_date < CURRENT_DATE
        AND
        (
            (
                COALESCE(t.principal_amt,0)
              + COALESCE(t.interest_amt,0)
              + COALESCE(t.service_chg_ded,0)
              + COALESCE(t.igst_amt,0)
              + COALESCE(t.cgst_amt,0)
              + COALESCE(t.sgst_amt,0)
            )
            - COALESCE(r.amount_received,0)
        ) > 0

        ORDER BY
            h.efa_application_date,
            h.efa_ctrl_id,
            t.emi_sno
    `;

  const { rows } = await db.query(query, [dealer_code]);

  return rows.map((row) => ({
    loanNo: row.loan_no,
    loanDate: row.loan_date
      ? new Date(row.loan_date).toLocaleDateString("en-GB")
      : "",
    scheme: row.scheme,
    emiNo: row.emi_sno,
    emiDate: row.emi_date
      ? new Date(row.emi_date).toLocaleDateString("en-GB")
      : "",
    emiAmt: Number(row.emi_amt),
    amountReceived: Number(row.amount_received),
    balAmt: Number(row.bal_amt),
    overdueDays: Number(row.overdue_days),
  }));
};



// ### **************************** Dealer Balance Statement **************************** ###



exports.getDealerBalanceStatementByDealerCode = async (dealer_code) => {
  const query = `
        SELECT
            m.member_id,
            m.member_no,
            m.dealer_code,
            m.dlr_name,
            d.dlr_type,
            d.city,
            d.email_id || ',' ||'info.eddal@escortskubota.com' AS email,
			      d.alternate_email_id as alternate_email,
            COALESCE(enc.sent_count,0) AS sent_count,
            enc.last_email_sent_on
        FROM moedmember m

        JOIN moeddealer d
            ON d.dealer_code = m.dealer_code

        LEFT JOIN (
            SELECT
                doc_no,
                doc_type,
                MAX(email_sent_on) AS last_email_sent_on,
                MAX(sent_count) AS sent_count
            FROM email_notification_center
            GROUP BY doc_no, doc_type
        ) enc
            ON enc.doc_no = m.dealer_code
           AND enc.doc_type = 'Dealer Balance Statement'

        WHERE
            m.member_active = 'Y'
            AND m.member_board_cease_date IS NULL
            AND m.dealer_code = $1
    `;

  const { rows } = await db.query(query, [dealer_code]);

  return rows.length ? rows[0] : null;
};

exports.saveDealerBalanceStatementHistory = async (data) => {
  const { rows } = await db.query(
    `
        SELECT COALESCE(MAX(sent_count),0) + 1 AS next_count
        FROM integral.email_notification_center
        WHERE doc_no = $1
          AND doc_type = $2
        `,
    [data.dealer_code, "Dealer Balance Statement"],
  );

  const nextCount = rows[0].next_count;

  await db.query(
    `
        INSERT INTO integral.email_notification_center
        (
            party_cd,
            member_no,
            doc_no,
            doc_dt,
            email_sent_to,
            sent_count,
            email_sent_by,
            doc_type,
            status
        )
        VALUES
        (
            $1,$2,$3,$4,$5,$6,$7,$8,$9
        )
        `,
    [
      data.dealer_code,
      data.member_no,
      data.dealer_code,
      new Date(), // or CURRENT_DATE
      data.email,
      nextCount,
      data.user_id ?? 0,
      "Dealer Balance Statement",
      "SUCCESS",
    ],
  );
};

exports.prepareDealerBalanceLedger = async (
  member_no,
  fromDate,
  toDate,
  division,
  transYear,
  includUnposted,
  user_id,
) => {
  console.log(
    `Preparing Dealer Balance Ledger for member_no: 
    ${member_no}, fromDate: ${fromDate}, toDate: ${toDate}, division: ${division}, transYear: ${transYear}, user_id: ${user_id}`,
  );
  await db.query(`delete from temp_gl_records_4_member_printing where user_id = $1`, [user_id,
  ]);
  await db.query(
    `
        CALL DUMP_GL_ACC_IN_DATE_RANGE_MEMBER(
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7
        )
        `,
    [
      `C${member_no}`,
      fromDate,
      toDate,
      division,
      transYear,
      "Y", // pVouch
      user_id,
    ],
  );
};

exports.getDealerBalanceLedgerData = async (user_id) => {
  const query = `
       SELECT
    acc_no,
    acc_desc,
    ref_no,
    TO_CHAR(ref_date::timestamp, 'DD-MM-YYYY') AS ref_date,
    voucher_no,
    TO_CHAR(voucher_dt::timestamp, 'DD-MM-YYYY') AS voucher_dt,
    sr_no,
    srl_no,
    remarks,
    nproj_no,
    cvendor_name,
    bill_no,
    TO_CHAR(bill_dt::timestamp, 'DD-MM-YYYY') AS bill_dt,
    chq_no,
    TO_CHAR(chq_dt::timestamp, 'DD-MM-YYYY') AS chq_dt,
    cchq_favour,
    npost,
    ndb_amt,
    ABS(ncr_amt) AS ncr_amt,
    cdbcr,

    -- Opening balance: apply sign based on cdbcr of the first row
    ABS(FIRST_VALUE(result_bal) OVER (PARTITION BY acc_no ORDER BY sr_no))
        * CASE WHEN 
			FIRST_VALUE(cdbcr) OVER (PARTITION BY acc_no ORDER BY sr_no) ='C' THEN -1
            ELSE 1
          END AS opening_balance,

    -- Running balance: signed opening balance + cumulative (debit - credit) movements
    ABS(
        ABS(FIRST_VALUE(result_bal) OVER (PARTITION BY acc_no ORDER BY sr_no))
        * CASE
            WHEN FIRST_VALUE(cdbcr) OVER (PARTITION BY acc_no ORDER BY sr_no) = 'C' THEN -1
            ELSE 1
          END
        + SUM(ndb_amt - ncr_amt) OVER (
            PARTITION BY acc_no
            ORDER BY voucher_dt, srl_no, sr_no
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
          )
    ) AS running_balance,

    -- Balance type: C if net balance is negative (credit), D if positive (debit)
    CASE
        WHEN (
            ABS(FIRST_VALUE(result_bal) OVER (PARTITION BY acc_no ORDER BY sr_no))
            * CASE
                WHEN FIRST_VALUE(cdbcr) OVER (PARTITION BY acc_no ORDER BY sr_no) ='C' THEN -1
                ELSE 1
              END
            + SUM(ndb_amt - ncr_amt) OVER (
                PARTITION BY acc_no
                ORDER BY voucher_dt, srl_no, sr_no
                ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
              )
        )::numeric < 0 THEN 'C'
        ELSE 'D'
    END AS balance_type,

    user_id,
    party_reference,
    T.cost_centre AS CC,
    T.PURPOSE

    FROM temp_gl_records_4_member_printing T
    WHERE user_id = $1
    ORDER BY acc_no, srl_no, sr_no;
    `;

  const { rows } = await db.query(query, [user_id]);

  return rows;
};



// ### **************************** Vendor Balance Statement **************************** ###



exports.getVendorBalanceStatementByVendorCode = async (vendor_code) => {
  const query = `
        SELECT
        v.v_code,
			v.v_name,
			v.v_city_name,
			v.gst_no,
			v.pan_no,
      v.email || ',' ||'info.eddal@escortskubota.com' AS email,
   --  v.email || ',' ||'sahil@escortskubota.com'|| ',' ||'kumarakshay.b10@gmail.com' AS email,
			v.telephone1,
          COALESCE(enc.sent_count, 0) AS sent_count,
          enc.last_email_sent_on

      FROM mommvend v

        LEFT JOIN (
            SELECT
                doc_no,
                doc_type,
                MAX(email_sent_on) AS last_email_sent_on,
                MAX(sent_count) AS sent_count
            FROM email_notification_center
            GROUP BY doc_no, doc_type
        ) enc
          ON enc.doc_no = v.v_code
           AND enc.doc_type = 'Vendor Balance Statement'

        WHERE v.v_code = $1
    `;

  const { rows } = await db.query(query, [vendor_code]);


  return rows.length ? rows[0] : null;
};

exports.saveVendorBalanceStatementHistory = async (data) => {
  const { rows } = await db.query(
    `
        SELECT COALESCE(MAX(sent_count),0) + 1 AS next_count
        FROM integral.email_notification_center
        WHERE doc_no = $1
          AND doc_type = $2
        `,
    [data.v_code, "Vendor Balance Statement"],
  );

  const nextCount = rows[0].next_count;

  await db.query(
    `
        INSERT INTO integral.email_notification_center
        (
            party_cd,
            doc_no,
            doc_dt,
            email_sent_to,
            sent_count,
            email_sent_by,
            doc_type,
            status
        )
        VALUES
        (
            $1,$2,$3,$4,$5,$6,$7,$8
        )
        `,
    [
      data.v_code,
      data.v_code,
      new Date(), // or CURRENT_DATE
      data.email,
      nextCount,
      data.user_id ?? 0,
      "Vendor Balance Statement",
      "SUCCESS",
    ],
  );
};

exports.prepareVendorBalanceLedger = async (
  v_code,
  fromDate,
  toDate,
  division,
  transYear,
  includUnposted,
  user_id,
) => {
  console.log(
    `Preparing Vendor Balance Ledger for member_no: 
    ${v_code}, fromDate: ${fromDate}, toDate: ${toDate}, division: ${division}, transYear: ${transYear}, user_id: ${user_id}`,
  );
  await db.query(`delete from temp_gl_records_4_member_printing where user_id = $1`, [user_id,
  ]);
  await db.query(
    `
         CALL DUMP_GL_ACC_WITHIN_DATE_RANGE(
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7
        )
        `,
    [
      `S${v_code}`,
      fromDate,
      toDate,
      division,
      transYear,
      "Y", // pVouch
      user_id,
    ],
  );
};

exports.getVendorBalanceLedgerData = async (user_id) => {
  const query = `
          SELECT
      acc_no,
      acc_desc,
      ref_no,
      TO_CHAR(ref_date::timestamp, 'DD-MM-YYYY') AS ref_date,
      voucher_no,
       TO_CHAR(voucher_dt::timestamp, 'DD-MM-YYYY') AS voucher_dt,
      sr_no,
      srl_no,
       remarks,
      nproj_no,
      cvendor_name,
       bill_no,
       TO_CHAR(bill_dt::timestamp, 'DD-MM-YYYY') AS bill_dt,
       chq_no,
       TO_CHAR(chq_dt::timestamp, 'DD-MM-YYYY') AS chq_dt,
      cchq_favour,
       npost,
      ndb_amt,
      ABS(ncr_amt) AS ncr_amt,
      cdbcr,

    -- Opening balance: apply sign based on cdbcr of the first row
    ABS(FIRST_VALUE(result_bal) OVER (PARTITION BY acc_no ORDER BY sr_no))
        * CASE WHEN 
			FIRST_VALUE(cdbcr) OVER (PARTITION BY acc_no ORDER BY sr_no) ='C' THEN -1
            ELSE 1
          END AS opening_balance,

    -- Running balance: signed opening balance + cumulative (debit - credit) movements
    ABS(
        ABS(FIRST_VALUE(result_bal) OVER (PARTITION BY acc_no ORDER BY sr_no))
        * CASE
            WHEN FIRST_VALUE(cdbcr) OVER (PARTITION BY acc_no ORDER BY sr_no) = 'C' THEN -1
            ELSE 1
          END
        + SUM(ndb_amt - ncr_amt) OVER (
            PARTITION BY acc_no
            ORDER BY sr_no, voucher_dt, srl_no
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
          )
    ) AS running_balance,

    -- Balance type: C if net balance is negative (credit), D if positive (debit)
    CASE
        WHEN (
            ABS(FIRST_VALUE(result_bal) OVER (PARTITION BY acc_no ORDER BY sr_no))
            * CASE
                WHEN FIRST_VALUE(cdbcr) OVER (PARTITION BY acc_no ORDER BY sr_no) ='C' THEN -1
                ELSE 1
              END
            + SUM(ndb_amt - ncr_amt) OVER (
                PARTITION BY acc_no
                ORDER BY sr_no, voucher_dt, srl_no
                ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
              )
        )::numeric < 0 THEN 'C'
        ELSE 'D'
    END AS balance_type,
    user_id,
    party_reference,
    T.cost_centre AS CC,
    T.PURPOSE
    FROM temp_gl_records_4_printing T
    WHERE user_id = $1
    ORDER BY acc_no, srl_no, sr_no;
    `;

  const { rows } = await db.query(query, [user_id]);

  return rows;
};




//------------------------ vendor pending invoice -------------------------------

exports.getVendorPendingInvoiceEmailRecord = async (v_code) => {
  const result = await db.query(
    `
      SELECT
        v_code,
        v_name,
        email || ',' || 'info.eddal@escortskubota.com' AS email
       -- 'sahil@escortskubota.com' AS email
      FROM mommvend
      WHERE v_code = $1
      LIMIT 1
    `,
    [v_code]
  );

  return result.rows[0] || null;
};


exports.saveVendorPendingInvoiceEmailHistory = async (data) => {

  // Get next email count for this vendor + notification type
  const { rows } = await db.query(
    `
      SELECT COALESCE(MAX(sent_count), 0) + 1 AS next_count
      FROM integral.email_notification_center
      WHERE doc_no = $1
        AND doc_type = $2
    `,
    [
      data.v_code,
      "Vendor Pending Invoice",
    ]
  );

  const nextCount = rows[0].next_count;

  // Save email history
  await db.query(
    `
      INSERT INTO integral.email_notification_center
      (
        party_cd,
        doc_no,
        doc_dt,
        email_sent_to,
        sent_count,
        email_sent_by,
        doc_type,
        status
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8
      )
    `,
    [
      data.v_code,
      data.v_code,
      new Date(),
      data.email,
      nextCount,
      data.user_id ?? 0,
      "Vendor Pending Invoice",
      "SUCCESS",
    ]
  );
};
