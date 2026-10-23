// module.exports = (loan) => {

//     const loans = loan?.loans || [];

//     const totalEmiAmount = loans.reduce((sum, item) => {
//         return sum + Number(item.emiAmt || 0);
//     }, 0);

//     const totalBalAmount = loans.reduce((sum, item) => {
//         return sum + Number(item.balAmt || 0);
//     }, 0);

//     const formatAmount = (amount) => {
//         return Number(amount || 0).toLocaleString("en-IN");
//     };

//     const tableRows = loans.map(item => `
//         <tr>
//             <td style="border:1px solid #000;padding:8px;">${item.loanNo || ""}</td>
//             <td style="border:1px solid #000;padding:8px;">${item.loanDate || ""}</td>
//             <td style="border:1px solid #000;padding:8px;">${item.scheme || ""}</td>
//             <td style="border:1px solid #000;padding:8px;">${item.emiDate || ""}</td>
//             <td style="border:1px solid #000;padding:8px;text-align:right;">${formatAmount(item.emiAmt)}</td>
//             <td style="border:1px solid #000;padding:8px;text-align:right;">${formatAmount(item.balAmt)}</td>
//         </tr>
//     `).join("");


// return `
// <!DOCTYPE html>
// <html>
// <head>
//     <meta charset="UTF-8">
// </head>

// <body style="font-family:Calibri,Arial,sans-serif;font-size:14px;color:#000;line-height:1.45;">

// <p>Dear Dealer Friends,</p>

// <p>
//     This has reference to our SMS request on the subject, please help in remitting the
//     following loan instalments <strong>&lt;Rs. ${formatAmount(totalEmiAmount)}&gt;</strong>;
//     through NEFT/RTGS/IMPS on its due dates:
// </p>

// <table cellpadding="0"
//        cellspacing="0"
//        style="border-collapse:collapse;margin-top:10px;margin-bottom:18px;">

//     <thead>

//         <tr style="background:#b8cce4;">

//             <th style="border:1px solid #000;padding:6px 5px;text-align:center;">
//                 Loan No.
//             </th>

//             <th style="border:1px solid #000;padding:6px 5px;text-align:center;">
//                 Loan Date
//             </th>

//             <th style="border:1px solid #000;padding:6px 5px;text-align:center;">
//                 Scheme
//             </th>

//             <th style="border:1px solid #000;padding:6px 5px;text-align:center;">
//                 EMI Date
//             </th>

//             <th style="border:1px solid #000;padding:6px 5px;text-align:center;">
//                 EMI Amt.
//             </th>

//             <th style="border:1px solid #000;padding:6px 5px;text-align:center;">
//                 Bal Amt.
//             </th>

//         </tr>

//     </thead>

//     <tbody>

//         ${tableRows}

//         <tr style="background:#b8cce4;font-weight:bold;">

//             <td style="border:1px solid #000;padding:6px;">
//                 Total
//             </td>

//             <td style="border:1px solid #000;"></td>

//             <td style="border:1px solid #000;"></td>

//             <td style="border:1px solid #000;"></td>

//             <td style="border:1px solid #000;padding:6px;text-align:right;">
//                 ${formatAmount(totalEmiAmount)}
//             </td>

//             <td style="border:1px solid #000;padding:6px;text-align:right;">
//                 ${formatAmount(totalBalAmount)}
//             </td>

//         </tr>

//     </tbody>

// </table>

// <p>
//     <strong>EDDAL Bank details are given below for your ready reference:</strong>
// </p>

// <ul style="margin-top:8px;margin-bottom:20px;line-height:1.8;">

//     <li>
//         Beneficiary Name : Escorts Dealers Development Association Limited
//     </li>

//     <li>
//         Account number : 008305000708
//     </li>

//     <li>
//         Bank Name : ICICI Bank Limited
//     </li>

//     <li>
//         Bank Address : Booth No. 104-105, District Centre, Sector-16,
//         Faridabad - 121 007
//     </li>

//     <li>
//         IFSC Code : ICIC0000083
//     </li>

// </ul>

// <p>
// If you have already made the payment, please share the transaction details
// to verify with our bank.
// </p>

// <p>
// Look forward to your timely action please.
// </p>

// <p>
// Thanking you,
// </p>

// <table cellpadding="0"
//        cellspacing="0"
//        border="0"
//        style="font-family:Calibri,Arial,sans-serif;
//               font-size:14px;
//               color:#000;
//               line-height:1.45;
//               margin-top:20px;">

// <tr>
//     <td style="padding-bottom:12px;">
//         <strong>Regards,</strong>
//     </td>
// </tr>

// <tr>
//     <td style="font-weight:bold;">
//         Manoj K Garg | Head-EDDAL and Dealer Development
//     </td>
// </tr>

// <tr>
//     <td style="padding-top:3px;">
//         <strong>Escorts Dealers Development Association Limited</strong>
//         |
//         <a href="https://www.escortsgroup.com"
//            style="color:#0000EE;
//                   text-decoration:underline;
//                   font-weight:bold;">
//             www.escortsgroup.com
//         </a>
//     </td>
// </tr>

// <tr>
//     <td style="padding-top:3px;font-weight:bold;">
//         15/5, Mathura Road, Faridabad -121 003 (Haryana)
//     </td>
// </tr>

// <tr>
//     <td style="padding-top:3px;font-weight:bold;">
//         M: +91-98212-56261 | L: 0129-2564400
//     </td>
// </tr>

// </table>

// </body>
// </html>
// `;
// };




module.exports = (loan) => {

    const loans = loan?.loans || [];

    const formatAmount = (amount) => {
        return Number(amount || 0).toLocaleString("en-IN");
    };

const getOverdueDays = (item) => {
    if (!item.emiDate) return "";

    const dateParts = String(item.emiDate).split("/");

    if (dateParts.length !== 3) return "";

    const [day, month, year] = dateParts.map(Number);

    // EMI date at midnight
    const emiDate = new Date(year, month - 1, day);
    emiDate.setHours(0, 0, 0, 0);

    // Today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - emiDate.getTime();

    const diffDays = Math.floor(
        diffTime / (1000 * 60 * 60 * 24)
    );

    return diffDays > 0 ? diffDays : 0;
};

    const totalEmiAmount = loans.reduce((sum, item) => {
        return sum + Number(item.emiAmt || 0);
    }, 0);

    const tableRows = loans.map(item => `
        <tr>
            <td style="border:1px solid #000;padding:8px;">
                ${item.scheme || item.programmeName || ""}
            </td>

            <td style="border:1px solid #000;padding:8px;text-align:center;">
                ${item.emiDate || ""}
            </td>

            <td style="border:1px solid #000;padding:8px;text-align:right;">
                ₹${formatAmount(item.emiAmt)}
            </td>

            <td style="border:1px solid #000;padding:8px;text-align:center;">
                ${getOverdueDays(item)}
            </td>
        </tr>
    `).join("");


    return `
<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
</head>

<body style="
    font-family:Calibri,Arial,sans-serif;
    font-size:14px;
    color:#000;
    line-height:1.45;
">

<p>Dear Dealer Member,</p>

<p>
    This is a reminder that the following Mutual Benefit Advance EMI(s)
    are overdue.
</p>

<p>
    We request you to arrange payment of the outstanding EMI(s) immediately
    to ensure timely regularisation of your account and continued benefits
    under the Mutual Benefit Advance Programme.
</p>


<table
    cellpadding="0"
    cellspacing="0"
    style="
        border-collapse:collapse;
        margin-top:15px;
        margin-bottom:20px;
        width:100%;
    "
>

    <thead>

        <tr style="background:#b8cce4;">

            <th style="
                border:1px solid #000;
                padding:8px;
                text-align:center;
            ">
                Programme Name
            </th>

            <th style="
                border:1px solid #000;
                padding:8px;
                text-align:center;
            ">
                EMI Date
            </th>

            <th style="
                border:1px solid #000;
                padding:8px;
                text-align:center;
            ">
                EMI Amount
            </th>

            <th style="
                border:1px solid #000;
                padding:8px;
                text-align:center;
            ">
                Overdue By (Days)
            </th>

        </tr>

    </thead>

    <tbody>

        ${tableRows}

        <tr style="background:#b8cce4;font-weight:bold;">

            <td
                colspan="2"
                style="
                    border:1px solid #000;
                    padding:8px;
                    text-align:right;
                "
            >
                Total Outstanding EMI
            </td>

            <td
                style="
                    border:1px solid #000;
                    padding:8px;
                    text-align:right;
                "
            >
                ₹${formatAmount(totalEmiAmount)}
            </td>

            <td style="border:1px solid #000;padding:8px;"></td>

        </tr>

    </tbody>

</table>


<p>
    <strong>
        EDDAL Bank Details for Remittance of the Outstanding EMI(s):
    </strong>
</p>

<ul style="
    margin-top:8px;
    margin-bottom:20px;
    line-height:1.8;
">

    <li>
        <strong>Beneficiary Name:</strong>
        Escorts Dealers Development Association Limited
    </li>

    <li>
        <strong>Bank:</strong>
        ICICI Bank Limited
    </li>

    <li>
        <strong>Account No.:</strong>
        008305000708
    </li>

    <li>
        <strong>IFSC Code:</strong>
        ICIC0000083
    </li>

    <li>
        <strong>Branch:</strong>
        Booth No. 104-105, District Centre, Sector-16,
        Faridabad - 121 007
    </li>

</ul>


<p>
    After making the payment, kindly share the transaction details/UTR
    with EDDAL for updating our records.
</p>

<p>
    Your prompt action is requested to clear the overdue EMI(s)
    without further delay.
</p>


<p style="margin-top:25px;">
    Warm Regards,
</p>

<p style="margin-top:15px;">
    <strong>Team EDDAL</strong>
</p>

</body>
</html>
`;
};




