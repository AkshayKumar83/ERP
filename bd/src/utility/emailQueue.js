// const { Queue } = require('bullmq');
// const IORedis = require('ioredis');

// const connection = new IORedis('redis://localhost:6379',{
//   maxRetriesPerRequest: null // 🚨 Required by BullMQ
// });

// const emailQueue = new Queue('email-queue', { connection });

// module.exports = emailQueue;




// require("dotenv").config();

// const { PgBoss } = require("pg-boss");

// const getPgBossConfig = () => {

//   switch (process.env.NODE_ENV) {

//     case "production":
//       return {
//         user: process.env.DB_USER_PROD,
//         password: process.env.DB_PASSWORD_PROD,
//         host: process.env.DB_HOST_PROD,
//         port: process.env.DB_PORT_PROD,
//         database: process.env.DB_NAME_PROD,
//         ssl: process.env.DB_SSL_CA
//           ? {
//               rejectUnauthorized: true,
//               ca: process.env.DB_SSL_CA,
//             }
//           : {
//               rejectUnauthorized: false,
//             },
//       };

//     case "testing":
//       return {
//         user: process.env.DB_USER_TEST,
//         password: process.env.DB_PASSWORD_TEST,
//         host: process.env.DB_HOST_TEST,
//         port: process.env.DB_PORT_TEST,
//         database: process.env.DB_NAME_TEST,
//       };

//     case "development":
//     default:
//       return {
//         user: process.env.DB_USER_DEV,
//         password: process.env.DB_PASSWORD_DEV,
//         host: process.env.DB_HOST_DEV,
//         port: process.env.DB_PORT_DEV,
//         database: process.env.DB_NAME_DEV,
//       };
//   }
// };

// const emailQueue = new PgBoss({
//   ...getPgBossConfig(),
//   application_name: "email-notification-service",
//   max: 5,
// });

// emailQueue.on("error", (error) => {
//   console.error("❌ pg-boss error:", error);
// });

// emailQueue.on("warning", (warning) => {
//   console.warn("⚠️ pg-boss warning:", warning);
// });

// module.exports = emailQueue;






require("dotenv").config();

const { PgBoss } = require("pg-boss");

const getPgBossConfig = () => {
  switch (process.env.NODE_ENV) {
    case "production":
      return {
        user: process.env.DB_USER_PROD,
        password: process.env.DB_PASSWORD_PROD,
        host: process.env.DB_HOST_PROD,
        port: Number(process.env.DB_PORT_PROD),
        database: process.env.DB_NAME_PROD,
        ssl: process.env.DB_SSL_CA
          ? {
              rejectUnauthorized: true,
              ca: process.env.DB_SSL_CA,
            }
          : {
              rejectUnauthorized: false,
            },
      };

    case "testing":
      return {
        user: process.env.DB_USER_TEST,
        password: process.env.DB_PASSWORD_TEST,
        host: process.env.DB_HOST_TEST,
        port: Number(process.env.DB_PORT_TEST),
        database: process.env.DB_NAME_TEST,
      };

    case "development":
    default:
      return {
        user: process.env.DB_USER_DEV,
        password: process.env.DB_PASSWORD_DEV,
        host: process.env.DB_HOST_DEV,
        port: Number(process.env.DB_PORT_DEV),
        database: process.env.DB_NAME_DEV,
      };
  }
};


const emailQueue = new PgBoss({
  ...getPgBossConfig(),

  application_name: "email-notification-service",

  // PostgreSQL connections for this PgBoss instance
  max: 5,

  // Optional but useful for faster job pickup
  newJobCheckIntervalSeconds: 2,
});

emailQueue.on("error", (error) => {
  console.error("❌ pg-boss error:", error);
});

emailQueue.on("warning", (warning) => {
  console.warn("⚠️ pg-boss warning:", warning);
});

module.exports = emailQueue;