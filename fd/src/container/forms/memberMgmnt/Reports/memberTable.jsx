import React, { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    TextField,
    Paper,
    TablePagination,
    Button,
    Stack,
} from "@mui/material";

function MemberTable({ data }) {
    const [orderDirection, setOrderDirection] = useState("asc");
    const [orderBy, setOrderBy] = useState("member_id");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);

    const columns = [
        "member_id",
        "dealer_code",
        "member_no",
        "division",
        "member_status",
        "dlr_name",
        "dlr_active",
        "member_active",
        "dlr_gstin",
        "dlr_email",
        "dlr_alt_email",
        "member_date",
        "member_board_appnt_date",
        "member_board_cease_date",
        "member_board_reinstate",
        "dlr_inoperative",
        "membership_fee",
        "member_form",
        "other",
        "pay_instr_no",
        "pay_instr_date",
        "create_id",
        "create_date",
        "update_id",
        "update_date",
        "start_kit_tool",
        "start_kit_uniform",
        "start_kit_promotion",
        "start_kit_stationery",
        "start_kit_all",
        "member_fee_amount",
        "forfeiture_amount",
        "facebook_acc",
    ];

    const handleSort = (property) => {
        const isAsc = orderBy === property && orderDirection === "asc";
        setOrderDirection(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    const handleChangePage = (event, newPage) => setPage(newPage);

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Filter search across all fields
    const filteredData = data.filter((row) =>
        Object.values(row).some((val) =>
            val?.toString().toLowerCase().includes(search.toLowerCase())
        )
    );

    // Sort
    const sortedData = [...filteredData].sort((a, b) => {
        if (a[orderBy] == null) return 1;
        if (b[orderBy] == null) return -1;
        if (typeof a[orderBy] === "number" && typeof b[orderBy] === "number") {
            return orderDirection === "asc"
                ? a[orderBy] - b[orderBy]
                : b[orderBy] - a[orderBy];
        }
        return orderDirection === "asc"
            ? a[orderBy].toString().localeCompare(b[orderBy].toString())
            : b[orderBy].toString().localeCompare(a[orderBy].toString());
    });

    // Pagination slice
    const paginatedData = sortedData.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    // Export Helpers
    // 1. CSV and XLS format export function
    const exportToCSVOrExcel = (filename, isExcel = false) => {
        // Create CSV string
        const header = columns.join(",");
        const rows = sortedData.map((row) =>
            columns
                .map(
                    (col) =>
                        `"${(row[col] ?? "").toString().replace(/"/g, '""')}"`
                )
                .join(",")
        );
        const csvContent = [header, ...rows].join("\r\n");

        if (isExcel) {
            // For .xls create simple HTML inside Blob:
            const htmlContent = `
        <html>
          <head><meta charset="UTF-8"></head>
          <body>
            <table border="1">
              <thead>
                <tr>${columns.map((c) => `<th>${c}</th>`).join("")}</tr>
              </thead>
              <tbody>
                ${sortedData
                    .map(
                        (row) =>
                            `<tr>${columns
                                .map((col) => `<td>${row[col] ?? ""}</td>`)
                                .join("")}</tr>`
                    )
                    .join("")}
              </tbody>
            </table>
          </body>
        </html>`;
            const blob = new Blob([htmlContent], {
                type: "application/vnd.ms-excel",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename + ".xls";
            a.click();
            URL.revokeObjectURL(url);
        } else {
            // CSV export
            const blob = new Blob([csvContent], {
                type: "text/csv;charset=utf-8;",
            });
            if (navigator.msSaveBlob) {
                // IE10+
                navigator.msSaveBlob(blob, filename + ".csv");
            } else {
                const link = document.createElement("a");
                if (link.download !== undefined) {
                    const url = URL.createObjectURL(blob);
                    link.setAttribute("href", url);
                    link.setAttribute("download", filename + ".csv");
                    link.style.visibility = "hidden";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            }
        }
    };

    // 2. PDF export using window.print (basic)
    const exportToPDF = () => {
        const printWindow = window.open("", "", "height=600,width=900");
        const styles = `
      <style>
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #999; padding: 8px; text-align: left; }
        th { background-color: #eee; }
      </style>`;
        const tableHtml = `
      <table>
        <thead>
          <tr>${columns.map((col) => `<th>${col}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${sortedData
              .map(
                  (row) =>
                      `<tr>${columns
                          .map((col) => `<td>${row[col] ?? ""}</td>`)
                          .join("")}</tr>`
              )
              .join("")}
        </tbody>
      </table>`;

        printWindow.document.write(
            "<html><head><title>Export PDF</title>" + styles + "</head><body>"
        );
        printWindow.document.write(tableHtml);
        printWindow.document.write("</body></html>");
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    return (
        <Paper sx={{ padding: 2 }}>
            <Stack direction="row" spacing={1} mb={2}>
                <Button
                    variant="outlined"
                    onClick={() => exportToCSVOrExcel("member_data", false)}
                >
                    Export CSV
                </Button>
                <Button
                    variant="outlined"
                    onClick={() => exportToCSVOrExcel("member_data", true)}
                >
                    Export Excel
                </Button>
                <Button variant="outlined" onClick={exportToPDF}>
                    Export PDF
                </Button>
            </Stack>

            <TextField
        label="Search..."
        variant="outlined"
        fullWidth
        size="small"
        margin="normal"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

            <TableContainer>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            {columns.map((col) => (
                                <TableCell key={col}>
                                    <TableSortLabel
                                        active={orderBy === col}
                                        direction={
                                            orderBy === col
                                                ? orderDirection
                                                : "asc"
                                        }
                                        onClick={() => handleSort(col)}
                                    >
                                        {col}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedData.map((row, idx) => (
                            <TableRow key={idx}>
                                {columns.map((col) => (
                                    <TableCell key={col}>
                                        {row[col] ?? "-"}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={sortedData.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 25, 50, 100]}
            />
        </Paper>
    );
}

export default MemberTable;
