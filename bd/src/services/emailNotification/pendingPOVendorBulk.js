
const {
  getPendingPOsByVendor,
} = require("../../repository/emailNotification");

const sendEmail = require("../../utility/sendEmail");
const pendingPOVendorBulkTemplate = require("../../emailTemplates/pendingPOVendorBulkTemplate");
const generatePendingPOExcel = require("../../utility/pendingPOExcel");

module.exports = async ({
  v_code,
  division,
  transYear,
  fromDate,
  toDate,
  aging,
  poType,
  user_id,
}) => {
  try {
    console.log("==================================");
    console.log("📋 BULK PENDING PO EMAIL");
    console.log("Vendor:", v_code);
    console.log("Division:", division);
    console.log("Trans Year:", transYear);
    console.log("Aging:", aging);
    console.log("PO Type:", poType);
    console.log("From Date:", fromDate);
    console.log("To Date:", toDate);
    console.log("==================================");

    // --------------------------------
    // Fetch latest data from DB
    // --------------------------------

    const pendingPOs = await getPendingPOsByVendor({
      v_code,
      division,
      transYear,
      fromDate,
      toDate,
      aging,
      poType,
    });

    console.log(
      `Found ${pendingPOs.length} pending PO/PA records`
    );

    if (!pendingPOs.length) {
      throw new Error(
        `No pending PO/PA found for vendor ${v_code} with the selected filters.`
      );
    }

    const vendor = pendingPOs[0];

    // --------------------------------
    // Generate Excel
    // --------------------------------

    console.log("Generating pending PO Excel...");

    const {
      filePath,
      fileName,
    } = await generatePendingPOExcel(
      pendingPOs,
      vendor
    );

    console.log("Excel generated:", filePath);

    // --------------------------------
    // Email Data
    // --------------------------------

    const emailData = {
      ...vendor,

      // Complete pending PO list
      pendingPOs,

      // Count
      pending_count: pendingPOs.length,

      // Existing data
      user_id,
    };

    // --------------------------------
    // Email Subject
    // --------------------------------

    const subject =
      "URGENT: Pending Orders – Immediate Action & Dispatch Confirmation Required.";

    console.log("Sending bulk email to:", vendor.email);

    // --------------------------------
    // Send Email
    // --------------------------------

    await sendEmail.sendPOEmail(
      vendor.email,
      subject,
      pendingPOVendorBulkTemplate(emailData),
      filePath,
      fileName
    );

    console.log(
      `✅ Bulk pending PO email sent to ${vendor.email}`
    );

    // --------------------------------
    // Cleanup Excel
    // --------------------------------

    try {
      const fs = require("fs");

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);

        console.log(
          "Temporary Excel removed:",
          filePath
        );
      }
    } catch (cleanupError) {
      console.error(
        "Unable to remove temporary Excel:",
        cleanupError
      );
    }

    console.log(
      "Bulk pending PO process completed."
    );

  } catch (err) {
    console.error(
      "❌ Bulk pending PO email failed:",
      err
    );

    throw err;
  }
};

