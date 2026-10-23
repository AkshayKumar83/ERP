const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

module.exports = function generateInvoice(pInv_ID) {
  return new Promise((resolve, reject) => {
    const reportName = "invprint_ls";
    const outputFileName = `invoice_${pInv_ID}`;
    const outputPdfFile = `${outputFileName}.pdf`;

    const JAR_PATH = path.resolve(
      __dirname,
      "../../../reportGeneration/jasper-service/target/jasper-service-1.0-SNAPSHOT.jar"
    );

    const REPORT_DIR = path.resolve(
      __dirname,
      "../../../reportGeneration/reports/"
    );
    const finalFile = path.join(REPORT_DIR, outputPdfFile);

    const params = {
      pInv_id: { type: "Integer", value: pInv_ID },
    };

    const paramString = Object.entries(params)
      .map(([key, { type, value }]) => `${key}=${type}:${value}`)
      .join(" ");

    // ✅ Use outputFileName CLI param, not Jasper param
    const command = `java -jar "${JAR_PATH}" reportName=${reportName} outputFileName=${outputFileName} ${paramString}`;

    exec(
      command,
      {
        cwd: path.dirname(JAR_PATH),
        shell: "C:\\Windows\\System32\\cmd.exe",
      },
      (error, stdout, stderr) => {
        console.log(stdout);
        if (error || stderr) {
          console.error("❌ Jasper Error:", error?.message || stderr);
          return reject(new Error("Failed to generate PDF"));
        }

        console.log("✅ Checking for generated file:", finalFile);

        // Small delay to ensure file is flushed
        setTimeout(() => {
          if (!fs.existsSync(finalFile)) {
            return reject(new Error("Generated PDF not found"));
          }
          resolve(finalFile);
        }, 400);
      }
    );
  });
};
