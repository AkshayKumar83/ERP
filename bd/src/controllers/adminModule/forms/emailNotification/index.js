const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");

const {
  generateSingleInsertQuery,
  cleanObject,
} = require("../../../../utility/query");

const emailQueue = require("../../../../utility/emailQueue");
const { dateFormater } = require("../../../../utility/constant");



// ## fetch all records as per  # NOTIFICATION TYPE
exports.handleEmailFormData = catchAsync(async (req, res) => {
  const { notificationType } = req.body;

  console.log('notificationType', notificationType)
  switch (notificationType) {
    case "PENDING_PO":
      return await fetchPendingPO(req, res);

    // case "EMI_DUE":
    //     return await fetchEMIDue(req, res);

    // case "EMI_REMINDER":
    //     return await fetchEMIReminder(req, res);

    // case "SERVICE_CHARGE":
    //     return await fetchServiceCharge(req, res);

    case "LOAN_OVERDUE":
      return await fetchLoanOverdue(req, res);

    case "LOAN_STATEMENT":
      return await fetchLoanStatement(req, res);

    case "DEALER_BALANCE_STATEMENT":
      return await fetchDealerBalanceStatement(req, res);

    case "VENDOR_BALANCE_STATEMENT":
      return await fetchVendorBalanceStatement(req, res);

    case "PENDING_PO_VENDOR_BULK":
      return await fetchPendingPOVendorBulk(req, res);
    
   case "VENDOR_PENDING_INVOICE":
      return await fetchVendorPendingInvoice(req, res);
    
    default:
      return res.status(400).json({
        success: false,
        message: "Invalid Notification Type",
      });
  }
});


// ---------------------- authorized po email ---------------------- 
const getAuthorizedPOsForEmail = async (poIds) => {
    const result = await db.query(
        `
       select * from
(
	  SELECT
            ph.po_id,
            ph.po_no,
            ph.po_type,
            ph.v_code,
            v.v_name,
             v.email||','||'sudhir.singh3@escortskubota.com'||','||'info.eddal@escortskubota.com' as email
           -- v.email
        FROM mhmmpo ph
        INNER JOIN mommvend v
            ON v.v_code = ph.v_code
        WHERE ph.po_id = ANY($1::bigint[])
        and ph.po_type != 'A'
        union
         SELECT
            ph.po_id,
            ph.po_no,
            ph.po_type,
            ph.v_code,
            v.v_name,
            v.email || ',rekha@escortskubota.com,sandeep.rai2@escortskubota.com,info.eddal@escortskubota.com' as email
           -- v.email
        FROM mhmmpo ph
        INNER JOIN mommvend v
            ON v.v_code = ph.v_code
        WHERE ph.po_id = ANY($1::bigint[])
        and ph.po_type = 'A'
		)
        ORDER BY v_code, po_no
        `,
        [poIds]
    );

    console.log('getAuthorizedPOsForEmail rows:: ', result.rows)

    return result.rows;
};

// const getAuthorizedPOsForEmail = async (poIds) => {
//   const result = await db.query(
//     `
//     SELECT
//         ph.po_id,
//         ph.po_no,
//         ph.po_type,
//         ph.v_code,
//         v.v_name,

//         CONCAT_WS(
//             ',',
//             v.email,
//             u1.email_id,
//             u2.email_id
//            -- u3.email_id
//         ) AS email

//     FROM mhmmpo ph

//     INNER JOIN mommvend v
//         ON v.v_code = ph.v_code

//     LEFT JOIN moitauth a
//         ON a.doc_type = 'P' || ph.po_type
//         AND a.active = 'Y'

//     LEFT JOIN user_master u1
//         ON u1.user_id = a.auth_id1

//     LEFT JOIN user_master u2
//         ON u2.user_id = a.auth_id2

//   --  LEFT JOIN user_master u3
//    --     ON u3.user_id = a.auth_id3

//     WHERE ph.po_id = ANY($1::bigint[])

//     ORDER BY ph.v_code, ph.po_no
//     `,
//     [poIds]
//   );

//   console.log(
//     "getAuthorizedPOsForEmail rows:: ",
//     result.rows
//   );

//   return result.rows;
// };



const groupPOsByVendor = (poRecords) => {

    return poRecords.reduce((groups, po) => {

        if (!groups[po.v_code]) {
            groups[po.v_code] = {
                v_code: po.v_code,
                v_name: po.v_name,
                email: po.email,
                po_ids: [],
            };
        }

        groups[po.v_code].po_ids.push(po.po_id);

        console.log('groups from groupPOsByVendor function:: ', groups)

        return groups;

    }, {});
};



// const queuePOAuthorizationNotifications = async (poIds) => {

//     if (!poIds?.length) {
//         return [];
//     }

//     const poRecords = await getAuthorizedPOsForEmail(poIds);

//     if (!poRecords.length) {
//         return [];
//     }

//     const vendorGroups =
//         groupPOsByVendor(poRecords);

//     const jobs = [];

//     for (const vendor of Object.values(vendorGroups)) {

//         if (!vendor.email) {
//             console.warn(
//                 `No email found for vendor ${vendor.v_code}`
//             );

//             continue;
//         }

//         const jobId = await emailQueue.send(
//             "email-queue",
//             {
//                 notificationType: "PO_AUTHORIZATION",

//                 v_code: vendor.v_code,

//                 po_ids: vendor.po_ids,
//             },
//             {
//                 retryLimit: 3,
//                 retryDelay: 10,
//                 retryBackoff: true,
//             }
//         );

//         jobs.push({
//             jobId,
//             v_code: vendor.v_code,
//             po_count: vendor.po_ids.length,
//         });
//     }

//     return jobs;
// };


//  ----------------------------------------- pending po bulk mail -------------------------------


      // Pending PO Authorization function 
const queuePOAuthorizationNotifications = async (poIds) => {

    console.log("🔥 queuePOAuthorizationNotifications CALLED");
    console.log("PO IDs:", poIds);
    console.log("Time:", new Date().toISOString());

    if (!poIds?.length) {
        return [];
    }

    const poRecords = await getAuthorizedPOsForEmail(poIds);

    console.log("📦 PO RECORDS:", poRecords);

    if (!poRecords.length) {
        return [];
    }

    const vendorGroups = groupPOsByVendor(poRecords);

    console.log("👥 VENDOR GROUPS:", vendorGroups);

    const jobs = [];

    for (const vendor of Object.values(vendorGroups)) {

        console.log("🚨 ABOUT TO CREATE JOB");
        console.log({
            v_code: vendor.v_code,
            po_ids: vendor.po_ids,
        });

        if (!vendor.email) {
            console.warn(
                `No email found for vendor ${vendor.v_code}`
            );
            continue;
        }

        const jobId = await emailQueue.send(
            "email-queue",
            {
                notificationType: "PO_AUTHORIZATION",
                v_code: vendor.v_code,
                po_ids: vendor.po_ids,
            },
            {
                retryLimit: 3,
                retryDelay: 10,
                retryBackoff: true,
            }
        );

        console.log("✅ JOB CREATED:", jobId);

        jobs.push({
            jobId,
            v_code: vendor.v_code,
            po_count: vendor.po_ids.length,
        });
    }

    return jobs;
};



const fetchPendingPOVendorBulk = async (req, res) => {
  try {
    const {
      fromDate,
      toDate,
      aging,
      poType,
    } = req.body;

    const params = [
      req.query.division,
      req.query.trans_year,
    ];

    let index = 3;

    const whereClause = [];

    // ------------------------------------
    // Date Filters
    // ------------------------------------
    if (fromDate) {
      whereClause.push(`ph.po_date >= $${index++}`);
      params.push(fromDate);
    }

    if (toDate) {
      whereClause.push(`ph.po_date <= $${index++}`);
      params.push(toDate);
    }

    // ------------------------------------
    // PO Type
    // ------------------------------------
    if (poType && poType !== "ALL") {
      whereClause.push(`ph.po_type = $${index++}`);
      params.push(poType);
    }

    // ------------------------------------
    // Aging
    // ------------------------------------
    const ageExpr = `(CURRENT_DATE - ph.po_date)`;

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

    // ------------------------------------
    // Query
    // ------------------------------------
    const query = `
      SELECT
          ph.v_code,
          v.v_name,
          v.email,

          COUNT(DISTINCT ph.po_id) AS pending_count,

          COALESCE(MAX(enc.sent_count), 0) AS sent_count,
          MAX(enc.last_email_sent_on) AS last_email_sent_on

      FROM mhmmpo ph

      JOIN mdmmpoit pd
          ON pd.po_id = ph.po_id

      JOIN mommvend v
          ON v.v_code = ph.v_code

      JOIN mosmcust c
          ON c.c_code = ph.c_code

      LEFT JOIN (
          SELECT
              doc_no,
              doc_type,
              MAX(email_sent_on) AS last_email_sent_on,
              MAX(sent_count) AS sent_count
          FROM email_notification_center
          GROUP BY doc_no, doc_type
      ) enc
          ON enc.doc_no = ph.v_code
         AND enc.doc_type = 'Pending PO Vendor Bulk'

      WHERE
          ph.division_id = $1
          AND ph.trans_year = $2
          AND ph.po_type IN ('O', 'A')
          AND ph.cancel_flag = 'N'
          AND ph.flag = 'F'
          AND ph.po_end_dt > CURRENT_DATE

          ${whereClause.length
            ? `AND ${whereClause.join(" AND ")}`
            : ""
          }

          AND NOT EXISTS (
              SELECT 1
              FROM mdmmpoit d
              WHERE d.po_id = ph.po_id
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

      GROUP BY
          ph.v_code,
          v.v_name,
          v.email

      ORDER BY
          v.v_name;
    `;

    console.log("Bulk Pending PO Query:");
    console.log(query);

    console.log("Bulk Pending PO Params:");
    console.log(params);

    const result = await db.query(query, params);

    return res.status(200).json({
      success: true,

      data: result.rows.map((item) => ({
        ...item,

        pending_count: Number(item.pending_count),

        last_email_sent_on: formatDateTime(
          item.last_email_sent_on
        ),
      })),
    });

  } catch (err) {
    console.error("fetchPendingPOVendorBulk error:", err);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch bulk pending PO vendors.",
    });
  }
};



const fetchPendingPO = async (req, res) => {
  try {
    const { fromDate, toDate, aging, poType } = req.body;

    const params = [req.query.division, req.query.trans_year];

    let index = 3;
    const whereClause = [];

    // Date Filters
    if (fromDate) {
      whereClause.push(`ph.po_date >= $${index++}`);
      params.push(fromDate);
    }

    if (toDate) {
      whereClause.push(`ph.po_date <= $${index++}`);
      params.push(toDate);
    }

    // PO Type
    if (poType && poType !== "ALL") {
      whereClause.push(`ph.po_type = $${index++}`);
      params.push(poType); // O or A
    }

    // Aging
    const ageExpr = `(CURRENT_DATE - ph.po_date)`;

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

    const query = `
            SELECT DISTINCT
                ph.po_id,
                ph.po_no,

                CASE
                    WHEN ph.po_type = 'O' THEN 'ORDER'
                    WHEN ph.po_type = 'A' THEN 'ADVICE'
                    ELSE ph.po_type
                END AS po_type,

                ph.v_code,
                v.v_name,

                ph.c_code,

                CASE
                    WHEN ph.po_type = 'O' THEN 'EDDAL'
                    ELSE c.c_name
                END AS dealer_name,

                CASE
                    WHEN ph.po_type = 'O' THEN 'EDDAL'
                    ELSE c.c_code
                END AS dealer_code,

                ph.po_date AS po_dt,
                ph.po_eff_dt,
                ph.po_end_dt,

                (CURRENT_DATE - ph.po_date) AS aging,

                'PENDING' AS po_status,

                v.email,

                COALESCE(enc.sent_count, 0) AS sent_count,
                enc.last_email_sent_on

            FROM mhmmpo ph

            JOIN mdmmpoit pd
                ON pd.po_id = ph.po_id

            JOIN mommvend v
                ON v.v_code = ph.v_code

            JOIN mosmcust c
                ON c.c_code = ph.c_code

            LEFT JOIN (
                SELECT
                    doc_no,
                    doc_type,
                    MAX(email_sent_on) AS last_email_sent_on,
                    MAX(sent_count) AS sent_count
                FROM email_notification_center
                GROUP BY doc_no, doc_type
            ) enc
                ON enc.doc_no = ph.po_no
               AND enc.doc_type = 'Pending PO'

            WHERE
                ph.division_id = $1
                AND ph.trans_year = $2
                AND ph.po_type IN ('O', 'A')
                AND ph.cancel_flag = 'N'
                AND ph.flag = 'F'
                AND ph.po_end_dt > CURRENT_DATE

                ${whereClause.length ? `AND ${whereClause.join(" AND ")}` : ""}

                AND NOT EXISTS (
                    SELECT 1
                    FROM mdmmpoit d
                    WHERE d.po_id = ph.po_id
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

            ORDER BY ph.po_date DESC
        `;

    console.log(query);
    console.log(params);

    const result = await db.query(query, params);

    return res.status(200).json({
      success: true,
      data: result.rows.map((item) => ({
        ...item,
        last_email_sent_on: formatDateTime(item.last_email_sent_on),
      })),
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch pending PO.",
    });
  }
};



const fetchLoanStatement = async (req, res) => {
  try {
    const { fromDate, toDate } = req.body;

    const params = [];
    let index = 1;
    const whereClause = [];

    // Loan Date Filter
    if (fromDate) {
      whereClause.push(`h.efa_application_date >= $${index++}`);
      params.push(fromDate);
    }

    if (toDate) {
      whereClause.push(`h.efa_application_date <= $${index++}`);
      params.push(toDate);
    }

    // const query = `
    //         SELECT
    //             h.efa_id,
    //             m.dealer_code,
    //             m.member_no,
    //             m.dlr_name AS dealer_name,
    //             h.efa_ctrl_id AS loan_no,
    //             h.efa_amount AS loan_amt,
    //             h.no_of_install,
    //             h.efa_application_date AS loan_date,
    //             lt.loan_purpose_desc AS loan_type,

    //             dl.email_id AS email,
    //             dl.alternate_email_id AS alternate_email,

    //             COALESCE(enc.sent_count, 0) AS sent_count,
    //             enc.last_email_sent_on

    //         FROM thlnefatran h

    //         JOIN moedmember m
    //             ON h.member_id = m.member_id

    //         JOIN mhedloan lt
    //             ON h.loan_id = lt.loan_id

    //         JOIN moeddealer dl
    //             ON m.dealer_code = dl.dealer_code

    //         LEFT JOIN
    //         (
    //             SELECT
    //                 doc_no,
    //                 doc_type,
    //                 MAX(email_sent_on) AS last_email_sent_on,
    //                 MAX(sent_count) AS sent_count
    //             FROM email_notification_center
    //             GROUP BY doc_no, doc_type
    //         ) enc
    //             ON enc.doc_no = h.efa_ctrl_id
    //            AND enc.doc_type = 'Loan Statement'

    //         ${whereClause.length ? `WHERE ${whereClause.join(" AND ")}` : ""}

    //         ORDER BY h.efa_application_date DESC, h.efa_id DESC
    //     `;

  // change by JSB/ Akshay for not showing close loan for 14/10/26 5:58pm
     const query = `
     

SELECT
                efa_id,
				status,
				pre_close_efa,
                dealer_code,
                member_no,
                dealer_name,
                loan_no,
				loan_type,
                loan_amt,
                no_of_install,
                efa_application_date as loan_date,
                email,
                alternate_email,
                sent_count,
                enc.last_email_sent_on
       from (
	        SELECT
                efa_id,
				status,
				pre_close_efa,
                m.dealer_code,
                member_no,
                m.dlr_name AS dealer_name,
                l.efa_ctrl_id AS loan_no,
                efa_amount AS loan_amt,
                no_of_install,
				email_id as email,
				alternate_email_id as alternate_email,
                efa_application_date ,
                lt.loan_purpose_desc AS loan_type
                from thlnefatran l, moedmember m, moeddealer dl, mhedloan lt
                where l.status = 'O'
				and l.pre_close_efa ='N' 
				and m.dealer_code = dl.dealer_code
                and l.member_id = m.member_id
				and lt.loan_id = l.loan_id
                ) h 				
            LEFT JOIN
            (
                SELECT
                    doc_no,
                    doc_type,
                    MAX(email_sent_on) AS last_email_sent_on,
                    MAX(sent_count) AS sent_count
                FROM email_notification_center
                GROUP BY doc_no, doc_type
            ) enc
                ON enc.doc_no = h.loan_no
               AND enc.doc_type = 'Loan Statement'


            ${whereClause.length ? `WHERE ${whereClause.join(" AND ")}` : ""}

            ORDER BY h.efa_application_date DESC, h.efa_id DESC
        `;
    console.log(query);
    console.log(params);

    const result = await db.query(query, params);

    return res.status(200).json({
      success: true,
      data: result.rows.map((item) => ({
        ...item,
        last_email_sent_on: formatDateTime(item.last_email_sent_on),
        loan_date: dateFormater(item.loan_date),
      })),
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch Loan Statement records.",
    });
  }
};


const fetchLoanOverdue = async (req, res) => {
  try {
    const { fromDate, toDate } = req.body;

    const params = [];
    let index = 1;
    const whereClause = [];

    // Default Conditions
    whereClause.push(`h.status = 'O'`);  // added by akshay 23-10-26

    whereClause.push(`t.emi_date < CURRENT_DATE`);

    whereClause.push(`
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
        `);

    // Optional EMI Date Filter
    if (fromDate) {
      whereClause.push(`t.emi_date >= $${index++}`);
      params.push(fromDate);
    }

    if (toDate) {
      whereClause.push(`t.emi_date <= $${index++}`);
      params.push(toDate);
    }

    const query = `
    SELECT

        m.dealer_code,
        m.member_no,
        m.dlr_name AS dealer_name,

        dl.city,
        dl.email_id AS email,
        dl.alternate_email_id AS alternate_email,

        COUNT(DISTINCT h.efa_id) AS total_loans,

        SUM(
            (
                COALESCE(t.principal_amt,0)
              + COALESCE(t.interest_amt,0)
              + COALESCE(t.service_chg_ded,0)
              + COALESCE(t.igst_amt,0)
              + COALESCE(t.cgst_amt,0)
              + COALESCE(t.sgst_amt,0)
            )
            - COALESCE(r.amount_received,0)
        ) AS total_pending_amount,

        COALESCE(enc.sent_count,0) AS sent_count,
        enc.last_email_sent_on

    FROM tdlnefatran t

    JOIN thlnefatran h
        ON h.efa_id = t.efa_id

    JOIN moedmember m
        ON m.member_id = h.member_id

    JOIN moeddealer dl
        ON dl.dealer_code = m.dealer_code

    LEFT JOIN
    (
        SELECT
            efa_id,
            emi_sno,
            SUM(amount_recd) AS amount_received
        FROM tolnemi_receipts
        GROUP BY efa_id, emi_sno
    ) r
        ON r.efa_id = t.efa_id
       AND r.emi_sno = t.emi_sno

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

    ${whereClause.length ? `WHERE ${whereClause.join(" AND ")}` : ""}

    GROUP BY
        m.dealer_code,
        m.member_no,
        m.dlr_name,
        dl.city,
        dl.email_id,
        dl.alternate_email_id,
        enc.sent_count,
        enc.last_email_sent_on

    ORDER BY
        m.dealer_code;
`;

    console.log(query);
    console.log(params);

    const result = await db.query(query, params);

    return res.status(200).json({
      success: true,
      data: result.rows.map((item) => ({
        ...item,
        total_loans: Number(item.total_loans),
        total_pending_amount: Number(item.total_pending_amount),
        last_email_sent_on: formatDateTime(item.last_email_sent_on),
      })),
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch Loan Overdue records.",
    });
  }
};


const fetchDealerBalanceStatement = async (req, res) => {
  try {
    const query = `
      SELECT
          m.member_id,
          m.member_no,
          m.dealer_code,
          m.dlr_name AS dealer_name,
          d.dlr_type,
          d.city,
          d.email_id AS email,
          d.alternate_email_id AS alternate_email,

          COALESCE(enc.sent_count, 0) AS sent_count,
          enc.last_email_sent_on

      FROM moedmember m

      JOIN moeddealer d
        ON d.dealer_code = m.dealer_code

      LEFT JOIN (
          SELECT
              doc_no,
              MAX(email_sent_on) AS last_email_sent_on,
              MAX(sent_count) AS sent_count
          FROM email_notification_center
          WHERE doc_type = 'Dealer Balance Statement'
          GROUP BY doc_no
      ) enc
        ON enc.doc_no = m.dealer_code

      WHERE
          m.member_active = 'Y'
          AND m.member_board_cease_date IS NULL

      ORDER BY
          m.dealer_code;
    `;

    const result = await db.query(query);

    return res.status(200).json({
      success: true,
      data: result.rows.map((item) => ({
        ...item,
        last_email_sent_on: formatDateTime(item.last_email_sent_on),
      })),
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch Dealer Balance Statement records.",
    });
  }
};


const fetchVendorBalanceStatement = async (req, res) => {
  try {
    const query = `
     SELECT
			v.v_code,
			v.v_name,
			v.v_city_name,
			v.gst_no,
			v.pan_no,
			v.email,
			v.telephone1,
          COALESCE(enc.sent_count, 0) AS sent_count,
          enc.last_email_sent_on

      FROM mommvend v
		   LEFT JOIN (
          SELECT
              doc_no,
              MAX(email_sent_on) AS last_email_sent_on,
              MAX(sent_count) AS sent_count
          FROM email_notification_center
          WHERE doc_type = 'Vendor Balance Statement'
          GROUP BY doc_no
      ) enc
        ON enc.doc_no = v.v_code;
    `;

    const result = await db.query(query);

    return res.status(200).json({
      success: true,
      data: result.rows.map((item) => ({
        ...item,
        last_email_sent_on: formatDateTime(item.last_email_sent_on),
      })),
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch Vendor Balance Statement records.",
    });
  }
};

const formatDateTime = (date) => {
  if (!date) return "-";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(new Date(date));
};




// this handler is purely based on pgBoss
exports.sendEmailNotification = catchAsync(async (req, res) => {
  const { notificationType, records } = req.body;

  for (const record of records) {
    let payload = {
      notificationType,
    };

    switch (notificationType) {
      case "PENDING_PO":
        payload.po_id = record.po_id;
        break;

      case "LOAN_STATEMENT":
        payload.efa_id = record.efa_id;
        break;

      case "LOAN_OVERDUE":
        payload.dealer_code = record.dealer_code;
        break;

      case "DEALER_BALANCE_STATEMENT":
        payload.dealer_code = record.dealer_code;
        payload.fromDate = req.body.fromDate;
        payload.toDate = req.body.toDate;
        payload.division = req.body.division;
        payload.transYear = req.body.transYear;
        payload.user_id = req.query.user_id;
        break;

      case "VENDOR_BALANCE_STATEMENT":
        payload.v_code = record.v_code;
        payload.fromDate = req.body.fromDate;
        payload.toDate = req.body.toDate;
        payload.division = req.body.division;
        payload.transYear = req.body.transYear;
        payload.user_id = req.query.user_id;
        break;

      case "PENDING_PO_VENDOR_BULK":
        payload.v_code = record.v_code;
        payload.fromDate = req.body.fromDate;
        payload.toDate = req.body.toDate;
        payload.aging = req.body.aging;
        payload.poType = req.body.poType;
        payload.division = req.body.division;
        payload.transYear = req.body.transYear;
        payload.user_id = req.query.user_id;
        break;

        case "VENDOR_PENDING_INVOICE":
        payload.v_code = record.v_code;
        payload.user_id = req.query.user_id;
        break;

      default:
        throw new Error(
          `Unsupported notification type: ${notificationType}`
        );
    }

    const jobId = await emailQueue.send(
      "email-queue",
      payload,
      {
        retryLimit: 3,
        retryDelay: 10,
        retryBackoff: true,
      }
    );

    

    console.log(
      `📨 Email job created: ${jobId} | ${notificationType}`
    );
  }

  return res.status(200).json({
    success: true,
    message: `${records.length} email(s) queued successfully.`,
  });
});


// ------------------- vendor pending invoice -----------------------------------------

const fetchVendorPendingInvoice = async (req, res) => {
  try {
    const query = `
      SELECT
        v.v_code,
        v.v_name,
        v.v_city_name,
        v.gst_no,
        v.pan_no,
        v.email,
        v.telephone1,
        COALESCE(enc.sent_count, 0) AS sent_count,
        enc.last_email_sent_on

      FROM mommvend v

      LEFT JOIN (
        SELECT
          doc_no,
          MAX(email_sent_on) AS last_email_sent_on,
          MAX(sent_count) AS sent_count
        FROM email_notification_center
        WHERE doc_type = 'Vendor Pending Invoice'
        GROUP BY doc_no
      ) enc
        ON enc.doc_no = v.v_code

      ORDER BY v.v_name;
    `;

    const result = await db.query(query);

    return res.status(200).json({
      success: true,
      data: result.rows.map((item) => ({
        ...item,

        // IMPORTANT
        // Your generic selection code expects item.id
        id: item.v_code,

        status: item.email ? "Ready" : "Missing",

        last_email_sent_on: formatDateTime(
          item.last_email_sent_on
        ),
      })),
    });

  } catch (err) {
    console.error(
      "fetchVendorPendingInvoice error:",
      err
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch vendors for pending invoice notification.",
    });
  }
};

exports.queuePOAuthorizationNotifications = queuePOAuthorizationNotifications;