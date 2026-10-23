module.exports = (data) => {
  const pendingPOs = data.pendingPOs || [];

  // =======================================
  // HELPERS
  // =======================================

  const formatDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-GB");
  };

  const getLocation = (po) => {
    return (
      po.dlr_location ||
      po.dealer_location ||
      ""
    );
  };

  const getState = (po) => {
    return (
      po.dlr_state ||
      po.dealer_state ||
      ""
    );
  };


  const getRemarks = (po) => {
    return (
      po.remarks ||
      po.remark ||
      ""
    );
  };

  // =======================================
  // PENDING ORDER TABLE ROWS
  // =======================================

  const orderRows = pendingPOs
    .map((po) => {
      return `
        <tr>

          <!-- Order No -->
          <td
            style="
              border: 1px solid #000;
              padding: 8px;
              text-align: center;
            "
          >
            ${po.po_no || ""}
          </td>

          <!-- Date -->
          <td
            style="
              border: 1px solid #000;
              padding: 8px;
              text-align: center;
            "
          >
            ${formatDate(po.po_date)}
          </td>

          <!-- Dealer Code -->
          <td
            style="
              border: 1px solid #000;
              padding: 8px;
              text-align: center;
            "
          >
            ${po.dealer_code || ""}
          </td>

          <!-- Dealership Name -->
          <td
            style="
              border: 1px solid #000;
              padding: 8px;
            "
          >
            ${po.dealer_name || ""}
          </td>

          <!-- Location -->
          <td
            style="
              border: 1px solid #000;
              padding: 8px;
            "
          >
            ${getLocation(po)}
          </td>

          <!-- State -->
          <td
            style="
              border: 1px solid #000;
              padding: 8px;
            "
          >
            ${getState(po)}
          </td>

          <!-- Pending Age -->
          <td
            style="
              border: 1px solid #000;
              padding: 8px;
              text-align: center;
            "
          >
            ${po.pending_age || 0}
          </td>

          <!-- Remarks -->
          <td
            style="
              border: 1px solid #000;
              padding: 8px;
            "
          >
            ${getRemarks(po)}
          </td>

        </tr>
      `;
    })
    .join("");

  // =======================================
  // EMAIL TEMPLATE
  // =======================================

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
    line-height: 1.6;
  "
>

  <!-- =======================================
       DATE
  ======================================== -->

  <p>
    Date: ${formatDate(new Date())}
  </p>


  <!-- =======================================
       GREETING
  ======================================== -->

  <p>
    Dear Business Associate,
  </p>

  <!-- =======================================
       INTRODUCTION
  ======================================== -->

  <p>
    This is to bring to your
    <strong>immediate attention</strong>
    that the following orders are currently pending at your end
    for execution.
  </p>

  <p>
    You are requested to
    <strong>
      prioritise and expedite the execution of these orders
    </strong>,
    particularly those pending for
    <strong>more than 15 days</strong>,
    to avoid any applicability of the penalty clauses as per the
    mutually agreed contractual timelines.
  </p>

  <!-- =======================================
       PENDING ORDER TABLE
  ======================================== -->

  <table
    style="
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      margin-bottom: 20px;
      font-size: 13px;
    "
  >

    <thead>

      <tr
        style="
          background-color: #d9eaf7;
        "
      >

        <th
          style="
            border: 1px solid #000;
            padding: 8px;
          "
        >
          Order No.
        </th>

        <th
          style="
            border: 1px solid #000;
            padding: 8px;
          "
        >
          Date
        </th>

        <th
          style="
            border: 1px solid #000;
            padding: 8px;
          "
        >
          D. Code
        </th>

        <th
          style="
            border: 1px solid #000;
            padding: 8px;
          "
        >
          Dealership Name
        </th>

        <th
          style="
            border: 1px solid #000;
            padding: 8px;
          "
        >
          Location
        </th>

        <th
          style="
            border: 1px solid #000;
            padding: 8px;
          "
        >
          State
        </th>

        <th
          style="
            border: 1px solid #000;
            padding: 8px;
          "
        >
          Older Than (Days)
        </th>

        <th
          style="
            border: 1px solid #000;
            padding: 8px;
          "
        >
          Remarks
        </th>

      </tr>

    </thead>

    <tbody>
      ${orderRows}
    </tbody>

  </table>

  <!-- =======================================
       ACTION REQUIRED
  ======================================== -->

  <p>
    <strong>
      Action Required – Within 24 Working Hours:
    </strong>
  </p>

  <p>
    You are requested to
    <strong>
      share the expected date of dispatch for each pending order
      within 24 working hours
    </strong>
    from the receipt of this email, in accordance with the mutually
    agreed contractual timelines.
  </p>

  <p>
    <strong>
      If any order has already been dispatched,
    </strong>
    please update the
    <strong>Remarks</strong>
    column with the following details:
  </p>

  <!-- =======================================
       DISPATCH DETAILS
  ======================================== -->

  <ul>

    <li>
      <strong>Bill/Invoice No.</strong>
    </li>

    <li>
      <strong>LR / Docket No., wherever applicable</strong>
    </li>

  </ul>

  <!-- =======================================
       CLOSING
  ======================================== -->

  <p>
    Your timely response will help EDDAL monitor the order execution
    and ensure timely delivery to the respective dealerships.
  </p>

  <p>
    For any further clarification or assistance, please feel free to
    connect with <strong>Team-EDDAL</strong>.
  </p>

  <!-- =======================================
       SIGNATURE
  ======================================== -->

  <p>
    <strong>Best Regards,</strong>
    <br>
    <strong>TEAM-EDDAL</strong>
  </p>

</body>

</html>
`;
};


