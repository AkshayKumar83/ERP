
// // const {
// //     getLoanOverdueById,
// //     saveLoanOverdueHistory
// // } = require("../../repository/emailNotification");
// const {
//     getLoanOverdueByDealer,
//     saveLoanOverdueHistory
// } = require("../../repository/emailNotification");

// const sendEmail = require("../../utility/sendEmail");

// const loanOverdueTemplate = require("../../emailTemplates/loanoverdueTemplate");

// const sendLoanOverdueEmail = async (loan) => {

//     const recipients = [
//         loan.email,
//         loan.alternate_email
//     ]
//     .filter(Boolean)
//     .join(",");

//    const currentDate = new Date().toLocaleDateString('en-GB'); // DD/MM/YYYY

//    const subject = `EDDAL LOAN OVERDUE AS ON ${currentDate}: ${loan.city}`;

//     await sendEmail.sendEmail(
//         recipients,
//         subject,
//         loanOverdueTemplate(loan)
//     );

// };

// // module.exports = async ({ efa_id }) => {
//     module.exports = async ({ dealer_code }) => {

//     try {

//         // console.log("Fetching Loan Overdue :", efa_id);

//         // const loan = await getLoanOverdueById(efa_id);
//         console.log("Fetching Loan Overdue :", dealer_code);

// const loan = await getLoanOverdueByDealer(dealer_code);

//        if (!loan) {
//     throw new Error("Dealer has no overdue loans.");
// }

//         console.log("Sending Email...");

//         await sendLoanOverdueEmail(loan);

//         console.log("Saving History...");

//         await saveLoanOverdueHistory(loan);

//         console.log("Loan Overdue Email Sent Successfully");

//     } catch (err) {

//         console.error(err);

//         throw err;

//     }

// };





const {
    getLoanOverdueByDealer,
     getDealerOverdueLoans,
    saveLoanOverdueHistory
} = require("../../repository/emailNotification");

const sendEmail = require("../../utility/sendEmail");
const loanOverdueTemplate = require("../../emailTemplates/loanoverdueTemplate");


const buildRemarks = (loans) => {

    return loans
        .map(item =>
            `${item.loanNo} | EMI ${item.emiNo} | ${item.emiDate} | EMI Amount: ${item.emiAmt} | Pending: ${item.balAmt}`
        )
        .join("\n");

};

// const sendLoanOverdueEmail = async (loan) => {

//     const recipients = [
//         loan.email,
//         loan.alternate_email
//     ]
//         .filter(Boolean)
//         .join(",");

//     const currentDate = new Date().toLocaleDateString("en-GB");

//     const subject = `EDDAL LOAN OVERDUE AS ON ${currentDate}: ${loan.city}`;

//     await sendEmail.sendEmail(
//         recipients,
//         subject,
//         loanOverdueTemplate(loan)
//     );
// };

const sendLoanOverdueEmail = async (dealer) => {

    const recipients = [
        dealer.email,
        dealer.alternate_email
    ]
        .filter(Boolean)
        .join(",");

    const currentDate = new Date().toLocaleDateString("en-GB");

    // const subject =
    //     `EDDAL LOAN OVERDUE AS ON ${currentDate}: ${dealer.city}`;
    const subject =
        `YOUR EMI IS OVERDUE – PLEASE PAY NOW.`;

    await sendEmail.sendEmail(
        recipients,
        subject,
        loanOverdueTemplate(dealer)
    );
};

module.exports = async ({ dealer_code }) => {

    try {

        console.log("Fetching Dealer :", dealer_code);

        const dealer = await getLoanOverdueByDealer(dealer_code);

        if (!dealer) {
            throw new Error("Dealer not found.");
        }

        console.log("Fetching Overdue Loans...");

        dealer.loans = await getDealerOverdueLoans(dealer_code);

        if (!dealer.loans.length) {
            throw new Error("Dealer has no overdue loans.");
        }

        dealer.remarks = buildRemarks(dealer.loans);

        console.log("Sending Email...");

        await sendLoanOverdueEmail(dealer);

        console.log("Saving History...");

        await saveLoanOverdueHistory(dealer);

        console.log("Loan Overdue Email Sent Successfully");

    } catch (err) {

        console.error(err);
        throw err;

    }

};


// module.exports = async ({ dealer_code }) => {

//     try {

//         console.log("Fetching Loan Overdue :", dealer_code);

//         const loan = await getLoanOverdueByDealer(dealer_code);

//         if (!loan) {
//             throw new Error("Dealer has no overdue loans.");
//         }

//         console.log("Sending Email...");

//         await sendLoanOverdueEmail(loan);

//         console.log("Saving History...");

//         await saveLoanOverdueHistory(loan);

//         console.log("Loan Overdue Email Sent Successfully");

//     } catch (err) {

//         console.error(err);
//         throw err;

//     }

// };