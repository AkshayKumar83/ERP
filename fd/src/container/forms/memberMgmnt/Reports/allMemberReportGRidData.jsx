// import React from "react";
// import { DataGrid } from "@mui/x-data-grid";
// import Paper from "@mui/material/Paper";

// const columns = [
//   { field: "member_no", headerName: "Member No", width: 120 },
//   { field: "dlr_name", headerName: "Dealer Name", width: 180 },
//   { field: "dlr_alt_email", headerName: "Alt Email", width: 220 },
//   { field: "dlr_gstin", headerName: "Dealer GSTIN", width: 150 },
//   { field: "member_fee_amount", headerName: "Fee Amount", type: "number", width: 130,},

// ];

// const paginationModel = { page: 0, pageSize: 5 };

// const AllMemberReportGRidData = ({ rows }) => {
//   const mappedRows = rows.map((item, index) => ({
//     id: index + 1,
//     ...item,
//   }));

//   return (
//     <Paper sx={{ height: 500, width: "100%" }}>
//       <DataGrid
//         rows={mappedRows}
//         columns={columns}
//         initialState={{ pagination: { paginationModel } }}
//         pageSizeOptions={[5, 10, 20, 50]}
//         checkboxSelection
//         sx={{ border: 0 }}
//       />
//     </Paper>
//   );
// };

// export default AllMemberReportGRidData;


import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";

const AllMemberReportGridData = ({ rows }) => {
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    if (rows && rows.length > 0) {
      // jitne bhi DB ke fields hain unse columns bana do
      const dynamicCols = Object.keys(rows[0]).map((key) => ({
        field: key,
        headerName: key.replace(/_/g, " ").toUpperCase(),
        flex: 0, // responsive column width
      }));
      setColumns(dynamicCols);
    }
  }, [rows]);

  return (
    <div style={{ height: 400, width: "100%" }}>
      <DataGrid
        rows={rows.map((row, index) => ({ id: index + 1, ...row }))}
        columns={columns}
        pagination
        pageSize={10}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />
    </div>
  );
};

export default AllMemberReportGridData;

