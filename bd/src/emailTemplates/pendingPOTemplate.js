
module.exports = (data) => {
  const isPurchaseAdvice =
    String(data.po_type || "")
      .trim()
      .toUpperCase() === "ADVICE";

  console.log("data from pendingPOTemplate ::", data);

  const documentName = isPurchaseAdvice
    ? "Purchase Advice"
    : "Purchase Order";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>

<body
  style="
    font-family: Calibri, Arial, Helvetica, sans-serif;
    font-size: 14px;
    color: #333333;
    line-height: 1.7;
  "
>
  <p>Dear ${data.v_name},</p>

  <p>
    Please find attached
    <strong>${documentName}</strong>
    <strong>${data.po_no}</strong>
    dated
    <strong>${data.po_date}</strong>.
  </p>

  ${
    isPurchaseAdvice
      ? `
  <p>
    <strong>Consignee / Dealer Details:</strong>
  </p>

  <table
    style="
      border-collapse: collapse;
      margin-bottom: 20px;
    "
  >
    <tr>
      <td style="padding: 6px 15px 6px 0;">
        <strong>Dealer Code:</strong>
      </td>
      <td style="padding: 6px 0;">
        ${data.dealer_code || "-"}
      </td>
    </tr>

    <tr>
      <td style="padding: 6px 15px 6px 0;">
        <strong>Dealer Name:</strong>
      </td>
      <td style="padding: 6px 0;">
        ${data.c_name || "-"}
      </td>
    </tr>

    <tr>
      <td style="padding: 6px 15px 6px 0;">
        <strong>City:</strong>
      </td>
      <td style="padding: 6px 0;">
        ${data.dlr_location || "-"}
      </td>
    </tr>
  </table>
  `
      : ""
  }

  <p>
    Kindly arrange the supply of the materials strictly as per the terms,
    specifications, quantities, and delivery schedule mentioned in the attached
    ${documentName}.
  </p>

  ${
    data.pending_age > 0
      ? `
  <p>
    As per our records, the supply against the above
    <strong>${documentName}</strong>
    has been pending for
    <strong>
      ${data.pending_age}
      ${data.pending_age === 1 ? "day" : "days"}
    </strong>.
    
    We request you to kindly expedite the dispatch of the pending material
    at the earliest and share the expected dispatch schedule to avoid any
    delay in procurement.
  </p>
  `
      : ""
  }

  ${
    isPurchaseAdvice
      ? `
  <p>
    <strong>Important:</strong>
    This is a <strong>Direct Purchase Advice</strong>.
    Please dispatch the materials directly to the consignee
    (Ship To Address) specified in the attached document.
  </p>
  `
      : ""
  }

  <p>
    Kindly acknowledge receipt of this ${documentName} and confirm the
    expected dispatch date.
  </p>

  <p>
    After dispatch, please share the following details:
  </p>

  <ul>
    <li>Invoice</li>
    <li>LR / AWB / Tracking Number</li>
    <li>Transporter / Courier Details</li>
    <li>Expected Delivery Date</li>
  </ul>

  <p>
    If you require any clarification regarding this ${documentName},
    please contact us before dispatch.
  </p>

  <p>
    Regards,<br>
    <strong>ESCORTS DEALERS DEVELOPMENT ASSOCIATION LIMITED</strong>
  </p>
</body>
</html>
`;
};


