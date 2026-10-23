// import React, { useEffect, useState } from "react";
// import { Table } from "reactstrap";
// import Checkbox from "./checkbox";
// import { RiDeleteBack2Line, RiVerifiedBadgeFill, RiVerifiedBadgeLine } from "@remixicon/react";

// const TableComponent = (props) => {
//   const { columns, selectedItems, setSelectedItems, showCheckboxes, showDelete, showVerify } = props;
//   const [verified, setVerified] = useState(false);

//   let data = [{ id: 1 }, { id: 2 }, { id: 3 }];
//   if (props.data) {
//     data = props.data;
//   }

//   const handleSelect = (e, itemId) => {
//     const isChecked = e.target.checked;
//     if (isChecked) {
//       setSelectedItems([...selectedItems, itemId]);
//     } else {
//       setSelectedItems(selectedItems.filter((id) => id !== itemId));
//     }
//   };

//   const handleSelectAll = (e) => {
//     const isChecked = e.target.checked;
//     if (isChecked) {
//       setSelectedItems(data.map((item) => item.id));
//     } else {
//       setSelectedItems([]);
//     }
//   };
//   let thWidth = showCheckboxes ? (showDelete ? (showVerify ? "80px" : "60px") : "40px") : "0px";

//   return (
//     <div className="table-wrapper">
//       <Table hover bordered={true} responsive>
//         <thead>
//           <tr>
//             {(showCheckboxes || showDelete || showVerify) && (
//               <th style={{ height: "100%", width: thWidth }}>
//                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                   {showCheckboxes && (
//                     <span className="checkbox-wrapper">
//                       <Checkbox onChange={handleSelectAll} checked={selectedItems.length === data.length} />
//                     </span>
//                   )}
//                   {showDelete && (
//                     <span className="delete-wrapper">
//                       <RiDeleteBack2Line className="color-error" style={{ height: "16px", width: "16px" }} />
//                     </span>
//                   )}
//                   {showVerify && <span className="delete-wrapper" style={{ width: "16px" }}></span>}
//                 </div>
//               </th>
//             )}
//             {columns.map((col, index) => (
//               <th key={index}>{col.label}</th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {data.map((item) => (
//             <tr key={item.id}>
//               {(showCheckboxes || showDelete || showVerify) && (
//                 <td style={{ height: "100%", width: thWidth }}>
//                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                     {showCheckboxes && (
//                       <span className="checkbox-wrapper">
//                         <Checkbox checked={selectedItems.includes(item.id)} onChange={(e) => handleSelect(e, item.id)} />
//                       </span>
//                     )}
//                     {showDelete && (
//                       <span className="delete-wrapper">
//                         <RiDeleteBack2Line className="color-error" style={{ height: "16px", width: "16px" }} />
//                       </span>
//                     )}
//                     {showVerify && (
//                       <span className="verified-wrapper">
//                         {verified ? (
//                           <RiVerifiedBadgeFill onClick={() => setVerified(false)} className="color-success" style={{ height: "18px", width: "18px" }} />
//                         ) : (
//                           <RiVerifiedBadgeLine onClick={() => setVerified(true)} className="color-success" style={{ height: "18px", width: "18px" }} />
//                         )}
//                       </span>
//                     )}
//                   </div>
//                 </td>
//               )}
//               {columns.map((col, index) => (
//                 <td key={index}>{item[col.key]}</td>
//               ))}
//             </tr>
//           ))}
//         </tbody>
//       </Table>
//     </div>
//   );
// };

// export default TableComponent;



// import React, { useState, useEffect } from "react";
// import { Table } from "reactstrap";
// import Checkbox from "./checkbox";
// import { RiDeleteBack2Line, RiVerifiedBadgeFill, RiVerifiedBadgeLine } from "@remixicon/react";
// import Select from "./select";
// import TextField from "./textField";


// const TableComponent = ({ columns, data, selectedItems, setSelectedItems, showCheckboxes, showDelete, showVerify, handleChange, validateRow, handleRowAction }) => {
//   const [verified, setVerified] = useState(false);

//   // Handle select all functionality
//   const handleSelectAll = (e) => {
//     const isChecked = e.target.checked;
//     if (isChecked) {
//       setSelectedItems(data.map((item) => item.id));
//     } else {
//       setSelectedItems([]);
//     }
//   };

//   // Handle row selection
//   const handleSelect = (e, itemId) => {
//     const isChecked = e.target.checked;
//     if (isChecked) {
//       setSelectedItems([...selectedItems, itemId]);
//     } else {
//       setSelectedItems(selectedItems.filter((id) => id !== itemId));
//     }
//   };

//   // Render cell input based on column type
//   const renderCellInput = (col, item, rowIndex) => {
//     const value = item[col.key];
    
//     switch (col.type) {
//       case "select":
//         return (
//           <Select
//             value={value ? { value, label: value } : null}
//             onChange={(selected) => handleChange(col.key, selected ? selected.value : "", rowIndex)}
//             options={col.options || []}
//             isValid={validateRow(rowIndex)}
//           />
//         );
//       case "checkbox":
//         return (
//           <Checkbox
//             checked={value}
//             onChange={(e) => handleChange(col.key, e.target.checked, rowIndex)}
//           />
//         );
//       case "text":
//       case "email":
//       case "number":
//         return (
//           <TextField
//             type={col.type || "text"}
//             value={value || ""}
//             onChange={(e) => handleChange(col.key, e.target.value, rowIndex)}
//             error={validateRow(rowIndex)}
//             helperText={validateRow(rowIndex) && "Invalid input"}
//           />
//         );
//         case "date":
//           return (
//             <TextField
//               type={col.type || "date"}
//               value={value || ""}
//               onChange={(e) => handleChange(col.key, e.target.value, rowIndex)}
//               error={validateRow(rowIndex)}
//               helperText={validateRow(rowIndex) && "Invalid input"}
//             />
//           );
//       case "radio":
//         return (
//           <div>
//             {col.options.map((option) => (
//               <label key={option.value}>
//                 <input
//                   type="radio"
//                   value={option.value}
//                   checked={value === option.value}
//                   onChange={(e) => handleChange(col.key, e.target.value, rowIndex)}
//                 />
//                 {option.label}
//               </label>
//             ))}
//           </div>
//         );
//       default:
//         return <span>{value}</span>;
//     }
//   };

//   let thWidth = showCheckboxes ? (showDelete ? (showVerify ? "80px" : "60px") : "40px") : "0px";

//   return (
//     <div className="table-wrapper">
//       <Table hover bordered={true} responsive className="table_v2">
//         <thead>
//           <tr>
//             {(showCheckboxes || showDelete || showVerify) && (
//               <th style={{ height: "100%", width: thWidth }}>
//                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                   {showCheckboxes && (
//                     <span className="checkbox-wrapper">
//                       <Checkbox onChange={handleSelectAll} checked={selectedItems.length === data.length} />
//                     </span>
//                   )}
//                   {showDelete && (
//                     <span className="delete-wrapper">
//                       <RiDeleteBack2Line className="color-error" style={{ height: "16px", width: "16px" }} />
//                     </span>
//                   )}
//                   {showVerify && <span className="delete-wrapper" style={{ width: "16px" }}></span>}
//                 </div>
//               </th>
//             )}
//             {columns.map((col, index) => (
//               <th key={index} style={{whiteSpace:'nowrap'}}>{col.label}</th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {data.map((item, rowIndex) => (
//             <tr key={item.id}>
//               {(showCheckboxes || showDelete || showVerify) && (
//                 <td style={{ height: "100%", width: thWidth }}>
//                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                     {showCheckboxes && (
//                       <span className="checkbox-wrapper">
//                         <Checkbox checked={selectedItems.includes(item.id)} onChange={(e) => handleSelect(e, item.id)} />
//                       </span>
//                     )}
//                     {showDelete && (
//                       <span className="delete-wrapper" onClick={() => handleRowAction("delete", item.id)}>
//                         <RiDeleteBack2Line className="color-error" style={{ height: "16px", width: "16px" }} />
//                       </span>
//                     )}
//                     {showVerify && (
//                       <span className="verified-wrapper" onClick={() => setVerified(!verified)}>
//                         {verified ? (
//                           <RiVerifiedBadgeFill className="color-success" style={{ height: "18px", width: "18px" }} />
//                         ) : (
//                           <RiVerifiedBadgeLine className="color-success" style={{ height: "18px", width: "18px" }} />
//                         )}
//                       </span>
//                     )}
//                   </div>
//                 </td>
//               )}
//               {columns.map((col, index) => (
//                 <td key={index}>{renderCellInput(col, item, rowIndex)}</td>
//               ))}
//             </tr>
//           ))}
//         </tbody>
//       </Table>
//     </div>
//   );
// };

// export default TableComponent;


import React, { useState } from "react";
import { Table } from "reactstrap";
import Checkbox from "./checkbox";
import { RiDeleteBack2Line, RiVerifiedBadgeFill, RiVerifiedBadgeLine } from "@remixicon/react";
import Select from "./select";
import TextField from "./textField";

const TableComponent = ({
  columns,
  data,
  selectedItems,
  setSelectedItems,
  showCheckboxes,
  showDelete,
  showVerify,
  handleChange,
  validateRow,
  handleRowAction,
  staticColumnIndex, // Index of the column to be static (e.g., last column)
}) => {
  const [verified, setVerified] = useState(false);

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    setSelectedItems(isChecked ? data.map((item) => item.id) : []);
  };

  const handleSelect = (e, itemId) => {
    const isChecked = e.target.checked;
    setSelectedItems(isChecked ? [...selectedItems, itemId] : selectedItems.filter((id) => id !== itemId));
  };

  const renderCellInput = (col, item, rowIndex) => {
    const value = item[col.key];

    switch (col.type) {
      case "select":
        return (
          <Select
            value={value ? { value, label: value } : null}
            onChange={(selected) => handleChange(col.key, selected ? selected.value : "", rowIndex)}
            options={col.options || []}
            isValid={validateRow(rowIndex)}
          />
        );
      case "checkbox":
        return (
          <Checkbox
            checked={value}
            onChange={(e) => handleChange(col.key, e.target.checked, rowIndex)}
          />
        );
      case "text":
      case "email":
      case "number":
      case "date":
        return (
          <TextField
            type={col.type}
            value={value || ""}
            onChange={(e) => handleChange(col.key, e.target.value, rowIndex)}
            error={validateRow(rowIndex)}
            helperText={validateRow(rowIndex) && "Invalid input"}
          />
        );
      case "radio":
        return (
          <div>
            {col.options.map((option) => (
              <label key={option.value}>
                <input
                  type="radio"
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => handleChange(col.key, e.target.value, rowIndex)}
                />
                {option.label}
              </label>
            ))}
          </div>
        );
      default:
        return <span>{value}</span>;
    }
  };

  const thWidth = showCheckboxes ? (showDelete ? (showVerify ? "80px" : "60px") : "40px") : "0px";

  return (
    <div className="table-wrapper" style={{ position: "relative", overflowX: "auto" }}>
      <Table hover bordered responsive className="table_v2">
        <thead>
          <tr>
            {(showCheckboxes || showDelete || showVerify) && (
              <th style={{ width: thWidth }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {showCheckboxes && <Checkbox onChange={handleSelectAll} checked={selectedItems.length === data.length} />}
                  {showDelete && <RiDeleteBack2Line className="color-error" style={{ height: "16px", width: "16px" }} />}
                  {showVerify && <span style={{ width: "16px" }}></span>}
                </div>
              </th>
            )}
            {columns.map((col, index) => (
              <th
                key={index}
                style={{
                  whiteSpace: "nowrap",
                  width: col.width || "auto",
                  position: staticColumnIndex === index ? "sticky" : "static",
                  right: staticColumnIndex === index ? 0 : "auto",
                  backgroundColor: staticColumnIndex === index ? "#fff" : "transparent",
                  zIndex: staticColumnIndex === index ? 1 : "auto",
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, rowIndex) => (
            <tr key={item.id}>
              {(showCheckboxes || showDelete || showVerify) && (
                <td style={{ width: thWidth }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    {showCheckboxes && (
                      <Checkbox checked={selectedItems.includes(item.id)} onChange={(e) => handleSelect(e, item.id)} />
                    )}
                    {showDelete && (
                      <RiDeleteBack2Line
                        className="color-error"
                        style={{ height: "16px", width: "16px", cursor: "pointer" }}
                        onClick={() => handleRowAction("delete", item.id)}
                      />
                    )}
                    {showVerify && (
                      <div onClick={() => setVerified(!verified)} style={{ cursor: "pointer" }}>
                        {verified ? (
                          <RiVerifiedBadgeFill className="color-success" style={{ height: "18px", width: "18px" }} />
                        ) : (
                          <RiVerifiedBadgeLine className="color-success" style={{ height: "18px", width: "18px" }} />
                        )}
                      </div>
                    )}
                  </div>
                </td>
              )}
              {columns.map((col, index) => (
                <td
                  key={index}
                  style={{
                    width: col.width || "auto",
                    position: staticColumnIndex === index ? "sticky" : "static",
                    right: staticColumnIndex === index ? 0 : "auto",
                    backgroundColor: staticColumnIndex === index ? "#fff" : "transparent",
                    zIndex: staticColumnIndex === index ? 1 : "auto",
                  }}
                >
                  {renderCellInput(col, item, rowIndex)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default TableComponent;