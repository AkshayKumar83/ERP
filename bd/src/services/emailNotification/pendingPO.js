const {
  getPendingPOById,
  saveEmailHistory,
} = require("../../repository/emailNotification");

const sendEmail = require("../../utility/sendEmail");
const pendingPOTemplate = require("../../emailTemplates/pendingPOTemplate");
const {
  generatePOPdf,
} = require("../../controllers/purchase/forms/purchaseOrder");

// const generatePendingPOPdf = require("./pdf.service");

const sendPendingPOEmail = async (po, pdfPath) => {
  const documentName =
    po.po_type === "ORDER" ? "Purchase_Order" : "Purchase_Advice";
  const subjectPrefix =
    po.po_type === "ORDER" ? "Purchase Order" : "Purchase Advice";

  const fileName = `${documentName}_${po.po_no}.pdf`;

  let subject;

  if (po.pending_age > 0) {
    subject = `Reminder: ${subjectPrefix} ${po.po_no} Pending for ${po.pending_age} ${po.pending_age === 1 ? "Day" : "Days"}`;
  } else {
    subject = `${subjectPrefix} - ${po.po_no}`;
  }

  await sendEmail.sendPOEmail(
    po.email,
    subject,
    pendingPOTemplate(po),
    pdfPath,
    fileName,
  );
};


module.exports = async ({ po_id }) => {
  try {
    console.log("Fetching PO :", po_id);

    const po = await getPendingPOById(po_id);

    console.log("po from getPendingPOById", po);

    if (!po) {
      throw new Error("Purchase Order not found.");
    }

    console.log("Generating PDF...");

    const pdfPath = await generatePOPdf(po.po_id, po.po_no);

    console.log("Sending Email...");

    await sendPendingPOEmail(po, pdfPath);

    console.log("Saving Email History...");

    await saveEmailHistory(po);

    console.log("Email Sent Successfully");
  } catch (err) {
    console.error(err);
    throw err;
  }
};
