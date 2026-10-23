
import { saveAs } from "file-saver";
import * as XLSX from "xlsx-js-style";

export const exportToExcel = (data) => {
  if (!data || data.length === 0) {
    toast.error("No data to export");
    return;
  }

  const formattedData = data.map((row) => ({
    "Eff. Date": row.eff_date || "",
    "PO Date": row.po_date || "",
    "Vendor Code": row.v_code || "",
    "Vendor Name": row.v_name || "",
    "Item Code": row.it_code || "",
    "Item Name": row.it_name || "",
    "Purchase Advice":row.advice || "",
    "Ship To": row.ship_to || "",
    "Customer Name": row.c_name || "",
    "PO No": row.po_no || "",
    "PO Qty": Number(row.qty || 0),
    "Rate": Number(row.rate || 0),
    "Actual Receipt Qty": Number(row.receipt_qty || 0),
    "PO Closer": row.po_closer || "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  //  Column Width (auto spacing)
  worksheet["!cols"] = [
    { wch: 12 }, // Eff Date
    { wch: 12 }, // PO Date
    { wch: 15 },
    { wch: 25 },
    { wch: 12 },
    { wch: 25 },
    { wch: 25 },
    { wch: 12 },
    { wch: 25 },
    { wch: 18 },
    { wch: 12 },
    { wch: 12 },
    { wch: 18 },
    { wch: 10 },
  ];

  //  Header styling (bold)
  const range = XLSX.utils.decode_range(worksheet["!ref"]);

  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!worksheet[cellAddress]) continue;

    worksheet[cellAddress].s = {
      font: { bold: true },
      alignment: { horizontal: "center" },
      fill: {
        fgColor: { rgb: "D9D9D9" }, // light gray (dark feel)
      },
    };
  }

  //  Number alignment right
  const numberCols = ["K", "L", "M"]; // PO Qty, Rate, Actual Qty

  numberCols.forEach((col) => {
    for (let row = 1; row <= data.length; row++) {
      const cell = worksheet[`${col}${row + 1}`];
      if (cell) {
        cell.t = "n"; // number type
        cell.z = "0.00"; // format
      }
    }
  });

//   const centerCols = ["G","N"]; // PO Closer column

// centerCols.forEach((col) => {
//   for (let row = 0; row <= data.length; row++) {
//     const cell = worksheet[`${col}${row + 1}`];
//     if (cell) {
//      cell.s = {
//   alignment: { horizontal: "center", vertical: "center" }
// };
//     }
//   }
// });

const centerCols = ["G","N"];

centerCols.forEach((col) => {
  for (let row = 0; row <= data.length; row++) {
    const cell = worksheet[`${col}${row + 1}`];
    if (cell) {
      cell.s = {
        ...cell.s, //  existing style preserve karega
        alignment: { horizontal: "center", vertical: "center" }
      };
    }
  }
});

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "PO Data");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
    cellStyles: true, // important
  });

  const blob = new Blob([excelBuffer], {
    type: "application/octet-stream",
  });

  saveAs(blob, "Bulk_PO_Data.xlsx");
};


export const headers=[

    { label: "V Code", width:"50px",isHelpExist: true },
    { label: "Name", width:"200px" },
    { label: "Ship To", width:"50px" ,isHelpExist: true,},
    { label: "Name", width:"200px", },
    { label: "Po No", width:"130px",isHelpExist: true },
    { label: "Po value", width:"100px"},
    { label: "PO Closure", width:"60px"}, 
    { label: "PO Closure By", width:"200px" },
    { label: "PO Closure Date", width:"100px" },
  
]




 export const VendorHelpListHeader = [
  { label: "Vendor Code", key: "v_code" },
  { label: "Name", key: "v_name" },
];

export const shipToHelpListHeader = [

  { label: "Ship To", key: "c_code" },
  { label: "Name", key: "c_name" },
];

export const PoNoHelpListHeader = [

  { label: "PO No", key: "po_no" },
];



export const createSearchPayloadForBulkPoCreationSpecificSearch = (masterData) => {
  let payload = {};
  const row = masterData?.[0] || {};

  if (row.v_code) {
    payload.v_code = row.v_code;
  }

  if (row.c_code) {
    payload.c_code = row.c_code;
  }
  if (row.po_no) {
    payload.po_no = row.po_no;
  }

  return payload;
};
