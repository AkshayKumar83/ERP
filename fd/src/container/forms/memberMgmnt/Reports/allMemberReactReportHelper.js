import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const membershipInitialFormData = {
  report_type: "",
}

export const emfaInitialFormData = {
  
}


// export const exportToExcel = (rows, fileName = "Report.xlsx") => {
//   //  Data ko worksheet me convert karo
//   const worksheet = XLSX.utils.json_to_sheet(rows);

//   //  Workbook banao aur worksheet add karo
//   const workbook = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

//   //  Excel file generate aur download karo
//   const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
//   const data = new Blob([excelBuffer], { type: "application/octet-stream" });
//   saveAs(data, fileName);
// };


export const exportToExcel = (rows, fileName = "Report.xlsx") => {
  if (!rows || rows.length === 0) return;

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const data = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(data, fileName);
};
