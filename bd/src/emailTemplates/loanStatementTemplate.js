// module.exports = (loan) => {

//     const statementDate = new Date().toLocaleDateString("en-GB");

//     return `
// <!DOCTYPE html>
// <html>
// <head>
//     <meta charset="UTF-8">
// </head>

// <body style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size:14px; color:#333; line-height:1.7;">

//     <p>Dear Dealer Friends,</p>

//     <p>
//         As a part of our audit process, we are herewith forwarding your
//         <strong>Statement of Loan Account</strong>
//         as on <strong>${statementDate}</strong>.
//     </p>

//     <p>
//         Please get your account reconciled and send your confirmation
//         within <strong>15 days</strong> of this email,
//         failing which it will be assumed that our books of accounts
//         are reconciled with you.
//     </p>

//     <p>
//         In case you need any further assistance regarding the financial
//         transactions to reconcile your books of account,
//         please feel free to write to us.
//     </p>

//     <p>
//         Kindly send the duly signed and stamped copy of the
//         <strong>Statement of Loan Account</strong>
//         as confirmation.
//     </p>

//     <p>
//         We will be highly grateful for your earliest action.
//     </p>

//     <br>

//     <p>
//         Yours faithfully,
//     </p>

//     <p>
//         <strong>Warm Regards</strong><br><br>

//         <strong>Sahil Chawla</strong><br>
//         Manager - EDDAL Finance<br><br>

//         Escorts Dealers Development Association Limited<br>
//         Escorts Kubota Limited<br><br>

//         15/5, Mathura Road,<br>
//         Faridabad - 121003 (Haryana)<br><br>

//         M : +91-98186-20200
//     </p>

// </body>
// </html>
// `;

// };





module.exports = (loan) => {

    const statementDate = new Date().toLocaleDateString("en-GB");

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>

<body style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size:14px; color:#333; line-height:1.7;">

    <p>Dear Dealer Member,</p>

    <p>
        We are herewith forwarding your
        <strong>Mutual Benefit Advance Statement of Account (SOA) as on ${statementDate}</strong>
        for your kind review and reconciliation with your books of account.
    </p>

    <p>
        You are requested to
        <strong>verify the details and outstanding balance reflected in the SOA</strong>
        and intimate EDDAL in case of any discrepancy or difference between our
        records and your books of account.
    </p>

    <p>
        In the absence of any communication from your end
        <strong>within 7 days from the date of this communication</strong>,
        it will be presumed that the Statement of Account has been duly
        reconciled and that the information contained therein is
        <strong>true and correct as per your records</strong>.
    </p>

    <p>
        You are welcome to contact us for
        <strong>any further clarification or information</strong>
        relating to your Mutual Benefit Advance account.
        We will be happy to assist you.
    </p>

    <p>
        We look forward to your cooperation and timely reconciliation.
    </p>

    <br>

    <p>
        Best Regards,
    </p>

    <p>
        <strong>TEAM-EDDAL</strong>
    </p>

</body>
</html>
`;
};

