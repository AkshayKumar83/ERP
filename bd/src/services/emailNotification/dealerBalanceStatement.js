const {
  getDealerBalanceStatementByDealerCode,
  saveDealerBalanceStatementHistory,
  getDealerBalanceLedgerData,
} = require("../../repository/emailNotification");

// services for dealerbalanceStatment

const fs = require("fs");

const sendEmail = require("../../utility/sendEmail");

const dealerBalanceStatementTemplate = require("../../emailTemplates/dlrBalStatementTemplate");
const genDlrBalStatementExcel = require("../../utility/genDlrBalStatementExcel");



const sendDealerBalanceStatementEmail = async (dealer, attachment, toDate) => {
  const recipients = [dealer.email, dealer.alternate_email]
    .filter(Boolean)
    .join(",");

  // const subject = `Dealer Balance Statement As On - ${toDate}`;

   const subject = `STATEMENT OF ACCOUNT AS ON - ${toDate} RECONCILIATION & CONFIRMATION.`;

  await sendEmail.sendEmail(
    recipients,
    subject,
    dealerBalanceStatementTemplate(dealer, toDate),
    attachment,
   `${dealer.dlr_name.split(" ").join("_")}_Balance_Statement.xlsx`
  );
};

module.exports = async ({
  dealer_code,
  fromDate,
  toDate,
  division,
  transYear,
}) => {
  try {
    console.log("Fetching Dealer Balance Statement :", dealer_code);

    const dealer = await getDealerBalanceStatementByDealerCode(dealer_code);

    if (!dealer) {
      throw new Error("Dealer Balance Statement not found.");
    }

    console.log("Generating Dealer Balance Statement Excel...");
    const today = new Date().toISOString().split("T")[0];

    // const attachment = await genDlrBalStatementExcel(
    //     {
    //          member_no: dealer.member_no,
    //         user_id : dealer.user_id??0,
    //         fromDate : '2026-04-01',
    //         toDate : today,
    //         division : 1,
    //         transYear : '2026',
    //         includUnposted : 'Y',
    //         dealer_name : dealer.dlr_name
    //      },

    // );
    const attachment = await genDlrBalStatementExcel({
      member_no: dealer.member_no,
      user_id: dealer.user_id ?? 0,
      fromDate,
      toDate,
      division: Number(division),
      transYear,
      includUnposted: "Y",
      dealer_name: dealer.dlr_name,
    });

    console.log("Attachment:", attachment);
    console.log("Exists:", fs.existsSync(attachment));

    console.log("Sending Email...");

    await sendDealerBalanceStatementEmail(dealer, attachment, toDate);

    console.log("Saving History...");

    await saveDealerBalanceStatementHistory(dealer);

    console.log("Dealer Balance Statement Email Sent Successfully");
  } catch (err) {
    console.error(err);
    throw err;
  }
};
