const path = require("path");
const fs = require("fs");
const ExcelJS = require("exceljs");

const {
  prepareDealerBalanceLedger,
  getDealerBalanceLedgerData,
} = require("../repository/emailNotification");

module.exports = async ({
  member_no,
  user_id,
  fromDate,
  toDate,
  division,
  transYear,
  includUnposted,
  dealer_name,
}) => {

    console.log(`before calling prepare Dealer bal ledger ${division} and ${transYear} and fromdate ${fromDate}`)

  await prepareDealerBalanceLedger(
    member_no,
    fromDate,
    toDate,
    division,
    transYear,
    includUnposted,
    user_id,
    
  );

  const rows = await getDealerBalanceLedgerData(user_id);

  const workbook = new ExcelJS.Workbook();

  const worksheet = workbook.addWorksheet("SOA");

  worksheet.properties.defaultRowHeight = 20;

  worksheet.columns = [
    { width: 12 }, // Date
    { width: 15 }, // Voucher
    { width: 38 }, // Sub Account
    { width: 65 }, // Narration
    { width: 14 }, // Debit
    { width: 14 }, // Credit
    { width: 16 }, // Closing Balance
    { width: 8 }, // D/C
  ];

  //====================================================
  // Heading
  //====================================================

  worksheet.mergeCells("A1:H1");

  worksheet.getCell("A1").value = "ESCORTS DEALERS DEVELOPMENT ASSOCIATION LIMITED";

  worksheet.getCell("A1").font = {
    bold: true,
    size: 16,
  };

  worksheet.getCell("A1").alignment = {
    horizontal: "center",
  };

  worksheet.mergeCells("A2:H2");

  worksheet.getCell("A2").value = `${dealer_name}-${member_no}`;

  worksheet.getCell("A2").font = {
    bold: true,
    size: 11,
  };

  worksheet.getCell("A2").alignment = {
    horizontal: "center",
  };

  worksheet.mergeCells("A3:H3");

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
    "Sub Account",
    "Narration",
    "Debit",
    "Credit",
    "Closing Bal.",
    "D/C",
  ];

  const headerRow = worksheet.getRow(4);

  // headers.forEach((header, index) => {
  //   const cell = headerRow.getCell(index + 1);

  //   cell.value = header;

  //   cell.font = {
  //     bold: true,
  //   };

  //   cell.alignment = {
  //     horizontal: "center",
  //     vertical: "middle",
  //   };

  //   cell.border = {
  //     top: { style: "thin" },
  //     bottom: { style: "thin" },
  //     left: { style: "thin" },
  //     right: { style: "thin" },
  //   };
  // });


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

// Left-align ONLY Sub Account and Narration headers
headerRow.getCell(3).alignment = {
  horizontal: "left",
  vertical: "middle",
};

headerRow.getCell(4).alignment = {
  horizontal: "left",
  vertical: "middle",
};

headerRow.height = 22;

  headerRow.height = 22;

  //----------------------------------------------------

  let currentRow = 5;

  rows.forEach((row) => {
    // worksheet.addRow([
    //     row.voucher_dt,
    //     row.voucher_no,
    //     row.acc_desc,
    //     row.remarks,
    //     Number(row.ndb_amt || 0),
    //     Number(row.ncr_amt || 0),
    //     Number(row.running_balance || 0),
    //     row.balance_type
    // ]);

    const isClosingBalance =
      row.remarks && row.remarks.toUpperCase().includes("CLOSING BALANCE");

    worksheet.addRow([
      row.voucher_dt,
      row.voucher_no,
      row.party_reference,
      row.remarks,
      Number(row.ndb_amt || 0),
      Number(row.ncr_amt || 0),
      isClosingBalance ? "" : Number(row.running_balance || 0),
      row.balance_type,
    ]);

    const excelRow = worksheet.getRow(currentRow);

    for (let col = 1; col <= 8; col++) {
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

    excelRow.getCell(1).alignment = {
      horizontal: "center",
    };

    excelRow.getCell(2).alignment = {
      horizontal: "center",
    };

    excelRow.getCell(5).alignment = {
      horizontal: "right",
    };

    excelRow.getCell(6).alignment = {
      horizontal: "right",
    };

    excelRow.getCell(7).alignment = {
      horizontal: "right",
    };

    excelRow.getCell(8).alignment = {
      horizontal: "center",
    };

    excelRow.getCell(5).numFmt = "#,##0.00";
    excelRow.getCell(6).numFmt = "#,##0.00";
    excelRow.getCell(7).numFmt = "#,##0.00";

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

  const fileName = `DealerBalanceStatement_${member_no}_${Date.now()}.xlsx`;

  const filePath = path.join(reportsDir, fileName);

  await workbook.xlsx.writeFile(filePath);

  return filePath;
};
