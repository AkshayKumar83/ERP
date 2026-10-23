const {
  getVendorBalanceStatementByVendorCode,
  saveVendorBalanceStatementHistory,
  getVendorBalanceLedgerData,
} = require("../../repository/emailNotification");

// services for dealerbalanceStatment

const fs = require("fs");

const sendEmail = require("../../utility/sendEmail");

const vendorBalanceStatementTemplate = require("../../emailTemplates/vendorBalStatementTemplate");
const genVendorBalStatementExcel = require("../../utility/genVendorBalStatementExcel");



const sendVendorBalanceStatementEmail = async (vendor, attachment, toDate) => {
  const recipients = [vendor.email]
    .filter(Boolean)
    .join(",");


 const subject = `STATEMENT OF ACCOUNT AS ON – ${toDate} RECONCILIATION & CONFIRMATION`;


  await sendEmail.sendEmail(
    recipients,
    subject,
    vendorBalanceStatementTemplate(vendor, toDate),
    attachment,
    `${vendor.v_name.split(" ").join("_")}_Balance_Statement.xlsx`
  );
};

module.exports = async ({
  v_code,
  fromDate,
  toDate,
  division,
  transYear,
}) => {
  try {
    
    console.log("Fetching Dealer Balance Statement :", v_code);

    const vendor = await getVendorBalanceStatementByVendorCode(v_code);

    console.log('vendor data::', vendor)

    if (!vendor) {
      throw new Error("vendor Balance Statement not found.");
    }

    console.log("Generating vendor Balance Statement Excel...");
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
    const attachment = await genVendorBalStatementExcel({
      v_code: vendor.v_code,
      user_id: vendor.user_id ?? 0,
      fromDate,
      toDate,
      division: Number(division),
      transYear,
      includUnposted: "Y",
      v_name: vendor.v_name,
    });

    console.log("Attachment:", attachment);
    console.log("Exists:", fs.existsSync(attachment));

    console.log("Sending Email...");

    await sendVendorBalanceStatementEmail(vendor, attachment, toDate);

    console.log("Saving History...");

    await saveVendorBalanceStatementHistory(vendor);

    console.log("vendor Balance Statement Email Sent Successfully");
  } catch (err) {
    console.error(err);
    throw err;
  }
};
