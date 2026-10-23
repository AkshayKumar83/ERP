
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Row, Col, Form, Table } from 'reactstrap';
import SimpleBar from 'simplebar-react';
import ButtonUi from '../../../../components/basic/button';
import TextField from '../../../../components/basic/textField';
import RowAction from '../../../../components/common/rowAction';
import { accNoHelpListHeader, checkDuplicateEntry, efaDetalHeader } from './efa_helper';
import { FcInfo } from "react-icons/fc";
import Checkbox from '../../../../components/basic/checkbox';

const EfaDetail = ({
    formData,
    formStatus,
    handleChange,
    handleAddRow,
    handleDeleteRow,
    handleHelpList = () => { },
    openHelpList = () => { },
    onSelectHelpItem = () => { },
    focusedRowIndex = 0,
    setFocusedRowIndex = () => { },
}) => {
    const tableContainerRef = useRef(null);
    const rowRefs = useRef([]);

    const scrollToRow = useCallback((index) => {
        if (rowRefs.current[index]) {
            rowRefs.current[index].scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, []);

    useEffect(() => {
        scrollToRow(focusedRowIndex);
    }, [focusedRowIndex, scrollToRow]);

    const handleKeyDown = (e) => {
        if (formStatus === 'Insert' || formStatus === 'Update') {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (focusedRowIndex < formData.length - 1) {
                    setFocusedRowIndex(focusedRowIndex + 1);
                }
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (focusedRowIndex > 0) {
                    setFocusedRowIndex(focusedRowIndex - 1);
                }
            }
        }
    };

    const handleDelete = async (data, index) => {
        handleDeleteRow(index);
    };

    const handleUpdate = async (data) => {
        ////console.log("Update button clicked");
    };

    const handleAdd = () => {
        handleAddRow();
        setTimeout(() => {
            setFocusedRowIndex(formData.length); // Focus the new row
        }, 0);
    };

    const makeFocusOnTableRow = (rowIndex) => {
        setFocusedRowIndex(rowIndex);
    };

    return (
        <React.Fragment>
            <Row>
                <Col className="m-auto">
                    <Form id="ageing-parameter-form" onKeyDown={handleKeyDown}>
                        <div className="table-title">
                            <span>EFA Detail</span>
                            {(formStatus === 'Insert' || formStatus === 'Update') &&
                                <ButtonUi color="primary" className="add-action" onClick={handleAdd}>
                                    Add Row
                                </ButtonUi>}
                        </div>

                        <div style={{ height: '180px', maxHeight: '180px'}} className="table-wrapper-v3">
                            <SimpleBar forceVisible="Y" autoHide={false}>
                            <div className="table-sticky-wrapper" style={{height: '180px', maxHeight: '180px'}}>
                                {/* <Table hover> */}
                                <Table hover>
                                    <thead>
                                        <tr>
                                            {(formStatus === 'Insert' || formStatus === 'Update') &&
                                                <th className="" style={{ width: '5%' }}>Actions</th>}
                                            {efaDetalHeader.map((header, index) => (
                                                <th
                                                    key={index}
                                                    style={{ whiteSpace: "nowrap", width: header.width, minWidth: header.width }}>
                                                    {header.label}
                                                    {header.isHelpExist && (<FcInfo title="Info" />)}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData && formData.map((data, rowIndex) => (
                                            <tr
                                                key={rowIndex}
                                                ref={(el) => rowRefs.current[rowIndex] = el}
                                                tabIndex={0}
                                                onClick={() => makeFocusOnTableRow(rowIndex)}
                                                style={{ border: rowIndex === focusedRowIndex ? '2px solid black' : 'none',}}
                                            >
                                                {(formStatus === 'Insert' || formStatus === 'Update') &&
                                                    <td className="">
                                                        <RowAction
                                                            formStatus={formStatus}
                                                            canDelete={formData.length > 1}
                                                            onDelete={() => handleDelete(data, rowIndex)}
                                                        />
                                                    </td>}
                                                <td className="table_cell">
                                                    <TextField
                                                        required
                                                        name="loan_purpose_desc"
                                                        value={data?.loan_purpose_desc || ''}
                                                        onChange={(e) => handleChange(e, "loan_purpose_desc", e.target.value, rowIndex)}
                                                        onBlur={(e) => checkDuplicateEntry(e, e.target.value, rowIndex,formData)}
                                                    />
                                                </td>
                                                <td className="table_cell">
                                                    <TextField
                                                        required
                                                        name="acc_no"
                                                        value={data?.acc_no || ''}
                                                        onChange={(e) => handleChange(e, "acc_no", e.target.value, rowIndex)}
                                                        onDoubleClick={() => openHelpList('acc_no', accNoHelpListHeader, rowIndex)}
                                                    />
                                                </td>
                                                <td className="table_cell">
                                                    <TextField
                                                        required
                                                        type="number"
                                                        name="loan_eligibility_yrs"
                                                        value={data?.loan_eligibility_yrs || ''}
                                                        onChange={(e) => handleChange(e, "loan_eligibility_yrs", e.target.value, rowIndex)}
                                                    />
                                                </td>
                                                <td className="table_cell">
                                                    <Checkbox
                                                        // text="Doc 1"
                                                        checked={data?.loan_eligibility_doc1 === "Y"}
                                                        onChange={(e) =>
                                                        handleChange(e, "loan_eligibility_doc1", e.target.checked ? "Y" : "N", rowIndex)
                                                        }
                                                    />
                                                </td>
                                                <td className="table_cell">
                                                    <Checkbox
                                                        // text="Doc 2"
                                                        checked={data?.loan_eligibility_doc2 === "Y"}
                                                        onChange={(e) =>
                                                        handleChange(e, "loan_eligibility_doc2", e.target.checked ? "Y" : "N", rowIndex)
                                                        }
                                                    />
                                                </td>
                                                <td className="table_cell">
                                                    <Checkbox
                                                        // text="Doc 3"
                                                        checked={data?.loan_eligibility_doc3 === "Y"}
                                                        onChange={(e) =>
                                                        handleChange(e, "loan_eligibility_doc3", e.target.checked ? "Y" : "N", rowIndex)
                                                        }
                                                    />
                                                </td>
                                                <td className="table_cell">
                                                    <Checkbox
                                                        // text="Doc 4"
                                                        checked={data?.loan_eligibility_doc4 === "Y"}
                                                        onChange={(e) =>
                                                        handleChange(e, "loan_eligibility_doc4", e.target.checked ? "Y" : "N", rowIndex)
                                                        }
                                                    />
                                                </td>
                                                <td className="table_cell">
                                                    <Checkbox
                                                        // text="Doc 5"
                                                        checked={data?.loan_eligibility_doc5 === "Y"}
                                                        onChange={(e) =>
                                                        handleChange(e, "loan_eligibility_doc5", e.target.checked ? "Y" : "N", rowIndex)
                                                        }
                                                    />
                                                </td>
                                                <td className="table_cell">
                                                    <Checkbox
                                                        // text="Doc 6"
                                                        checked={data?.loan_eligibility_doc6 === "Y"}
                                                        onChange={(e) =>
                                                        handleChange(e, "loan_eligibility_doc6", e.target.checked ? "Y" : "N", rowIndex)
                                                        }
                                                    />
                                                </td>

                                            </tr>
                                        ))}
                                    </tbody>
                                {/* </Table> */}
                                </Table>
                            </div>
                            </SimpleBar>
                        </div>

                        <Row>
                            <Col md={6}>
                                <div style={{ width: "40%" }}>
                                    <TextField
                                        label="Acc Description"
                                        name="acc_desc"
                                        value={formData[focusedRowIndex]?.acc_desc || ""}
                                        onChange={(e) => handleChange("acc_desc", e.target.value, focusedRowIndex)}
                                        disabled
                                    />
                                </div>
                            </Col>
                        </Row>
                    </Form>
                </Col>
            </Row>
        </React.Fragment>
    );
};

export default EfaDetail;
