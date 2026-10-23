const { sendPOEmail } = require("../../../../utility/sendEmail");
const { db } = require("../../../../config/dbConnection");
const path = require("path");
const jwt = require("jsonwebtoken");


const sendNextAuthMail = async ({
  po_id,
  po_no,
  auth_level,
  finalFlag,
  pdfPath,
  actionType,
  remarks,
  actionUserId,
  docType
}) => {
  try {
    let nextUserId = null;

    // 🏷️ LABEL based on docType
    const docLabel = docType === "PA" ? "Purchase Advice" : "Purchase Order";
    const docShortLabel = docType === "PA" ? "PA" : "PO";

    console.log("📊 Fetching auth matrix for docType:", docType);

    // 🎯 FETCH AUTH MATRIX comment by akshay 31-07-26
    // let authRes = await db.query(
    //   `SELECT auth_id1, auth_id2, auth_id3
    //    FROM moitauth
    //    WHERE doc_type = $1
    //      AND active = 'Y'`,
    //   [docType]
    // );
 
    // fetch new user  matrix

    let authRes = await db.query(
        `
        SELECT auth_id1, auth_id2, auth_id3
        FROM moitauth
        WHERE doc_type = $1
        AND active='Y'
        AND (
              auth_id1 = $2
          OR auth_id2 = $2
        )
        LIMIT 1
        `,
        [docType, actionUserId]
    );

    // Fallback: try without active filter
    if (authRes.rowCount === 0) {
      authRes = await db.query(
        `SELECT auth_id1, auth_id2, auth_id3
         FROM moitauth
         WHERE doc_type = $1`,
        [docType]
      );
    }

    if (authRes.rowCount === 0) {
      console.error(`No auth matrix found for doc_type: "${docType}"`);
      return;
    }

    const { auth_id1, auth_id2, auth_id3 } = authRes.rows[0];

    // ✅ FORWARD FLOW  comment by akshay
    // if (actionType === "approve") {
    //   if (auth_level == 1 && finalFlag === "Y") {
    //     nextUserId = auth_id2;
    //   } else if (auth_level == 2 && finalFlag === "A") {
    //     nextUserId = auth_id3;
    //   }
    // }

         // added by akshay 22-06-26

    const skipLevel2 =
  docType === "PO" &&
  Number(auth_id1) === Number(auth_id2);

   
      if (actionType === "approve") {

        if (
          skipLevel2 &&
          auth_level == 1 && finalFlag === "A"
        ) {
          nextUserId = auth_id3;
        }

        else if (auth_level == 1 && finalFlag === "Y") {
          nextUserId = auth_id2;
        }

        else if (auth_level == 2 && finalFlag === "A") {
          nextUserId = auth_id3;
        }
      }

    // 🔁 REVERSE FLOW
    else if (actionType === "refuse" || actionType === "cancel") {
      if (auth_level == 3) {
        nextUserId = auth_id2;
      } else if (auth_level == 2) {
        nextUserId = auth_id1;
      }
    }

    if (!nextUserId) return;

    // 📧 Get recipient email
    const userRes = await db.query(
      `SELECT email_id FROM user_master WHERE user_id = $1`,
      [nextUserId]
    );
    const email = userRes.rows[0]?.email_id;
    if (!email) return;

    // 👤 Action user name
    const actionUserRes = await db.query(
      `SELECT user_name FROM user_master WHERE user_id = $1`,
      [actionUserId]
    );
    const actionUserName = actionUserRes.rows[0]?.user_name || "";

    // 📧 SUBJECT
    let subject = "";
    if (actionType === "approve") {
      subject =
        auth_level == 1
          ? `${docLabel} Prepared By ${actionUserName} - ${po_no}`
          : `${docLabel} Checked By ${actionUserName} - ${po_no}`;
    } else if (actionType === "refuse") {
      subject = `${docLabel} Refused By ${actionUserName} - ${po_no}`;
    } else if (actionType === "cancel") {
      subject = `${docLabel} Cancelled By ${actionUserName} - ${po_no}`;
    }

    // 📝 MAIL HEADING
    let mailHeading = "";
    if (actionType === "approve") {
      mailHeading = `${docLabel} Approval Required`;
    } else if (actionType === "refuse") {
      mailHeading = `${docLabel} Refused`;
    } else if (actionType === "cancel") {
      mailHeading = `${docLabel} Cancelled`;
    }

    // 📝 STATUS TEXT
    let statusText = "";
    if (actionType === "approve") {
      statusText = auth_level == 1 ? "Prepared" : "Checked";
    } else if (actionType === "refuse") {
      statusText = "Refused";
    } else if (actionType === "cancel") {
      statusText = "Cancelled";
    }

    // 🔑 JWT TOKEN for next level
    const SECRET = process.env.JWT_SECRET;
     // comment by akshay
    // const token = jwt.sign(
    //   { po_id, level: auth_level + 1, user_id: nextUserId },
    //   SECRET,
    //   { expiresIn: "1d" }
    // );

         // added by akshay 22-06-26
    let nextLevel = auth_level + 1;

     if (
        skipLevel2 &&
        actionType === "approve" &&
        auth_level == 1
      ) {
        nextLevel = 3;
      }

      const token = jwt.sign(
      { po_id,level: nextLevel,user_id: nextUserId },
        SECRET,
        { expiresIn: "1d" }
      );

    const baseUrl = process.env.BACKEND_URL;
    const approveUrl = `${baseUrl}/api/v1/prch-ordr/email-action?token=${token}&action=approve`;
    const refuseUrl  = `${baseUrl}/api/v1/prch-ordr/email-action?token=${token}&action=refuse`;
    const cancelUrl  = `${baseUrl}/api/v1/prch-ordr/email-action?token=${token}&action=cancel`;

    const showOpenButton = Number(nextUserId) === Number(auth_id3);
    const openPoUrl = `http://ec2-13-235-80-101.ap-south-1.compute.amazonaws.com:4173/module/materialMgmnt/60111?token=${token}&po_no=${po_no}`;

    // 📨 HTML BODY
    const html = `
<div style="font-family: Arial;">
  <h3>${mailHeading}</h3>

  <p><b>${docShortLabel} No:</b> ${po_no}</p>

  <p><b>Action By:</b> ${actionUserName}</p>

  <p><b>Remarks:</b> ${remarks || "-"}</p>

  <p><b>Status:</b> ${statusText}</p>

  <br/>

  <a href="${approveUrl}" style="padding:10px 20px;background:#28a745;color:white;text-decoration:none;border-radius:5px;margin-right:10px;">
    ✅ Approve
  </a>

  <a href="${refuseUrl}" style="padding:10px 20px;background:#dc3545;color:white;text-decoration:none;border-radius:5px;margin-right:10px;">
    ❌ Refuse
  </a>

  <a href="${cancelUrl}" style="padding:10px 20px;background:#6c757d;color:white;text-decoration:none;border-radius:5px;">
    🚫 Cancel
  </a>

  <p style="margin-top:20px;">Or login to system to take action.</p>

  ${showOpenButton ? `
  <br/><br/>
  <a href="${openPoUrl}"
     style="padding:10px 20px;background:#007bff;color:white;text-decoration:none;border-radius:5px;display:inline-block;">
     🔍 Open ${docLabel} In Application
  </a>
  ` : ""}
</div>
`;

    await sendPOEmail(email, subject, html, pdfPath, docType === 'PA'? 'Purchase Advice.Pdf':'Purchase Order.Pdf');
    console.log(`📩 Mail sent to: ${email} for ${docLabel} ${po_no}`);

  } catch (err) {
    console.error("Mail Error:", err.message);
  }
};

module.exports = { sendNextAuthMail };


