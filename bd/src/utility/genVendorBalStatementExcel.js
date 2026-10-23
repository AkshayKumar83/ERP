const path = require("path");
const fs = require("fs");
const ExcelJS = require("exceljs");

const {
  prepareVendorBalanceLedger,
  getVendorBalanceLedgerData,
} = require("../repository/emailNotification");

module.exports = async ({
  v_code,
  user_id,
  fromDate,
  toDate,
  division,
  transYear,
  includUnposted,
  v_name,
}) => {

    console.log(`before calling prepare vendor bal ledger ${division} and ${transYear} and fromdate ${fromDate}`)

  await prepareVendorBalanceLedger(
    v_code,
    fromDate,
    toDate,
    division,
    transYear,
    includUnposted,
    user_id,
    
  );

  const rows = await getVendorBalanceLedgerData(user_id);

  const workbook = new ExcelJS.Workbook();

  const worksheet = workbook.addWorksheet("SOA");

  worksheet.properties.defaultRowHeight = 20;



worksheet.columns = [
  { width: 12 }, // Date
  { width: 15 }, // Voucher No.
  { width: 30 }, // Purpose
  { width: 25 }, // Party Reference
  { width: 65 }, // Narration
  { width: 16 }, // Bill No.
  { width: 16 }, // Bill Date
  { width: 16 }, // Cheque No.
  { width: 16 }, // Cheque Date
  { width: 14 }, // Debit
  { width: 14 }, // Credit
  { width: 16 }, // Closing Balance
  { width: 8 },  // D/C
];
  //====================================================
  // Heading
  //====================================================

//   worksheet.mergeCells("A1:H1");
worksheet.mergeCells("A1:I1");

  worksheet.getCell("A1").value = "ESCORTS DEALERS DEVELOPMENT ASSOCIATION LIMITED";

  worksheet.getCell("A1").font = {
    bold: true,
    size: 16,
  };

  worksheet.getCell("A1").alignment = {
    horizontal: "center",
  };

//   worksheet.mergeCells("A2:H2");
worksheet.mergeCells("A2:I2");

  worksheet.getCell("A2").value = `${v_name}-${v_code}`;

  worksheet.getCell("A2").font = {
    bold: true,
    size: 11,
  };

  worksheet.getCell("A2").alignment = {
    horizontal: "center",
  };

//   worksheet.mergeCells("A3:H3");
worksheet.mergeCells("A3:I3");

  worksheet.getCell("A3").value =
    `BALANCE CONFIRMATION STATEMENT AS ON ${toDate}`;

  worksheet.getCell("A3").font = {
    bold: true,
    size: 11,
  };

  worksheet.getCell("A3").alignment = {
    horizontal: "center",
  };

  //---------------------------------------------------

const headers = [
  "Date",
  "Voucher No.",
  "Purpose",
  "Party Reference",
  "Narration",
  "Bill No.",
  "Bill Date",
  "Cheque No.",
  "Cheque Date",
  "Debit",
  "Credit",
  "Closing Bal.",
  "D/C",
];

  const headerRow = worksheet.getRow(4);

  headers.forEach((header, index) => {
    const cell = headerRow.getCell(index + 1);

    cell.value = header;

    cell.font = {
      bold: true,
    };

    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    cell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };
  });

  headerRow.getCell(3).alignment = {
  horizontal: "left",
  vertical: "middle",
};

headerRow.getCell(4).alignment = {
  horizontal: "left",
  vertical: "middle",
};

headerRow.getCell(5).alignment = {
  horizontal: "left",
  vertical: "middle",
};

headerRow.height = 22;

  // headerRow.height = 22;

  //----------------------------------------------------

  let currentRow = 5;

  rows.forEach((row) => {


    const isClosingBalance =
      row.remarks && row.remarks.toUpperCase().includes("CLOSING BALANCE");


worksheet.addRow([
  row.voucher_dt,
  row.voucher_no,
  row.purpose,
  row.party_reference,
  row.remarks,

  // New columns
  row.bill_no,
  row.bill_dt,
  row.chq_no,
  row.chq_dt,

  // Amount columns
  Number(row.ndb_amt || 0),
  Number(row.ncr_amt || 0),
  isClosingBalance ? "" : Number(row.running_balance || 0),
  row.balance_type,
]);

    const excelRow = worksheet.getRow(currentRow);

  //  for (let col = 1; col <= 9; col++) {
  //     const cell = excelRow.getCell(col);

  //     cell.border = {
  //       top: { style: "thin" },
  //       left: { style: "thin" },
  //       right: { style: "thin" },
  //       bottom: { style: "thin" },
  //     };

  //     cell.alignment = {
  //       vertical: "middle",
  //     };
  //   }

  for (let col = 1; col <= 13; col++) {
  const cell = excelRow.getCell(col);

  cell.border = {
    top: { style: "thin" },
    left: { style: "thin" },
    right: { style: "thin" },
    bottom: { style: "thin" },
  };

  cell.alignment = {
    vertical: "middle",
  };
}

// Date
excelRow.getCell(1).alignment = {
  horizontal: "center",
  vertical: "middle",
};

// Voucher No.
excelRow.getCell(2).alignment = {
  horizontal: "center",
  vertical: "middle",
};

// Purpose
excelRow.getCell(3).alignment = {
  horizontal: "left",
  vertical: "middle",
};

// Party Reference
excelRow.getCell(4).alignment = {
  horizontal: "left",
  vertical: "middle",
};

// Narration
excelRow.getCell(5).alignment = {
  horizontal: "left",
  vertical: "middle",
};

// Bill No.
excelRow.getCell(6).alignment = {
  horizontal: "left",
  vertical: "middle",
};

// Bill Date
excelRow.getCell(7).alignment = {
  horizontal: "center",
  vertical: "middle",
};

// Cheque No.
excelRow.getCell(8).alignment = {
  horizontal: "left",
  vertical: "middle",
};

// Cheque Date
excelRow.getCell(9).alignment = {
  horizontal: "center",
  vertical: "middle",
};

// Debit
excelRow.getCell(10).alignment = {
  horizontal: "right",
  vertical: "middle",
};

// Credit
excelRow.getCell(11).alignment = {
  horizontal: "right",
  vertical: "middle",
};

// Closing Balance
excelRow.getCell(12).alignment = {
  horizontal: "right",
  vertical: "middle",
};

// D/C
excelRow.getCell(13).alignment = {
  horizontal: "center",
  vertical: "middle",
};


  excelRow.getCell(10).numFmt = "#,##0.00";
excelRow.getCell(11).numFmt = "#,##0.00";
excelRow.getCell(12).numFmt = "#,##0.00";

    //------------------------------------------------
    // Highlight Closing Balance row
    //------------------------------------------------

    if (isClosingBalance) {
      excelRow.font = {
        bold: true,
      };

      excelRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: "C6EFCE",
        },
      };
    }

    currentRow++;
  });

  //-----------------------------------------------------

  const reportsDir = path.join(__dirname, "../reports");

  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const fileName = `VendorBalanceStatement_${v_code}_${Date.now()}.xlsx`;

  const filePath = path.join(reportsDir, fileName);

  await workbook.xlsx.writeFile(filePath);

  return filePath;
};
