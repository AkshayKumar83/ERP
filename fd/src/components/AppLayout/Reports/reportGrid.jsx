



import React, {
  useState,
  useEffect,
  forwardRef,  // added for dasboard to pass excel download button
  useImperativeHandle, // added for dasboard to pass excel download button
} from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Menu, MenuItem, Box } from "@mui/material";
// YE SAB IMPORT ZAROORI HAIN (packages install kar lena)
import { saveAs } from "file-saver";
import Papa from "papaparse";
// import * as XLSX from "xlsx";
import * as XLSX from "xlsx-js-style";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // ← FIXED: Named import instead of string
import eddalLogo from "../../../assets/images/eddal_logo.jpg";
import { useNavigate } from "react-router-dom";

const ReportGrid = forwardRef(({
  columns,
  fetchData,
  headerEvents,  // ← Yeh ab optional banaya, kyuki ab onStateChange use karenge
  onStateChange, // ← NEW: Callback to notify parent about loading state
  reportTitle = "Report",
  companyName = "ESCORTS DEALERS DEVELOPMENT ASSOCIATION LIMITED",
  rowColorRules = [],
  // NEW
  rowsData = null,  // for dashboard
  showHeaderMenu = true, // for dashboard
  showExportMenu = true, // for dashboard
  gridHeight = "calc(100vh - 140px)", //for member dashboard
}, ref) => {

  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [visibleCols, setVisibleCols] = useState(
    Object.fromEntries(columns.map((c) => [c.field, true]))
  );
  const [colAnchor, setColAnchor] = useState(null);
  const [exportAnchor, setExportAnchor] = useState(null);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });
  const [computedColumns, setComputedColumns] = useState([]); // ← NEW: For auto-width columns
  const navigate = useNavigate();

  // ← NEW: Compute isDataLoaded state
  const isDataLoaded = !loading && rowCount > 0;

  // ← UPDATED: UseEffect for loadData – ab onStateChange call karo har baar jab loading change ho
  // below useEffect is correct 
  // useEffect(() => {
  //   const loadData = async () => {
  //     setLoading(true);
  //     try {
  //       const result = await fetchData(paginationModel);
  //       setRows(result.data);
  //       setRowCount(result.total);
  //     } catch (err) {
  //       console.error(err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   loadData();
  // }, [paginationModel, fetchData]);

  // above is correct below is chnage for dashbord

  useEffect(() => {

    // Dashboard mode
    if (rowsData) {

      const start = paginationModel.page * paginationModel.pageSize;

      setRows(
        rowsData.slice(
          start,
          start + paginationModel.pageSize
        )
      );

      setRowCount(rowsData.length);

      setLoading(false);

      return;
    }

    // Report mode
    const loadData = async () => {

      setLoading(true);

      try {

        const result = await fetchData(paginationModel);

        setRows(result.data);

        setRowCount(result.total);

      } finally {

        setLoading(false);

      }

    };

    loadData();

  }, [paginationModel, fetchData, rowsData]);



  // ← NEW: Notify parent on every state change (loading ya rowCount)
  useEffect(() => {
    if (onStateChange) {
      onStateChange({ isDataLoaded, loading, rowCount }); // Pass current state
    }
  }, [loading, rowCount, onStateChange]);

  // ← UPDATED: Old headerEvents ab optional – agar diya hai toh call karo (backward compat)
  useEffect(() => {
    if (typeof headerEvents === "function") {
      headerEvents({
        onColumnClick: (e) => setColAnchor(e.currentTarget),
        onExportClick: (e) => setExportAnchor(e.currentTarget),
        onExitClick: () => navigate(-1),
      });
    }
  }, [headerEvents, navigate]);

  useEffect(() => {
    setVisibleCols(Object.fromEntries(columns.map((c) => [c.field, true])));
  }, [columns]);


  useEffect(() => {
    if (typeof headerEvents === "function") {
      headerEvents({
        onColumnClick: (e) => setColAnchor(e.currentTarget),
        onExportClick: (e) => setExportAnchor(e.currentTarget),
        onExitClick: () => {
          // peeche jana
          navigate(-1);
          // ya agar specific route pe bhejna hai:
          // navigate("/material-acceptance-form");
        },
      });
    }
  }, [headerEvents, navigate, columns, fetchData]);

  // ← UPDATED: Auto-compute column widths balancing header & data (more generous for long data)
  useEffect(() => {
    if (columns.length === 0) return;

    const visibleColumns = columns.filter(c => visibleCols[c.field]);

    // agar rows 0 hain to simple default width ke saath columns set kar do
    if (rows.length === 0) {
      const basicCols = visibleColumns.map(col => ({
        ...col,
        width: col.width || 120,   // koi default width
        flex: undefined,
      }));
      setComputedColumns(basicCols);
      return;
    }
    // ← NEW: Calculate total width needed for all columns
    let totalComputedWidth = 0;
    const newComputedColumns = visibleColumns.map(col => {
      // Header length prioritized (bold + left)
      const headerLength = col.headerName.length;
      let maxDataLength = 0;
      rows.forEach(row => {
        const cellValue = String(row[col.field] || '').length;
        maxDataLength = Math.max(maxDataLength, cellValue);
      });
      // Balanced width: Header 10px/char, data 9px/char (generous for long data), min 80, max 250
      const headerWidth = headerLength * 10;
      const dataWidth = maxDataLength * 9;
      const width = Math.min(Math.max(Math.max(headerWidth, dataWidth), 80), 250);

      // ← NEW: Conditional wrap for data cells (>15 chars to avoid truncation), + date formatter
      // const isDateField = col.field.endsWith('_dt') || col.field.endsWith('_date');
      // const isDateField =
      //   col.field.toUpperCase().includes("DATE");
      // added y akshay 24-07-26
      const isDateField =
  col.field.toUpperCase().includes("DATE") ||
  col.field.toUpperCase().includes("_DT");

      const needsWrap = maxDataLength > 15 && !isDateField; // Don't wrap dates

      // Date fields get reduced width for compact display
      const finalWidth = isDateField ? Math.min(Math.max(80, headerLength * 10), 120) : width;

      totalComputedWidth += finalWidth; // ← Track total width

      const cellStyle = needsWrap ? {
        whiteSpace: 'normal',
        wordWrap: 'break-word',
        lineHeight: 1.2,
        overflow: 'visible'
      } : { whiteSpace: 'nowrap' };
      // ← FIXED: Safe string conversion before split
      // const valueFormatter = isDateField ? (value) => {
      //   if (!value) return '';
      //   const strValue = String(value);
      //   return strValue.split('T')[0];
      // } : undefined;

      const valueFormatter = isDateField
        ? (value) => {
          if (!value) return "";

          const strValue = String(value).split("T")[0];
          const [year, month, day] = strValue.split("-");

          return `${day}-${month}-${year}`;
        }
        : undefined;

      return {
        ...col,
        width: finalWidth, // Set computed width (compact for dates)
        flex: undefined, // Will set after checking total width
        minWidth: undefined, // Remove minWidth for auto-fit
        cellStyle, // Conditional wrap style
        valueFormatter, // Date formatter (no time)
        align: isDateField ? 'center' : col.align, // Center-align dates
        _originalWidth: finalWidth, // ← Store original width for flex calculation
      };
    });

    // ← NEW: If total width < screen width, use flex to expand columns proportionally
    const containerWidth = window.innerWidth - 40; // Account for margins and borders (~40px)
    if (totalComputedWidth < containerWidth) {
      // Calculate flex value for each column based on its proportion
      const finalColumns = newComputedColumns.map(col => {
        const flexValue = col._originalWidth / totalComputedWidth; // Proportional flex
        return {
          ...col,
          flex: flexValue, // Enable flex to fill remaining space
          width: undefined, // Remove fixed width when using flex
        };
      });
      setComputedColumns(finalColumns);
    } else {
      // If total width >= screen width, keep fixed widths for horizontal scroll
      const finalColumns = newComputedColumns.map(col => {
        const { _originalWidth, ...colWithoutTemp } = col;
        return {
          ...colWithoutTemp,
          width: _originalWidth,
          flex: undefined,
        };
      });
      setComputedColumns(finalColumns);
    }
  }, [rows, visibleCols, columns]); // Recompute on data/visibility change

  // Dynamic File Name (clean kar diya spaces aur special chars)
  const getFileName = (ext) => {
    const clean = reportTitle.replace(/[^a-zA-Z0-9]/g, "_");
    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    return `${clean}_${date}.${ext}`;
  };

  // HELPER: Fetch full data for export
  // const fetchFullData = async () => {
  //   if (rowCount === 0) return [];
  //   try {
  //     // Full data fetch: page 0, pageSize = total rows (ek call mein saara)
  //     const fullModel = { page: 0, pageSize: rowCount };
  //     const result = await fetchData(fullModel);
  //     return result.data || [];
  //   } catch (err) {
  //     console.error("Export data fetch error:", err);
  //     // Fallback to current rows if full fetch fails
  //     return rows;
  //   }
  // };

  // below fetch data function for dashbaord and report excel
  const fetchFullData = async () => {

    // Dashboard mode
    if (rowsData) {
      return rowsData;
    }

    // Report mode
    if (rowCount === 0) return [];

    try {
      const fullModel = {
        page: 0,
        pageSize: rowCount,
      };

      const result = await fetchData(fullModel);

      return result.data || [];

    } catch (err) {
      console.error(err);
      return rows;
    }
  };

  // EXPORT FUNCTIONS — AB FULL DATA EXPORT HOGA!
  const exportToCSV = async () => {
    setExportAnchor(null);
    const fullData = await fetchFullData();
    const visibleColumns = columns.filter(c => visibleCols[c.field]);
    const data = fullData.map(row =>
      visibleColumns.reduce((acc, col) => {
        let val = row[col.field] || "";
        // ← FIXED: Safe string conversion before split
        if ((col.field.endsWith('_dt') || col.field.endsWith('_date')) && val) {
          val = String(val).split('T')[0];
        }
        acc[col.headerName] = val;
        return acc;
      }, {})
    );
    // CSV optimize: Quotes around all fields for better Excel import, header uppercase
    const csvOptions = {
      header: true,
      quotes: true,
      quoteAllText: true, // All fields quoted to prevent comma issues
      delimiter: ',', // Standard comma
    };
    let csv = Papa.unparse(data, csvOptions);
    // Uppercase headers for distinction
    if (data.length > 0) {
      const headerLine = csv.split('\n')[0];
      const newHeaderLine = headerLine.replace(/"/g, '').split(',').map(h => h.toUpperCase()).join('","');
      csv = `"${newHeaderLine}"\n${csv.split('\n').slice(1).join('\n')}`;
    }
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, getFileName("csv"));
    console.log(`Exported ${fullData.length} rows to CSV with optimized quoting`); // Debug log
  };

  const exportToExcel = async () => {
    setExportAnchor(null);
    const fullData = await fetchFullData();
    const visibleColumns = columns.filter(c => visibleCols[c.field]);
    // Use AoA for better control (no empty columns, exact order)
    const headers = visibleColumns.map(col => col.headerName);
    const body = fullData.map(row =>
      visibleColumns.map(col => {
        let val = row[col.field];
        // ← FIXED: Safe string conversion before split
        if ((col.field.endsWith('_dt') || col.field.endsWith('_date')) && val) {
          val = String(val).split('T')[0];
        }
        // Ensure numbers are numbers for proper alignment/formatting
        return typeof val === 'number' ? val : (val || '');
      })
    );
    const aoa = [headers, ...body];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    // OPTIMIZATION: Styles aur Auto-fit
    const range = XLSX.utils.decode_range(ws['!ref']);
    const numRows = range.e.r + 1;
    const numCols = range.e.c + 1;
    // Header styling (row 1, index 0): Bold white text on BLACK bg (full dark), larger font, center
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!ws[cellAddress]) continue;
      // ws[cellAddress].s = { // Direct assign, no if check needed as we know it exists
      //   font: { bold: true, color: { rgb: "FFFFFF" }, sz: 14 }, // Bigger bold white text
      //   fill: { fgColor: { rgb: "000000" } }, // Full black background for strong contrast
      //   alignment: { horizontal: "center", vertical: "center", wrapText: true },
      //   border: {
      //     top: { style: "medium", color: { rgb: "FFFFFF" } }, // Thicker white border for visibility
      //     bottom: { style: "medium", color: { rgb: "FFFFFF" } },
      //     left: { style: "medium", color: { rgb: "FFFFFF" } },
      //     right: { style: "medium", color: { rgb: "FFFFFF" } }
      //   }
      // };

      ws[cellAddress].s = {
        font: { bold: true, color: { rgb: "FF000000" }, sz: 12 },
        fill: { fgColor: { rgb: "FFF2F2F2" } }, // 👈 light color
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
        border: {
          top: { style: "thin", color: { rgb: "FFCCCCCC" } },
          bottom: { style: "thin", color: { rgb: "FFCCCCCC" } },
          left: { style: "thin", color: { rgb: "FFCCCCCC" } },
          right: { style: "thin", color: { rgb: "FFCCCCCC" } }
        }
      };

    }
    // Data rows: Borders, alignment (dynamic based on col.align), ensure number type, normal font
    for (let R = 1; R < numRows; ++R) {

      const currentRow = fullData[R - 1];

      const matchedRule = rowColorRules.find(
        (rule) => currentRow[rule.field] === rule.value
      );

      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddress]) continue;
        const col = visibleColumns[C];
        const isNumberField = col.align === 'right';
        const cellValue = ws[cellAddress].v;
        // Force number type if it's a number field and value is numeric
        if (isNumberField && typeof cellValue === 'string' && !isNaN(cellValue) && cellValue !== '') {
          ws[cellAddress].t = 'n';
          ws[cellAddress].v = parseFloat(cellValue);
        } else if (isNumberField && typeof cellValue === 'number') {
          ws[cellAddress].t = 'n';
        }
        // ws[cellAddress].s = { // Direct assign
        //   font: { bold: false, sz: 11 }, // Normal, slightly smaller to contrast header
        //   alignment: {
        //     horizontal: isNumberField ? "right" : "left",
        //     vertical: "center",
        //     wrapText: true
        //   },
        //   border: {
        //     top: { style: "thin", color: { rgb: "CCCCCC" } },
        //     bottom: { style: "thin", color: { rgb: "CCCCCC" } },
        //     left: { style: "thin", color: { rgb: "CCCCCC" } },
        //     right: { style: "thin", color: { rgb: "CCCCCC" } }
        //   }
        // };

        // for excel download in acc to report color given
        ws[cellAddress].s = {
          font: {
            bold: false,
            sz: 11,
            color: matchedRule?.textColor
              ? { rgb: matchedRule.textColor.replace("#", "") }
              : undefined,
          },

          fill: matchedRule?.bgColor
            ? {
              fgColor: {
                rgb: matchedRule.bgColor.replace("#", "")
              }
            }
            : undefined,

          alignment: {
            horizontal: isNumberField ? "right" : "left",
            vertical: "center",
            wrapText: true
          },

          border: {
            top: { style: "thin", color: { rgb: "CCCCCC" } },
            bottom: { style: "thin", color: { rgb: "CCCCCC" } },
            left: { style: "thin", color: { rgb: "CCCCCC" } },
            right: { style: "thin", color: { rgb: "CCCCCC" } }
          }
        };
      }
    }
    // Auto-fit columns: Calculate max length per column, with extra padding for better spacing
    const colWidths = [];
    for (let C = 0; C < numCols; ++C) {
      let maxLength = 0;
      for (let R = 0; R < numRows; ++R) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (ws[cellAddress] && ws[cellAddress].v !== undefined) {
          const cellValue = String(ws[cellAddress].v).length;
          maxLength = Math.max(maxLength, cellValue);
        }
      }
      // Header length bhi consider kar
      const headerLength = visibleColumns[C] ? visibleColumns[C].headerName.length : 10;
      maxLength = Math.max(maxLength, headerLength);
      colWidths[C] = { wch: Math.min(Math.max(maxLength + 4, 12), 60) }; // Extra padding +4, min 12, max 60 for better spacing
    }
    ws['!cols'] = colWidths;
    XLSX.writeFile(wb, getFileName("xlsx"));
    console.log(`Exported ${fullData.length} rows to Excel with black header & extra spacing`); // Debug log
  };

  useImperativeHandle(ref, () => ({  // added for dashboard 

    exportExcel: exportToExcel,

    exportCSV: exportToCSV,

  }));

  //  const exportToPDF = async () => {
  //   setExportAnchor(null);
  //   const fullData = await fetchFullData();
  //   const visibleColumns = columns.filter(c => visibleCols[c.field]);
  //   const doc = new jsPDF("l", "mm", "a4"); // Landscape for more columns

  //   // Header: Logo left, title/company center, date right – TIGHTENED SPACING FOR SMALLER HEIGHT
  //   const pageWidth = doc.internal.pageSize.getWidth(); // ~297mm for A4 landscape? Wait, landscape is 297 width, 210 height.
  //   const centerX = pageWidth / 2;
  //   const rightX = pageWidth - 10;

  //   let headerY = 8; // Start even closer to top

  //   // Logo (smaller size for less height)
  //   if (eddalLogo) {
  //     try {
  //       doc.addImage(eddalLogo, "JPG", 10, headerY, 25, 10); // Width 25mm, height 10mm (reduced)
  //     } catch (err) {
  //       console.warn("Logo load error:", err);
  //     }
  //   }

  //   // Title (smaller font, closer)
  //   let titleY = headerY + 5; // ~13mm
  //   doc.setFontSize(14); // Slightly smaller
  //   doc.setFont("helvetica", "bold");
  //   doc.text(reportTitle, centerX, titleY, { align: "center" });

  //   // Company (tighter below)
  //   let companyY = titleY + 4; // ~17mm
  //   doc.setFontSize(9); // Smaller
  //   doc.setFont("helvetica", "normal");
  //   doc.text(companyName, centerX, companyY, { align: "center" });

  //   // Date (even closer, smaller font)
  //   let dateY = companyY + 3; // ~20mm
  //   doc.setFontSize(8);
  //   const shortDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  //   doc.text(`Generated: ${shortDate}`, rightX, dateY, { align: "right" });

  //   // Table start after minimal space (total header ~24mm now)
  //   const startY = dateY + 4; // ~24mm

  //   // Table Data: Headers as FIRST BODY ROW (no repeat on new pages)
  //   const headers = visibleColumns.map(c => c.headerName);
  //   const bodyRows = fullData.map(row =>
  //     visibleColumns.map(c => {
  //       let val = row[c.field] || "-";
  //       if ((c.field.endsWith('_dt') || c.field.endsWith('_date')) && val) {
  //         val = String(val).split('T')[0]; // ← FIXED: Safe string conversion
  //       }
  //       return val;
  //     })
  //   );
  //   const tableBody = [headers, ...bodyRows]; // Headers as first row of body

  //   autoTable(doc, {
  //     head: [], // No separate head (prevents auto-repeat)
  //     body: tableBody,
  //     startY: startY,
  //     theme: "grid",
  //     bodyStyles: {
  //       fontSize: 7, // Small for data
  //       cellPadding: 2 // Tight padding
  //     },
  //     styles: {
  //       overflow: 'linebreak', // Wrap long text
  //       halign: 'left', // Default
  //       cellPadding: 2
  //     },
  //     columnStyles: {}, // Will handle in hook
  //     margin: { top: 5, left: 10, right: 10, bottom: 10 }, // Smaller top margin for new pages (no header repeat)
  //     didParseCell: function(data) {
  //       // Style FIRST ROW (ex-headers) as bold blue head
  //       if (data.section === 'body' && data.row.index === 0) {
  //         data.cell.styles.fillColor = [41, 128, 185];
  //         data.cell.styles.textColor = 255;
  //         data.cell.styles.fontStyle = 'bold';
  //         data.cell.styles.fontSize = 9;
  //         data.cell.styles.halign = 'center'; // Center headers, or 'left' if you want
  //         data.cell.styles.valign = 'middle';
  //       } else {
  //         // Normal data rows: Align based on column
  //         const colIndex = data.column.index;
  //         const col = visibleColumns[colIndex];
  //         const isNumberField = col.align === 'right';
  //         data.cell.styles.halign = isNumberField ? 'right' : 'left';
  //         data.cell.styles.fontSize = 7;
  //         // Number formatting
  //         if (isNumberField && typeof data.cell.text[0] === 'string' && !isNaN(data.cell.text[0])) {
  //           data.cell.text[0] = parseFloat(data.cell.text[0]).toFixed(2);
  //         }
  //       }
  //     },
  //     pageBreak: 'auto'
  //   });
  //   doc.save(getFileName("pdf"));
  //   console.log(`Exported ${fullData.length} rows to PDF (no header repeat, smaller height)`);
  // };

  const toggleCol = (field) => {
    setVisibleCols(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // ← UPDATED: Use computedColumns for auto-width (no flex, fixed widths based on content)
  const getDynamicColumns = () => {
    return computedColumns.map(col => ({
      ...col,
      align: col.align || 'left', // Use parent's align if set, else left
      headerAlign: 'left', // ← CHANGED: Header left-aligned (no center)
    }));
  };



  // Row class name for consistent zebra striping on scroll
  // const getRowClassName = (params) => {
  //   // Use row id for consistent striping (even if virtual scroll)
  //   const rowIndex = rows.findIndex(r => r.id === params.id);
  //   return rowIndex % 2 === 0 ? 'even-row' : 'odd-row';
  // };  

  const getRowClassName = (params) => {
    if (params.row.id === "total-row") {
      return "total-row";
    }

    const ruleIndex = rowColorRules.findIndex(
      (r) => params.row[r.field] === r.value
    );

    if (ruleIndex >= 0) {
      return `dynamic-row-${ruleIndex}`;
    }

    const rowIndex = rows.findIndex((r) => r.id === params.id);

    return rowIndex % 2 === 0 ? "even-row" : "odd-row";
  };



  const dynamicRowStyles = {};

  rowColorRules.forEach((rule, index) => {
    dynamicRowStyles[`& .dynamic-row-${index} .MuiDataGrid-cell`] = {
      backgroundColor: `${rule.bgColor} !important`,
      color: `${rule.textColor || "#000"} !important`,
    };

    dynamicRowStyles[`& .dynamic-row-${index}:hover .MuiDataGrid-cell`] = {
      backgroundColor: `${rule.bgColor} !important`,
      color: `${rule.textColor || "#000"} !important`,
    };
  });

  // console.log("rowColorRules =>", rowColorRules);

  return (
    <Box
      sx={{
        mx: "10px",
        my: "10px",
        background: "#fff",
        borderRadius: "12px",
        border: "1px solid #d0d0d0",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        // height: "calc(100vh - 140px)",
        height: gridHeight,
        overflow: "hidden",
      }}
    >
      <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
        <DataGrid
          rows={rows}
          columns={computedColumns.length > 0 ? getDynamicColumns() : columns} // ← Use computed auto-width columns

          // getRowClassName={(params) => {
          //   const rowIndex = rows.findIndex((r) => r.id === params.id);
          //   const zebraClass =
          //     rowIndex % 2 === 0 ? "even-row" : "odd-row";

          //   const ruleIndex = rowColorRules.findIndex(
          //     (r) => params.row[r.field] === r.value
          //   );

          //   return ruleIndex >= 0
          //     ? `dynamic-row-${ruleIndex}`
          //     : zebraClass;
          // }}

          rowCount={rowCount}
          loading={loading}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
          rowHeight={30} // ← CELL HEIGHT CHOTI KAR DI (38 se 32px)
          columnHeaderHeight={40}
          getRowClassName={getRowClassName} // ← ZEBRA STRIPING FIX ON SCROLL




          sx={{
            height: "100%",
            border: "none",
            ...dynamicRowStyles,
            // FINAL HORIZONTAL SCROLL FIX — NO EXTRA SPACE
            "& .MuiDataGrid-main": { overflow: "hidden" },
            "& .MuiDataGrid-virtualScroller": {
              overflowX: "auto",
              overflowY: "auto",
              "&::-webkit-scrollbar": { height: 8, width: 8 },
              "&::-webkit-scrollbar-thumb": { backgroundColor: "#aaa", borderRadius: 4 },
            },
            // HEADER — BOLD FONT WAPAS AAYA! + WRAP FOR LONG HEADERS
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#ffffff",
              borderBottom: "2px solid #c8c8c8",
              minHeight: "40px !important",
              maxHeight: "40px !important",
            },
            "& .MuiDataGrid-columnHeader": {
              padding: "0 10px",
              borderRight: "1px solid #e0e0e0",
              whiteSpace: "normal", // Allow wrap for long headers
              wordWrap: "break-word",
              lineHeight: 1.2,
            },
            "& .MuiDataGrid-columnHeader:last-child": { borderRight: "none" },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontSize: "13px",
              fontWeight: 700, // BOLD WAPAS!
              color: "#222",
              textAlign: "left", // ← CHANGED: Left align for headers
              whiteSpace: "normal", // Ensure no truncation
              overflow: "visible",
            },
            // ROWS & CELLS — GREY COLOR DARK KAR DIYA + ZEBRA FIX + CONDITIONAL WRAP (per-column)
            "& .MuiDataGrid-row": {
              minHeight: "30px !important",
              maxHeight: "30px !important",
              // "&:hover": { backgroundColor: "#edf5ff !important" }, // Hover override
            },
            // ← FIXED ZEBRA STRIPING: Use nth-of-type for DOM position-based alternating (consistent after filters, no index dependency)
            // "& .MuiDataGrid-row:nth-of-type(even)": {
            //   backgroundColor: "#e9ecef !important"
            // },
            // "& .MuiDataGrid-row:nth-of-type(odd)": { 
            //   backgroundColor: "#ffffff !important" 
            // },

            "& .MuiDataGrid-cell": {
              fontSize: "12px",
              fontWeight: 600,
              color: "#333",
              // NO GLOBAL ALIGN — COLUMN ALIGN TAKE OVER KAREGA
              padding: "0 10px",
              borderRight: "1px solid #e8e8e8",
              borderBottom: "1px solid #e8e8e8",
              minHeight: "30px !important",
              maxHeight: "30px !important",
              display: "flex",
              alignItems: "center",
            },
            "& .MuiDataGrid-cell:last-child": { borderRight: "none" },
            "& .MuiDataGrid-row:last-child .MuiDataGrid-cell": { borderBottom: "none" },
            // FOOTER — SCROLLBAR HATA DIYA + STABLE
            "& .MuiDataGrid-footerContainer": {
              borderTop: "2px solid #c8c8c8",
              backgroundColor: "#fafafa",
              height: "52px !important",
              minHeight: "52px !important",
              maxHeight: "52px !important",
              justifyContent: "flex-start",
              paddingLeft: "16px",
              paddingRight: "16px",
              overflow: "hidden", // ← SCROLLBAR HATA DIYA
            },
            "& .MuiTablePagination-root": {
              height: "52px !important",
              overflow: "hidden", // ← FOOTER SCROLLBAR HATA DIYA
            },
            "& .MuiTablePagination-toolbar": {
              height: "52px !important",
              minHeight: "52px !important",
              padding: 0,
              alignItems: "center",
              fontSize: "13px",
              fontWeight: 600,
              width: "100%", // ← FULL WIDTH, NO OVERFLOW
              overflow: "hidden",
            },
            "& .MuiTablePagination-displayedRows": { margin: 0 },
            "& .MuiTablePagination-selectLabel": { margin: 0 },
            "& .MuiDataGrid-columnSeparator": { display: "none" },

            "& .even-row": {
              backgroundColor: "#e9ecef",
            },
            "& .even-row:hover": {
              backgroundColor: "#e9ecef !important",
            },

            "& .odd-row": {
              backgroundColor: "#ffffff",
            },
            "& .odd-row:hover": {
              backgroundColor: "#ffffff !important",
            },
            // TOTAL ROW
            "& .total-row": {
              backgroundColor: "#ffcc80 !important", // light orange
            },

            "& .total-row:hover": {
              backgroundColor: "#ffcc80 !important",
            },

            "& .total-row .MuiDataGrid-cell": {
              backgroundColor: "#ffc3b8 !important",
              fontWeight: 700,
              color: "#000",
              borderTop: "2px solid #ef6c00",
              borderBottom: "2px solid #ef6c00",
            },

          }}
        />
      </Box>

      {/* Column Menu */}
      {showHeaderMenu && (  // for dasboard pass state
        <Menu anchorEl={colAnchor} open={Boolean(colAnchor)} onClose={() => setColAnchor(null)}>
          {columns.map((col) => (
            <MenuItem key={col.field} onClick={() => toggleCol(col.field)}>
              <input type="checkbox" checked={visibleCols[col.field]} readOnly />
              &nbsp; {col.headerName}
            </MenuItem>
          ))}
        </Menu>
      )}

      {/* Export Menu — SAB WORKING, AB FULL DATA KE SAATH */}
      {showExportMenu && (  // for dasboard pass state
        <Menu
          anchorEl={exportAnchor}
          open={Boolean(exportAnchor)}
          onClose={() => setExportAnchor(null)}
          PaperProps={{
            sx: { borderRadius: "10px", boxShadow: "0 8px 30px rgba(0,0,0,0.15)", minWidth: 180 },
          }}
        >
          {/* <MenuItem onClick={exportToPDF}>
          Download PDF
        </MenuItem> */}
          <MenuItem onClick={exportToExcel}>
            Download Excel (.xlsx)
          </MenuItem>
          <MenuItem onClick={exportToCSV}>
            Download CSV
          </MenuItem>
        </Menu>
      )}
    </Box>
  );
});

export default ReportGrid;
