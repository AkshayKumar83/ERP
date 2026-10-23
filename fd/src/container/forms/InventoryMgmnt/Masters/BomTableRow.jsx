


import React from "react";
import TextField from "../../../../components/basic/textField";
import { Col, Row, Table, Form } from "reactstrap";
import ButtonUi from "../../../../components/basic/button";
import Checkbox from "../../../../components/basic/checkbox";
import SimpleBar from "simplebar-react";
import RowAction from "../../../../components/common/rowAction";
import { headers } from "./bomHelpers";
import MuiTextField from "../../../../components/basic/muiTextField";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";

const BomTableRow = ({
  formData,
  setFormData,
  detailData,
  setDetailData,
  handleChange,
  formStatus,
  triggerAddRow,
  handleDelete,
  toggleExpand,
  focusedNodeId,
  setFocusedNodeId,
}) => {
  // UPDATED: Recursive render for tree rows, focus by node ID
  const renderTreeRows = (nodes, parentPath = []) => {
    return nodes.map((data) => {
      const currentPath = [...parentPath, data.id];
      const isFocused = focusedNodeId === data.id;
      const hasChildren = data.children && data.children.length > 0;
      const isExpanded = data.expanded !== false;
      const rowKey = `row-${data.id}`; // Unique key for each row fragment

      return (
        <React.Fragment key={rowKey}>
          <tr
            onFocus={(e) => {
              e.stopPropagation(); // Prevent tr focus interfering with inputs
              setFocusedNodeId(data.id);
            }}
            style={{ border: isFocused ? "2px solid black" : "none" }}
            tabIndex={0}
          >
            {(formStatus === "Insert" || formStatus === "Update" || formStatus === "Query") && (
              <td className="sticky-column left" style={{ paddingLeft: `${data.level * 5}px` }}>
                {/*  NEW: Flex wrapper for horizontal alignment of actions/icons */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px', // Small space between icons
                  flexWrap: 'nowrap' // Prevent wrapping to vertical
                }}>
                  {/* Always show RowAction (delete) only in Insert/Update */}
                  {(formStatus === "Insert" || formStatus === "Update") && (
                    <RowAction
                      formStatus={formStatus}
                      canDelete={true}
                      onDelete={() => handleDelete(data.id)}
                    />
                  )}

                  {/* Expand/Collapse: Always show if hasChildren, regardless of mode – but subtle in Query */}
                  {hasChildren && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(data.id);
                      }}
                      className="expand-btn"
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer',
                        opacity: formStatus === "Query" ? 0.6 : 1, // Subtle in query
                        color: formStatus === "Query" ? '#black' : '#007bff' // Gray in query, blue otherwise
                      }}
                      title={isExpanded ? "Collapse" : "Expand"}
                    >
                      {isExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
                    </button>
                  )}

                  {/*  FIXED: + Icon now directly adds child row (no selection needed) */}
                  {(formStatus === "Insert" || formStatus === "Update") && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerAddRow(data.id); // Direct add child to this row
                      }}
                      className="add-child-btn"
                      title="Add Child Row Here"
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer',
                        color: '#007bff',
                        padding: '2px'
                      }}
                    >
                      <AddIcon fontSize="small" />
                    </button>
                  )}
                </div>
              </td>
            )}
            {/*  NEW: Seq. no column right after Actions */}
            <td className="table_cell">
              <MuiTextField
                type="text"
                required
                name="seq_no"
                value={data?.seq_no || ""}
               
                onChange={(e) => handleChange("seq_no", e.target.value, data.id)}
                size="small"
                fullWidth
              />
            </td>
            {/*  NEW: Parent Column - After Seq., shows par_it_cd, disabled always */}
            <td className="table_cell">
              <MuiTextField
                type="text"
                // label="Parent"
                name="par_it_cd"
                value={data?.par_it_cd || formData.par_it_cd || ""} // Use row's parent or header's
                disabled
                size="small"
                fullWidth
                 maxLength={20}
              />
            </td>
            {/* Rest of cells with indentation - UPDATED: Use MuiTextField for editable inputs */}
            <td className="table_cell">
              <MuiTextField
                type="text"
                required
                name="chl_it_cd"
                value={data?.chl_it_cd || ""}
                maxLength={20}
                onChange={(e) => handleChange("chl_it_cd", e.target.value, data.id)}
                size="small"
                fullWidth
              />
            </td>
            <td className="table_cell">
              <MuiTextField
                type="text"
                required
                name="child_desc"
                value={data?.child_desc || ""}
                // maxLength={20}
                onChange={(e) => handleChange("child_desc", e.target.value, data.id)}
                size="small"
                fullWidth
              />
            </td>
            <td className="table_cell">
              <MuiTextField
                type="text"
                required
                name="child_uom"
                value={data?.child_uom || ""}
                // maxLength={20}
                onChange={(e) => handleChange("child_uom", e.target.value, data.id)}
                size="small"
                fullWidth
              />
            </td>
            <td className="table_cell">
              <MuiTextField
                type="number"
                required
                name="usage"
                value={data?.usage || ""}
                // maxLength={20}
                onChange={(e) => handleChange("usage", e.target.value, data.id)}
                size="small"
                fullWidth
              />
            </td>
            <td className="table_cell">
              <MuiTextField
                type="number"
                required
                name="rej_perc"
                value={data?.rej_perc || ""}
                // maxLength={20}
                onChange={(e) => handleChange("rej_perc", e.target.value, data.id)}
                size="small"
                fullWidth
              />
            </td>
            <td className="table_cell">
              <Checkbox onChange={(e) => handleChange("active", e.target.checked ? "Y" : "N", data.id)} checked={data?.active === "Y"} />
            </td>
            <td className="table_cell">
              <MuiTextField
                type="text"
                required
                name="remarks"
                value={data?.remarks || ""}
                // maxLength={20}
                onChange={(e) => handleChange("remarks", e.target.value, data.id)}
                size="small"
                fullWidth
              />
            </td>
            <td className="table_cell">
              <MuiTextField
                type="text"
                required
                name="drawing_no"
                value={data?.drawing_no || ""}
                // maxLength={20}
                onChange={(e) => handleChange("drawing_no", e.target.value, data.id)}
                size="small"
                fullWidth
              />
            </td>
            <td className="table_cell">
              <MuiTextField
                type="number"
                required
                name="overheads"
                value={data?.overheads || ""}
                // maxLength={20}
                onChange={(e) => handleChange("overheads", e.target.value, data.id)}
                size="small"
                fullWidth
              />
            </td>
            <td className="table_cell">
              <MuiTextField
                type="number"
                required
                name="labourcost"
                value={data?.labourcost || ""}
                // maxLength={20}
                onChange={(e) => handleChange("labourcost", e.target.value, data.id)}
                size="small"
                fullWidth
              />
            </td>
            <td className="table_cell">
              <Checkbox onChange={(e) => handleChange("it_fmp_pu", e.target.checked ? "Y" : "N", data.id)} checked={data?.it_fmp_pu === "Y"} />
            </td>
            <td className="table_cell">
              <Checkbox onChange={(e) => handleChange("mrp_yesno", e.target.checked ? "Y" : "N", data.id)} checked={data?.mrp_yesno === "Y"} />
            </td>
          </tr>
          {/* Recursive children */}
          {isExpanded && hasChildren && renderTreeRows(data.children, currentPath)}
        </React.Fragment>
      );
    });
  };

  return (
    <>
      {/* Parent Header Fields - Same */}
      <Row>
        <Col xl={2}>
          <MuiTextField
            type="text"
            label="Parent Item Code"
            name="par_it_cd"
            value={formData?.par_it_cd}
            onChange={(e) => handleChange("par_it_cd", e.target.value)}
          />
        </Col>
        <Col xl={10}>
          <MuiTextField
            type="text"
            label="Parent Item Description"
            name="par_desc"
            value={formData?.par_desc}
            onChange={(e) => handleChange("par_desc", e.target.value)}
          />
        </Col>
      </Row>
      <Row className="mt-3">
        <Col xl={2}>
          <MuiTextField
            type="text"
            label="Parent UOM"
            name="par_uom"
            value={formData?.par_uom}
            onChange={(e) => handleChange("par_uom", e.target.value)}
          />
        </Col>
        <Col xl={2}>
          <MuiTextField
            type="text"
            label="Drawing Code"
            name="drawing_no"
            value={formData?.drawing_no}
            onChange={(e) => handleChange("drawing_no", e.target.value)}
          />
        </Col>
        <Col xl={8}>
          <MuiTextField
            type="text"
            label="Parent Remarks"
            name="par_remarks"
            value={formData?.par_remarks}
            onChange={(e) => handleChange("par_remarks", e.target.value)}
          />
        </Col>
      </Row>

      {/* Tree Table */}
      <div className="">
        <Row className="mb-2">
          <Col xl={12}>
            <Form id="bill-of-material" className="">
              <div className="table-title">
                <span>Bill of Material (Tree View)</span>
                {(formStatus === "Insert" || formStatus === "Update") && (
                  <>
                    <ButtonUi color="primary" className="add-action me-2" onClick={() => triggerAddRow(null)}>
                      Add Row
                    </ButtonUi>
                    {/*  REMOVED: "Add Child to Selected" button, as + icon now directly adds */}
                  </>
                )}
              </div>
          <div className="table-wrapper-v3">
                             <SimpleBar forceVisible="y" autoHide={false}>
                               <div className="table-sticky-wrapper "style={{ height: '265px', maxHeight: '265px' }}>
                                 <Table hover>
                                   <thead>
                                     <tr>
                                       {(formStatus === "Insert" || formStatus === "Update" || formStatus === "Query") &&
                           <th  style={{ width: "1px" }} className="">Actions</th>
                           }
                           {headers.map((header, index) => (                             <th key={index} style={{ whiteSpace: "nowrap", width: header.width, minWidth: header.width }}>
                               {header.label}
                               {header.required && <span className="required-asterisk">*</span>}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {renderTreeRows(detailData)}
                      </tbody>
                    </Table>
                  </div>
                </SimpleBar>
              </div>
            </Form>
          </Col>
         </Row>
       </div>
     </>
   );
 }
 export default BomTableRow;