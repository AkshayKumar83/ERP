const {
  getVendorPendingInvoiceEmailRecord,
  saveVendorPendingInvoiceEmailHistory,
} = require("../../repository/emailNotification");

const { sendEmail } = require("../../utility/sendEmail");

const vendorPendingInvoiceTemplate = require(
  "../../emailTemplates/vendorPendingInvoiceTemplate"
);

module.exports = async ({ v_code, user_id }) => {
  try {
    if (!v_code) {
      throw new Error(
        "Vendor code is required for pending invoice email."
      );
    }

    // Get vendor details
    const vendor =
      await getVendorPendingInvoiceEmailRecord(v_code);

    if (!vendor) {
      throw new Error(
        `Vendor ${v_code} not found.`
      );
    }

    // Vendor must have an email
    if (!vendor.email) {
      throw new Error(
        `No email found for vendor ${v_code}.`
      );
    }

    const subject = "SUBMISSION OF PENDING INVOICES – IMMEDIATE ACTION REQUIRED.";

    const html =
      vendorPendingInvoiceTemplate();

    // Send email
    await sendEmail(
      vendor.email,
      subject,
      html
    );

    // Save email history
    await saveVendorPendingInvoiceEmailHistory({
      v_code: vendor.v_code,
      email: vendor.email,
      user_id,
    });

    console.log(
      `✅ Vendor Pending Invoice email sent to ${vendor.v_code}`
    );

    return {
      success: true,
      v_code: vendor.v_code,
      email: vendor.email,
    };

  } catch (error) {
    console.error(
      `❌ Vendor Pending Invoice Email Failed for ${v_code}:`,
      error
    );

    throw error;
  }
};