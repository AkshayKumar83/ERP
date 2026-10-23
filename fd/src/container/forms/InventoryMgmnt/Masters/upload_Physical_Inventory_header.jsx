
   
  import React, { useRef, useState } from "react";
import { Row, Col, Table, Form } from "reactstrap";
import ButtonUi from "../../../../components/basic/button";
import TextField from "../../../../components/basic/textField";
import SimpleBar from "simplebar-react";
import { handleValidateHeaderField, itCodeHelpListHeader, uploadHeaders, WcNoHelpListHeader } from "./upload_Physical_Inventory_helper";
import Select from "../../../../components/basic/select";
import { FcInfo } from "react-icons/fc";
import toast from "react-hot-toast";
import { APP_PROD_API } from "../../../../utils/api";

const UploadPhysicalInventoryHeader = ({
  formData,
  setFormData,
  formStatus,
  handleChange,
  focusedRowIndex,
  setFocusedRowIndex,
  triggerAddRow,
  opngMnth = [],
  handleHelpList = () => {},
  setHelpFor,
  setHelpListHeader,
  user,
  handleValidationError = () => {}
}) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDoubleClickWC = (field, header) => {
    if (["Update"].includes(formStatus)) {
      setHelpFor(field);
      setHelpListHeader(header);
      handleHelpList(true);
    }
  };

  // const handleDoubleClickItem = (field, rowIndex) => {
  //   if (["Update"].includes(formStatus)) {
  //     setHelpFor(field);
  //     setHelpListHeader(itCodeHelpListHeader);
  //     handleHelpList(true, rowIndex);
  //   }
  // };

  const makeFocusOnTableRow = (rowIndex) => {
    setFocusedRowIndex(rowIndex);
  };

  const handleUploadButtonClick = () => {
    if (formStatus !== "Update") {
      toast.error("Upload data allowed only in UPDATE mode!");
      return;
    }

    if (!formData.inv_date) {
      toast.error("Inventory date cannot be left blank!");
      return;
    }

    if (!formData.wc_id) {
      toast.error("Please select Work Center from list!");
      return;
    }

    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      file_name: file.name
    }));
    setSelectedFile(file);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("inv_date", formData.inv_date);
    fd.append("inv_month", formData.inv_month);
    fd.append("wc_id", formData.wc_id);
    fd.append("user_id", formData.user_id || user?.id);
    fd.append("file_name", file.name);
    fd.append("formStatus", formStatus);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.UPLOAD_EXCEL_FILE}`,
        {
          method: "POST",
          body: fd,
        }
      );

      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "File uploaded successfully!");
      } else {
        toast.error(data.message || "Upload failed!");
      }
    } catch (error) {
      toast.error("Error uploading file");
      console.error(error);
    }
  };

  const handleShowUploadedData = async () => {
    try {
      if (!["Update"].includes(formStatus)) {
        toast.error("Show Uploaded Data allowed only in UPDATE mode!");
        return;
      }

      const payload = {
        form_status: formStatus,
        wc_id: formData.wc_id,
        global_fin_year: user.global_fin_year,
        file_name: formData.file_name
      };

      const res = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_UPLOADED_EXCEL_DATA}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: 'include',
        }
      );

      const data = await res.json();

      if (!data.success) {
        toast.error(data.message || "Validation failed!");
        return;
      }

      console.log("API Response:", data);

      const invalidCodes = new Set(data.invalidItems || []);
      const missingStoreCodes = new Set(data.missingStoreItems || []);

      const formattedRows = (data.rows || []).map((row) => {
        const color = invalidCodes.has(row.it_code)
          ? "red"
          : missingStoreCodes.has(row.it_code)
          ? "blue"
          : "";
        return {
          ...row,
          batch_date: row.batch_date
            ? row.batch_date.includes('.')
              ? row.batch_date.split('.').reverse().join('-')
              : row.batch_date
            : "",
          _rowColor: color,
        };
      });

      setFormData((prev) => ({
        ...prev,
        rows: formattedRows,
      }));

      if (data.invalidItems && data.invalidItems.length > 0) {
        handleValidationError('invalid', {
          message: "The excel uploaded contains invalid item codes, displayed in red.\nYou can not proceed further till corrections are made\nin the excel file and file uploading done again.",
          items: data.invalidItems,
          storeItems: data.missingStoreItems || [],
          storeMessage: "The excel uploaded consists of items whose store is not defined in Item Master, displayed in blue.\nYou can not proceed further till corrections are made\nin the excel file and file uploading done again.",
          showGenerateButton: data.showGenerateButton
        });
      } else if (data.missingStoreItems && data.missingStoreItems.length > 0) {
        handleValidationError('store', {
          message: "The excel uploaded consists of items whose store is not defined in Item Master, displayed in blue.\nYou can not proceed further till corrections are made\nin the excel file and file uploading done again.",
          items: data.missingStoreItems,
          showGenerateButton: data.showGenerateButton
        });
      } else {
        handleValidationError('valid', { showGenerateButton: data.showGenerateButton });
        toast.success("All uploaded data is valid. You may proceed.", { duration: 7000 });
      }
    } catch (err) {
      toast.error("Failed to validate uploaded data");
      console.error("Error:", err);
    }
  };

  // const handleShowExceptions = async () => {
  //   try {
  //     if (![ "Update"].includes(formStatus)) {
  //       toast.error("Show Exceptions allowed only in UPDATE mode!");
  //       return;
  //     }
  //     if (!formData.file_name) {
  //       toast.error("Please upload file first!");
  //       return;
  //     }

  //     const payload = {
  //       file_name: formData.file_name,
  //       fin_year: user.global_fin_year,
  //     };

  //     const res = await fetch(
  //       `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_GEN_EXCPT_CSV}`,
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(payload),
  //         credentials: 'include'
  //       }
  //     );

  //     const data = await res.json();

  //     if (!data.success) {
  //       toast.error(data.message);
  //       return;
  //     }

  //     window.open(data.file_url, "_blank");
  //     toast.success("Exception CSV generated!");
  //   } catch (err) {
  //     toast.error("Error generating CSV");
  //     console.error(err);
  //   }
  // };

  const handleShowExceptions = async () => {
  try {
    if (!["Update"].includes(formStatus)) {
      toast.error("Show Exceptions allowed only in UPDATE mode!");
      return;
    }
    if (!formData.file_name) {
      toast.error("Please upload file first!");
      return;
    }
    if (!formData.wc_id) {  
      toast.error("WC ID is required!");
      return;
    }

    const payload = {
      file_name: formData.file_name,
      fin_year: user.global_fin_year,
      wc_id: formData.wc_id,
    };

    const res = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_GEN_EXCPT_CSV}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: 'include'
      }
    );

    const data = await res.json();

    if (!data.success) {
      toast.error(data.message);
      return;
    }

    if (!data.file_url) {
      toast.success("No exceptions found!");
      return;
    }

    window.open(data.file_url, "_blank");
    toast.success("Exception CSV generated!");
  } catch (err) {
    toast.error("Error generating CSV");
    console.error(err);
  }
};



  return (
    <>
      <Row className="d-flex justify-content-around">
        <Col lg={3}>
          <Row className="">
            <span style={{ fontWeight: "500", color: 'red' }}>
              In Update mode, first press the Query button, then the Update button.
            </span>
          </Row>
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <Row className="mt-4">
            <ButtonUi
              type="button"
              color="dark"
              outline
              onClick={handleUploadButtonClick}
            >
              UPLOAD DATA FROM XL
            </ButtonUi>
          </Row>
          <Row className="mt-4">
            <ButtonUi
              type="button"
              color="dark"
              outline
              onClick={handleShowUploadedData}
            >
              SHOW UPLOADED DATA
            </ButtonUi>
          </Row>
          {selectedFile && (
            <p className="mt-2 text-success">
              Selected File: <b>{selectedFile.name}</b>
            </p>
          )}
        </Col>
        <Col lg={8}>
          <span style={{ fontWeight: "500" }}>While Uploading</span> <br />
          <span style={{ fontWeight: "500" }}>
            - Make Sure comma is not present in the CSV for uploading.
          </span>
          <br />
          <span style={{ fontWeight: "500" }}>
            - CSV should contain six columns serial no, item code, batch_no, batch date, make, qty,
            in the order as mentioned. Batch date format must be DD.MM.YYYY.
          </span>
          <br />
          <span style={{ fontWeight: "500" }}>
            - Item code in CSV should have max. size of 20, not having space and should be in text form.
          </span>
          <br />
          <span style={{ fontWeight: "500" }}>
            - There should not be any blank/null columns in the CSV for uploading.
          </span>
          <br />
          <span style={{ fontWeight: "500" }}>
            - Quantity should have maximum three decimals.
          </span>
          <br />
          <span style={{ fontWeight: "500" }}>
            - Serial Number should be integer.
          </span>
          <br />
        </Col>
      </Row>

      <Row className="mt-1">
        <Col>
          <div
            lg={12}
            className="text-wrapper upload-customer-height box border p-2 mt-sm-3 mt-md-3 mt-lg-2"
          >
            <span className="text-label">Upload Wip physical Inventory</span>
            <Row>
              <Col md={4} lg={2}>
                <TextField
                  type="text"
                  label="Work Center"
                  value={formData?.wc_no || ""}
                  onChange={(e) =>
                    handleChange("wc_no", e.target.value, undefined, e)
                  }
                  onDoubleClick={() => handleDoubleClickWC('WcNo', WcNoHelpListHeader)}
                />
              </Col>
              <Col md={4} lg={2} className="">
                <TextField
                  type="date"
                  label="Inventory date"
                  name='inv_date'
                  value={formData?.inv_date || ""}
                  onChange={(e) => {
                    const dateValue = e.target.value;
                    handleChange("inv_date", dateValue, undefined, e);
                    if (dateValue) {
                      const monthNumber = String(new Date(dateValue).getMonth() + 1).padStart(2, "0");
                      handleChange("inv_month", monthNumber, undefined, e);
                    } else {
                      handleChange("inv_month", "", undefined, e);
                    }
                  }}
                  onBlur={(e) => handleValidateHeaderField(e, formStatus)}
                />
              </Col>
              <Col md={4} lg={2} className="">
                <Select
                  type="text"
                  label="Inventory month"
                  value={formData?.inv_month || ""}
                  onChange={(e) => handleChange("inv_month", e.target.value, undefined, e)}
                  options={opngMnth}
                />
              </Col>
              <Col md={4} lg={4} className="">
                <TextField
                  type="text"
                  label="File Name Selected"
                  value={formData?.file_name || ""}
                  onChange={(e) => handleChange("file_name", e.target.value, undefined, e)}
                  disabled
                />
              </Col>
              <Col className="mt-2 p-2 d-flex justify-content-center">
                <ButtonUi type="button" color="dark" outline onClick={handleShowExceptions}>
                  Show Exceptions
                </ButtonUi>
              </Col>
            </Row>

            <Form id="upload-phy-inv" className="mt-4">
              <div className="table-title">
                <span>Uploaded</span>
                {(formStatus === "Insert" || formStatus === "Update") && (
                  <ButtonUi
                    color="primary"
                    className="add-action"
                    onClick={triggerAddRow}
                  >
                    Add Row
                  </ButtonUi>
                )}
              </div>

              <div className="table-wrapper-v3">
                <SimpleBar forceVisible="y" autoHide={false}>
                  <div className='table-sticky-wrapper'>
                    <Table hover>
                      <thead>
                        <tr>
                          {uploadHeaders.map((header, index) => (
                            <th
                              key={index}
                              data-required={header.required || false}
                              style={{
                                whiteSpace: "nowrap",
                                width: header.width,
                                minWidth: header.width,
                              }}
                            >
                              {header.label}
                              {header.isHelpExist && (<FcInfo title="Info" />)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {formData.rows?.map((data, rowIndex) => (
                          <tr
                            key={rowIndex}
                            onFocus={() => makeFocusOnTableRow(rowIndex)}
                            style={{
                              border: rowIndex === focusedRowIndex ? "2px solid black" : "none",
                            }}
                            tabIndex={0}
                          >
                            <td className="table_cell">
                              <TextField
                                type="text"
                                required
                                name="rec_id"
                                value={data.rec_id || ""}
                                maxLength={30}
                                onChange={(e) => handleChange("rec_id", e.target.value, rowIndex, e)}
                                disabled
                              />
                            </td>
                            <td className={`table_cell ${data._rowColor ? `error-cell-${data._rowColor}` : ''}`}>
                              <TextField
                                type="text"
                                required
                                name="it_code"
                                value={data.it_code || ""}
                                maxLength={30}
                                onChange={(e) => handleChange("it_code", e.target.value, rowIndex, e)}
                                // onDoubleClick={() => handleDoubleClickItem('item', rowIndex)}
                              />
                            </td>
                            <td className="table_cell">
                              <TextField
                                type="text"
                                required
                                name="it_name"
                                value={data.it_name || ""}
                                maxLength={30}
                                onChange={(e) => handleChange("it_name", e.target.value, rowIndex, e)}
                                disabled
                              />
                            </td>
                            <td className="table_cell">
                              <TextField
                                type="text"
                                required
                                name="uom"
                                value={data.uom || ""}
                                maxLength={30}
                                onChange={(e) => handleChange("uom", e.target.value, rowIndex, e)}
                                disabled
                              />
                            </td>
                            <td className="table_cell">
                              <TextField
                                type="text"
                                required
                                name="batch_no"
                                value={data.batch_no || ""}
                                maxLength={30}
                                onChange={(e) => handleChange("batch_no", e.target.value, rowIndex, e)}
                              />
                            </td>
                            <td className="table_cell">
                              <TextField
                                type="date"
                                required
                                name="batch_date"
                                value={data.batch_date || ""}
                                maxLength={30}
                                onChange={(e) => handleChange("batch_date", e.target.value, rowIndex, e)}
                              />
                            </td>
                            <td className="table_cell">
                              <TextField
                                type="text"
                                required
                                name="make"
                                value={data.make || ""}
                                maxLength={30}
                                onChange={(e) => handleChange("make", e.target.value, rowIndex, e)}
                              />
                            </td>
                            <td className="table_cell">
                              <TextField
                                type="number"
                                required
                                name="qty"
                                value={data.qty || ""}
                                maxLength={30}
                                onChange={(e) => handleChange("qty", e.target.value, rowIndex, e)}
                                disabled
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </SimpleBar>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default UploadPhysicalInventoryHeader;