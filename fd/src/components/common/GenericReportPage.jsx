


// // import { useState, useRef } from "react";
// // import { useLocation, useNavigate } from "react-router-dom";
// // import toast from "react-hot-toast";
// // import ReportHeader from "../AppLayout/Reports/reportHeader";
// // import ReportGrid from "../AppLayout/Reports/reportGrid";

// // const GenericReportPage = ({
// //   FormComponent,
// //   apiUrl,
// //   rightAlignedFields = [],
// //   reportTitle,
// //   companyName = "ESCORTS DEALERS DEVELOPMENT ASSOCIATION LIMITED",
// //   chartComponent: ChartComponent ,  // for chart graph
// //    rowColorRules = [],  // this props for give row color in report 

// // }) => {

// //   const navigate = useNavigate();
// //   const location = useLocation();
// //   const headerEventsRef = useRef({});
// //   const [showForm, setShowForm] = useState(true);
// //   const [dynamicColumns, setDynamicColumns] = useState([]);
// //   const [fetchDataFunc, setFetchDataFunc] = useState(() => async () => ({ data: [], total: 0 }));
// //   const [reportRawData, setReportRawData] = useState(null);  // for chart graph
// //   const [isDataLoaded, setIsDataLoaded] = useState(false);  // ← NEW: Local state for header actions (no need in individual components)
// //   const [showReport, setShowReport] = useState(false); // ← NEW: Control showing the report grid

// //   const handleFormSubmit = async (res) => {
// //     try {
// //       const { data: apiData, columns: backendColumns } = res;
// //       setReportRawData(res);
// //       const total = apiData.length;

// //       //  Add id
// //       const processedData = apiData.map((row, index) => ({
// //         ...row,
// //         id: row.ge_id || `row-${index}`,
// //       }));

// //       //  Create column definitions using backend column list
// //       const columns = backendColumns.map((field) => {
// //         const baseColumn = {
// //           field,
// //           headerName: field
// //             .split("_")
// //             .map((w) => w[0].toUpperCase() + w.slice(1))
// //             .join(" "),
// //         };

// //         if (rightAlignedFields.includes(field)) {
// //           return { ...baseColumn, align: "right" };
// //         }
// //         return baseColumn;
// //       });

// //       //  Pagination wrapper
// //       const fetchWrapper = async ({ page, pageSize }) => {
// //         const start = page * pageSize;
// //         return {
// //           data: processedData.slice(start, start + pageSize),
// //           total,
// //         };
// //       };

// //       setDynamicColumns(columns);
// //       setFetchDataFunc(() => fetchWrapper);
// //       setShowForm(false);
      
// //       // ← FIXED: If no chart, directly show report grid; else show dashboard first
// //       if (!ChartComponent) {
// //         setShowReport(true);  // No dashboard → directly grid
// //       } else {
// //         setShowReport(false); // Has dashboard → show chart first
// //       }

// //     } catch (error) {
// //       toast.error("Something went wrong.");
// //     }
// //   };

// //   const getBaseModuleUrl = () =>{
// //     const parts = location.pathname.split("/");
// //     if(parts.length > 3) parts.pop();
// //     return parts.join("/");
// //   }
   

// //   const handleReset = () => {
// //     setShowForm(true);
// //     setDynamicColumns([]);
// //     setFetchDataFunc(() => async () => ({ data: [], total: 0 }));
// //     setIsDataLoaded(false);  // ← NEW: Reset on form show
// //     setShowReport(false); // ← NEW: Reset on form show
// //   };

// //   // ← NEW: Callback from ReportGrid for isDataLoaded
// //   const handleStateChange = ({ isDataLoaded: loaded }) => {
// //     setIsDataLoaded(loaded);
// //   };

// //   // ← NEW: Callback from ChartComponent to show report
// //   const handleShowReport = () => {
// //     setShowReport(true);
// //   };
  
// //   // ← FIXED: Helper to check if we should show grid (always if no chart, or if showReport=true with chart)
// //   const shouldShowGrid = !ChartComponent || showReport;
  
// //   // ← FIXED: Helper to check if we should show chart (only if chart exists and !showReport)
// //   const shouldShowChart = ChartComponent && !showReport && reportRawData;
  
// //   return (
// //    <div className="generic-report-page">
// //       <ReportHeader
// //         onColumnClick={(e) => headerEventsRef.current.onColumnClick?.(e)}
// //         onExportClick={(e) => headerEventsRef.current.onExportClick?.(e)}
// //         onExitClick={() => {
// //           if (showForm) {
// //             navigate(getBaseModuleUrl());   // dynamic path
// //           } else {
// //             handleReset();
// //           }
// //         }}
// //         showActions={isDataLoaded}  // ← NEW: Pass local state to control buttons
// //       />

// //       {showForm ? (
// //         <FormComponent onSubmit={handleFormSubmit} />
// //       ) : (
// //         <>
// //           {/* ← FIXED: Chart only if shouldShowChart */}
// //           {shouldShowChart && (
// //             <div className="p-3">
// //               <ChartComponent 
// //                 data={reportRawData} 
// //                 onShowReport={handleShowReport}  // ← Button callback pass
// //               />
// //             </div>
// //           )}
          
// //           {/* ← FIXED: Grid if shouldShowGrid */}
// //           {shouldShowGrid && (
// //             <ReportGrid
// //               columns={dynamicColumns}
// //               fetchData={fetchDataFunc}
// //               reportTitle={reportTitle}
// //               companyName={companyName}
// //               headerEvents={(events) => {
// //                 headerEventsRef.current = {
// //                   ...events,
// //                   onExitClick: handleReset,
// //                 };
// //               }}
// //               onStateChange={handleStateChange}  // ← NEW: Listen to grid state for buttons
// //               rowColorRules={rowColorRules}
// //             />
// //           )}
// //         </>
// //       )}
// //     </div>
// //   );
// // };

// // export default GenericReportPage;





// import { useState, useRef } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";
// import ReportHeader from "../AppLayout/Reports/reportHeader";
// import ReportGrid from "../AppLayout/Reports/reportGrid";

// const GenericReportPage = ({
//   FormComponent,
//   apiUrl,
//   rightAlignedFields = [],
//   reportTitle,
//   companyName = "ESCORTS DEALERS DEVELOPMENT ASSOCIATION LIMITED",
//   chartComponent: ChartComponent,  // for chart graph
//   rowColorRules = [],  // this props for give row color in report 

// }) => {

//   const navigate = useNavigate();
//   const location = useLocation();
//   const headerEventsRef = useRef({});
//   const [showForm, setShowForm] = useState(true);
//   const [dynamicColumns, setDynamicColumns] = useState([]);
//   const [fetchDataFunc, setFetchDataFunc] = useState(() => async () => ({ data: [], total: 0 }));
//   const [reportRawData, setReportRawData] = useState(null);  // for chart graph
//   const [isDataLoaded, setIsDataLoaded] = useState(false);  // ← NEW: Local state for header actions (no need in individual components)
//   const [showReport, setShowReport] = useState(false); // ← NEW: Control showing the report grid

//   const handleFormSubmit = async (res) => {
//     try {
//       const { data: apiData, columns: backendColumns } = res;
//       setReportRawData(res);
//       const total = apiData.length;

//       //  Add id
//       const processedData = apiData.map((row, index) => ({
//         ...row,
//         id: row.ge_id || `row-${index}`,
//       }));

//       // //  Create column definitions using backend column list
//       // const columns = backendColumns.map((field) => {
//       //   const baseColumn = {
//       //     field,
//       //     headerName: field
//       //       .split("_")
//       //       .map((w) => w[0].toUpperCase() + w.slice(1))
//       //       .join(" "),
//       //   };

//       //   if (rightAlignedFields.includes(field)) {
//       //     return { ...baseColumn, align: "right" };
//       //   }
//       //   return baseColumn;
//       // });n  

//       // changes by vartika on 13-07-2026

//       const columns = backendColumns.map((col) => {
//         // New format: { field, headerName }
//         if (typeof col === "object" && col !== null) {
//           const baseColumn = {
//             field: col.field,
//             headerName: col.headerName,
//           };

//           if (rightAlignedFields.includes(col.field)) {
//             return { ...baseColumn, align: "right" };
//           }

//           return baseColumn;
//         }

//         // Old format: "emp_cd"
//         const baseColumn = {
//           field: col,
//           headerName: col
//             .split("_")
//             .map((w) => w[0].toUpperCase() + w.slice(1))
//             .join(" "),
//         };

//         if (rightAlignedFields.includes(col)) {
//           return { ...baseColumn, align: "right" };
//         }

//         return baseColumn;
//       });



//       //  Pagination wrapper
//       const fetchWrapper = async ({ page, pageSize }) => {
//         const start = page * pageSize;
//         return {
//           data: processedData.slice(start, start + pageSize),
//           total,
//         };
//       };

//       setDynamicColumns(columns);
//       setFetchDataFunc(() => fetchWrapper);
//       setShowForm(false);

//       // ← FIXED: If no chart, directly show report grid; else show dashboard first
//       if (!ChartComponent) {
//         setShowReport(true);  // No dashboard → directly grid
//       } else {
//         setShowReport(false); // Has dashboard → show chart first
//       }

//     } catch (error) {
//       toast.error("Something went wrong.");
//     }
//   };

//   const getBaseModuleUrl = () => {
//     const parts = location.pathname.split("/");
//     if (parts.length > 3) parts.pop();
//     return parts.join("/");
//   }


//   const handleReset = () => {
//     setShowForm(true);
//     setDynamicColumns([]);
//     setFetchDataFunc(() => async () => ({ data: [], total: 0 }));
//     setIsDataLoaded(false);  // ← NEW: Reset on form show
//     setShowReport(false); // ← NEW: Reset on form show
//   };

//   // ← NEW: Callback from ReportGrid for isDataLoaded
//   const handleStateChange = ({ isDataLoaded: loaded }) => {
//     setIsDataLoaded(loaded);
//   };

//   // ← NEW: Callback from ChartComponent to show report
//   const handleShowReport = () => {
//     setShowReport(true);
//   };

//   // ← FIXED: Helper to check if we should show grid (always if no chart, or if showReport=true with chart)
//   const shouldShowGrid = !ChartComponent || showReport;

//   // ← FIXED: Helper to check if we should show chart (only if chart exists and !showReport)
//   const shouldShowChart = ChartComponent && !showReport && reportRawData;

//   return (
//     <div className="generic-report-page">
//       <ReportHeader
//         onColumnClick={(e) => headerEventsRef.current.onColumnClick?.(e)}
//         onExportClick={(e) => headerEventsRef.current.onExportClick?.(e)}
//         onExitClick={() => {
//           if (showForm) {
//             navigate(getBaseModuleUrl());   // dynamic path
//           } else {
//             handleReset();
//           }
//         }}
//         showActions={isDataLoaded}  // ← NEW: Pass local state to control buttons
//       />

//       {showForm ? (
//         <FormComponent onSubmit={handleFormSubmit} />
//       ) : (
//         <>
//           {/* ← FIXED: Chart only if shouldShowChart */}
//           {shouldShowChart && (
//             <div className="p-3">
//               <ChartComponent
//                 data={reportRawData}
//                 onShowReport={handleShowReport}  // ← Button callback pass
//               />
//             </div>
//           )}

//           {/* ← FIXED: Grid if shouldShowGrid */}
//           {shouldShowGrid && (
//             <ReportGrid
//               columns={dynamicColumns}
//               fetchData={fetchDataFunc}
//               reportTitle={reportTitle}
//               companyName={companyName}
//               headerEvents={(events) => {
//                 headerEventsRef.current = {
//                   ...events,
//                   onExitClick: handleReset,
//                 };
//               }}
//               onStateChange={handleStateChange}  // ← NEW: Listen to grid state for buttons
//               rowColorRules={rowColorRules}
//             />
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default GenericReportPage;







import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ReportHeader from "../AppLayout/Reports/reportHeader";
import ReportGrid from "../AppLayout/Reports/reportGrid";

const GenericReportPage = ({
  FormComponent,
  apiUrl,
  rightAlignedFields = [],
  reportTitle,
  companyName = "ESCORTS DEALERS DEVELOPMENT ASSOCIATION LIMITED",
  chartComponent: ChartComponent,  // for chart graph
  rowColorRules = [],  // this props for give row color in report 

}) => {

  const navigate = useNavigate();
  const location = useLocation();
  const headerEventsRef = useRef({});
  const [showForm, setShowForm] = useState(true);
  const [dynamicColumns, setDynamicColumns] = useState([]);
  const [fetchDataFunc, setFetchDataFunc] = useState(() => async () => ({ data: [], total: 0 }));
  const [reportRawData, setReportRawData] = useState(null);  // for chart graph
  const [isDataLoaded, setIsDataLoaded] = useState(false);  // ← NEW: Local state for header actions (no need in individual components)
  const [showReport, setShowReport] = useState(false); // ← NEW: Control showing the report grid

  const handleFormSubmit = async (res) => {
    try {
      const { data: apiData, columns: backendColumns, totals } = res;
      setReportRawData(res);
      const total = apiData.length;

      //  Add id
      const processedData = apiData.map((row, index) => ({
        ...row,
        id: row.ge_id || `row-${index}`,
      }));

      // -----------------------
      // Create TOTAL row dynamically
      // -----------------------
      // Add TOTAL row only if backend sends totals
      if (totals && Object.keys(totals).length > 0) {
        const totalRow = {
          id: "total-row",
        };

        backendColumns.forEach((col) => {
          const field = typeof col === "object" ? col.field : col;
          totalRow[field] = "";
        });

        const firstField =
          typeof backendColumns[0] === "object"
            ? backendColumns[0].field
            : backendColumns[0];

        totalRow[firstField] = "TOTAL";

        Object.assign(totalRow, totals);

        processedData.push(totalRow);
      }

      // //  Create column definitions using backend column list
      // const columns = backendColumns.map((field) => {
      //   const baseColumn = {
      //     field,
      //     headerName: field
      //       .split("_")
      //       .map((w) => w[0].toUpperCase() + w.slice(1))
      //       .join(" "),
      //   };

      //   if (rightAlignedFields.includes(field)) {
      //     return { ...baseColumn, align: "right" };
      //   }
      //   return baseColumn;
      // });n  

      // changes by vartika on 13-07-2026

      const columns = backendColumns.map((col) => {
        // New format: { field, headerName }
        if (typeof col === "object" && col !== null) {
          const baseColumn = {
            field: col.field,
            headerName: col.headerName,
          };

          if (rightAlignedFields.includes(col.field)) {
            return { ...baseColumn, align: "right" };
          }

          return baseColumn;
        }

        // Old format: "emp_cd"
        const baseColumn = {
          field: col,
          headerName: col
            .split("_")
            .map((w) => w[0].toUpperCase() + w.slice(1))
            .join(" "),
        };

        if (rightAlignedFields.includes(col)) {
          return { ...baseColumn, align: "right" };
        }

        return baseColumn;
      });




      //  Pagination wrapper
      const fetchWrapper = async ({ page, pageSize }) => {
        const start = page * pageSize;
        return {
          data: processedData.slice(start, start + pageSize),
          total,
        };
      };

      setDynamicColumns(columns);
      setFetchDataFunc(() => fetchWrapper);
      setShowForm(false);

      // ← FIXED: If no chart, directly show report grid; else show dashboard first
      if (!ChartComponent) {
        setShowReport(true);  // No dashboard → directly grid
      } else {
        setShowReport(false); // Has dashboard → show chart first
      }

    } catch (error) {
      toast.error("Something went wrong.");
    }
  };

  const getBaseModuleUrl = () => {
    const parts = location.pathname.split("/");
    if (parts.length > 3) parts.pop();
    return parts.join("/");
  }


  const handleReset = () => {
    setShowForm(true);
    setDynamicColumns([]);
    setFetchDataFunc(() => async () => ({ data: [], total: 0 }));
    setIsDataLoaded(false);  // ← NEW: Reset on form show
    setShowReport(false); // ← NEW: Reset on form show
  };

  // ← NEW: Callback from ReportGrid for isDataLoaded
  const handleStateChange = ({ isDataLoaded: loaded }) => {
    setIsDataLoaded(loaded);
  };

  // ← NEW: Callback from ChartComponent to show report
  const handleShowReport = () => {
    setShowReport(true);
  };

  // ← FIXED: Helper to check if we should show grid (always if no chart, or if showReport=true with chart)
  const shouldShowGrid = !ChartComponent || showReport;

  // ← FIXED: Helper to check if we should show chart (only if chart exists and !showReport)
  const shouldShowChart = ChartComponent && !showReport && reportRawData;

  return (
    <div className="generic-report-page">
      <ReportHeader
        onColumnClick={(e) => headerEventsRef.current.onColumnClick?.(e)}
        onExportClick={(e) => headerEventsRef.current.onExportClick?.(e)}
        onExitClick={() => {
          if (showForm) {
            navigate(getBaseModuleUrl());   // dynamic path
          } else {
            handleReset();
          }
        }}
        showActions={isDataLoaded}  // ← NEW: Pass local state to control buttons
      />

      {showForm ? (
        <FormComponent onSubmit={handleFormSubmit} />
      ) : (
        <>
          {/* ← FIXED: Chart only if shouldShowChart */}
          {shouldShowChart && (
            <div className="p-3">
              <ChartComponent
                data={reportRawData}
                onShowReport={handleShowReport}  // ← Button callback pass
              />
            </div>
          )}

          {/* ← FIXED: Grid if shouldShowGrid */}
          {shouldShowGrid && (
            <ReportGrid
              columns={dynamicColumns}
              fetchData={fetchDataFunc}
              reportTitle={reportTitle}
              companyName={companyName}
              headerEvents={(events) => {
                headerEventsRef.current = {
                  ...events,
                  onExitClick: handleReset,
                };
              }}
              onStateChange={handleStateChange}  // ← NEW: Listen to grid state for buttons
              rowColorRules={rowColorRules}
            />
          )}
        </>
      )}
    </div>
  );
};

export default GenericReportPage;