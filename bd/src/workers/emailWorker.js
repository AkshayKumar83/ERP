

const emailQueue = require("../utility/emailQueue");
const pendingPO = require("../services/emailNotification/pendingPO");
const loanStatement = require("../services/emailNotification/loanStatement");
const loanOverdue = require("../services/emailNotification/loanOverdue");
const dealerBalanceStatement = require("../services/emailNotification/dealerBalanceStatement");
const vendorBalanceStatement = require("../services/emailNotification/vendorBalStatement");
const pendingPOVendorBulk = require("../services/emailNotification/pendingPOVendorBulk");
const poAuthorization = require("../services/emailNotification/poAuthorization");
const vendorPendingInvoice = require("../services/emailNotification/vendorPendingInvoice");

const QUEUE_NAME = "email-queue";

const processEmailJob = async ([job]) => {
  console.log("==================================");
  console.log("📨 EMAIL JOB RECEIVED");
  console.log("Job ID:", job.id);
  console.log("Job Data:", job.data);
  console.log("==================================");

  const {
    notificationType,
    ...data
  } = job.data;

  switch (notificationType) {
    case "PENDING_PO":
      return await pendingPO(data);

    case "LOAN_STATEMENT":
      return await loanStatement(data);

    case "LOAN_OVERDUE":
      return await loanOverdue(data);

    case "DEALER_BALANCE_STATEMENT":
      return await dealerBalanceStatement(data);

    case "VENDOR_BALANCE_STATEMENT":
      return await vendorBalanceStatement(data);

    case "PENDING_PO_VENDOR_BULK":
      return await pendingPOVendorBulk(data);

    case "PO_AUTHORIZATION":
    return await poAuthorization(data);

    case "VENDOR_PENDING_INVOICE":
    return await vendorPendingInvoice(data);


    default:
      throw new Error(
        `Unsupported notification type: ${notificationType}`
      );
  }
};

const startEmailWorker = async () => {
  try {
    console.log("=================================");
    console.log("🚀 Starting pg-boss email worker");
    console.log("=================================");

    await emailQueue.start();

    console.log("✅ pg-boss started");

    await emailQueue.createQueue(QUEUE_NAME, {
      retryLimit: 3,
      retryDelay: 10,
      retryBackoff: true,
    });

    console.log(`✅ Queue "${QUEUE_NAME}" ready`);

    await emailQueue.work(
      QUEUE_NAME,
      {
        localConcurrency: 5,
      },
      processEmailJob
    );

    console.log("🚀 Email worker is listening...");
  } catch (error) {
    console.error("❌ Email worker failed to start");
    console.error(error);

    process.exit(1);
  }
};

startEmailWorker();







// ## the below code for stoping the worker

// const shutdown = async (signal) => {
//   console.log(`\n🛑 Received ${signal}`);

//   try {
//     await emailQueue.stop({
//       graceful: true,
//       timeout: 30000,
//     });

//     console.log("✅ pg-boss stopped gracefully");

//     process.exit(0);
//   } catch (error) {
//     console.error("❌ Error during shutdown:", error);
//     process.exit(1);
//   }
// };

// process.on("SIGINT", () => shutdown("SIGINT"));
// process.on("SIGTERM", () => shutdown("SIGTERM"));