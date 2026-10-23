import React, { useCallback } from "react";
import { Form, Row, Col, Card, Table } from "reactstrap";
import RadioGroup from "../../../../components/basic/radioGroup";
import Checkbox from "../../../../components/basic/checkbox";
import Select from "../../../../components/basic/select";
import TextField from "../../../../components/basic/textField";
import ButtonUi from "../../../../components/basic/button";
import { headers } from "./account_code_for_gstHelper";
import SimpleBar from "simplebar-react";
import RowAction from "../../../../components/common/rowAction";
import {
    dupValidation,
    getFieldItemDesc,
} from "../Masters/account_code_for_gstHelper";
import { validateForm } from "../../../../utils/fn";
import toast from "react-hot-toast";
import { FcInfo } from "react-icons/fc";

const AccountCodeforGstDtl = ({
    formData = [{}],
    formStatus,
    handleChange,
    handleAddRow,
    handleDelete,
    gstTypeList = [],
    getValidateData,

    handleHelpFor = () => { },
    handleHelpList = () => { },
    focusedRow = () => { },
    otherQueryPera,
}) => {
    const validateRequiredField = (e, fieldLabel) => {
        if (!["Insert", "Update"].includes(formStatus)) {
            return;
        }
        const value = e.target.value?.trim();
        if (!value) {
            toast.error(`this ${fieldLabel} field is required`);
            // e.preventDefault();
            e.target.focus();
            return false;
        }
        return true;
    };

    const handleDoubleClick = (data) => {
        if (["Insert", "Update"].includes(formStatus)) {
            handleHelpFor(data);
            handleHelpList(true);
        }
    };

    const triggerAddRow = useCallback(async () => {
        //console.log(formData[focusedRow]?.gst_pers)
        // duplicate checks
        const isValidForm = validateForm("gst-acc-mstr-detail-form");
        if (!isValidForm) return;

        const isDuplicateRecord = dupValidation(formData);
        if (isDuplicateRecord) {
            toast.error("GST Type, GST % and Eff. Date combination already exist.");
            return;
        }

        // Common field list
        const fields = [
            { name: "gst_pers", value: formData[focusedRow]?.gst_pers },
            { name: "gst_type", value: formData[focusedRow]?.gst_type },
            { name: "eff_dt", value: formData[focusedRow]?.eff_dt },
        ];

        // get Validation logic
        if (formStatus === "Update") {
            const isChecked =
                formData[focusedRow]?.init_gst_type ===
                formData[focusedRow]?.gst_type &&
                formData[focusedRow]?.init_gst_pers ===
                formData[focusedRow]?.gst_pers &&
                formData[focusedRow]?.init_eff_dt === formData[focusedRow]?.eff_dt;

            if (!isChecked) {
                // validate all fields only if not checked
                for (const f of fields) {
                    const result = await getValidateData(
                        f.name,
                        f.value,
                        otherQueryPera,
                        focusedRow
                    );
                    if (!result.valid) return;
                }
            }
        }
        else if (formStatus != 'Insert') {
            for (const f of fields) {
                const result = await getValidateData(
                    f.name,
                    f.value,
                    otherQueryPera,
                    focusedRow
                );
                if (!result.valid) return;
            }
        }

        // add row
        handleAddRow();
    }, [formStatus, formData, focusedRow, otherQueryPera, handleAddRow]);

    // handle handleValidateBlur

    const handleBlur = async (e, rowIndex, name) => {
        if (!["Insert", "Update"].includes(formStatus)) {
            return;
        }

        const field = e.target;
        const value = field.value;

        validateRequiredField({ target: field }, `${name}`);

        const currentRow = formData[rowIndex];
        if (!currentRow?.gst_type || !currentRow?.gst_pers || !currentRow?.eff_dt || !currentRow?.record_id) {

            return;
        }

        try {
            const result = await getValidateData(
                name,
                value,
                otherQueryPera,
                rowIndex
            );
            //console.log("Validation result:", result);

            if (!result.valid) {
                // Only focus if INVALID
                field.focus();
            } else if (result.data) {
                // setformData((prevData) => {
                //     const updated = [...prevData];
                //     if (updated[rowIndex]) {
                //         // updated[rowIndex].v_code = vCode;
                //         updated[rowIndex].v_name = result.data.v_name;
                //         updated[rowIndex].pan_no = result.data.pan_no;
                //     }
                //     return updated;
                // });
            }
        } catch (err) {
            console.error("Validation error:", err);
        }




    };

    return (
        <React.Fragment>
            <Form id="gst-acc-mstr-detail-form">
                <p
                    style={{
                        width: "90%",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#ef4444",
                    }}
                >
                    NOTE: PLEASE LEAVE GST % FIELD BLANK SO THAT SAME HEADS ARE APPLICABLE
                    FOR ALL GST %. IF YOU WISH TO CAPTURE DATA IN SEPARATE GL HEADS BASED
                    ON GST %, PLEASE ENTER SEPARATE RECORDS AFTER ENTERING GST %. FOR SUCH
                    SCENERIO SEPARATE GL ACCOUNTS SHALL HAVE TO BE OPENED.
                </p>

                <div className="table-title">
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
                        <div className="table-sticky-wrapper height-auto">
                            <Table hover>
                                <thead>
                                    <tr>
                                        {(formStatus === "Insert" || formStatus === "Update") && (
                                            <td></td>
                                        )}
                                        <td></td>
                                        <td colSpan={4}>
                                            <h3
                                                style={{
                                                    fontSize: "12px",
                                                    fontWeight: "bold",
                                                    textAlign: "center",
                                                }}
                                            >
                                                Liabilities
                                            </h3>
                                        </td>

                                        <td colSpan={2}>
                                            <h3
                                                style={{
                                                    fontSize: "12px",
                                                    fontWeight: "bold",
                                                    textAlign: "center",
                                                }}
                                            >
                                                Assets
                                            </h3>
                                        </td>

                                        <td colSpan={3}>
                                            <h3
                                                style={{
                                                    fontSize: "12px",
                                                    fontWeight: "bold",
                                                    textAlign: "center",
                                                }}
                                            >
                                                Expenditure
                                            </h3>
                                        </td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        {(formStatus === "Insert" || formStatus === "Update") && (
                                            <th
                                                style={{ width: "80px" }}
                                                className="sticky-column left"
                                            >
                                                Actions
                                            </th>
                                        )}
                                        {headers.map((header, index) => (
                                            <th
                                                key={index}
                                                data-required={header.required || false}
                                                style={{
                                                    whiteSpace: "nowrap",
                                                    width: header.width,
                                                    minWidth: header.width,
                                                    maxWidth: header.width,
                                                }}
                                            >
                                                {header.label}
                                                {/* {header.required} */}
                                                {header.required && (
                                                    <span className="required-asterisk"> *</span>
                                                )}
                                                {header.isHelpExist && <FcInfo title="Info" />}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData?.map((data, rowIndex) => (
                                        <React.Fragment key={`row-${rowIndex}`}>
                                            <tr onFocus={() => focusedRow(rowIndex)}>
                                                {(formStatus === "Insert" ||
                                                    formStatus === "Update") && (
                                                        <td className="sticky-column left">
                                                            <RowAction
                                                                formStatus={formStatus}
                                                                canDelete={formData.length >= 1}
                                                                onDelete={() => handleDelete(data)}
                                                            // onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                                                            />
                                                        </td>
                                                    )}

                                                <td>
                                                    <Select
                                                        required
                                                        type="text"
                                                        name={`gst_type_${rowIndex}_1`}
                                                        value={data?.gst_type || ""}
                                                        onChange={(e) =>
                                                            handleChange("gst_type", e.target.value, rowIndex)
                                                        }
                                                        options={gstTypeList}
                                                        onBlur={(e) => handleBlur(e, rowIndex, "GST type")}
                                                    />
                                                </td>
                                                <td>
                                                    <TextField
                                                        type="number"
                                                        step="0.1"
                                                        min={0}
                                                        max={100}
                                                        name={`gst_pers_${rowIndex}_1`}
                                                        value={data?.gst_pers || ""}
                                                        onChange={(e) =>
                                                            handleChange("gst_pers", e.target.value, rowIndex)
                                                        }
                                                        onDoubleClick={() => handleDoubleClick("gst_pers")}
                                                    //onBlur={(e) => handleBlur(e, rowIndex, "GST pers")}
                                                    />
                                                </td>
                                                <td>
                                                    <TextField
                                                        type="text"
                                                        name={`acc_no_payable_${rowIndex}_1`}
                                                        value={data?.acc_no_payable || ""}
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "acc_no_payable",
                                                                e.target.value,
                                                                rowIndex
                                                            )
                                                        }
                                                        onDoubleClick={() =>
                                                            handleDoubleClick("acc_no_payable")
                                                        }
                                                        required
                                                        onBlur={(e) => {
                                                            if (formStatus === "Insert" || "Update") {
                                                                validateRequiredField(e, "Acc no. payble");
                                                            }
                                                        }}
                                                    />
                                                </td>
                                                <td>
                                                    <TextField
                                                        type="text"
                                                        name={`acc_no_rev_payable_${rowIndex}_1`}
                                                        value={data?.acc_no_rev_payable || ""}
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "acc_no_rev_payable",
                                                                e.target.value,
                                                                rowIndex
                                                            )
                                                        }
                                                        onDoubleClick={() =>
                                                            handleDoubleClick("acc_no_rev_payable")
                                                        }
                                                        onBlur={(e) => {
                                                            if (formStatus === "Insert" || "Update") {
                                                                validateRequiredField(e, "Acc no. rev payble");
                                                            }
                                                        }}
                                                        required
                                                    />
                                                </td>
                                                <td>
                                                    <TextField
                                                        type="text"
                                                        name={`acc_no_inward_${rowIndex}_1`}
                                                        value={data?.acc_no_inward || ""}
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "acc_no_inward",
                                                                e.target.value,
                                                                rowIndex
                                                            )
                                                        }
                                                        onDoubleClick={() =>
                                                            handleDoubleClick("acc_no_inward")
                                                        }
                                                        onBlur={(e) => {
                                                            if (formStatus === "Insert" || "Update") {
                                                                validateRequiredField(e, "Acc no. inward");
                                                            }
                                                        }}
                                                        required
                                                    />
                                                </td>
                                                <td>
                                                    <TextField
                                                        type="text"
                                                        name={`gst_elec_cash_legr_reg_acc_${rowIndex}_1`}
                                                        value={data?.gst_elec_cash_legr_reg_acc || ""}
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "gst_elec_cash_legr_reg_acc",
                                                                e.target.value,
                                                                rowIndex
                                                            )
                                                        }
                                                        onDoubleClick={() =>
                                                            handleDoubleClick("gst_elec_cash_legr_reg_acc")
                                                        }
                                                        onBlur={(e) => {
                                                            if (formStatus === "Insert" || "Update") {
                                                                validateRequiredField(e, "GST elec cash");
                                                            }
                                                        }}
                                                        required
                                                    />
                                                </td>

                                                <td>
                                                    <TextField
                                                        type="text"
                                                        name={`acc_no_available_${rowIndex}_1`}
                                                        value={data?.acc_no_available || ""}
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "acc_no_available",
                                                                e.target.value,
                                                                rowIndex
                                                            )
                                                        }
                                                        onDoubleClick={() =>
                                                            handleDoubleClick("acc_no_available")
                                                        }
                                                        //onBlur={(e) => validateRequiredField(e, "Acc No available")}
                                                        onBlur={(e) => {
                                                            if (formStatus === "Insert" || "Update") {
                                                                validateRequiredField(e, "Acc No available");
                                                            }
                                                        }}
                                                        required
                                                    />
                                                </td>

                                                <td>
                                                    <TextField
                                                        type="text"
                                                        name={`acc_no_int_paid_${rowIndex}_1`}
                                                        value={data?.acc_no_int_paid || ""}
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "acc_no_int_paid",
                                                                e.target.value,
                                                                rowIndex
                                                            )
                                                        }
                                                        onDoubleClick={() =>
                                                            handleDoubleClick("acc_no_int_paid")
                                                        }
                                                        //  onBlur={(e) => validateRequiredField(e, "Acc no int Paid")}
                                                        onBlur={(e) => {
                                                            if (formStatus === "Insert" || "Update") {
                                                                validateRequiredField(e, "Acc no int Paid");
                                                            }
                                                        }}
                                                        required
                                                    />
                                                </td>

                                                <td>
                                                    <TextField
                                                        type="text"
                                                        name={`acc_no_penalty_paid_${rowIndex}_1`}
                                                        value={data?.acc_no_penalty_paid || ""}
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "acc_no_penalty_paid",
                                                                e.target.value,
                                                                rowIndex
                                                            )
                                                        }
                                                        onDoubleClick={() =>
                                                            handleDoubleClick("acc_no_penalty_paid")
                                                        }
                                                        // onBlur={(e) => validateRequiredField(e, "Acc no Penalty paid")}
                                                        onBlur={(e) => {
                                                            if (formStatus === "Insert" || "Update") {
                                                                validateRequiredField(e, "Acc no Penalty paid");
                                                            }
                                                        }}
                                                        required
                                                    />
                                                </td> 

                                                <td>
                                                    <TextField
                                                        type="text"
                                                        name={`acc_no_provisional_${rowIndex}_1`}
                                                        value={data?.acc_no_provisional || ""}
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "acc_no_provisional",
                                                                e.target.value,
                                                                rowIndex
                                                            )
                                                        }
                                                        onDoubleClick={() =>
                                                            handleDoubleClick("acc_no_provisional")
                                                        }
                                                        //onBlur={(e) => validateRequiredField(e, "GST expense acc no")}
                                                        onBlur={(e) => {
                                                            if (formStatus === "Insert" || "Update") {
                                                                validateRequiredField(e, "GST provisional acc no");
                                                            }
                                                        }}
                                                        required
                                                    />
                                                </td>

                                                <td>
                                                    <TextField
                                                        type="text"
                                                        name={`gst_expense_acc_no_${rowIndex}_1`}
                                                        value={data?.gst_expense_acc_no || ""}
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "gst_expense_acc_no",
                                                                e.target.value,
                                                                rowIndex
                                                            )
                                                        }
                                                        onDoubleClick={() =>
                                                            handleDoubleClick("gst_expense_acc_no")
                                                        }
                                                        //onBlur={(e) => validateRequiredField(e, "GST expense acc no")}
                                                        onBlur={(e) => {
                                                            if (formStatus === "Insert" || "Update") {
                                                                validateRequiredField(e, "GST expense acc no");
                                                            }
                                                        }}
                                                        required
                                                    />
                                                </td>

                                                <td>
                                                    <TextField
                                                        type="date"
                                                        name={`eff_dt_${rowIndex}_1`}
                                                        value={data?.eff_dt || ""}
                                                        onChange={(e) =>
                                                            handleChange("eff_dt", e.target.value, rowIndex)
                                                        }
                                                        required
                                                        onBlur={(e) =>
                                                            handleBlur(e, rowIndex, "Effective date")
                                                        }
                                                    />
                                                </td>
                                            </tr>

                                            {/* Second Row (Duplicate of First Row) */}
                                            <tr>
                                                {(formStatus === "Insert" ||
                                                    formStatus === "Update") && <td></td>}

                                                <td colSpan={12}>
                                                    <Row className="">
                                                        <Col
                                                            style={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: "10px",
                                                            }}
                                                        >
                                                            <label
                                                                style={{
                                                                    width: "200px",
                                                                    textAlign: "right",
                                                                    maxWidth: "200px",
                                                                }}
                                                            >
                                                                Payable Acc Desc
                                                            </label>
                                                            <TextField
                                                                style={{
                                                                    width: "250px",
                                                                    textAlign: "",
                                                                    maxWidth: "250px",
                                                                }}
                                                                type="text"
                                                                name={`acc_no_payable_desc_${rowIndex}_2`}
                                                                value={data.acc_no_payable_desc || ""}
                                                                disabled
                                                                onChange={(e) =>
                                                                    handleChange(
                                                                        "acc_no_payable_desc",
                                                                        e.target.value,
                                                                        rowIndex,
                                                                        2
                                                                    )
                                                                }
                                                            />
                                                        </Col>

                                                        <Col
                                                            style={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: "10px",
                                                            }}
                                                        >
                                                            <label
                                                                style={{
                                                                    width: "200px",
                                                                    textAlign: "right",
                                                                    maxWidth: "200px",
                                                                }}
                                                            >
                                                                Electronic Cash Ledger Acc Desc
                                                            </label>
                                                            <TextField
                                                                style={{
                                                                    width: "250px",
                                                                    textAlign: "",
                                                                    maxWidth: "250px",
                                                                }}
                                                                type="text"
                                                                name={`gst_elec_cash_legr_reg_ac_desc_${rowIndex}_2`}
                                                                value={
                                                                    data.gst_elec_cash_legr_reg_ac_desc || ""
                                                                }
                                                                disabled
                                                                onChange={(e) =>
                                                                    handleChange(
                                                                        "gst_elec_cash_legr_reg_ac_desc",
                                                                        e.target.value,
                                                                        rowIndex,
                                                                        2
                                                                    )
                                                                }
                                                            />
                                                        </Col>
                                                    </Row>

                                                    <Row>
                                                        <Col
                                                            style={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: "10px",
                                                            }}
                                                        >
                                                            <label
                                                                style={{
                                                                    width: "200px",
                                                                    textAlign: "right",
                                                                    maxWidth: "200px",
                                                                }}
                                                            >
                                                                Reverse Payable Acc Desc
                                                            </label>
                                                            <TextField
                                                                style={{
                                                                    width: "250px",
                                                                    textAlign: "",
                                                                    maxWidth: "250px",
                                                                }}
                                                                type="text"
                                                                name={`acc_no_rev_payable_desc_${rowIndex}_2`}
                                                                value={data.acc_no_rev_payable_desc || ""}
                                                                disabled
                                                                onChange={(e) =>
                                                                    handleChange(
                                                                        "acc_no_rev_payable_desc",
                                                                        e.target.value,
                                                                        rowIndex,
                                                                        2
                                                                    )
                                                                }
                                                            //disabled
                                                            />
                                                        </Col>

                                                        <Col
                                                            style={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: "10px",
                                                            }}
                                                        >
                                                            <label
                                                                style={{
                                                                    width: "200px",
                                                                    textAlign: "right",
                                                                    maxWidth: "200px",
                                                                }}
                                                            >
                                                                Available Acc Desc
                                                            </label>
                                                            <TextField
                                                                style={{
                                                                    width: "250px",
                                                                    textAlign: "",
                                                                    maxWidth: "250px",
                                                                }}
                                                                type="text"
                                                                name={`acc_no_available_desc_${rowIndex}_2`}
                                                                value={data.acc_no_available_desc || ""}
                                                                disabled
                                                                onChange={(e) =>
                                                                    handleChange(
                                                                        "acc_no_available_desc",
                                                                        e.target.value,
                                                                        rowIndex,
                                                                        2
                                                                    )
                                                                }
                                                            //disabled
                                                            />
                                                        </Col>
                                                    </Row>

                                                    <Row>
                                                        <Col
                                                            style={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: "10px",
                                                            }}
                                                        >
                                                            <label
                                                                style={{
                                                                    width: "200px",
                                                                    textAlign: "right",
                                                                    maxWidth: "200px",
                                                                }}
                                                            >
                                                                Inward Acc Desc
                                                            </label>
                                                            <TextField
                                                                style={{
                                                                    width: "250px",
                                                                    textAlign: "",
                                                                    maxWidth: "250px",
                                                                }}
                                                                type="text"
                                                                name={`acc_no_inward_desc_${rowIndex}_2`}
                                                                value={data.acc_no_inward_desc || ""}
                                                                disabled
                                                                onChange={(e) =>
                                                                    handleChange(
                                                                        "acc_no_inward_desc",
                                                                        e.target.value,
                                                                        rowIndex,
                                                                        2
                                                                    )
                                                                }
                                                            //disabled
                                                            />
                                                        </Col>

                                                        <Col
                                                            style={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: "10px",
                                                            }}
                                                        >
                                                            <label
                                                                style={{
                                                                    width: "200px",
                                                                    textAlign: "right",
                                                                    maxWidth: "200px",
                                                                }}
                                                            >
                                                                Interest paid Acc Desc
                                                            </label>
                                                            <TextField
                                                                style={{
                                                                    width: "250px",
                                                                    textAlign: "",
                                                                    maxWidth: "250px",
                                                                }}
                                                                type="text"
                                                                name={`acc_no_int_paid_desc_${rowIndex}_2`}
                                                                value={data.acc_no_int_paid_desc || ""}
                                                                disabled
                                                                onChange={(e) =>
                                                                    handleChange(
                                                                        "acc_no_int_paid_desc",
                                                                        e.target.value,
                                                                        rowIndex,
                                                                        2
                                                                    )
                                                                }
                                                            //disabled
                                                            />
                                                        </Col>
                                                    </Row>

                                                    <Row className="">
                                                        <Col
                                                            style={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: "10px",
                                                            }}
                                                        >
                                                            <label
                                                                style={{
                                                                    width: "200px",
                                                                    textAlign: "right",
                                                                    maxWidth: "200px",
                                                                }}
                                                            >
                                                                GST Expense Acc Desc
                                                            </label>
                                                            <TextField
                                                                style={{
                                                                    width: "250px",
                                                                    textAlign: "",
                                                                    maxWidth: "250px",
                                                                }}
                                                                type="text"
                                                                name={`gst_expense_acc_desc_${rowIndex}_2`}
                                                                value={data.gst_expense_acc_desc || ""}
                                                                disabled
                                                                onChange={(e) =>
                                                                    handleChange(
                                                                        "gst_expense_acc_desc",
                                                                        e.target.value,
                                                                        rowIndex,
                                                                        2
                                                                    )
                                                                }
                                                            //disabled
                                                            />
                                                        </Col>

                                                        <Col
                                                            style={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: "10px",
                                                            }}
                                                        >
                                                            <label
                                                                style={{
                                                                    width: "200px",
                                                                    textAlign: "right",
                                                                    maxWidth: "200px",
                                                                }}
                                                            >
                                                                Penalty paid Acc Desc
                                                            </label>
                                                            <TextField
                                                                style={{
                                                                    width: "250px",
                                                                    textAlign: "",
                                                                    maxWidth: "250px",
                                                                }}
                                                                type="text"
                                                                name={`acc_no_int_paid_desc_${rowIndex}_2`}
                                                                value={data.acc_no_penalty_paid_desc || ""}
                                                                disabled
                                                                onChange={(e) =>
                                                                    handleChange(
                                                                        "acc_no_penalty_paid_desc",
                                                                        e.target.value,
                                                                        rowIndex,
                                                                        2
                                                                    )
                                                                }
                                                            //disabled
                                                            />
                                                        </Col> 

                                                        
                                                    </Row> 

                                                       <Row className=""> 
                                                        <Col>
                                                        </Col>
                                                        <Col
                                                            style={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: "10px",
                                                            }}
                                                        >
                                                            <label
                                                                style={{
                                                                    width: "200px",
                                                                    textAlign: "right",
                                                                    maxWidth: "200px",
                                                                }}
                                                            >
                                                                GST Provisional Acc Desc
                                                            </label>
                                                            <TextField
                                                                style={{
                                                                    width: "250px",
                                                                    textAlign: "",
                                                                    maxWidth: "250px",
                                                                }}
                                                                type="text"
                                                                name={`gst_prov_acc_desc_${rowIndex}_2`}
                                                                value={data.gst_prov_acc_desc || ""}
                                                                disabled
                                                                onChange={(e) =>
                                                                    handleChange(
                                                                        "gst_prov_acc_desc",
                                                                        e.target.value,
                                                                        rowIndex,
                                                                        2
                                                                    )
                                                                }
                                                            //disabled
                                                            />
                                                        </Col> 
                                                        </Row>
                                                </td>
                                            </tr>
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </SimpleBar>
                </div>
            </Form>
        </React.Fragment>
    );
};

export default AccountCodeforGstDtl;
