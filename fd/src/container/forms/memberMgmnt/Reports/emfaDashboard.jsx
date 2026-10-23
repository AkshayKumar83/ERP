

    // old chart for members graph
// import React, { useMemo, useState } from "react";
// import {
//   PieChart,
//   Pie,
//   Cell,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   CartesianGrid,
// } from "recharts";

// const COLORS_DUES = ["#ef5350", "#ff7043", "#ab47bc", "#26a69a", "#42a5f5", "#8d6e63"];
// const COLORS_RECEIPTS = ["#66bb6a", "#29b6f6", "#ffca28", "#7e57c2", "#ff8a65", "#9ccc65", "#26c6da"];

// const EmfaDashboard = ({ reportData,dlrNameSelected  }) => {
//   const [selectedCategory, setSelectedCategory] = useState("emi");

//   const { duesData, receiptsData, totalDues, totalReceipts } = useMemo(() => {
//     if (!reportData || reportData.length === 0)
//       return { duesData: [], receiptsData: [], totalDues: 0, totalReceipts: 0 };

//     const sum = (arr, field) =>
//       arr.reduce((acc, item) => acc + (parseFloat(item[field]) || 0), 0);

//     const totalDues =
//       sum(reportData, "emi_principal") +
//       sum(reportData, "emi_service_chg_ded") +
//       sum(reportData, "emi_interest_amt") +
//       sum(reportData, "emi_igst_amt") +
//       sum(reportData, "emi_cgst_amt") +
//       sum(reportData, "emi_sgst_amt");

//     const totalReceipts = sum(reportData, "total_amt_adjusted");

//     const duesData = [
//       { name: "Principal", value: sum(reportData, "emi_principal") },
//       { name: "Service Charge", value: sum(reportData, "emi_service_chg_ded") },
//       { name: "Interest", value: sum(reportData, "emi_interest_amt") },
//       { name: "IGST", value: sum(reportData, "emi_igst_amt") },
//       { name: "CGST", value: sum(reportData, "emi_cgst_amt") },
//       { name: "SGST", value: sum(reportData, "emi_sgst_amt") },
//     ];

//     const receiptsData = [
//       { name: "Paid Principal", value: sum(reportData, "principal_adjusted") },
//       { name: "Paid Serv. Chg", value: sum(reportData, "serv_chg_ded_adjusted") },
//       { name: "Paid Interest", value: sum(reportData, "interest_amt_adjusted") },
//       { name: "Paid IGST", value: sum(reportData, "igst_amt_adjusted") },
//       { name: "Paid CGST", value: sum(reportData, "cgst_amt_adjusted") },
//       { name: "Paid SGST", value: sum(reportData, "sgst_amt_adjusted") },
//       { name: "Total Paid", value: sum(reportData, "total_amt_adjusted") },
//     ];

//     return { duesData, receiptsData, totalDues, totalReceipts };
//   }, [reportData]);

//   const remainingDue = totalDues - totalReceipts;

//   const emiMonthData = useMemo(() => {
//     const emiData = Array.from({ length: 12 }, (_, i) => ({
//       emi_sno: i + 1,
//       Dues: 0,
//       Receipts: 0,
//       Remaining: 0,
//     }));

//     if (!reportData || reportData.length === 0) return emiData;

//     reportData.forEach((item) => {
//       const emiNo = parseInt(item.emi_sno);
//       if (emiNo >= 1 && emiNo <= 12) {
//         let dues = 0, receipts = 0;

//         if (selectedCategory === "gst") {
//           dues =
//             (parseFloat(item.emi_igst_amt) || 0) +
//             (parseFloat(item.emi_cgst_amt) || 0) +
//             (parseFloat(item.emi_sgst_amt) || 0);
//           receipts =
//             (parseFloat(item.igst_amt_adjusted) || 0) +
//             (parseFloat(item.cgst_amt_adjusted) || 0) +
//             (parseFloat(item.sgst_amt_adjusted) || 0);
//         } else if (selectedCategory === "service") {
//           dues = parseFloat(item.emi_service_chg_ded) || 0;
//           receipts = parseFloat(item.serv_chg_ded_adjusted) || 0;
//         } else if (selectedCategory === "principal") {
//           dues = parseFloat(item.emi_principal) || 0;
//           receipts = parseFloat(item.principal_adjusted) || 0;
//         } else {
//           dues =
//             (parseFloat(item.emi_principal) || 0) +
//             (parseFloat(item.emi_service_chg_ded) || 0) +
//             (parseFloat(item.emi_interest_amt) || 0) +
//             (parseFloat(item.emi_igst_amt) || 0) +
//             (parseFloat(item.emi_cgst_amt) || 0) +
//             (parseFloat(item.emi_sgst_amt) || 0);
//           receipts = parseFloat(item.total_amt_adjusted) || 0;
//         }

//         emiData[emiNo - 1].Dues += dues;
//         emiData[emiNo - 1].Receipts += receipts;
//         emiData[emiNo - 1].Remaining += dues - receipts;
//       }
//     });

//     return emiData;
//   }, [reportData, selectedCategory]);

//   return (
//      <div style={{ padding: 20 }}>
//       {/* Show dealer name if selected */}
//       {dlrNameSelected && (
//         <p style={{ textAlign: "center", fontWeight: "bold", fontSize: 16 }}>
//           Dealer: {dlrNameSelected}
//         </p>
//       )}
//       <h3 style={{ textAlign: "center", marginBottom: 20 }}>📊 EMFA Dashboard Overview</h3>

//       {/* PIE CHARTS */}
//       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30, marginBottom: 30 }}>
//         {/* DUES PIE */}
//         <div>
//           <h5 style={{ textAlign: "center" }}>💸 EMI Dues</h5>
//           <ResponsiveContainer width="100%" height={280}>
//             <PieChart>
//               <Pie data={duesData} dataKey="value" nameKey="name" outerRadius={90} label>
//                 {duesData.map((_, i) => (
//                   <Cell key={i} fill={COLORS_DUES[i % COLORS_DUES.length]} />
//                 ))}
//               </Pie>
//               <Tooltip />
//               <Legend />
//             </PieChart>
//           </ResponsiveContainer>
//           <p style={{ textAlign: "center", marginTop: 8 }}>
//             <strong>Total Dues:</strong> ₹{totalDues.toLocaleString()}
//           </p>
//         </div>

//         {/* RECEIPTS PIE */}
//         <div>
//           <h5 style={{ textAlign: "center" }}>✅ EMI Receipts</h5>
//           <ResponsiveContainer width="100%" height={280}>
//             <PieChart>
//               <Pie data={receiptsData} dataKey="value" nameKey="name" outerRadius={90} label>
//                 {receiptsData.map((_, i) => (
//                   <Cell key={i} fill={COLORS_RECEIPTS[i % COLORS_RECEIPTS.length]} />
//                 ))}
//               </Pie>
//               <Tooltip />
//               <Legend />
//             </PieChart>
//           </ResponsiveContainer>
//           <p style={{ textAlign: "center", marginTop: 8 }}>
//             <strong>Total Paid:</strong> ₹{totalReceipts.toLocaleString()} <br />
//             <strong>Remaining Due:</strong>{" "}
//             <span style={{ color: remainingDue > 0 ? "red" : "green" }}>
//               ₹{remainingDue.toLocaleString()}
//             </span>
//           </p>
//         </div>
//       </div>

//       {/* CATEGORY BUTTONS */}
//       <div style={{ textAlign: "center", marginBottom: 20 }}>
//         {["emi", "gst", "service", "principal"].map((cat) => (
//           <button
//             key={cat}
//             onClick={() => setSelectedCategory(cat)}
//             style={{
//               marginRight: 10,
//               backgroundColor: selectedCategory === cat ? "#1976d2" : "#e0e0e0",
//               color: selectedCategory === cat ? "#fff" : "#000",
//               border: "none",
//               padding: "8px 16px",
//               borderRadius: 4,
//               cursor: "pointer",
//             }}
//           >
//             {cat.toUpperCase()}
//           </button>
//         ))}
//       </div>

//       {/* STACKED BAR */}
//       <div>
//         <h5 style={{ textAlign: "center", marginBottom: 10 }}>📅 EMI-wise Breakdown</h5>
//         <ResponsiveContainer width="75%" height={350}>
//           <BarChart data={emiMonthData} stackOffset="sign">
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="emi_sno" label={{ value: "EMI No.", position: "insideBottom", offset: -5 }} />
//             <YAxis />
//             <Tooltip />
//             <Legend />
//             <Bar dataKey="Dues" stackId="a" fill="#ef5350" />
//             <Bar dataKey="Receipts" stackId="a" fill="#66bb6a" />
//             <Bar
//               dataKey="Remaining"
//               stackId="a"
//               fill="#ffb74d"
//               isAnimationActive={false}
//               label={false} // no value on top
//             />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// };

// export default EmfaDashboard;



    // new chart for members graph
// import React, { useMemo, useState } from "react";
// import {
//   PieChart,
//   Pie,
//   Cell,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   CartesianGrid,
// } from "recharts";

// const COLORS_DUES = ["#ef5350", "#ff7043", "#ab47bc", "#26a69a", "#42a5f5", "#8d6e63"];
// const COLORS_RECEIPTS = ["#66bb6a", "#29b6f6", "#ffca28", "#7e57c2", "#ff8a65", "#9ccc65", "#26c6da"];

// const EmfaDashboard = ({ data, selectedDealer }) => {
//   const [selectedCategory, setSelectedCategory] = useState("emi");

//   const reportData = data?.data || [];   // from GenericReportPage

//   // -----------------------------
//   // 1️⃣ PIE CHART DATA CALCULATION
//   // -----------------------------
//   const { duesData, receiptsData, totalDues, totalReceipts } = useMemo(() => {
//     if (!reportData || reportData.length === 0)
//       return { duesData: [], receiptsData: [], totalDues: 0, totalReceipts: 0 };

//     const sum = (arr, field) =>
//       arr.reduce((acc, item) => acc + (parseFloat(item[field]) || 0), 0);

//     const totalDues =
//       sum(reportData, "emi_principal") +
//       sum(reportData, "emi_service_chg_ded") +
//       sum(reportData, "emi_interest_amt") +
//       sum(reportData, "emi_igst_amt") +
//       sum(reportData, "emi_cgst_amt") +
//       sum(reportData, "emi_sgst_amt");

//     const totalReceipts = sum(reportData, "total_amt_adjusted");

//     const duesData = [
//       { name: "Principal", value: sum(reportData, "emi_principal") },
//       { name: "Service Charge", value: sum(reportData, "emi_service_chg_ded") },
//       { name: "Interest", value: sum(reportData, "emi_interest_amt") },
//       { name: "IGST", value: sum(reportData, "emi_igst_amt") },
//       { name: "CGST", value: sum(reportData, "emi_cgst_amt") },
//       { name: "SGST", value: sum(reportData, "emi_sgst_amt") },
//     ];

//     const receiptsData = [
//       { name: "Paid Principal", value: sum(reportData, "principal_adjusted") },
//       { name: "Paid Serv. Chg", value: sum(reportData, "serv_chg_ded_adjusted") },
//       { name: "Paid Interest", value: sum(reportData, "interest_amt_adjusted") },
//       { name: "Paid IGST", value: sum(reportData, "igst_amt_adjusted") },
//       { name: "Paid CGST", value: sum(reportData, "cgst_amt_adjusted") },
//       { name: "Paid SGST", value: sum(reportData, "sgst_amt_adjusted") },
//       { name: "Total Paid", value: sum(reportData, "total_amt_adjusted") },
//     ];

//     return { duesData, receiptsData, totalDues, totalReceipts };
//   }, [reportData]);

//   const remainingDue = totalDues - totalReceipts;

//   // -------------------------------------
//   // 2️⃣ EMI-WISE STACKED BAR CHART DATA
//   // -------------------------------------
//   const emiMonthData = useMemo(() => {
//     const emiData = Array.from({ length: 12 }, (_, i) => ({
//       emi_sno: i + 1,
//       Dues: 0,
//       Receipts: 0,
//       Remaining: 0,
//     }));

//     if (!reportData || reportData.length === 0) return emiData;

//     reportData.forEach((item) => {
//       const emiNo = parseInt(item.emi_sno);
//       if (emiNo >= 1 && emiNo <= 12) {
//         let dues = 0, receipts = 0;

//         if (selectedCategory === "gst") {
//           dues =
//             (parseFloat(item.emi_igst_amt) || 0) +
//             (parseFloat(item.emi_cgst_amt) || 0) +
//             (parseFloat(item.emi_sgst_amt) || 0);

//           receipts =
//             (parseFloat(item.igst_amt_adjusted) || 0) +
//             (parseFloat(item.cgst_amt_adjusted) || 0) +
//             (parseFloat(item.sgst_amt_adjusted) || 0);
//         }

//         else if (selectedCategory === "service") {
//           dues = parseFloat(item.emi_service_chg_ded) || 0;
//           receipts = parseFloat(item.serv_chg_ded_adjusted) || 0;
//         }

//         else if (selectedCategory === "principal") {
//           dues = parseFloat(item.emi_principal) || 0;
//           receipts = parseFloat(item.principal_adjusted) || 0;
//         }

//         else {
//           dues =
//             (parseFloat(item.emi_principal) || 0) +
//             (parseFloat(item.emi_service_chg_ded) || 0) +
//             (parseFloat(item.emi_interest_amt) || 0) +
//             (parseFloat(item.emi_igst_amt) || 0) +
//             (parseFloat(item.emi_cgst_amt) || 0) +
//             (parseFloat(item.emi_sgst_amt) || 0);

//           receipts = parseFloat(item.total_amt_adjusted) || 0;
//         }

//         emiData[emiNo - 1].Dues += dues;
//         emiData[emiNo - 1].Receipts += receipts;
//         emiData[emiNo - 1].Remaining += dues - receipts;
//       }
//     });

//     return emiData;
//   }, [reportData, selectedCategory]);

//   // -------------------------------------
//   // 3️⃣ FINAL RENDER
//   // -------------------------------------

//   // return (
//   //   <div style={{ padding: 20 }}>

//   //     {/* Dealer Name */}
//   //     {selectedDealer && (
//   //       <p style={{ textAlign: "center", fontWeight: "bold", fontSize: 16 }}>
//   //         Dealer: {selectedDealer}
//   //       </p>
//   //     )}

//   //     <h3 style={{ textAlign: "center", marginBottom: 20 }}>
//   //       📊 EMFA Dashboard Overview
//   //     </h3>

//   //     {/* PIE CHARTS */}
//   //     <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30, marginBottom: 30 }}>

//   //       {/* DUES PIE */}
//   //       <div>
//   //         <h5 style={{ textAlign: "center" }}>💸 EMI Dues</h5>
//   //         <ResponsiveContainer width="100%" height={280}>
//   //           <PieChart>
//   //             <Pie data={duesData} dataKey="value" nameKey="name" outerRadius={90} label>
//   //               {duesData.map((_, i) => (
//   //                 <Cell key={i} fill={COLORS_DUES[i % COLORS_DUES.length]} />
//   //               ))}
//   //             </Pie>
//   //             <Tooltip />
//   //             <Legend />
//   //           </PieChart>
//   //         </ResponsiveContainer>
//   //       </div>

//   //       {/* RECEIPTS PIE */}
//   //       <div>
//   //         <h5 style={{ textAlign: "center" }}>✅ EMI Receipts</h5>
//   //         <ResponsiveContainer width="100%" height={280}>
//   //           <PieChart>
//   //             <Pie data={receiptsData} dataKey="value" nameKey="name" outerRadius={90} label>
//   //               {receiptsData.map((_, i) => (
//   //                 <Cell key={i} fill={COLORS_RECEIPTS[i % COLORS_RECEIPTS.length]} />
//   //               ))}
//   //             </Pie>
//   //             <Tooltip />
//   //             <Legend />
//   //           </PieChart>
//   //         </ResponsiveContainer>
//   //       </div>

//   //     </div>

//   //     {/* CATEGORY BUTTONS */}
//   //     <div style={{ textAlign: "center", marginBottom: 20 }}>
//   //       {["emi", "gst", "service", "principal"].map((cat) => (
//   //         <button
//   //           key={cat}
//   //           onClick={() => setSelectedCategory(cat)}
//   //           style={{
//   //             marginRight: 10,
//   //             backgroundColor: selectedCategory === cat ? "#1976d2" : "#e0e0e0",
//   //             color: selectedCategory === cat ? "#fff" : "#000",
//   //             border: "none",
//   //             padding: "8px 16px",
//   //             borderRadius: 4,
//   //             cursor: "pointer",
//   //           }}
//   //         >
//   //           {cat.toUpperCase()}
//   //         </button>
//   //       ))}
//   //     </div>

//   //     {/* EMI-WISE STACKED BAR CHART */}
//   //     <div>
//   //       <h5 style={{ textAlign: "center", marginBottom: 10 }}>📅 EMI-wise Breakdown</h5>
//   //       <ResponsiveContainer width="90%" height={350}>
//   //         <BarChart data={emiMonthData} stackOffset="sign">
//   //           <CartesianGrid strokeDasharray="3 3" />
//   //           <XAxis dataKey="emi_sno" label={{ value: "EMI No.", position: "insideBottom", offset: -5 }} />
//   //           <YAxis />
//   //           <Tooltip />
//   //           <Legend />
//   //           <Bar dataKey="Dues" stackId="a" fill="#ef5350" />
//   //           <Bar dataKey="Receipts" stackId="a" fill="#66bb6a" />
//   //           <Bar dataKey="Remaining" stackId="a" fill="#ffb74d" />
//   //         </BarChart>
//   //       </ResponsiveContainer>
//   //     </div>

//   //   </div>
//   // );

//   return (
//   <div style={{ padding: 20 }}>
//     {/* Dealer Name (optional) */}
//     {selectedDealer && (
//       <p style={{ textAlign: "center", fontWeight: "bold", fontSize: 16 }}>
//         Dealer: {selectedDealer}
//       </p>
//     )}

//     {/* Title */}
//     <h3 style={{ textAlign: "center", marginBottom: 10 }}>
//       📊 EMFA Dashboard Overview
//     </h3>

//     {/* CATEGORY BUTTONS – EMI / GST / SERVICE / PRINCIPAL */}
//     <div style={{ textAlign: "right", marginBottom: 15 }}>
//       {["emi", "gst", "service", "principal"].map((cat) => (
//         <button
//           key={cat}
//           onClick={() => setSelectedCategory(cat)}
//           style={{
//             marginRight: 8,
//             minWidth: 90,
//             backgroundColor: selectedCategory === cat ? "#1976d2" : "#e0e0e0",
//             color: selectedCategory === cat ? "#fff" : "#000",
//             border: "none",
//             padding: "6px 14px",
//             borderRadius: 4,
//             cursor: "pointer",
//             fontSize: 12,
//             fontWeight: 600,
//           }}
//         >
//           {cat.toUpperCase()}
//         </button>
//       ))}
//     </div>

//     {/* 2 PIE + 1 BAR CHART – SAME ROW */}
//     <div
//       style={{
//         display: "grid",
//         gridTemplateColumns: "1fr 1fr 2fr",
//         gap: "20px",
//         alignItems: "center",
//         marginBottom: "10px",
//       }}
//     >
//       {/* EMI DUES PIE */}
//       <div style={{ textAlign: "center" }}>
//         <h5 style={{ fontSize: 14, marginBottom: 4 }}>💸 EMI Dues</h5>
//         <ResponsiveContainer width="100%" height={230}>
//           <PieChart>
//             <Pie
//               data={duesData}
//               dataKey="value"
//               nameKey="name"
//               outerRadius={80}
//               label={{ fontSize: 10 }}
//             >
//               {duesData.map((_, i) => (
//                 <Cell key={i} fill={COLORS_DUES[i % COLORS_DUES.length]} />
//               ))}
//             </Pie>
//             <Tooltip contentStyle={{ fontSize: 11 }} />
//             <Legend wrapperStyle={{ fontSize: 10 }} />
//           </PieChart>
//         </ResponsiveContainer>
//       </div>

//       {/* EMI RECEIPTS PIE */}
//       <div style={{ textAlign: "center" }}>
//         <h5 style={{ fontSize: 14, marginBottom: 4 }}>✅ EMI Receipts</h5>
//         <ResponsiveContainer width="100%" height={230}>
//           <PieChart>
//             <Pie
//               data={receiptsData}
//               dataKey="value"
//               nameKey="name"
//               outerRadius={80}
//               label={{ fontSize: 10 }}
//             >
//               {receiptsData.map((_, i) => (
//                 <Cell key={i} fill={COLORS_RECEIPTS[i % COLORS_RECEIPTS.length]} />
//               ))}
//             </Pie>
//             <Tooltip contentStyle={{ fontSize: 11 }} />
//             <Legend wrapperStyle={{ fontSize: 10 }} />
//           </PieChart>
//         </ResponsiveContainer>
//       </div>

//       {/* EMI-WISE BREAKDOWN BAR */}
//       <div>
//         <h5 style={{ textAlign: "center", fontSize: 14, marginBottom: 4 }}>
//           📅 EMI-wise Breakdown
//         </h5>
//         <ResponsiveContainer width="100%" height={230}>
//           <BarChart data={emiMonthData}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="emi_sno" tick={{ fontSize: 10 }} />
//             <YAxis tick={{ fontSize: 10 }} />
//             <Tooltip contentStyle={{ fontSize: 11 }} />
//             <Legend wrapperStyle={{ fontSize: 10 }} />
//             <Bar dataKey="Dues" stackId="a" fill="#ef5350" />
//             <Bar dataKey="Receipts" stackId="a" fill="#66bb6a" />
//             <Bar dataKey="Remaining" stackId="a" fill="#ffb74d" />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   </div>
// );

// };

// export default EmfaDashboard;


// modern chart 

// import React, { useMemo, useState } from "react";
// import {
//   PieChart,
//   Pie,
//   Cell,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   CartesianGrid,
//   LineChart,
//   Line,
// } from "recharts";

// const COLORS_DUES = ["#ef5350", "#ff7043", "#ab47bc", "#26a69a", "#42a5f5"];
// const COLORS_RECEIPTS = ["#29b6f6", "#66bb6a", "#ffca28", "#7e57c2", "#26c6da"];

// const EmfaDashboard = ({ data }) => {
//   const [selectedCategory, setSelectedCategory] = useState("emi");

//   const rows = data?.data || [];

//   const sum = (field) =>
//     rows.reduce((a, v) => a + (parseFloat(v[field]) || 0), 0);

//   const totalDues =
//     sum("emi_principal") +
//     sum("emi_service_chg_ded") +
//     sum("emi_interest_amt") +
//     sum("emi_igst_amt") +
//     sum("emi_cgst_amt") +
//     sum("emi_sgst_amt");

//   const totalReceipts = sum("total_amt_adjusted");
//   const remaining = totalDues - totalReceipts;

//   // PIE CHART DATA
//   const duesData = [
//     { name: "Principal", value: sum("emi_principal") },
//     { name: "Service Chg", value: sum("emi_service_chg_ded") },
//     { name: "Interest", value: sum("emi_interest_amt") },
//     { name: "IGST", value: sum("emi_igst_amt") },
//     { name: "CGST", value: sum("emi_cgst_amt") },
//     { name: "SGST", value: sum("emi_sgst_amt") },
//   ];

//   const receiptsData = [
//     { name: "Paid Principal", value: sum("principal_adjusted") },
//     { name: "Paid Serv Chg", value: sum("serv_chg_ded_adjusted") },
//     { name: "Paid Interest", value: sum("interest_amt_adjusted") },
//     { name: "Paid IGST", value: sum("igst_amt_adjusted") },
//     { name: "Paid CGST", value: sum("cgst_amt_adjusted") },
//     { name: "Paid SGST", value: sum("sgst_amt_adjusted") },
//   ];

//   // BAR CHART DATA (12 EMI months)
//   const emiMonthData = Array.from({ length: 12 }, (_, i) => {
//     const sno = i + 1;
//     let dues = 0,
//       paid = 0;

//     rows.forEach((v) => {
//       if (parseInt(v.emi_sno) === sno) {
//         dues += parseFloat(v.emi_total_amt || 0);
//         paid += parseFloat(v.total_amt_adjusted || 0);
//       }
//     });

//     return {
//       emi_sno: sno,
//       Dues: dues,
//       Remaining: dues - paid,
//       Paid: paid,
//     };
//   });

//   return (
//     <div style={{ padding: 20 }}>

//       {/* ----- TOP SUMMARY CARDS ----- */}
//       <div className="dashboard-grid dashboard-grid-3">
//         <div className="dashboard-card">
//           <p className="stat-title">Total EMI Dues</p>
//           <p className="stat-value" style={{ color: "#d32f2f" }}>
//             ₹ {totalDues.toLocaleString()}
//           </p>
//         </div>

//         <div className="dashboard-card">
//           <p className="stat-title">Total EMI Paid</p>
//           <p className="stat-value" style={{ color: "#2e7d32" }}>
//             ₹ {totalReceipts.toLocaleString()}
//           </p>
//         </div>

//         <div className="dashboard-card">
//           <p className="stat-title">Remaining Due</p>
//           <p className="stat-value" style={{ color: "#ff9800" }}>
//             ₹ {remaining.toLocaleString()}
//           </p>
//         </div>
//       </div>

//       {/* ----- 3 CHARTS IN ONE ROW ----- */}
//       <div
//         className="dashboard-grid dashboard-grid-3"
//         style={{ marginTop: 20 }}
//       >
//         {/* PIE DUES */}
//         <div className="dashboard-card">
//           <h4 style={{ marginBottom: 10 }}>💸 EMI Dues</h4>
//           <ResponsiveContainer width="100%" height={230}>
//             <PieChart>
//               <Pie data={duesData} dataKey="value" outerRadius={80}>
//                 {duesData.map((_, i) => (
//                   <Cell key={i} fill={COLORS_DUES[i]} />
//                 ))}
//               </Pie>
//               <Tooltip />
//               <Legend />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>

//         {/* PIE RECEIPTS */}
//         <div className="dashboard-card">
//           <h4 style={{ marginBottom: 10 }}>📥 EMI Receipts</h4>
//           <ResponsiveContainer width="100%" height={230}>
//             <PieChart>
//               <Pie data={receiptsData} dataKey="value" outerRadius={80}>
//                 {receiptsData.map((_, i) => (
//                   <Cell key={i} fill={COLORS_RECEIPTS[i]} />
//                 ))}
//               </Pie>
//               <Tooltip />
//               <Legend />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>

//         {/* BAR CHART */}
//         <div className="dashboard-card">
//           <h4 style={{ marginBottom: 10 }}>📊 EMI-wise Breakdown</h4>
//           <ResponsiveContainer width="100%" height={250}>
//             <BarChart data={emiMonthData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="emi_sno" />
//               <YAxis />
//               <Tooltip />
//               <Legend />
//               <Bar dataKey="Paid" fill="#4caf50" />
//               <Bar dataKey="Remaining" fill="#ff9800" />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       {/* ----- LINE CHART SECTION ----- */}
//       <div className="dashboard-card" style={{ marginTop: 20 }}>
//         <h4>📈 Receipts vs Dues</h4>
//         <ResponsiveContainer width="100%" height={260}>
//           <LineChart data={emiMonthData}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="emi_sno" />
//             <YAxis />
//             <Tooltip />
//             <Legend />
//             <Line type="monotone" dataKey="Dues" stroke="#ef5350" />
//             <Line type="monotone" dataKey="Remaining" stroke="#43a047" />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// };

// export default EmfaDashboard;

// -----------------------------------below is correct code-----------

// import React, { useMemo } from "react";
// import Chart from "react-apexcharts";

// const EmfaDashboard = ({ data }) => {
//   const rows = data?.data || [];

//   if (!rows.length) {
//     return <div>No data available for EMFA dashboard.</div>;
//   }

//   const first = rows[0];  // all view query columns.

//   // ---------- HELPERS FUCTION FOR COLLECTING TOTAL SUM  ----------
//   const sumField = (field) =>
//     rows.reduce((acc, r) => acc + (parseFloat(r[field]) || 0), 0);

//   const sumFields = (fields) =>
//     rows.reduce(
//       (acc, r) =>
//         acc +
//         fields.reduce(
//           (inner, f) => inner + (parseFloat(r[f]) || 0),
//           0
//         ),
//       0
//     );

//   // ---------- TOP SUMMARY ----------
//   const totalDues =
//     sumField("emi_principal") +
//     sumField("emi_service_chg_ded") +
//     sumField("emi_interest_amt") +
//     sumField("emi_igst_amt") +
//     sumField("emi_cgst_amt") +
//     sumField("emi_sgst_amt");

//   const totalPaid = sumField("total_amt_adjusted");
//   const remaining = totalDues - totalPaid;

//   const memberStatus = first.active_inactive || "Unknown";
//   const isActive = memberStatus.toLowerCase() === "active";

//   const uniqueLoans = new Set(rows.map((r) => r.efa_id)).size;
//   const uniqueEmis = new Set(rows.map((r) => r.emi_sno)).size;

//     // ---------- EMI AGG FOR EMIs 1..12 ----------
//   const emiAgg = useMemo(() => {
//     const arr = Array.from({ length: 12 }, (_, i) => ({
//       emiNo: i + 1,
//       dues: 0,
//       paid: 0,
//     }));

//     rows.forEach((r) => {
//       const sno = parseInt(r.emi_sno);
//       if (!sno || sno < 1 || sno > 12) return;

//       const dues = parseFloat(r.emi_total_amt) || 0; // total emi per row
//       const paid = parseFloat(r.total_amt_adjusted) || 0;

//       arr[sno - 1].dues += dues;
//       arr[sno - 1].paid += paid;
//     });

//     return arr.map((e) => ({
//       ...e,
//       remaining: e.dues - e.paid,
//       progress: e.dues > 0 ? (e.paid / e.dues) * 100 : 0,
//     }));
//   }, [rows]);

//   // ---------- CATEGORY SUMMARY ----------
//   const catPrincipalDue = sumField("emi_principal");
//   const catPrincipalPaid = sumField("principal_adjusted");
//   const catPrincipalRem = catPrincipalDue - catPrincipalPaid;

//   const catServiceDue = sumField("emi_service_chg_ded");
//   const catServicePaid = sumField("serv_chg_ded_adjusted");
//   const catServiceRem = catServiceDue - catServicePaid;

//   const catInterestDue = sumField("emi_interest_amt");
//   const catInterestPaid = sumField("interest_amt_adjusted");
//   const catInterestRem = catInterestDue - catInterestPaid;

//   const catGstDue = sumFields([
//     "emi_igst_amt",
//     "emi_cgst_amt",
//     "emi_sgst_amt",
//   ]);
//   const catGstPaid = sumFields([
//     "igst_amt_adjusted",
//     "cgst_amt_adjusted",
//     "sgst_amt_adjusted",
//   ]);
//   const catGstRem = catGstDue - catGstPaid;

//   // ---------- PIE: EMI DUES  TOTAL EMI AMOUNT(WEIGHT)  ----------
//   const duesPieLabels = [
//     "Principal",
//     "Service Chg",
//     "Interest",
//     "IGST",
//     "CGST",
//     "SGST",
//   ];
//   const duesPieSeries = [
//     catPrincipalDue,
//     catServiceDue,
//     catInterestDue,
//     sumField("emi_igst_amt"),
//     sumField("emi_cgst_amt"),
//     sumField("emi_sgst_amt"),
//   ];
//   const duesPieOptions = {
//     labels: duesPieLabels,
//     legend: { position: "bottom", fontSize: "11px" },
//     dataLabels: { enabled: true, style: { fontSize: "10px" } },
//     colors: ["#ef5350", "#ff7043", "#ab47bc", "#26a69a", "#42a5f5", "#8d6e63"],
//     stroke: { width: 1 },
//   };

//   // ---------- BAR: EMI RECEIPTS ----------
//   const emiCategories = emiAgg.map((e) => `EMI ${e.emiNo}`);
//   const barOptions = {
//     chart: { stacked: true, toolbar: { show: false } },
//     xaxis: {
//       categories: emiCategories,
//       labels: { style: { fontSize: "10px" } },
//     },
//     yaxis: {
//       labels: { style: { fontSize: "10px" } },
//     },
//     legend: { position: "bottom", fontSize: "11px" },
//     plotOptions: {
//       bar: { columnWidth: "50%", borderRadius: 4 },
//     },
//     colors: ["#22c55e", "#fbbf24"],
//     tooltip: {
//       y: {
//         formatter: (val) => `₹ ${val.toLocaleString()}`,
//       },
//     },
//   };
//   const barSeries = [
//     {
//       name: "Paid",
//       data: emiAgg.map((e) => Math.round(e.paid)),
//     },
//     {
//       name: "Remaining",
//       data: emiAgg.map((e) => Math.round(e.remaining)),
//     },
//   ];

//   // ---------- LINE: Receipts vs Dues ----------
//   const lineOptions = {
//     chart: { toolbar: { show: false } },
//     xaxis: {
//       categories: emiCategories,
//       labels: { style: { fontSize: "10px" } },
//     },
//     yaxis: { labels: { style: { fontSize: "10px" } } },
//     legend: { position: "top", fontSize: "11px" },
//     colors: ["#f97316", "#22c55e"],
//     stroke: { curve: "smooth", width: 3 },
//     markers: { size: 3 },
//     tooltip: {
//       y: { formatter: (v) => `₹ ${v.toLocaleString()}` },
//     },
//   };
//   const lineSeries = [
//     { name: "Dues", data: emiAgg.map((e) => Math.round(e.dues)) },
//     {
//       name: "Remaining",
//       data: emiAgg.map((e) => Math.round(e.remaining)),
//     },
//   ];

//   // ---------- GAUGE: Member Status / Paid % ----------
//   const overallPct =
//     totalDues > 0 ? Math.min(100, (totalPaid / totalDues) * 100) : 0;
//   const gaugeOptions = {
//     chart: { toolbar: { show: false } },
//     labels: ["Paid %"],
//     plotOptions: {
//       radialBar: {
//         startAngle: -120,
//         endAngle: 120,
//         hollow: { size: "65%" },
//         track: { background: "#e5e7eb" },
//         dataLabels: {
//           name: { show: false },
//           value: {
//             fontSize: "18px",
//             fontWeight: 700,
//             formatter: (v) => `${Math.round(v)}%`,
//           },
//         },
//       },
//     },
//     colors: [overallPct >= 90 ? "#16a34a" : "#f97316"],
//   };
//   const gaugeSeries = [overallPct];

//   // ---------- EMI PROGRESS DATA ----------
//   const emiProgressList = emiAgg.filter((e) => e.dues > 0);

//   // ---------- CATEGORY TABLE DATA ----------
//   const categoryRows = [
//     {
//       name: "Principal",
//       due: catPrincipalDue,
//       paid: catPrincipalPaid,
//       rem: catPrincipalRem,
//     },
//     {
//       name: "Service Chg",
//       due: catServiceDue,
//       paid: catServicePaid,
//       rem: catServiceRem,
//     },
//     {
//       name: "Interest",
//       due: catInterestDue,
//       paid: catInterestPaid,
//       rem: catInterestRem,
//     },
//     {
//       name: "GST",
//       due: catGstDue,
//       paid: catGstPaid,
//       rem: catGstRem,
//     },
//   ];

//   const formatMoney = (v) => `₹ ${Math.round(v).toLocaleString()}`;

//   // ==================================================
//   // RENDER
//   // ==================================================
//   return (
//     <div className="emfa-dashboard-root">
//       <div className="emfa-main-card">
//         {/* HEADER */}
//         <div className="emfa-header">
//           <div className="emfa-title">EMFA Dashboard</div>
//           <div className="emfa-header-right">
//             Member Status:&nbsp;
//             <span
//               className="emfa-status-badge"
//               style={{
//                 background: isActive ? "#ecfdf3" : "#fef2f2",
//                 color: isActive ? "#15803d" : "#b91c1c",
//                 borderColor: isActive ? "#bbf7d0" : "#fecaca",
//               }}
//             >
//               {memberStatus}
//             </span>
//           </div>
//         </div>

//         {/* TOP SUMMARY CARDS (4) */}
//         <div className="emfa-grid emfa-grid-4" style={{ marginBottom: 18 }}>
//           <div className="emfa-card">
//             <div className="emfa-stat-label">Total EMI Dues</div>
//             <div
//               className="emfa-stat-value"
//               style={{ color: "#b91c1c" }}
//             >
//               {formatMoney(totalDues)}
//             </div>
//           </div>

//           <div className="emfa-card">
//             <div className="emfa-stat-label">Total EMI Paid</div>
//             <div
//               className="emfa-stat-value"
//               style={{ color: "#16a34a" }}
//             >
//               {formatMoney(totalPaid)}
//             </div>
//           </div>

//           <div className="emfa-card">
//             <div className="emfa-stat-label">Remaining Due</div>
//             <div
//               className="emfa-stat-value"
//               style={{ color: "#f97316" }}
//             >
//               {formatMoney(remaining)}
//             </div>
//           </div>

//           <div className="emfa-card">
//             <div className="emfa-stat-label">Member Status</div>
//             <div
//               className="emfa-stat-value"
//               style={{ color: isActive ? "#16a34a" : "#b91c1c" }}
//             >
//               {memberStatus.toUpperCase()}
//             </div>
//             <div className="emfa-stat-sub">
//               Loans: {uniqueLoans} • EMIs: {uniqueEmis}
//             </div>
//           </div>
//         </div>

//         {/* ROW 2: EMI DUES PIE + EMI RECEIPTS BAR + GAUGE+DETAILS */}
//         <div className="emfa-grid emfa-grid-3" style={{ marginBottom: 18 }}>
//           {/* EMI DUES PIE */}
//           <div className="emfa-card">
//             <h4 style={{ fontSize: 14, marginBottom: 8 }}>EMI Dues</h4>
//             <Chart
//               options={duesPieOptions}
//               series={duesPieSeries}
//               type="pie"
//               height={240}
//             />
//           </div>

//           {/* EMI RECEIPTS BAR */}
//           <div className="emfa-card">
//             <h4 style={{ fontSize: 14, marginBottom: 8 }}>EMI Receipts</h4>
//             <Chart
//               options={barOptions}
//               series={barSeries}
//               type="bar"
//               height={240}
//             />
//           </div>

//           {/* GAUGE + MEMBER DETAILS */}
//           <div className="emfa-card">
//             <h4 style={{ fontSize: 14, marginBottom: 8 }}>Member Status</h4>
//             <Chart
//               options={gaugeOptions}
//               series={gaugeSeries}
//               type="radialBar"
//               height={180}
//             />

//             <div
//               style={{
//                 textAlign: "center",
//                 marginTop: 6,
//                 fontSize: 13,
//                 fontWeight: 600,
//               }}
//             >
//               {isActive ? "Active Member" : "Inactive Member"}
//             </div>

//             <div className="emfa-info-list">
//               <div>
//                 {/* <span className="emfa-info-label">Member ID</span>
//                 <span className="emfa-info-value">
//                   {first.member_id || "-"}
//                 </span> */}
//                 <span className="emfa-info-label">Member No</span>
//                 <span className="emfa-info-value">
//                   {first.member_no || " "}
//                 </span>
//               </div>
//               <div>
//                 {/* <span className="emfa-info-label">Dealer Type</span>
//                 <span className="emfa-info-value">
//                   {first.qry_flag || "Single"}
//                 </span> */}
//                 <span className="emfa-info-label">Division</span>
//                 <span className="emfa-info-value">
//                   {first.division || " "}
//                 </span>
//               </div>
//               <div>
//                 <span className="emfa-info-label">Loans No</span>
//                 <span className="emfa-info-value">{uniqueLoans}</span>
//               </div>
//               <div>
//                 <span className="emfa-info-label">Total Pay EMI</span>
//                 <span className="emfa-info-value">{uniqueEmis}</span>
//               </div>
//             </div>

//             {first.dlr_name && (
//               <div className="emfa-dealer-badge">
//                 {first.dlr_name}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* ROW 3: LINE CHART + CATEGORY SUMMARY TABLE */}
//         <div className="emfa-grid emfa-grid-2" style={{ marginBottom: 18 }}>
//           {/* RECEIPTS VS DUES LINE */}
//           <div className="emfa-card">
//             <h4 style={{ fontSize: 14, marginBottom: 8 }}>
//               Receipts vs Dues
//             </h4>
//             <Chart
//               options={lineOptions}
//               series={lineSeries}
//               type="line"
//               height={260}
//             />
//           </div>

//           {/* CATEGORY SUMMARY TABLE */}
//           <div className="emfa-card">
//             <h4 style={{ fontSize: 14, marginBottom: 8 }}>
//               Category Summary
//             </h4>
//             <table className="emfa-table">
//               <thead>
//                 <tr>
//                   <th>Category</th>
//                   <th>Due</th>
//                   <th>Paid</th>
//                   <th>Remaining</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {categoryRows.map((c) => (
//                   <tr key={c.name}>
//                     <td>{c.name}</td>
//                     <td>{formatMoney(c.due)}</td>
//                     <td className="emfa-amount-positive">
//                       {formatMoney(c.paid)}
//                     </td>
//                     <td
//                       className={
//                         c.rem >= 0
//                           ? "emfa-amount-negative"
//                           : "emfa-amount-positive"
//                       }
//                     >
//                       {formatMoney(c.rem)}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* ROW 4: EMI PAYMENT PROGRESS */}
//         {/* <div className="emfa-card">
//           <h4 style={{ fontSize: 14, marginBottom: 8 }}>
//             EMI Payment Progress
//           </h4>
//           {emiProgressList.length === 0 ? (
//             <div style={{ fontSize: 12, color: "#6b7280" }}>
//               No EMI breakdown found.
//             </div>
//           ) : (
//             emiProgressList.map((e) => (
//               <div
//                 key={e.emiNo}
//                 className="emfa-progress-row"
//               >
//                 <div className="emfa-progress-label">
//                   EMI {e.emiNo}
//                 </div>
//                 <div className="emfa-progress-track">
//                   <div
//                     className="emfa-progress-fill"
//                     style={{
//                       width: `${Math.min(100, Math.max(0, e.progress)).toFixed(
//                         0
//                       )}%`,
//                     }}
//                   />
//                 </div>
//                 <div className="emfa-progress-percent">
//                   {Math.round(e.progress)}%
//                 </div>
//               </div>
//             ))
//           )}
//         </div> */}
//       </div>
//     </div>
//   );
// };

// export default EmfaDashboard;

  
// ----- something is chnge for better visible-----

// import React, { useMemo } from "react";
// import Chart from "react-apexcharts";

// const EmfaDashboard = ({ data }) => {
//   const rows = data?.data || [];

//   if (!rows.length) {
//     return <div>No data available for EMFA dashboard.</div>;
//   }

//   const first = rows[0];  // all view query columns.

//   const uniqueLoans = new Set(rows.map((r) => r.efa_id)).size;
//   const uniqueEmis = new Set(rows.map((r) => r.emi_sno)).size;
//   const totalEmiActual = data?.totalEmiActual || 0;
//   const loanNo = data?.efaCtrlId || "";
//   const totalEmfaAmount = data?.totalEmfaAmount || 0;
//   const totalEmiDueAmount = data?.totalEmiDueAmount || 0;
//   const breakdown = data?.emiBreakdown || {};



  

//   // ---------- HELPERS FUCTION FOR COLLECTING TOTAL SUM  ----------
//   const sumField = (field) =>
//     rows.reduce((acc, r) => acc + (parseFloat(r[field]) || 0), 0);

//   const sumFields = (fields) =>
//     rows.reduce(
//       (acc, r) =>
//         acc +
//         fields.reduce(
//           (inner, f) => inner + (parseFloat(r[f]) || 0),
//           0
//         ),
//       0
//     );

//     const num = (v) => {
//     const n = parseFloat(v);
//     return Number.isFinite(n) ? n : 0;
//   };


//   // ---------- TOP SUMMARY ----------
//   const totalDues =
//     sumField("emi_principal") +
//     sumField("emi_service_chg_ded") +
//     sumField("emi_interest_amt") +
//     sumField("emi_igst_amt") +
//     sumField("emi_cgst_amt") +
//     sumField("emi_sgst_amt");

//   const totalPaid = sumField("total_amt_adjusted");
//   const remaining = Math.max(0, totalEmiDueAmount - totalPaid);

//   const diffTotal = totalEmiDueAmount - totalPaid;

//   const totalRemaining = diffTotal > 0 ? diffTotal : 0;
//   const totalOverdue   = diffTotal < 0 ? Math.abs(diffTotal) : 0;



//   // const memberStatus = first.active_inactive || "Unknown";
//   // const isActive = memberStatus.toLowerCase() === "active";

//       const getStatus = (val) => {
//       if (val === "Y" || val === 1 || val === true) {
//         return { label: "ACTIVE", isActive: true };
//       }

//       if (val === "N" || val === 0 || val === false) {
//         return { label: "INACTIVE", isActive: false };
//       }

//       // null / undefined / anything else
//       return { label: "NOT DECIDED", isActive: null };
//     };


//           // MEMBER STATUS
//      const memberStatusObj = getStatus(first.member_active);

//     const memberStatus = memberStatusObj.label;
//     const isMemberActive = memberStatusObj.isActive;


//           // DEALER STATUS
//      const dealerStatusObj = getStatus(first.dlr_active);

//       const dealerStatus = dealerStatusObj.label;
//       const isDealerActive = dealerStatusObj.isActive;


//     // ---------- EMI AGG FOR EMIs 1.. emi_sno ----------

//   const emiCount =
//   totalEmiActual > 0
//     ? totalEmiActual
//     : Math.max(...rows.map(r => parseInt(r.emi_sno) || 0));


// const emiAgg = useMemo(() => {
//   const arr = Array.from({ length: emiCount }, (_, i) => ({
//     emiNo: i + 1,
//     dues: 0,
//     paid: 0,
//   }));

//   rows.forEach((r) => {
//     const sno = parseInt(r.emi_sno);
//     if (!sno || sno < 1 || sno > emiCount) return;

//     const dues =
//       num(r.emi_total_amt) > 0
//         ? num(r.emi_total_amt)
//         : num(r.emi_principal) +
//           num(r.emi_service_chg_ded) +
//           num(r.emi_interest_amt) +
//           num(r.emi_igst_amt) +
//           num(r.emi_cgst_amt) +
//           num(r.emi_sgst_amt);

//     const paid = num(r.total_amt_adjusted);

//     arr[sno - 1].dues += dues;
//     arr[sno - 1].paid += paid;
//   });

// //   return arr.map((e) => ({
// //     ...e,
// //     remaining: Math.max(0, e.dues - e.paid),
// //     progress: e.dues > 0 ? (e.paid / e.dues) * 100 : 0,
// //   }));
// // }, [rows, emiCount]);
// return arr.map((e) => {
//   const diff = e.dues - e.paid;

//   return {
//     ...e,
//     remaining: diff > 0 ? diff : null,
//     overdue: diff < 0 ? Math.abs(diff) : null,
//     progress: e.dues > 0 ? (e.paid / e.dues) * 100 : 0,
//   };
// });
// }, [rows, emiCount]);





//   // ---------- CATEGORY SUMMARY ----------
//   // const catPrincipalDue = sumField("emi_principal");
//   // const catPrincipalPaid = sumField("principal_adjusted");
//   // const catPrincipalRem = catPrincipalDue - catPrincipalPaid;

//   // const catServiceDue = sumField("emi_service_chg_ded");
//   // const catServicePaid = sumField("serv_chg_ded_adjusted");
//   // const catServiceRem = catServiceDue - catServicePaid;

//   // const catInterestDue = sumField("emi_interest_amt");
//   // const catInterestPaid = sumField("interest_amt_adjusted");
//   // const catInterestRem = catInterestDue - catInterestPaid;
//   const catPrincipalDue = breakdown.principal || 0;
// const catServiceDue   = breakdown.service || 0;
// const catInterestDue  = breakdown.interest || 0;
// const catIgstDue      = breakdown.igst || 0;
// const catCgstDue      = breakdown.cgst || 0;
// const catSgstDue      = breakdown.sgst || 0;

//   const catGstDue = sumFields([
//     "emi_igst_amt",
//     "emi_cgst_amt",
//     "emi_sgst_amt",
//   ]);
//   const catGstPaid = sumFields([
//     "igst_amt_adjusted",
//     "cgst_amt_adjusted",
//     "sgst_amt_adjusted",
//   ]);
//   const catGstRem = catGstDue - catGstPaid;

//   // ---------- PIE: EMI DUES  TOTAL EMI AMOUNT(WEIGHT)  ----------
//   const duesPieLabels = [
//     "Principal",
//     "Service Chg",
//     "Interest",
//     "IGST",
//     "CGST",
//     "SGST",
//   ];
//   // const duesPieSeries = [
//   //   catPrincipalDue,
//   //   catServiceDue,
//   //   catInterestDue,
//   //   sumField("emi_igst_amt"),
//   //   sumField("emi_cgst_amt"),
//   //   sumField("emi_sgst_amt"),
//   // ];
  
  
//   // ===== PIE SERIES =====
// const duesPieSeries = [
//   catPrincipalDue,
//   catServiceDue,
//   catInterestDue,
//   catIgstDue,
//   catCgstDue,
//   catSgstDue,
// ];
  
//   const duesPieOptions = {
//     labels: duesPieLabels,
//     legend: { position: "bottom", fontSize: "11px" },
//     dataLabels: { enabled: true, style: { fontSize: "10px" } },
//     colors: ["#ef5350", "#ff7043", "#ab47bc", "#26a69a", "#42a5f5", "#8d6e63"],
//     stroke: { width: 1 },
//   };

//   // ---------- BAR: EMI RECEIPTS ----------
//   const emiCategories = emiAgg.map((e) => `EMI ${e.emiNo}`);

//   const barOptions = {
//     chart: { stacked: true, toolbar: { show: false } },
//     xaxis: {
//       categories: emiCategories,
//       labels: { style: { fontSize: "10px" } },
//     },
//     yaxis: {
//       labels: { style: { fontSize: "10px" } },
//     },
//     legend: { position: "bottom", fontSize: "11px" },
//     plotOptions: {
//       bar: { columnWidth: "50%", borderRadius: 4 },
//     },
//     colors: ["#22c55e", "#fbbf24"],
//     tooltip: {
//       y: {
//         formatter: (val) => `₹ ${val.toLocaleString()}`,
//       },
//     },
//   };
//   const barSeries = [
//     {
//       name: "Paid",
//       data: emiAgg.map((e) => Math.round(e.paid)),
//     },
//     {
//       name: "Remaining",
//       data: emiAgg.map((e) => Math.round(e.remaining)),
//     },
//   ];

//   // ---------- LINE: Receipts vs Dues ----------
//   const lineOptions = {
//     chart: { toolbar: { show: false } },
//     xaxis: {
//       categories: emiCategories,
//       labels: { style: { fontSize: "10px" } },
//     },
//     yaxis: { labels: { style: { fontSize: "10px" } } },
//     legend: { position: "bottom", fontSize: "11px" },
//     colors: ["#f97316", "#22c55e"],
//     stroke: { curve: "smooth", width: 3 },
//     markers: { size: 3 },
//     tooltip: {
//       y: { formatter: (v) => `₹ ${v.toLocaleString()}` },
//     },
//   };
  
//   const lineSeries = [
//     { name: "Dues", data: emiAgg.map((e) => Math.round(e.dues)) },
//     {
//       name: "Remaining", data: emiAgg.map((e) => Math.round(e.remaining)),
//     },
//   ];

// //   const comboSeries = [
// //     {
// //     name: "EMI Due",
// //     type: "line",
// //     data: emiAgg.map(e => Math.round(e.dues)),
// //   },
// //   {
// //     name: "Paid",
// //     type: "column",
// //     data: emiAgg.map(e => Math.round(e.paid)),
// //   },
// //   {
// //     name: "Remaining",
// //     type: "column",
// //     data: emiAgg.map(e => Math.round(e.remaining)),
// //   },
  
// // ];

// const comboSeries = [
//   {
//     name: "EMI Due",
//     type: "line",
//     data: emiAgg.map(e => Math.round(e.dues)),
//   },
//   {
//     name: "Paid",
//     type: "column",
//     data: emiAgg.map(e => Math.round(e.paid)),
//   },
//   {
//     name: "Remaining",
//     type: "column",
//     data: emiAgg.map(e => e.remaining),
//   },
//   {
//     name: "Overpaid",
//     type: "column",
//     data: emiAgg.map(e => e.overdue),
//   },
// ];


// const comboOptions = {
//   chart: {
//     stacked: false,   
//     toolbar: { show: false },
//   },
//   xaxis: {
//     categories: emiAgg.map(e => `EMI ${e.emiNo}`),
//   },
//   yaxis: {
//     labels: {
//       formatter: (v) => `₹ ${v.toLocaleString()}`,
//     },
//   },
//   stroke: {
//     width: [3,0, 0,],   // line ko highlight
//     curve: "smooth",
//   },
//   markers: {
//     size: [5, 0, 0],              // line points visible
//   },
//   plotOptions: {
//     bar: {
//       columnWidth: "45%",
//       borderRadius: 4,
//     },
//   },
//   colors: [
//     "#2563eb", // EMI Due - blue line
//     "#22c55e", // Paid - green
//     "#fbbf24", // Remaining - yellow
//     "#ef4444", // Overpaid (red)
    
//   ],
//   legend: {
//     position: "bottom",
//   },
//   // tooltip: {
//   //   y: {
//   //     formatter: (val) => `₹ ${val.toLocaleString()}`,
//   //   },
//   // },
// tooltip: {
//   y: {
//     formatter: (val, { seriesIndex }) => {
//       if (val === null) return "";
//       if (seriesIndex === 3) return `₹ ${val.toLocaleString()} (Overpaid)`;
//       return `₹ ${val.toLocaleString()}`;
//     },
//   },
// },

// };


//   // ---------- GAUGE: Member Status / Paid %  ----------

//     // -----  totalDues = Total EMI amount (Principal + Interest + GST + Service)
//     // -----  totalPaid = Ab tak jitna paisa adjust / pay hua
//     // ------ overallPct = Payment completion percentage
  

//      // EMI Completion % = (Total Paid / Total EMI Due Amount) * 100 
     
//     // const overallPct =
//     //   totalEmiDueAmount > 0
//     //     ? Math.min(100, (totalPaid / totalEmiDueAmount) * 100)
//     //     : 0;
   
  
//     const emiCompletionPct =
//       totalEmiDueAmount > 0
//         ? Math.round((totalPaid / totalEmiDueAmount) * 100)
//         : 0;

//   // Average EMI Amount = Total EMI Due Amount / Total EMI Actual Paid  
// const avgEmiAmount =
//   totalEmiActual > 0
//     ? totalEmiDueAmount / totalEmiActual
//     : 0;



//      const gaugeOptions = {
//     chart: { toolbar: { show: false } },
//     labels: ["Paid %"],
//     plotOptions: {
//       radialBar: {
//         startAngle: -120,
//         endAngle: 120,
//         hollow: { size: "65%" },
//         track: { background: "#e5e7eb" },
//         dataLabels: {
//           name: { show: false },
//           value: {
//             fontSize: "18px",
//             fontWeight: 700,
//             formatter: (v) => `${Math.round(v)}%`,
//           },
//         },
//       },
//     },
//     // colors: [overallPct >= 90 ? "#16a34a" : "#f97316"],
//     colors: [
//   emiCompletionPct >= 75
//     ? "#16a34a"   // green
//     : emiCompletionPct >= 25
//     ? "#f97316"   // orange
//     : "#dc2626"   // red
// ],

//   };

//   // const gaugeSeries = [overallPct];

//   // ---------- EMI PROGRESS DATA ----------
//   const emiProgressList = emiAgg.filter((e) => e.dues > 0);

//   // ---------- CATEGORY TABLE DATA ----------
//   // const categoryRows = [
//   //   {
//   //     name: "Principal",
//   //     due: catPrincipalDue,
//   //     paid: catPrincipalPaid,
//   //     rem: catPrincipalRem,
//   //   },
//   //   {
//   //     name: "Service Chg",
//   //     due: catServiceDue,
//   //     paid: catServicePaid,
//   //     rem: catServiceRem,
//   //   },
//   //   {
//   //     name: "Interest",
//   //     due: catInterestDue,
//   //     paid: catInterestPaid,
//   //     rem: catInterestRem,
//   //   },
//   //   {
//   //     name: "GST",
//   //     due: catGstDue,
//   //     paid: catGstPaid,
//   //     rem: catGstRem,
//   //   },
//   // ];

// const categoryRows = [
//   {
//     name: "Principal",
//     due: catPrincipalDue,                 // from tdlnefatran
//     paid: sumField("principal_adjusted"), // from VIEW
//     rem: catPrincipalDue - sumField("principal_adjusted"),
//   },
//   {
//     name: "Service Chg",
//     due: catServiceDue,
//     paid: sumField("serv_chg_ded_adjusted"),
//     rem: catServiceDue - sumField("serv_chg_ded_adjusted"),
//   },
//   {
//     name: "Interest",
//     due: catInterestDue,
//     paid: sumField("interest_amt_adjusted"),
//     rem: catInterestDue - sumField("interest_amt_adjusted"),
//   },
//   {
//     name: "GST",
//     due: catIgstDue + catCgstDue + catSgstDue,
//     paid: sumFields([
//       "igst_amt_adjusted",
//       "cgst_amt_adjusted",
//       "sgst_amt_adjusted",
//     ]),
//     rem:
//       (catIgstDue + catCgstDue + catSgstDue) -
//       sumFields([
//         "igst_amt_adjusted",
//         "cgst_amt_adjusted",
//         "sgst_amt_adjusted",
//       ]),
//   },
// ];


//   const formatMoney = (v) => `₹ ${Math.round(v).toLocaleString()}`;

//   // ==================================================
//   // RENDER
//   // ==================================================
//   return (
//     <div className="emfa-dashboard-root">
//       <div className="emfa-main-card">
//         {/* HEADER */}
//         <div className="emfa-header">
//           <div className="emfa-title"> Dashboard</div>
//           <div className="emfa-header-right">
//            Member Name:&nbsp;
//              {first.dlr_name && (
//               <div className="emfa-dealer-badge">
//                 {first.dlr_name}
//               </div>
//             )}
//           </div>
//           <div className="emfa-header-right">
//             Member No:&nbsp;
//              {first.member_no && (
//               <div className="emfa-dealer-badge">
//                 {first.member_no}
//               </div>
//             )}
//           </div>
//           <div className="emfa-header-right">
//             Dealer Code:&nbsp;
//              {first.dealer_code && (
//               <div className="emfa-dealer-badge">
//                 {first.dealer_code}
//               </div>
//             )}
//           </div>
//           <div className="emfa-header-right">
//            Division:&nbsp;
//              {first.division && (
//               <div className="emfa-dealer-badge">
//                 {first.division}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* TOP SUMMARY CARDS (4) */}
//         <div className="emfa-grid emfa-grid-6" style={{ marginBottom: 18 }}>
//           <div className="emfa-card">
//             <div className="emfa-stat-label">Total EMFA Amount</div>
//             <div
//               className="emfa-stat-value"
//               style={{ color: "#b91c1c" }}
//             >
//               {formatMoney(totalEmfaAmount)}
//             </div>
//           </div>
//           <div className="emfa-card">
//             <div className="emfa-stat-label">Total EMI Amount</div>
//             <div
//               className="emfa-stat-value"
//               style={{ color: "#b91c1c" }}
//             >
//               {formatMoney(totalEmiDueAmount)}
//             </div>
//           </div>

//           <div className="emfa-card">
//             <div className="emfa-stat-label">Total EMI Paid</div>
//             <div
//               className="emfa-stat-value"
//               style={{ color: "#16a34a" }}
//             >
//               {formatMoney(totalPaid)}
//             </div>
//           </div>

//           <div className="emfa-card">
//             <div className="emfa-stat-label">Remaining EMI Due</div>
//             <div
//               className="emfa-stat-value"
//               style={{ color: "#f97316" }}
//             >
//               {formatMoney(remaining)}
//             </div>
//           </div>

//           <div className="emfa-card">
//             <div className="emfa-stat-label">Member Status</div>
//           <div
//           className="emfa-stat-value"
//           style={{
//             color:
//               isMemberActive === true
//                 ? "#16a34a"     // green
//                 : isMemberActive === false
//                 ? "#b91c1c"     // red
//                 : "#6b7280"     // gray (not decided)
//           }}
//         >
//           {memberStatus}
//         </div>

//             {/* <div className="emfa-stat-sub">
//               Loans: {uniqueLoans} • EMIs: {uniqueEmis}
//             </div> */}
//           </div>
//           <div className="emfa-card">
//             <div className="emfa-stat-label">Dealer Status</div>
//            <div
//               className="emfa-stat-value"
//               style={{
//                 color:
//                   isDealerActive === true
//                     ? "#16a34a"
//                     : isDealerActive === false
//                     ? "#b91c1c"
//                     : "#6b7280"
//               }}
//             >
//               {dealerStatus}
//             </div>

//           </div>
//         </div>

//         {/* ROW 2: EMI DUES PIE + EMI RECEIPTS BAR + GAUGE+DETAILS */}
//         <div className="emfa-grid emfa-grid-3" style={{ marginBottom: 18 }}>

//             {/* <div className="emfa-card">
//             <h4 style={{ fontSize: 14, marginBottom: 8 }}>EMI Payment Progress </h4>
//             <Chart
//               options={gaugeOptions}
//               series={gaugeSeries}
//               type="radialBar"
//               height={180}
//             />


//             <div className="emfa-info-list">

//             <div>
//               <span className="emfa-info-label">EFA No.</span>
//               <span className="emfa-info-value">{loanNo}</span>
//             </div>

//             <div>
//               <span className="emfa-info-label">Total EMI</span>
//               <span className="emfa-info-value">{totalEmiActual}</span>        
//             </div>

//             <div>
//               <span className="emfa-info-label">Paid EMI</span>
//               <span className="emfa-info-value">{uniqueEmis}</span>       
//             </div>

//             </div>

//           </div> */}

//           <div className="emfa-card">
//   <h4 style={{ fontSize: 14, marginBottom: 8 }}>
//     EMI Payment Progress
//   </h4>

//   <Chart
//     options={gaugeOptions}
//     series={[emiCompletionPct]}
//     type="radialBar"
//     height={180}
//   />

//   <div
//     style={{
//       textAlign: "center",
//       fontSize: 13,
//       fontWeight: 600,
//       marginBottom: 8,
//     }}
//   >
//     {emiCompletionPct}% Completed
//   </div>

//   <div className="emfa-info-list">
//     <div>
//       <span className="emfa-info-label">EMFA No.</span>
//       <span className="emfa-info-value">{loanNo}</span>
//     </div>

//     <div>
//       <span className="emfa-info-label">EMIs Paid</span>
//       <span className="emfa-info-value">
//         {uniqueEmis} / {totalEmiActual}
//       </span>
//     </div>

//     {/* <div>
//       <span className="emfa-info-label">Outstanding Amount</span>
//       <span className="emfa-info-value">
//         {formatMoney(outstandingAmount)}
//       </span>
//     </div> */}

//     {/* <div>
//       <span className="emfa-info-label">Next EMI Due</span>
//       <span className="emfa-info-value">
//         {nextEmiDate}
//       </span>
//     </div>

//     <div>
//       <span className="emfa-info-label">Loan Stage</span>
//       <span
//         className="emfa-info-value"
//         style={{
//           color:
//             loanStage === "HEALTHY"
//               ? "#16a34a"
//               : loanStage === "RUNNING"
//               ? "#f97316"
//               : loanStage === "CLOSED"
//               ? "#2563eb"
//               : "#dc2626",
//           fontWeight: 600,
//         }}
//       >
//         {loanStage}
//       </span>
//     </div> */}

//     <div>
//       <span className="emfa-info-label">Avg EMI</span>
//       <span className="emfa-info-value">
//         {formatMoney(avgEmiAmount)}
//       </span>
//     </div>
//   </div>
// </div>


//           {/* EMI DUES PIE */}
//           <div className="emfa-card">
//             <h4 style={{ fontSize: 14, marginBottom: 8 }}>EMI Dues (Breakdown)</h4>
//             <Chart
//               options={duesPieOptions}
//               series={duesPieSeries}
//               type="pie"
//               height={240}
//             />
//           </div>

//           {/* EMI RECEIPTS BAR */}
//           {/* <div className="emfa-card">
//             <h4 style={{ fontSize: 14, marginBottom: 8 }}>EMI Receipts</h4>
//             <Chart
//               options={barOptions}
//               series={barSeries}
//               type="bar"
//               height={240}
//             />
//           </div> */}
//              {/* CATEGORY SUMMARY TABLE */}
//           <div className="emfa-card">
//             <h4 style={{ fontSize: 14, marginBottom: 8 }}>
//               Category Summary
//             </h4>
//             <table className="emfa-table">
//               <thead>
//                 <tr>
//                   <th>Category</th>
//                   <th>Due</th>
//                   <th>Paid</th>
//                   <th>Remaining</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {categoryRows.map((c) => (
//                   <tr key={c.name}>
//                     <td>{c.name}</td>
//                     <td>{formatMoney(c.due)}</td>
//                     <td className="emfa-amount-positive">
//                       {formatMoney(c.paid)}
//                     </td>
//                     <td
//                       className={
//                         c.rem >= 0
//                           ? "emfa-amount-negative"
//                           : "emfa-amount-positive"
//                       }
//                     >
//                       {formatMoney(c.rem)}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* ROW 3: LINE CHART + CATEGORY SUMMARY TABLE */}
//         <div className="emfa-grid emfa-grid-2" style={{ marginBottom: 18 }}>
//           {/* RECEIPTS VS DUES LINE */}
//           {/* <div className="emfa-card">
//             <h4 style={{ fontSize: 14, marginBottom: 8 }}> Receipts vs Dues </h4>
//             <Chart
//               options={lineOptions}
//               series={lineSeries}
//               type="line"
//               height={260}
//             />
//           </div> */}

//            {/* EMI RECEIPTS BAR */}
//           {/* <div className="emfa-card">
//             <h4 style={{ fontSize: 14, marginBottom: 8 }}>EMI Receipts</h4>
//             <Chart
//               options={barOptions}
//               series={barSeries}
//               type="bar"
//               height={240}
//             />
//           </div> */}

//           {/* CATEGORY SUMMARY TABLE
//           <div className="emfa-card">
//             <h4 style={{ fontSize: 14, marginBottom: 8 }}>
//               Category Summary
//             </h4>
//             <table className="emfa-table">
//               <thead>
//                 <tr>
//                   <th>Category</th>
//                   <th>Due</th>
//                   <th>Paid</th>
//                   <th>Remaining</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {categoryRows.map((c) => (
//                   <tr key={c.name}>
//                     <td>{c.name}</td>
//                     <td>{formatMoney(c.due)}</td>
//                     <td className="emfa-amount-positive">
//                       {formatMoney(c.paid)}
//                     </td>
//                     <td
//                       className={
//                         c.rem >= 0
//                           ? "emfa-amount-negative"
//                           : "emfa-amount-positive"
//                       }
//                     >
//                       {formatMoney(c.rem)}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div> */}
//           <div className="emfa-card">
//   <h4 style={{ fontSize: 14, marginBottom: 8 }}>
//     EMI Payment Overview
//   </h4>

//   <Chart
//     options={comboOptions}
//     series={comboSeries}
//     type="line"
//     height={280}
//   />
// </div>

//         </div>

//         {/* ROW 4: EMI PAYMENT PROGRESS */}
//         {/* <div className="emfa-card">
//           <h4 style={{ fontSize: 14, marginBottom: 8 }}>
//             EMI Payment Progress
//           </h4>
//           {emiProgressList.length === 0 ? (
//             <div style={{ fontSize: 12, color: "#6b7280" }}>
//               No EMI breakdown found.
//             </div>
//           ) : (
//             emiProgressList.map((e) => (
//               <div
//                 key={e.emiNo}
//                 className="emfa-progress-row"
//               >
//                 <div className="emfa-progress-label">
//                   EMI {e.emiNo}
//                 </div>
//                 <div className="emfa-progress-track">
//                   <div
//                     className="emfa-progress-fill"
//                     style={{
//                       width: `${Math.min(100, Math.max(0, e.progress)).toFixed(
//                         0
//                       )}%`,
//                     }}
//                   />
//                 </div>
//                 <div className="emfa-progress-percent">
//                   {Math.round(e.progress)}%
//                 </div>
//               </div>
//             ))
//           )}
//         </div> */}
//       </div>
//     </div>
//   );
// };

// export default EmfaDashboard;

// ---------- below code all comment code delete------------

import React, { useMemo } from "react";
import Chart from "react-apexcharts";
import ButtonUi from "../../../../components/basic/button";

const EmfaDashboard = ({ data,onShowReport }) => {
  const rows = data?.data || [];

  if (!rows.length) {
    return <div>No data available for EMFA dashboard.</div>;
  }

  const first = rows[0];  // all view query columns.

  const uniqueLoans = new Set(rows.map((r) => r.efa_id)).size;
  const uniqueEmis = new Set(rows.map((r) => r.emi_sno)).size;
  const totalEmiActual = data?.totalEmiActual || 0;
  const loanNo = data?.efaCtrlId || "";
  const totalEmfaAmount = data?.totalEmfaAmount || 0;
  const totalEmiDueAmount = data?.totalEmiDueAmount || 0;
  const breakdown = data?.emiBreakdown || {};



  

  // ---------- HELPERS FUCTION FOR COLLECTING TOTAL SUM  ----------
  const sumField = (field) =>
    rows.reduce((acc, r) => acc + (parseFloat(r[field]) || 0), 0);

  const sumFields = (fields) =>
    rows.reduce(
      (acc, r) =>
        acc +
        fields.reduce(
          (inner, f) => inner + (parseFloat(r[f]) || 0),
          0
        ),
      0
    );

    const num = (v) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  };


  // ---------- TOP SUMMARY ----------
  const totalDues =
    sumField("emi_principal") +
    sumField("emi_service_chg_ded") +
    sumField("emi_interest_amt") +
    sumField("emi_igst_amt") +
    sumField("emi_cgst_amt") +
    sumField("emi_sgst_amt");

  const totalPaid = sumField("total_amt_adjusted");
  const remaining = Math.max(0, totalEmiDueAmount - totalPaid);

  const diffTotal = totalEmiDueAmount - totalPaid;

  const totalRemaining = diffTotal > 0 ? diffTotal : 0;
  const totalOverdue   = diffTotal < 0 ? Math.abs(diffTotal) : 0;



  // const memberStatus = first.active_inactive || "Unknown";
  // const isActive = memberStatus.toLowerCase() === "active";

      const getStatus = (val) => {
      if (val === "Y" || val === 1 || val === true) {
        return { label: "ACTIVE", isActive: true };
      }

      if (val === "N" || val === 0 || val === false) {
        return { label: "INACTIVE", isActive: false };
      }

      // null / undefined / anything else
      return { label: "NOT DECIDED", isActive: null };
    };


          // MEMBER STATUS
     const memberStatusObj = getStatus(first.member_active);

    const memberStatus = memberStatusObj.label;
    const isMemberActive = memberStatusObj.isActive;


          // DEALER STATUS
     const dealerStatusObj = getStatus(first.dlr_active);

      const dealerStatus = dealerStatusObj.label;
      const isDealerActive = dealerStatusObj.isActive;


    // ---------- EMI AGG FOR EMIs 1.. emi_sno ----------

  const emiCount =
  totalEmiActual > 0
    ? totalEmiActual
    : Math.max(...rows.map(r => parseInt(r.emi_sno) || 0));


const emiAgg = useMemo(() => {
  const arr = Array.from({ length: emiCount }, (_, i) => ({
    emiNo: i + 1,
    dues: 0,
    paid: 0,
  }));

  rows.forEach((r) => {
    const sno = parseInt(r.emi_sno);
    if (!sno || sno < 1 || sno > emiCount) return;

    const dues =
      num(r.emi_total_amt) > 0
        ? num(r.emi_total_amt)
        : num(r.emi_principal) +
          num(r.emi_service_chg_ded) +
          num(r.emi_interest_amt) +
          num(r.emi_igst_amt) +
          num(r.emi_cgst_amt) +
          num(r.emi_sgst_amt);

    const paid = num(r.total_amt_adjusted);

    arr[sno - 1].dues += dues;
    arr[sno - 1].paid += paid;
  });

//   return arr.map((e) => ({
//     ...e,
//     remaining: Math.max(0, e.dues - e.paid),
//     progress: e.dues > 0 ? (e.paid / e.dues) * 100 : 0,
//   }));
// }, [rows, emiCount]);
return arr.map((e) => {
  const diff = e.dues - e.paid;

  return {
    ...e,
    remaining: diff > 0 ? diff : null,
    overdue: diff < 0 ? Math.abs(diff) : null,
    progress: e.dues > 0 ? (e.paid / e.dues) * 100 : 0,
  };
});
}, [rows, emiCount]);





  // ---------- CATEGORY SUMMARY ----------
  // const catPrincipalDue = sumField("emi_principal");
  // const catPrincipalPaid = sumField("principal_adjusted");
  // const catPrincipalRem = catPrincipalDue - catPrincipalPaid;

  // const catServiceDue = sumField("emi_service_chg_ded");
  // const catServicePaid = sumField("serv_chg_ded_adjusted");
  // const catServiceRem = catServiceDue - catServicePaid;

  // const catInterestDue = sumField("emi_interest_amt");
  // const catInterestPaid = sumField("interest_amt_adjusted");
  // const catInterestRem = catInterestDue - catInterestPaid;
  const catPrincipalDue = breakdown.principal || 0;
const catServiceDue   = breakdown.service || 0;
const catInterestDue  = breakdown.interest || 0;
const catIgstDue      = breakdown.igst || 0;
const catCgstDue      = breakdown.cgst || 0;
const catSgstDue      = breakdown.sgst || 0;

  const catGstDue = sumFields([
    "emi_igst_amt",
    "emi_cgst_amt",
    "emi_sgst_amt",
  ]);
  const catGstPaid = sumFields([
    "igst_amt_adjusted",
    "cgst_amt_adjusted",
    "sgst_amt_adjusted",
  ]);
  const catGstRem = catGstDue - catGstPaid;

  // ---------- PIE: EMI DUES  TOTAL EMI AMOUNT(WEIGHT)  ----------
  const duesPieLabels = [
    "Principal",
    "Service Chg",
    "Interest",
    "IGST",
    "CGST",
    "SGST",
  ];
  // const duesPieSeries = [
  //   catPrincipalDue,
  //   catServiceDue,
  //   catInterestDue,
  //   sumField("emi_igst_amt"),
  //   sumField("emi_cgst_amt"),
  //   sumField("emi_sgst_amt"),
  // ];
  
  
  // ===== PIE SERIES =====
const duesPieSeries = [
  catPrincipalDue,
  catServiceDue,
  catInterestDue,
  catIgstDue,
  catCgstDue,
  catSgstDue,
];
  
  const duesPieOptions = {
    labels: duesPieLabels,
    legend: { position: "bottom", fontSize: "11px" },
    dataLabels: { enabled: true, style: { fontSize: "10px" } },
    colors: ["#ef5350", "#ff7043", "#ab47bc", "#26a69a", "#42a5f5", "#8d6e63"],
    stroke: { width: 1 },
  };

  // ---------- BAR: EMI RECEIPTS ----------
  const emiCategories = emiAgg.map((e) => `EMI ${e.emiNo}`);

  const barOptions = {
    chart: { stacked: true, toolbar: { show: false } },
    xaxis: {
      categories: emiCategories,
      labels: { style: { fontSize: "10px" } },
    },
    yaxis: {
      labels: { style: { fontSize: "10px" } },
    },
    legend: { position: "bottom", fontSize: "11px" },
    plotOptions: {
      bar: { columnWidth: "50%", borderRadius: 4 },
    },
    colors: ["#22c55e", "#fbbf24"],
    tooltip: {
      y: {
        formatter: (val) => `₹ ${val.toLocaleString()}`,
      },
    },
  };
  const barSeries = [
    {
      name: "Paid",
      data: emiAgg.map((e) => Math.round(e.paid)),
    },
    {
      name: "Remaining",
      data: emiAgg.map((e) => Math.round(e.remaining)),
    },
  ];

  // ---------- LINE: Receipts vs Dues ----------
  const lineOptions = {
    chart: { toolbar: { show: false } },
    xaxis: {
      categories: emiCategories,
      labels: { style: { fontSize: "10px" } },
    },
    yaxis: { labels: { style: { fontSize: "10px" } } },
    legend: { position: "bottom", fontSize: "11px" },
    colors: ["#f97316", "#22c55e"],
    stroke: { curve: "smooth", width: 3 },
    markers: { size: 3 },
    tooltip: {
      y: { formatter: (v) => `₹ ${v.toLocaleString()}` },
    },
  };
  
  const lineSeries = [
    { name: "Dues", data: emiAgg.map((e) => Math.round(e.dues)) },
    {
      name: "Remaining", data: emiAgg.map((e) => Math.round(e.remaining)),
    },
  ];

//   const comboSeries = [
//     {
//     name: "EMI Due",
//     type: "line",
//     data: emiAgg.map(e => Math.round(e.dues)),
//   },
//   {
//     name: "Paid",
//     type: "column",
//     data: emiAgg.map(e => Math.round(e.paid)),
//   },
//   {
//     name: "Remaining",
//     type: "column",
//     data: emiAgg.map(e => Math.round(e.remaining)),
//   },
  
// ];

const comboSeries = [
  {
    name: "EMI Due",
    type: "line",
    data: emiAgg.map(e => Math.round(e.dues)),
  },
  {
    name: "Paid",
    type: "column",
    data: emiAgg.map(e => Math.round(e.paid)),
  },
  {
    name: "Remaining",
    type: "column",
    data: emiAgg.map(e => e.remaining),
  },
  {
    name: "Overpaid",
    type: "column",
    data: emiAgg.map(e => e.overdue),
  },
];


const comboOptions = {
  chart: {
    stacked: false,   
    toolbar: { show: false },
  },
  xaxis: {
    categories: emiAgg.map(e => `EMI ${e.emiNo}`),
  },
  yaxis: {
    labels: {
      formatter: (v) => `₹ ${v.toLocaleString()}`,
    },
  },
  stroke: {
    width: [3,0, 0,],   // line ko highlight
    curve: "smooth",
  },
  markers: {
    size: [5, 0, 0],              // line points visible
  },
  plotOptions: {
    bar: {
      columnWidth: "45%",
      borderRadius: 4,
    },
  },
  colors: [
    "#2563eb", // EMI Due - blue line
    "#22c55e", // Paid - green
    "#fbbf24", // Remaining - yellow
    "#ef4444", // Overpaid (red)
    
  ],
  legend: {
    position: "bottom",
  },
  // tooltip: {
  //   y: {
  //     formatter: (val) => `₹ ${val.toLocaleString()}`,
  //   },
  // },
tooltip: {
  y: {
    formatter: (val, { seriesIndex }) => {
      if (val === null) return "";
      if (seriesIndex === 3) return `₹ ${val.toLocaleString()} (Overpaid)`;
      return `₹ ${val.toLocaleString()}`;
    },
  },
},

};


  // ---------- GAUGE: Member Status / Paid %  ----------

    // -----  totalDues = Total EMI amount (Principal + Interest + GST + Service)
    // -----  totalPaid = Ab tak jitna paisa adjust / pay hua
    // ------ overallPct = Payment completion percentage
  

     // EMI Completion % = (Total Paid / Total EMI Due Amount) * 100 
     
    // const overallPct =
    //   totalEmiDueAmount > 0
    //     ? Math.min(100, (totalPaid / totalEmiDueAmount) * 100)
    //     : 0;
   
  
    const emiCompletionPct =
      totalEmiDueAmount > 0
        ? Math.round((totalPaid / totalEmiDueAmount) * 100)
        : 0;

  // Average EMI Amount = Total EMI Due Amount / Total EMI Actual Paid  
const avgEmiAmount =
  totalEmiActual > 0
    ? totalEmiDueAmount / totalEmiActual
    : 0;



     const gaugeOptions = {
    chart: { toolbar: { show: false } },
    labels: ["Paid %"],
    plotOptions: {
      radialBar: {
        startAngle: -120,
        endAngle: 120,
        hollow: { size: "65%" },
        track: { background: "#e5e7eb" },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: "18px",
            fontWeight: 700,
            formatter: (v) => `${Math.round(v)}%`,
          },
        },
      },
    },
    // colors: [overallPct >= 90 ? "#16a34a" : "#f97316"],
    colors: [
  emiCompletionPct >= 75
    ? "#16a34a"   // green
    : emiCompletionPct >= 25
    ? "#f97316"   // orange
    : "#dc2626"   // red
],

  };

  // const gaugeSeries = [overallPct];

  // ---------- EMI PROGRESS DATA ----------
  const emiProgressList = emiAgg.filter((e) => e.dues > 0);

const categoryRows = [
  {
    name: "Principal",
    due: catPrincipalDue,                 // from tdlnefatran
    paid: sumField("principal_adjusted"), // from VIEW
    rem: catPrincipalDue - sumField("principal_adjusted"),
  },
  {
    name: "Service Chg",
    due: catServiceDue,
    paid: sumField("serv_chg_ded_adjusted"),
    rem: catServiceDue - sumField("serv_chg_ded_adjusted"),
  },
  {
    name: "Interest",
    due: catInterestDue,
    paid: sumField("interest_amt_adjusted"),
    rem: catInterestDue - sumField("interest_amt_adjusted"),
  },
  {
    name: "GST",
    due: catIgstDue + catCgstDue + catSgstDue,
    paid: sumFields([
      "igst_amt_adjusted",
      "cgst_amt_adjusted",
      "sgst_amt_adjusted",
    ]),
    rem:
      (catIgstDue + catCgstDue + catSgstDue) -
      sumFields([
        "igst_amt_adjusted",
        "cgst_amt_adjusted",
        "sgst_amt_adjusted",
      ]),
  },
];


  const formatMoney = (v) => `₹ ${Math.round(v).toLocaleString()}`;

  // ==================================================
  // RENDER
  // ==================================================
  return (
    <div className="emfa-dashboard-root">
      <div className="emfa-main-card">
        {/* HEADER */}
        <div className="emfa-header">
          <div className="emfa-title"> Dashboard</div>
          <div className="emfa-header-right">
           Member Name:&nbsp;
             {first.dlr_name && (
              <div className="emfa-dealer-badge">
                {first.dlr_name}
              </div>
            )}
          </div>
          <div className="emfa-header-right">
            Member No:&nbsp;
             {first.member_no && (
              <div className="emfa-dealer-badge">
                {first.member_no}
              </div>
            )}
          </div>
          <div className="emfa-header-right">
            Dealer Code:&nbsp;
             {first.dealer_code && (
              <div className="emfa-dealer-badge">
                {first.dealer_code}
              </div>
            )}
          </div>
          <div className="emfa-header-right">
           Division:&nbsp;
             {first.division && (
              <div className="emfa-dealer-badge">
                {first.division}
              </div>
            )}
          </div>
        </div>

        {/* TOP SUMMARY CARDS (4) */}
        <div className="emfa-grid emfa-grid-6" style={{ marginBottom: 18 }}>
          <div className="emfa-card">
            <div className="emfa-stat-label">Total EMFA Amount</div>
            <div
              className="emfa-stat-value"
              style={{ color: "#b91c1c" }}
            >
              {formatMoney(totalEmfaAmount)}
            </div>
          </div>
          <div className="emfa-card">
            <div className="emfa-stat-label">Total EMI Amount</div>
            <div
              className="emfa-stat-value"
              style={{ color: "#b91c1c" }}
            >
              {formatMoney(totalEmiDueAmount)}
            </div>
          </div>

          <div className="emfa-card">
            <div className="emfa-stat-label">Total EMI Paid</div>
            <div
              className="emfa-stat-value"
              style={{ color: "#16a34a" }}
            >
              {formatMoney(totalPaid)}
            </div>
          </div>

          <div className="emfa-card">
            <div className="emfa-stat-label">Remaining EMI Due</div>
            <div
              className="emfa-stat-value"
              style={{ color: "#f97316" }}
            >
              {formatMoney(remaining)}
            </div>
          </div>

          <div className="emfa-card">
            <div className="emfa-stat-label">Member Status</div>
          <div
          className="emfa-stat-value"
          style={{
            color:
              isMemberActive === true
                ? "#16a34a"     // green
                : isMemberActive === false
                ? "#b91c1c"     // red
                : "#6b7280"     // gray (not decided)
          }}
        >
          {memberStatus}
        </div>

      
          </div>
          <div className="emfa-card">
            <div className="emfa-stat-label">Dealer Status</div>
           <div
              className="emfa-stat-value"
              style={{
                color:
                  isDealerActive === true
                    ? "#16a34a"
                    : isDealerActive === false
                    ? "#b91c1c"
                    : "#6b7280"
              }}
            >
              {dealerStatus}
            </div>

          </div>
        </div>

        {/* ROW 2: EMI DUES PIE + EMI RECEIPTS BAR + GAUGE+DETAILS */}
        <div className="emfa-grid emfa-grid-3" style={{ marginBottom: 18 }}>

          <div className="emfa-card">
  <h4 style={{ fontSize: 14, marginBottom: 8 }}>
    EMI Payment Progress
  </h4>

  <Chart
    options={gaugeOptions}
    series={[emiCompletionPct]}
    type="radialBar"
    height={180}
  />

  <div
    style={{
      textAlign: "center",
      fontSize: 13,
      fontWeight: 600,
      marginBottom: 8,
    }}
  >
    {emiCompletionPct}% Completed
  </div>

  <div className="emfa-info-list">
    <div>
      <span className="emfa-info-label">EMFA No.</span>
      <span className="emfa-info-value">{loanNo}</span>
    </div>

    <div>
      <span className="emfa-info-label">EMIs Paid</span>
      <span className="emfa-info-value">
        {uniqueEmis} / {totalEmiActual}
      </span>
    </div>

    <div>
      <span className="emfa-info-label">Avg EMI</span>
      <span className="emfa-info-value">
        {formatMoney(avgEmiAmount)}
      </span>
    </div>
  </div>
</div>


          {/* EMI DUES PIE */}
          <div className="emfa-card">
            <h4 style={{ fontSize: 14, marginBottom: 8 }}>EMI Dues (Breakdown)</h4>
            <Chart
              options={duesPieOptions}
              series={duesPieSeries}
              type="pie"
              height={240}
            />
          </div>

         
        
             {/* CATEGORY SUMMARY TABLE */}
          <div className="emfa-card">
            <h4 style={{ fontSize: 14, marginBottom: 8 }}>
              Category Summary
            </h4>
            <table className="emfa-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Due</th>
                  <th>Paid</th>
                  <th>Remaining</th>
                </tr>
              </thead>
              <tbody>
                {categoryRows.map((c) => (
                  <tr key={c.name}>
                    <td>{c.name}</td>
                    <td>{formatMoney(c.due)}</td>
                    <td className="emfa-amount-positive">
                      {formatMoney(c.paid)}
                    </td>
                    <td
                      className={
                        c.rem >= 0
                          ? "emfa-amount-negative"
                          : "emfa-amount-positive"
                      }
                    >
                      {formatMoney(c.rem)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ROW 3: LINE CHART + CATEGORY SUMMARY TABLE */}
        <div className="emfa-grid emfa-grid-2" style={{ marginBottom: 18 }}>
          <div className="emfa-card">
  <h4 style={{ fontSize: 14, marginBottom: 8 }}>
    EMI Payment Overview
  </h4>

  <Chart
    options={comboOptions}
    series={comboSeries}
    type="line"
    height={280}
  />
</div>

        </div>

        <div className="d-flex justify-content-end">
        <ButtonUi onClick={onShowReport}>Show Report</ButtonUi>
      </div>
      </div>
     
    </div>
  );
};

export default EmfaDashboard;