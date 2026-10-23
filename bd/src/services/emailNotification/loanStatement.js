
const {
    getLoanStatementById,
    saveLoanStatementHistory,
    getLoanLedgerData
} = require("../../repository/emailNotification");
const fs = require("fs");

const generateLoanStatementExcel = require("../../utility/generateLoanStatementExcel");

const sendEmail = require("../../utility/sendEmail");

const loanStatementTemplate = require("../../emailTemplates/loanStatementTemplate");


const sendLoanStatementEmail = async (loan, attachment) => {

    const recipients = [
        loan.email,
        loan.alternate_email
    ]
        .filter(Boolean)
        .join(",");

    // const subject = `Statement of Loan Account - ${loan.loan_no}`;

    // Current system date in DD/MM/YYYY format
    const statementDate = new Date().toLocaleDateString("en-GB");

    const subject = `MUTUAL BENEFIT ADVANCE - STATEMENT OF ACCOUNT AS ON ${statementDate}`;

     const rows = await getLoanLedgerData(loan.efa_id);

     console.log("Rows for Loan Statement:", rows);

    await sendEmail.sendEmail(
        recipients,
        subject,
        loanStatementTemplate(loan),
         attachment,
         `LoanStatement_${loan.loan_no}.xlsx`
    );
};




module.exports = async ({ efa_id }) => {

    try {

        console.log("Fetching Loan Statement :", efa_id);

        const loan = await getLoanStatementById(efa_id);

        if (!loan) {
            throw new Error("Loan Statement not found.");
        }

        console.log("Generating Loan Statement Excel...");

        const attachment = await generateLoanStatementExcel(
            loan.efa_id,
            loan.user_id ?? 0
        );

        console.log("Attachment:", attachment);
        console.log("Exists:", fs.existsSync(attachment));

        console.log("Sending Email...");

        await sendLoanStatementEmail(
            loan,
            attachment
        );

        console.log("Saving History...");

        await saveLoanStatementHistory(loan);

        console.log("Loan Statement Email Sent Successfully");

    } catch (err) {

        console.error(err);
        throw err;

    }

};

