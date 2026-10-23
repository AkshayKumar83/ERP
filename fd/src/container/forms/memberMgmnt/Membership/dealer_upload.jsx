import React, { useState, useMemo, useCallback, useEffect } from "react";
import * as XLSX from "xlsx";
import { useTable, useBlockLayout, useResizeColumns } from "react-table";
import { FixedSizeList } from "react-window";
import { Upload } from "lucide-react";
import { useFormLoading } from "../../../../hooks/useFormLoading";
import { useRecordCount } from "../../../../hooks/useRecordCount";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import toast from "react-hot-toast";
import Loader from "../../../../components/GenricComponents/Loader";
import {
  Form,
  TabContent,
  TabPane,
  Card,
  CardBody,
  Alert,
  Badge,
  Table,
} from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import ButtonUi from "../../../../components/basic/button";
import TextField from "../../../../components/basic/textField";
import { COLUMN_LENGTH_LIMITS } from "./dealer_upload_helper";

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

const DealerUploading = () => {
  const { loading, setLoading } = useFormLoading();
  const {
    currentRecordNo,
    setCurrentRecordNo,
    totalRecordCount,
    setTotalRecordCount,
    handleOffset,
  } = useRecordCount();
  const { formStatus, handleOperation, releaseFormStatus } = useFormStatus();

  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(1);
  const [isMainUploadClicked, setIsMainUploadClicked] = useState(false);

  useEffect(() => {
    setIsMainUploadClicked(false);
  }, [formStatus]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);

    const isCSV =
      /\.csv$/i.test(file.name || "") ||
      file.type === "text/csv" ||
      // Some browsers label CSV as this legacy type
      file.type === "application/vnd.ms-excel";

    // ---------- helpers ----------
    const pad2 = (n) => String(n).padStart(2, "0");

    // Excel 1900 serial -> LOCAL date (handles fractional time too)
    const excelSerialToLocalDate = (serial) => {
      const base = new Date(1899, 11, 30); // 1899‑12‑30
      const ms = Math.round(Number(serial) * 86400000);
      return new Date(base.getTime() + ms);
    };

    const normKey = (k) => String(k).trim().toLowerCase().replace(/\s+/g, "_");

    // Keep '.' intact; unify other separators to '-'
    const unifySeps = (s) =>
      String(s)
        .trim()
        .replace(/^\uFEFF/, "")
        .replace(/^['"]|['"]$/g, "")
        .replace(/[\/_\s,|~]+/g, "-")
        .replace(/[\u2010-\u2015\u2212\u2043\uFE58\uFE63\uFF0D]+/g, "-");

    // Very strict DD-MM-YYYY (or DD-M-YY etc) → DD-MM-YYYY
    const dmyToDDMMYYYY = (s) => {
      const m = s.match(/^(\d{1,2})-(\d{1,2})-(\d{2}|\d{4})$/);
      if (!m) return null;
      const d = pad2(+m[1]);
      const mo = pad2(+m[2]);
      let y = m[3];
      if (y.length === 2) y = String(+y <= 49 ? 2000 + +y : 1900 + +y);
      return `${d}-${mo}-${y}`;
    };

    // YYYY-MM-DD → DD-MM-YYYY
    const ymdToDDMMYYYY = (s) => {
      const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
      if (!m) return null;
      return `${pad2(+m[3])}-${pad2(+m[2])}-${m[1]}`;
    };

    // Detect "thing that could be a date" (without trusting JS Date)
    const looksLikeDateString = (v) => {
      if (v == null) return false;
      const s0 = String(v).trim();
      const s = unifySeps(s0);
      return (
        /^\d{1,2}-\d{1,2}-(\d{2}|\d{4})$/.test(s) || // D-M-Y / DD-MM-YYYY
        /^\d{4}-\d{1,2}-\d{1,2}$/.test(s) || // Y-M-D
        /^\d{1,2}\/\d{1,2}\/(\d{2}|\d{4})$/.test(s) || // D/M/Y
        /^\d{1,2}\.\d{1,2}\.(\d{2}|\d{4})$/.test(s) // D.M.Y
      );
    };

    // Always return strict DD-MM-YYYY (DMY-first policy)
    const normalizeDateStringStrict = (v) => {
      if (v == null || v === "") return null;

      // Excel serial as number or numeric string
      if (typeof v === "number" || /^\d+(\.\d+)?$/.test(String(v).trim())) {
        const n = Number(v);
        if (n > 20000 && n < 80000) {
          const d = excelSerialToLocalDate(n);
          return `${pad2(d.getDate())}-${pad2(
            d.getMonth() + 1
          )}-${d.getFullYear()}`;
        }
      }

      let s = String(v).trim();
      // tolerate '/', '.', spaces → '-'
      s = unifySeps(s);

      // If it's already DD-MM-YYYY (or D-M-YY), normalize
      const dmy = dmyToDDMMYYYY(s);
      if (dmy) return dmy;

      // If it's YYYY-MM-DD, flip to DMY
      const ymd = ymdToDDMMYYYY(s);
      if (ymd) return ymd;

      // If it's "MM-DD-YYYY" (US) but we promised DMY-first, treat it as D-M-Y
      // Only do this when header tells us it's a date OR we already think it's a date string.
      const mdy = s.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
      if (mdy) {
        // Interpret as D-M-Y (DMY policy)
        return `${pad2(+mdy[1])}-${pad2(+mdy[2])}-${mdy[3]}`;
      }

      // Not a date → return original trimmed
      return String(v).trim();
    };

    // -------- CSV parsing (quote-aware, delimiter auto-detect) ----------
    const detectDelimiter = (line) => {
      const candidates = [",", "\t", ";", "|"];
      let best = ",";
      let max = 0;
      for (const d of candidates) {
        const c = (line.match(new RegExp(`\\${d}`, "g")) || []).length;
        if (c > max) {
          max = c;
          best = d;
        }
      }
      return best;
    };

    const splitLine = (line, delim) => {
      const out = [];
      let cur = "";
      let inQ = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (inQ) {
          if (ch === '"') {
            if (line[i + 1] === '"') {
              cur += '"';
              i++;
            } else {
              inQ = false;
            }
          } else {
            cur += ch;
          }
        } else {
          if (ch === '"') inQ = true;
          else if (ch === delim) {
            out.push(cur);
            cur = "";
          } else {
            cur += ch;
          }
        }
      }
      out.push(cur);
      return out;
    };

    // const parseCSVText = (text) => {
    //   const clean = text
    //     .replace(/^\uFEFF/, "")
    //     .replace(/\r\n/g, "\n")
    //     .replace(/\r/g, "\n");
    //   const lines = clean.split("\n").filter((l) => l.trim().length > 0);

    //   if (lines.length === 0) return { headers: [], rows: [] };

    //   const delim = detectDelimiter(lines[0]);
    //   const headers = splitLine(lines[0], delim).map((h) => h.trim());

    //   const rows = lines.slice(1).map((ln) => {
    //     const cells = splitLine(ln, delim);
    //     const obj = {};
    //     headers.forEach((h, i) => {
    //       const raw = cells[i] === undefined ? "" : cells[i];
    //       obj[h] = raw === "" ? null : raw;
    //     });
    //     return obj;
    //   });

    //   return { headers, rows };
    // };

    const parseCSVText = (text) => {
      const clean = text
        .replace(/^\uFEFF/, "")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n");
      const lines = clean.split("\n").filter((l) => l.trim().length > 0);

      if (lines.length === 0) return { headers: [], rows: [] };

      const delim = detectDelimiter(lines[0]);
      const headers = splitLine(lines[0], delim).map((h) => h.trim());

      const rows = lines
        .slice(1)
        .map((ln) => {
          const cells = splitLine(ln, delim);
          const obj = {};
          headers.forEach((h, i) => {
            const raw = cells[i] === undefined ? "" : cells[i];
            obj[h] = raw === "" ? null : raw;
          });
          return obj;
        })
        // 🚀 FILTER OUT EMPTY ROWS (all nulls or blanks)
        .filter((row) => Object.values(row).some((v) => v && String(v).trim() !== ""));

      return { headers, rows };
    };

    // -------------------------------------------------------------------

    // Columns that are definitely date fields
    const explicitDateNames = new Set([
      "appointment_date",
      "ceasation_date",
      "in_operative_date",
      "agr_expiry_date",
      "agr_expiry",
    ]);

    try {
      let rows = [];
      let allKeys = [];

      if (isCSV) {
        // ---------- CSV path (safe for DMY) ----------
        const text = await file.text();
        const { headers, rows: recs } = parseCSVText(text);
        rows = recs;
        allKeys = headers;
      } else {
        // ---------- Excel path (your original logic) ----------
        const reader = new FileReader();
        const buffer = await new Promise((resolve, reject) => {
          reader.onload = (ev) => resolve(ev.target.result);
          reader.onerror = reject;
          reader.readAsArrayBuffer(file);
        });

        const workbook = XLSX.read(buffer, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // We keep raw:true so we control formatting; cellDates:true ensures true Excel dates become Date objects
        rows = XLSX.utils.sheet_to_json(worksheet, {
          defval: null,
          raw: true,
          cellDates: true,
        });

        allKeys = [...new Set(rows.flatMap(Object.keys))];
      }

      // Build date column set from headers
      const dateCols = new Set(
        allKeys
          .map((k) => [k, normKey(k)])
          .filter(
            ([_, nk]) => /(^|_)(date|dt)$/.test(nk) || explicitDateNames.has(nk)
          )
          .map(([k]) => k)
      );

      // Normalize rows (always emit DD-MM-YYYY strings for dates)
      const standardizedData = [];
      const dealersForPost = [];
      const missingDealerCodes = [];

      rows.forEach((row, idx) => {
        const out = { s_no: idx + 1 };
        const apiRow = {};

        for (const key of allKeys) {
          if (!key || key?.startsWith?.("__EMPTY")) continue;

          let val = row[key];
          val = val === undefined || val === "" || val === "NULL" ? null : val;

          // For CSV, never trust JS Date objects at all (we won't have them anyway)
          // For Excel, trust Excel serial/Date; for any string that looks like a date, normalize strictly to DMY
          if (val != null && (dateCols.has(key) || looksLikeDateString(val))) {
            // Excel path: if Date object or serial → turn into DMY
            if (!isCSV && val instanceof Date && !isNaN(val)) {
              const d = val;
              const ddmmyyyy = `${pad2(d.getDate())}-${pad2(
                d.getMonth() + 1
              )}-${d.getFullYear()}`;
              out[key] = ddmmyyyy;
              apiRow[normKey(key)] = ddmmyyyy;
            } else {
              const ddmmyyyy = normalizeDateStringStrict(val);
              out[key] = ddmmyyyy;
              apiRow[normKey(key)] = ddmmyyyy;
            }
          } else {
            out[key] = val;
            apiRow[normKey(key)] = val;
          }
        }

        if (!out["dealer_code"] && !out["DEALER CODE"]) {
          missingDealerCodes.push(idx + 1);
        }

        standardizedData.push(out);
        dealersForPost.push(apiRow);
      });

      // ✅ Step 1: initialize exceeded rows array
        const exceededLengthRows = [];

        // ✅ Step 2: check each row for column length limits
        rows.forEach((row, idx) => {
          const exceededCols = [];

          for (const [col, limit] of Object.entries(COLUMN_LENGTH_LIMITS)) {
            const value =
              row[col] ?? row[col.toUpperCase()] ?? row[col.toLowerCase()] ?? "";

            if (value && String(value).length > limit) {
              exceededCols.push(`${col} (${String(value).length}/${limit})`);
            }
          }

          if (exceededCols.length > 0) {
            exceededLengthRows.push({
              row: idx + 1,
              columns: exceededCols,
            });
          }
        });

        // ✅ Step 3: stop upload if any exceeded
        if (exceededLengthRows.length > 0) {
          const details = exceededLengthRows
            .map((r) => `Row ${r.row + 1}: ${r.columns.join(", ")}`)
            .join("\n");

          toast.error(`Some rows exceed DB column limits:\n${details}`);
          setError(`Some rows exceed DB column length limits.${details} `);
          console.error("Exceeded length details:", exceededLengthRows);
          setLoading(false);
          return;
        }


      if (missingDealerCodes.length > 0) {
        setData(standardizedData);
        setError(
          `Rows with missing dealer_code: ${missingDealerCodes.join(", ")}.`
        );
        setLoading(false);
        return;
      }

      // POST to API
      const response = await fetch(`${BASE_API_URL}/upload/dealers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealers: dealersForPost }),
        credentials: "include",
      });

      if (!response.ok){
        const getError = await response.json()
        throw new Error(getError?.errMsg || "Failed to upload data");
      } 

      setData(standardizedData);
      setTotalRecordCount(standardizedData.length);
      setCurrentRecordNo(standardizedData.length - 1);
    } catch (err) {
      console.error("Error processing file:", err);
      setError(err.message);
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = useCallback(async () => {
    releaseFormStatus();
    setData([]);
    setFile(null);
    setError(null);
    setIsMainUploadClicked(false);
    // deleteTempUploadData()
  }, [releaseFormStatus]);

  const uploadInMainDealer = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_API_URL}/upload/upl_in_main`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to upload in main dealer");
      const result = await response.json();
      const dealersWithSNo = result.dealers.map((dealer, index) => ({
        s_no: index + 1,
        ...dealer,
      }));

      setData(dealersWithSNo);
      setTotalRecordCount(result.count);
      setCurrentRecordNo(result.count - 1);
      toast.success("Successfully uploaded into main table");
      setIsMainUploadClicked(true);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(() => {
    if (data.length === 0) return [];
    return [
      {
        Header: "S.No",
        accessor: "s_no",
        width: 60,
      },
      ...Object.keys(data[0])
        .filter((key) => key !== "s_no")
        .map((key) => {
          let width = 150;
          if (
            ["dealership_name", "address", "email", "remarks"].includes(key)
          ) {
            width = 300;
          } else if (["description", "comments"].includes(key)) {
            width = 250;
          }

          return {
            Header: key.replace(/_/g, " ").toUpperCase(),
            accessor: key,
            width,
          };
        }),
    ];
  }, [data]);

  const defaultColumn = React.useMemo(
    () => ({
      minWidth: 60,
      width: 150,
      maxWidth: 400,
    }),
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    totalColumnsWidth,
  } = useTable(
    { columns, data, defaultColumn },
    useBlockLayout,
    useResizeColumns
  );

  // const RenderRow = useCallback(
  //   ({ index, style }) => {
  //     const row = rows[index];
  //     prepareRow(row);
  //     return (
  //       <tr {...row.getRowProps({ style })} className="border">
  //         {row.cells.map((cell) => {
  //           const { key, ...cellProps } = cell.getCellProps();
  //           return (
  //             <td
  //               key={key}
  //               {...cellProps}
  //               className="p-2 align-middle border-bottom text-nowrap border"
  //               style={{
  //                 width: cell.column.width,
  //                 minWidth: cell.column.minWidth,
  //                 maxWidth: cell.column.maxWidth,
  //                 overflow: "hidden",
  //                 textOverflow: "ellipsis",
  //                 whiteSpace: "nowrap", // or use "normal" + wordWrap for wrapping
  //               }}
  //             >
  //               {cell.render("Cell")}
  //             </td>
  //           );
  //         })}
  //       </tr>
  //     );
  //   },
  //   [prepareRow, rows]
  // );

  const RenderRow = useCallback(
  ({ index, style }) => {
    const row = rows[index];
    prepareRow(row);

    // const { key, ...rowProps } = row.getRowProps({ style });

    // return (
    //   <tr key={key} {...rowProps} className="border">
    const rowProps = row.getRowProps({ style });
    const rowKey = rowProps.key;
    const { key, ...restRowProps } = rowProps;

    return (
  <tr key={rowKey} {...restRowProps} className="border">
        {row.cells.map((cell) => {
          const { key: cellKey, ...cellProps } = cell.getCellProps();
          return (
            <td
              key={cellKey}
              {...cellProps}
              className="p-2 align-middle border-bottom text-nowrap border"
              style={{
                width: cell.column.width,
                minWidth: cell.column.minWidth,
                maxWidth: cell.column.maxWidth,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {cell.render("Cell")}
            </td>
          );
        })}
      </tr>
    );
  },
  [prepareRow, rows]
);


  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100">
        <Loader />
      </div>
    );
  }
  const deleteTempUploadData = async () => {
    try {
      const response = await fetch(`${BASE_API_URL}/upload/delete_temp_upld`, {
        credentials: "include",
      });
      if (!response == "ok") {
        const data = await response.json();
        throw new Error(data.message);
      }
      handleCancel();
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <FormSetup
      navType="tabs"
      activeTab={activeTab}
      tabs={[]}
      updateActiveTab={setActiveTab}
      formStatus={formStatus}
      currentRecordNo={currentRecordNo}
      totalRecordCount={totalRecordCount}
      pageCount={1}
      totalPageCount={1}
      isSingleQuery={true}
      setupQueryData={() => {}}
      handleSubmit={deleteTempUploadData}
      handleCancel={handleCancel}
      handleOperation={handleOperation}
      formData={data}
      handleOffset={handleOffset}
      QUERY_API="/upload/dealers"
    >
      <TabContent activeTab={activeTab}>
        <TabPane tabId={1}>
          <Card className="shadow-sm mb-2">
            <CardBody>
              {/* <h4 className="mb-4 text-primary">Dealer Data Upload</h4> */}
              <Form onSubmit={handleSubmit} className="mb-1">
                <div className="mb-2">
                  <div className="d-flex align-items-center flex-wrap gap-3">
                    <div className="position-relative">
                      <label
                        htmlFor="csvFile"
                        className="btn btn-outline-primary d-flex align-items-center"
                      >
                        <Upload className="me-2" size={18} />
                        Select CSV File
                      </label>
                      <TextField
                        type="file"
                        id="csvFile"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileChange}
                        required
                        className="d-none"
                        disabled={!formStatus}
                      />
                    </div>
                    {file && (
                      <div className="d-flex align-items-center">
                        <Badge
                          color="light"
                          className="py-2 px-3 text-dark border"
                        >
                          {file.name}
                        </Badge>
                      </div>
                    )}

                    {/* Instruction Message */}
                    <div>
                      <p
                        style={{
                          fontSize: "11px",
                          color: "red",
                          fontWeight: "bold",
                          textAlign: "center",
                          maxWidth: "500px",
                        }}
                      >
                        PRESS <strong>INSERT</strong> TO SELECT CSV FILE, THEN
                        PRESS <strong>UPLOAD</strong> BUTTON. WAIT FOR UPLOADING
                        TO COMPLETE. THE DATA WILL THEN BE DISPLAYED IN THE
                        TABLE BELOW FOR YOUR REVIEW. FINALLY, PRESS{" "}
                        <strong>UPLOAD INTO MAIN TABLE</strong> BUTTON TO
                        SUBMIT.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <ButtonUi
                    type="submit"
                    color="primary"
                    disabled={loading || !file || !formStatus}
                    className="px-4"
                  >
                    {loading ? "Uploading..." : "Upload File"}
                  </ButtonUi>
                </div>
              </Form>

              {error && (
                <Alert color="danger" className="mb-2 p-1">
                  {error}
                </Alert>
              )}

              {data.length > 0 && (
                <div className="mt-2">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="mb-0">Uploaded Data</h5>
                    <Badge color="success" pill className="px-3 py-1">
                      {data.length} Records
                    </Badge>
                  </div>

                  <div className="table-responsive border rounded">
                    <div style={{ height: "280px", overflow: "auto" }}>
                      <table
                        {...getTableProps()}
                        className="table table-sm table-striped mb-0 dealer-table"
                      >
                        <thead className="bg-light sticky-top">
                          {headerGroups.map((headerGroup) => (
                            <tr {...headerGroup.getHeaderGroupProps()}>
                              {/* {headerGroup.headers.map((column) => (
                                <th
                                  {...column.getHeaderProps()}
                                  className="text-nowrap font-weight-bold position-relative p-2 border-bottom align-middle"
                                  style={{
                                    width: column.width,
                                    minWidth: column.minWidth,
                                    maxWidth: column.maxWidth,
                                    backgroundColor: "#f8f9fa",
                                  }}
                                >
                                  {column.render("Header")}
                                  <div
                                    {...column.getResizerProps()}
                                    className={`resizer ${
                                      column.isResizing ? "isResizing" : ""
                                    }`}
                                    style={{
                                      position: "absolute",
                                      right: 0,
                                      top: 0,
                                      height: "100%",
                                      width: "4px",
                                      backgroundColor: column.isResizing ? "#007bff" : "transparent",
                                      cursor: "col-resize",
                                      zIndex: 1,
                                    }}
                                  />
                                </th>
                              ))} */}

                              {/* {headerGroup.headers.map((column) => {
                                const { key, ...restHeaderProps } = column.getHeaderProps();
                                return (
                                  <th
                                    key={key}
                                    {...restHeaderProps} */}
                                    {headerGroup.headers.map((column) => {
                                const headerProps = column.getHeaderProps();
                                const headerKey = headerProps.key;
                                const { key, ...restHeaderProps } = headerProps;

                                return (
                                  <th
                                    key={headerKey}
                                    {...restHeaderProps}
                                    className="text-nowrap font-weight-bold position-relative p-2 border-bottom align-middle"
                                    style={{
                                      width: column.width,
                                      minWidth: column.minWidth,
                                      maxWidth: column.maxWidth,
                                      backgroundColor: "#f8f9fa",
                                    }}
                                  >
                                    {column.render("Header")}
                                    <div
                                      {...column.getResizerProps()}
                                      className={`resizer ${column.isResizing ? "isResizing" : ""}`}
                                      style={{
                                        position: "absolute",
                                        right: 0,
                                        top: 0,
                                        height: "100%",
                                        width: "4px",
                                        backgroundColor: column.isResizing ? "#007bff" : "transparent",
                                        cursor: "col-resize",
                                        zIndex: 1,
                                      }}
                                    />
                                  </th>
                                );
                              })}

                            </tr>
                          ))}
                        </thead>

                        {/* <tbody {...getTableBodyProps()}>
                          <tr>
                            <td
                              colSpan={columns.length}
                              style={{ padding: 0, border: "none" }}
                            >
                              <FixedSizeList
                                height={250}
                                itemCount={rows.length}
                                itemSize={30}
                                width={totalColumnsWidth}
                              >
                                {RenderRow}
                              </FixedSizeList>
                            </td>
                          </tr>
                        </tbody> */}

                        <tbody {...getTableBodyProps()}>
                          <FixedSizeList
                            height={250}
                            itemCount={rows.length}
                            itemSize={30}
                            width={totalColumnsWidth}
                          >
                            {RenderRow}
                          </FixedSizeList>
                        </tbody>

                      </table>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end mt-2">
                    <ButtonUi
                      onClick={uploadInMainDealer}
                      disabled={
                        data.length === 0 || isMainUploadClicked === true
                      }
                      color="success"
                      className="px-4"
                    >
                      Upload to Main Dealers
                    </ButtonUi>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </TabPane>
      </TabContent>
    </FormSetup>
  );
};

export default DealerUploading;
