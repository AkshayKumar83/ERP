
const {
    getPOAuthorizationEmailRecords,
    saveEmailHistory,
} = require("../../repository/emailNotification");

const sendEmail = require("../../utility/sendEmail");

const poAuthorizationOrderTemplate = require(
    "../../emailTemplates/poAuthorizationOrderTemplate"
);

const poAuthorizationAdviceTemplate = require(
    "../../emailTemplates/poAuthorizationAdviceTemplate"
);

const {
    generatePOPdf,
} = require("../../controllers/purchase/forms/purchaseOrder");




const sendPOAuthorizationEmail = async (poRecords, attachments) => {

    const firstPO = poRecords[0];

    const isPurchaseOrder = firstPO.po_type === "ORDER";

    // const subject = isPurchaseOrder
    //     ? "Purchase Order – Dispatch Within Contracted Timelines."
    //     : "Purchase Advice – Dispatch Within Contracted Timelines.";

    const subject = isPurchaseOrder
  ? "PURCHASE ORDER – DISPATCH WITHIN CONTRACTED TIMELINES."
  : "PURCHASE ADVICE – DISPATCH WITHIN CONTRACTED TIMELINES.";

    const template = isPurchaseOrder
        ? poAuthorizationOrderTemplate
        : poAuthorizationAdviceTemplate;

    const emailBody = template(poRecords);

    await sendEmail.sendMultipleAttachmentsEmail(
        firstPO.email,
        subject,
        emailBody,
        attachments
    );
};


module.exports = async ({ v_code, po_ids }) => {

    try {

        console.log("======================================");
        console.log("PO AUTHORIZATION EMAIL");
        console.log("Vendor Code:", v_code);
        console.log("PO IDs:", po_ids);
        console.log("======================================");


        if (!v_code) {
            throw new Error(
                "Vendor code is required for PO authorization email."
            );
        }

        if (!po_ids || po_ids.length === 0) {
            throw new Error(
                "PO IDs are required for PO authorization email."
            );
        }


        console.log("Fetching authorized POs...");

        const poRecords = await getPOAuthorizationEmailRecords(
            po_ids
        );


        if (!poRecords.length) {
            throw new Error(
                `No authorized POs found for vendor ${v_code}.`
            );
        }


        /*
         * Make sure all POs belong to the vendor
         * for which this job was created.
         */
        const invalidVendorPO = poRecords.find(
            (po) => po.v_code !== v_code
        );

        if (invalidVendorPO) {
            throw new Error(
                `PO ${invalidVendorPO.po_id} does not belong to vendor ${v_code}.`
            );
        }


        /*
         * Make sure vendor has an email.
         */
        const email = poRecords[0].email;

        if (!email) {
            throw new Error(
                `No email found for vendor ${v_code}.`
            );
        }


        /*
         * Generate PDFs for every PO.
         */
        const attachments = [];

        for (const po of poRecords) {

            console.log("--------------------------------------");
            console.log("Processing PO:", po.po_id);
            console.log("PO Number:", po.po_no);
            console.log("PO Type:", po.po_type);
            console.log("Vendor:", po.v_code);
            console.log("--------------------------------------");


            console.log("Generating PDF...");

            const pdfPath = await generatePOPdf(
                po.po_id,
                po.po_no
            );


            const documentName = po.po_type === "ORDER"
                ? "Purchase_Order"
                : "Purchase_Advice";


            const fileName = `${documentName}_${po.po_no}.pdf`;


            attachments.push({
                path: pdfPath,
                filename: fileName,
            });


            console.log(
                `PDF generated: ${fileName}`
            );
        }


        console.log("======================================");
        console.log("Sending vendor email");
        console.log("Vendor:", v_code);
        console.log("Email:", email);
        console.log("Attachments:", attachments);
        console.log("======================================");


        /*
         * ONE EMAIL PER VENDOR
         *
         * If vendor has 3 POs, attachments will contain
         * 3 PDFs but sendPOEmail() is called only once.
         */
        await sendPOAuthorizationEmail(
            poRecords,
            attachments
        );


        console.log(
            `Email sent successfully to vendor ${v_code}`
        );


        /*
         * Save history for each PO.
         */
        for (const po of poRecords) {

            await saveEmailHistory(po);

            console.log(
                `Email history saved for PO ${po.po_no}`
            );
        }


        console.log(
            `PO authorization email processing completed for vendor ${v_code}`
        );

    } catch (err) {

        console.error(
            "PO Authorization Email Failed:",
            err
        );

        /*
         * Re-throw so pg-boss knows the job failed
         * and can retry it.
         */
        throw err;
    }
};