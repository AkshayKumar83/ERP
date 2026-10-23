// import React, { useMemo } from "react";
// import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

// const MemberReportChart = ({ reportData, reportType }) => {
//   const chartData = useMemo(() => {
//     const total = reportData.length;
//     const active = reportData.filter(m => m.member_active === "Y").length;
//     const inactive = reportData.filter(m => m.member_active === "N").length;

//     if (reportType === "A") {
//       return [
//         { name: "All Members", count: total },
//         { name: "Active Members", count: active },
//         { name: "Inactive Members", count: inactive }
//       ];
//     }
//     //  else if (reportType === "M") {
//     //   return [{ name: "Active Members", count: active }];
//     // } else if (reportType === "N") {
//     //   return [{ name: "Inactive Members", count: inactive }];
//     // }
//     return [];
//   }, [reportData, reportType]);

//   console.log("ChartData:", chartData); // debug

//   return (
//     <div style={{ width: "100%", height: 400, minHeight: 400 }}>
//       <ResponsiveContainer>
//         <BarChart data={chartData}>
//           <XAxis dataKey="name" />
//           <YAxis allowDecimals={false} />
//           <Tooltip />
//           <Legend />
//           <Bar dataKey="count" fill="#1976d2" />
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default MemberReportChart;


  import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#1976d2", "#2e7d32", "#d32f2f"]; // Blue, Green, Red

const MemberReportChart = ({ reportData, reportType }) => {
  const chartData = useMemo(() => {
    const total = reportData.length;
    const active = reportData.filter((m) => m.member_active === "Y").length;
    const inactive = reportData.filter((m) => m.member_active === "N").length;

    if (reportType === "A") {
      return [
        { name: "All Members", value: total },
        { name: "Active Members", value: active },
        { name: "Inactive Members", value: inactive },
      ];
    }
    // Future extension
    // else if (reportType === "M") {
    //   return [{ name: "Active Members", value: active }];
    // } else if (reportType === "N") {
    //   return [{ name: "Inactive Members", value: inactive }];
    // }
    return [];
  }, [reportData, reportType]);

  return (
    <div style={{ width: "100%", height: 400, minHeight: 400 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={120}
            label
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MemberReportChart;

  




// import React, { useMemo } from "react";
// import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

// const MemberReportChart = ({ reportData }) => {
//   const chartData = useMemo(() => {
//     if (!reportData || reportData.length === 0) return [];

//     // Get all column names dynamically
//     const columns = Object.keys(reportData[0]);

//     // Example: count non-empty values per column
//     return columns.map((col) => {
//       const count = reportData.filter((row) => row[col] !== null && row[col] !== "").length;
//       return { name: col.toUpperCase(), count };
//     });
//   }, [reportData]);

//   return (
//     <div style={{ width: "100%", height: 400 }}>
//       <ResponsiveContainer>
//         <BarChart data={chartData}>
//           <XAxis dataKey="name" />
//           <YAxis allowDecimals={false} />
//           <Tooltip />
//           <Legend />
//           <Bar dataKey="count" fill="#1976d2" />
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default MemberReportChart;
