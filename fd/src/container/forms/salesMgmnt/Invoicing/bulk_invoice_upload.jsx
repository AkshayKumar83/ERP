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
} from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import ButtonUi from "../../../../components/basic/button";
import TextField from "../../../../components/basic/textField";
import { APP_PROD_API } from "../../../../utils/api";
import { useSelector } from "react-redux";

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

const BulkInvoiceUpload = () => {
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
  const [invDate, setInvDate] = useState("");

    const { user } = useSelector((state) => state.auth);

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

    const reader = new FileReader();

    const excelDateToJSDate = (serial) => {
      const utc_days = Math.floor(serial - 25569);
      const utc_value = utc_days * 86400;
      const date_info = new Date(utc_value * 1000);
      return date_info.toISOString().split("T")[0]; // returns "YYYY-MM-DD"
    };

    reader.onload = async (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null });

        const allKeys = [...new Set(jsonData.flatMap(Object.keys))];

        const standardizedData = [];
        const missingDealerCodes = [];
        const seenDealerCodes = new Set();
        const duplicateDealerCodes = new Set();

        jsonData.forEach((row, index) => {
          const rowData = { s_no: index + 1 };
          allKeys.forEach((key) => {
            if (key.startsWith("__EMPTY")) return;

            let value = row[key];

            // if (key === "month" && typeof value === "number") {
            //   value = excelDateToJSDate(value); // convert Excel serial to "YYYY-MM-DD"
            // }

            rowData[key] =
              value === undefined || value === "" || value === "NULL"
                ? null
                : value;
          });

          const dealerCode = rowData["member_no"];
          rowData["inv_creation_dt"] = invDate || null;
          standardizedData.push(rowData);
        });

        // If any issues found, show error and stop upload
        if (missingDealerCodes.length > 0 || duplicateDealerCodes.size > 0) {
          let errorMessage = "";

          if (missingDealerCodes.length > 0) {
            errorMessage += `Rows with missing member no: ${missingDealerCodes.join(
              ", "
            )}.\n`;
          }

          if (duplicateDealerCodes.size > 0) {
            errorMessage += `Duplicate member_no(s) found: ${Array.from(
              duplicateDealerCodes
            ).join(", ")}.`;
          }

          setError(errorMessage);
          setLoading(false);
          return;
        }
        //console.log(standardizedData);
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.UPLOAD_BULK_INVOICE
          }`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ invoicesData: standardizedData, fileName: file.name, user_id: user?.id,  inv_creation_dt: invDate,}),
            credentials: "include",
          }
        );

        // if (!response.ok) throw new Error("Failed to upload data");

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.errMsg || "Something went wrong");
        }

        const result = await response.json();
        setData(result.invoices);
        setTotalRecordCount(result.count);
        setCurrentRecordNo(result.count - 1);
      } catch (error) {
        console.error("Error processing file:", error);
        setError(error.message);
        toast.error(error.message); // 🔥 add this
        setFile(null);
      } finally {
        setLoading(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleCancel = useCallback(async () => {
    releaseFormStatus();
    setData([]);
    setFile(null);
    setError(null);
    setIsMainUploadClicked(false);
    setInvDate('')
    // deleteTempUploadData()
  }, [releaseFormStatus]);

  const handleCreateBulkInvoice = async () => {
    setLoading(true);
    try {
      // const response = await fetch(
      //   `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_CREATE_BULK_INVOICE}`,
      //   {
      //     method: "POST",
      //     credentials: "include",
      //   }
      // );
      let payload = {
       fileName: file.name,
       user_id: user?.id
      };


      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_CREATE_BULK_INVOICE}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        },
      );


    // if (!response.ok) throw new Error("Failed to upload in main dealer");

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.errMsg || "Bulk creation failed");
    }

      const result = await response.json();
      // const dealersWithSNo = result.dealers.map((dealer, index) => ({
      //   s_no: index + 1,
      //   ...dealer,
      // }));

      // setData(dealersWithSNo);
      // setTotalRecordCount(result.count);
      // setCurrentRecordNo(result.count - 1);
      toast.success("Bulk Invoices created successfully!");
      // setIsMainUploadClicked(true);
    } catch (error) {
      console.error(error);
      setError(error.message);
      toast.error(error.message); // 🔥 add this
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
          if (["remarks"].includes(key)) {
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

  const RenderRow = useCallback(
    ({ index, style }) => {
      const row = rows[index];
      prepareRow(row);
      return (
        <tr {...row.getRowProps({ style })} className="border">
          {row.cells.map((cell) => {
            const { key, ...cellProps } = cell.getCellProps();
            return (
              <td
                key={key}
                {...cellProps}
                className="p-2 align-middle border-bottom text-nowrap border"
                style={{
                  width: cell.column.width,
                  minWidth: cell.column.minWidth,
                  maxWidth: cell.column.maxWidth,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap", // or use "normal" + wordWrap for wrapping
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
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.DEL_BULK_INVOICE}`
      );
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
                  <div className="d-flex align-items-start flex-wrap gap-3 ">
                    {/* File Input */}
                
                      <TextField
                          type="date"
                          label="Enter Invoice Date"
                          name="inv_creation_dt"
                          value={invDate}
                          onChange={(e) => setInvDate(e.target.value)}
                          disabled={!formStatus}
                          // className='border'
                        />
                    

                    <div className="position-relative  mt-3">
                      
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

                    {/* Selected File Name */}
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

                    {/* Instruction and Column Info Side-by-Side */}
                    <div className="d-flex flex-wrap gap-3 mt-2">
                      {/* Instruction Message */}
                      <div
                        style={{
                          fontSize: "11px",
                          color: "red",
                          fontWeight: "bold",
                          maxWidth: "350px",
                        }}
                      >
                        PRESS <strong>INSERT</strong> TO SELECT CSV FILE, THEN
                        PRESS <strong>UPLOAD</strong> BUTTON. WAIT FOR UPLOADING
                        TO COMPLETE. THE DATA WILL THEN BE DISPLAYED IN THE
                        TABLE BELOW FOR YOUR REVIEW. FINALLY, PRESS{" "}
                        <strong>UPLOAD INTO MAIN TABLE</strong> BUTTON TO
                        SUBMIT.
                      </div>

                      {/* CSV Column Info Box */}
                      <div
                        style={{
                          backgroundColor: "#f8f9fa",
                          border: "1px solid #ced4da",
                          borderRadius: "8px",
                          padding: "10px 15px",
                          fontSize: "13px",
                          color: "#212529",
                          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                          minWidth: "250px",
                          flex: "1 1 auto",
                        }}
                      >
                        <div
                          className="fw-bold text-dark mb-1"
                          style={{ fontSize: "14px" }}
                        >
                          Expected CSV Columns:
                        </div>
                        <div className="d-flex flex-wrap gap-2">
                          <span className="badge bg-light text-dark border">
                            <code style={{ fontSize: "12px" }}>member_no</code>
                          </span>
                          <span className="badge bg-light text-dark border">
                            <code style={{ fontSize: "12px" }}>debit_acc</code>
                          </span>
                          <span className="badge bg-light text-dark border">
                            <code style={{ fontSize: "12px" }}>credit_acc</code>
                          </span>
                          <span className="badge bg-light text-dark border">
                            <code style={{ fontSize: "12px" }}>it_code</code>
                          </span>
                          <span className="badge bg-light text-dark border">
                            <code style={{ fontSize: "12px" }}>qty</code>
                          </span>
                          <span className="badge bg-light text-dark border">
                            <code style={{ fontSize: "12px" }}>rate</code>
                          </span>
                          <span className="badge bg-light text-dark border">
                            <code style={{ fontSize: "12px" }}>remarks</code>
                          </span>
                          {/* <span className="badge bg-light text-dark border">
                            <code style={{ fontSize: "12px" }}>mnth</code>
                          </span> */}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upload Button Row */}
                <div className="d-flex align-items-center gap-3 mt-3 flex-wrap">
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
                    <div style={{ height: "240px" }}>
                      <table
                        {...getTableProps()}
                        className="table table-sm table-striped mb-0 dealer-table"
                      >
                        <thead className="bg-light sticky-top">
                          {headerGroups.map((headerGroup) => (
                            <tr {...headerGroup.getHeaderGroupProps()}>
                              {headerGroup.headers.map((column) => (
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
                                      backgroundColor: column.isResizing
                                        ? "#007bff"
                                        : "transparent",
                                      cursor: "col-resize",
                                      zIndex: 1,
                                    }}
                                  />
                                </th>
                              ))}
                            </tr>
                          ))}
                        </thead>

                        <tbody {...getTableBodyProps()}>
                          <tr>
                            <td
                              colSpan={columns.length}
                              style={{ padding: 0, border: "none" }}
                            >
                              <FixedSizeList
                                height={200}
                                itemCount={rows.length}
                                itemSize={30}
                                width={totalColumnsWidth}
                              >
                                {RenderRow}
                              </FixedSizeList>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end mt-2">
                    <ButtonUi
                      onClick={handleCreateBulkInvoice}
                      disabled={
                        data.length === 0 || isMainUploadClicked === true
                      }
                      color="success"
                      className="px-4"
                    >
                      Create Bulk Invoices
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

export default BulkInvoiceUpload;
