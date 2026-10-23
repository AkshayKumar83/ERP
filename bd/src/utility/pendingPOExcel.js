const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");

const generatePendingPOExcel = async (pendingPOs, vendor) => {
  if (!pendingPOs || pendingPOs.length === 0) {
    throw new Error("No pending PO records found.");
  }

  const workbook = new ExcelJS.Workbook();

  const worksheet = workbook.addWorksheet("Pending PO List");

  // ---------------------------------------
  // Title
  // ---------------------------------------

  worksheet.mergeCells("A1:J1");

  const titleCell = worksheet.getCell("A1");

  titleCell.value =
    "PENDING PURCHASE ORDER / PURCHASE ADVICE LIST";

  titleCell.font = {
    bold: true,
    size: 16,
  };

  titleCell.alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  worksheet.getRow(1).height = 28;

  // ---------------------------------------
  // Vendor Information
  // ---------------------------------------

  worksheet.getCell("A3").value = "Vendor Code";
  worksheet.getCell("B3").value = vendor.v_code || "";

  worksheet.getCell("A4").value = "Vendor Name";
  worksheet.getCell("B4").value = vendor.v_name || "";

  worksheet.getCell("A5").value = "Generated On";
  worksheet.getCell("B5").value = new Date();

  worksheet.getCell("A6").value = "Total Pending Documents";
  worksheet.getCell("B6").value = pendingPOs.length;

  ["A3", "A4", "A5", "A6"].forEach((cell) => {
    worksheet.getCell(cell).font = {
      bold: true,
    };
  });

  // ---------------------------------------
  // Headers
  // ---------------------------------------

  const headerRowNumber = 8;

  const headers = [
    "PO NO",
    "PO TYPE",
    "PO DATE",
    "PENDING AGE IN DAYS",
    "CUSTOMER CODE",
    "DEALER CODE",
    "DEALER NAME",
    "PO BASIC VALUE",
    "GST VALUE",
    "TOTAL VALUE",
  ];

  const headerRow = worksheet.getRow(headerRowNumber);

  headers.forEach((header, index) => {
    headerRow.getCell(index + 1).value = header;
  });

  headerRow.font = {
    bold: true,
  };

  headerRow.alignment = {
    horizontal: "center",
    vertical: "center",
    wrapText: true,
  };

  headerRow.height = 30;

  // ---------------------------------------
  // Data
  // ---------------------------------------

  pendingPOs.forEach((po) => {
    const row = worksheet.addRow([
      // PO NO
      po.po_no || "",

      // PO TYPE
      po.po_type || "",

      // PO DATE
      po.po_date || "",

      // PENDING AGE
      Number(po.pending_age || 0),

      // CUSTOMER CODE
      po.customer_code || po.c_code || "",

      // DEALER CODE
      po.dealer_code || "",

      // DEALER NAME
      po.dealer_name || "",

      // PO BASIC VALUE
      Number(po.basic_value || 0),

      // GST VALUE
      Number(po.gst_value || 0),

      // TOTAL VALUE
      Number(po.total_amount || 0),
    ]);

    // ---------------------------------------
    // Date formatting
    // ---------------------------------------

    row.getCell(3).numFmt = "dd-mmm-yyyy";

    // ---------------------------------------
    // Pending Age formatting
    // ---------------------------------------

    row.getCell(4).alignment = {
      horizontal: "center",
      vertical: "center",
    };

    // ---------------------------------------
    // Amount formatting
    // ---------------------------------------

    row.getCell(8).numFmt = "#,##0.00";
    row.getCell(9).numFmt = "#,##0.00";
    row.getCell(10).numFmt = "#,##0.00";

    row.getCell(8).alignment = {
      horizontal: "right",
    };

    row.getCell(9).alignment = {
      horizontal: "right",
    };

    row.getCell(10).alignment = {
      horizontal: "right",
    };
  });

  // ---------------------------------------
  // Column Widths
  // ---------------------------------------

  const columnWidths = [
    22, // PO NO
    15, // PO TYPE
    15, // PO DATE
    22, // PENDING AGE
    18, // CUSTOMER CODE
    18, // DEALER CODE
    30, // DEALER NAME
    20, // PO BASIC VALUE
    18, // GST VALUE
    20, // TOTAL VALUE
  ];

  columnWidths.forEach((width, index) => {
    worksheet.getColumn(index + 1).width = width;
  });

  // ---------------------------------------
  // Freeze header
  // ---------------------------------------

  worksheet.views = [
    {
      state: "frozen",
      ySplit: headerRowNumber,
    },
  ];

  // ---------------------------------------
  // Auto Filter
  // ---------------------------------------

  worksheet.autoFilter = {
    from: `A${headerRowNumber}`,
    to: `J${headerRowNumber + pendingPOs.length}`,
  };

  // ---------------------------------------
  // Borders
  // ---------------------------------------

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber >= headerRowNumber) {
      row.eachCell((cell) => {
        cell.border = {
          top: {
            style: "thin",
          },
          left: {
            style: "thin",
          },
          bottom: {
            style: "thin",
          },
          right: {
            style: "thin",
          },
        };
      });
    }
  });

  // ---------------------------------------
  // Create temp directory
  // ---------------------------------------

  const tempDir = path.join(process.cwd(), "temp");

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, {
      recursive: true,
    });
  }

  // ---------------------------------------
  // File name
  // ---------------------------------------

  const fileName = `Pending_PO_List_${vendor.v_code}.xlsx`;

  const filePath = path.join(tempDir, fileName);

  // ---------------------------------------
  // Write Excel
  // ---------------------------------------

  await workbook.xlsx.writeFile(filePath);

  console.log("Excel generated:", filePath);

  return {
    filePath,
    fileName,
  };
};

module.exports = generatePendingPOExcel;