const path = require("path");
const fs = require("fs");
const ExcelJS = require("exceljs");

const {
  getNextReportId,
  prepareLoanLedger,
  getLoanLedgerData,
} = require("../repository/emailNotification");


const { dateFormater, formatDateForExcel } = require("./constant");

module.exports = async (efa_id, user_id) => {
  const rep_id = await getNextReportId();

  await prepareLoanLedger(efa_id, user_id, rep_id);

  const rows = await getLoanLedgerData(efa_id);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("EMFA Ledger");

  worksheet.properties.defaultRowHeight = 20;

  worksheet.views = [
    {
      state: "frozen",
      ySplit: 3,
    },
  ];

  // =======================================
  // COLUMN WIDTHS
  // =======================================

  worksheet.columns = [
    { width: 10 }, // Level
    { width: 15 }, // Dealer Code
    { width: 15 }, // Member No
    { width: 30 }, // Dealership Name
    { width: 18 }, // Station
    { width: 35 }, // Scheme
    { width: 15 }, // EMFA No
    { width: 15 }, // EMFA Date
    { width: 15 }, // EMFA Amount
    { width: 15 }, // EMI Date
    { width: 18 }, // Initial EMI Amount
    { width: 18 }, // Actual EMI Amount
    { width: 15 }, // Bal Amt
    { width: 18 }, // Rect No
    { width: 15 }, // Rect Date
    { width: 15 }, // Receipt Amt
  ];

  // =======================================
  // EXCEL TITLE
  // =======================================

  worksheet.mergeCells("A1:P1");

  worksheet.getCell("A1").value =
    "ESCORTS DEALERS DEVELOPMENT ASSOCIATION LIMITED";

  worksheet.getCell("A1").font = {
    bold: true,
    size: 14,
  };

  worksheet.getCell("A1").alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  worksheet.mergeCells("A2:P2");

  worksheet.getCell("A2").value = "EMFA Ledger Report";

  worksheet.getCell("A2").font = {
    bold: true,
    size: 12,
  };

  worksheet.getCell("A2").alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  worksheet.getRow(1).height = 24;
  worksheet.getRow(2).height = 20;

  // =======================================
  // TABLE HEADER
  // =======================================

  const tableStartRow = 3;

  const headers = [
    "Level",
    "Dealer Code",
    "Member No",
    "Dealership Name",
    "Station",
    "Scheme",
    "EMFA No.",
    "EMFA Date",
    "EMFA Amount",
    "EMI Date",
    "Initial EMI Amount",
    "Actual EMI Amount",
    "Bal Amt",
    "Rect No",
    "Rect Date",
    "Receipt Amt",
  ];

  const headerRow = worksheet.getRow(tableStartRow);

  headers.forEach((header, index) => {
    const cell = headerRow.getCell(index + 1);

    cell.value = header;

    cell.font = {
      bold: true,
      color: {
        argb: "000000",
      },
    };

    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: "9FD5F6",
      },
    };

    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };

    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
      bottom: { style: "thin" },
    };
  });

  headerRow.height = 24;

  // =======================================
  // AUTO FILTER
  // =======================================

  worksheet.autoFilter = {
    from: {
      row: tableStartRow,
      column: 1,
    },
    to: {
      row: tableStartRow,
      column: 16,
    },
  };

  // =======================================
  // DATA ROWS
  // =======================================

  let currentRow = tableStartRow + 1;

  rows.forEach((row) => {
    // const efaApplicationDate = dateFormater(row.efa_application_date);
    const efaApplicationDate = formatDateForExcel(
      row.efa_application_date
    );

    worksheet.addRow([
      row.level,
      row.dealer_code,
      row.member_no,
      row.dealership_name,
      row.station,
      row.scheme,
      row.efa_number,

      // H - EMFA Date
      efaApplicationDate,

      // I - EMFA Amount
      Number(row.efa_amount || 0),

      // J - EMI Date
      row.emi_date,

      // K - Initial EMI Amount
      Number(row.initial_emi_amount || 0),

      // L - Actual EMI Amount
      Number(row.actual_emi_amount || 0),

      // M - Balance Amount
      Number(row.bal_amt || 0),

      // N - Receipt Number
      row.receipt_number,

      // O - Receipt Date
      row.receipt_date,

      // P - Receipt Amount
      Number(row.amount_recd || 0),
    ]);

    const excelRow = worksheet.getRow(currentRow);

    // =======================================
    // CELL BORDER + ALIGNMENT
    // =======================================

    for (let col = 1; col <= 16; col++) {
      const cell = excelRow.getCell(col);

      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" },
      };

      // Amount columns
      if ([9, 11, 12, 13, 16].includes(col)) {
        cell.alignment = {
          horizontal: "right",
          vertical: "middle",
        };
      } else {
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
        };
      }
    }

    // =======================================
    // LOAN ROW HIGHLIGHT
    // =======================================

    if (row.level === "Loan") {
      for (let col = 1; col <= 16; col++) {
        const cell = excelRow.getCell(col);

        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: {
            argb: "C6EFCE",
          },
        };

        cell.font = {
          bold: true,
        };
      }
    }

    // =======================================
    // NUMBER FORMATS
    // =======================================

    // EMFA Amount
    excelRow.getCell(9).numFmt = "#,##0.00";

    // Initial EMI Amount
    excelRow.getCell(11).numFmt = "#,##0.00";

    // Actual EMI Amount
    excelRow.getCell(12).numFmt = "#,##0.00";

    // Balance Amount
    excelRow.getCell(13).numFmt = "#,##0.00";

    // Receipt Amount
    excelRow.getCell(16).numFmt = "#,##0.00";

    // =======================================
    // DATE FORMAT
    // =======================================

    excelRow.getCell(8).numFmt = "dd-mm-yyyy";

    currentRow++;
  });

  // =======================================
  // CREATE REPORT DIRECTORY
  // =======================================

  const reportsDir = path.join(__dirname, "../reports");

  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, {
      recursive: true,
    });
  }

  // =======================================
  // WRITE FILE
  // =======================================

  const fileName = `EMFA_Ledger_${efa_id}_${Date.now()}.xlsx`;

  const filePath = path.join(reportsDir, fileName);

  await workbook.xlsx.writeFile(filePath);

  return filePath;
};

