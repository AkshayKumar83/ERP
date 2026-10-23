// import React, { useMemo } from "react";
// import {
//   PieChart, Pie, Cell, Tooltip as ReTooltip, Legend as ReLegend,
//   BarChart, Bar, XAxis, YAxis, ResponsiveContainer
// } from "recharts";

// const MemberDashboard = ({ reportData }) => {
//   //  Chart Data Banana
//   const chartData = useMemo(() => {
//     const total = reportData.length;
//     const active = reportData.filter(m => m.member_active === "Y").length;
//     const inactive = reportData.filter(m => m.member_active === "N").length;

//     return [
//       { name: "All Members", count: total },
//       { name: "Active Members", count: active },
//       { name: "Inactive Members", count: inactive }
//     ];
//   }, [reportData]);

//   const COLORS = ["#1976d2", "#2e7d32", "#d32f2f"];

//   return (
//     <div style={{ padding: 20 }}>
//       <h3 className="mb-3">📊 Members Dashboard</h3>

//       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
//         {/* 🥧 Pie Chart */}
//         <div style={{ height: 400 }}>
//           <ResponsiveContainer>
//             <PieChart>
//               <Pie
//                 data={chartData}
//                 dataKey="count"
//                 nameKey="name"
//                 cx="50%"
//                 cy="50%"
//                 outerRadius={120}
//                 label
//               >
//                 {chartData.map((_, index) => (
//                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                 ))}
//               </Pie>
//               <ReTooltip />
//               <ReLegend />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>

//         {/* 📊 Bar Chart */}
//         <div style={{ height: 400 }}>
//           <ResponsiveContainer>
//             <BarChart data={chartData}>
//               <XAxis dataKey="name" />
//               <YAxis allowDecimals={false} />
//               <ReTooltip />
//               <ReLegend />
//               <Bar dataKey="count" fill="#1976d2" />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MemberDashboard;


// import React, { useMemo } from "react";
// import {
//   PieChart, Pie, Cell, Tooltip as ReTooltip, Legend as ReLegend,
//   BarChart, Bar, XAxis, YAxis, ResponsiveContainer
// } from "recharts";

// const MemberDashboard = ({ reportData }) => {
//   // 🟢 Chart Data Banana
//   const chartData = useMemo(() => {
//     const total = reportData.length;
//     const active = reportData.filter(m => m.member_active === "Y").length;
//     const inactive = reportData.filter(m => m.member_active === "N").length;

//     return [
//       { name: "All Members", count: total },
//       { name: "Active Members", count: active },
//       { name: "Inactive Members", count: inactive }
//     ];
//   }, [reportData]);

//   const COLORS = ["#1976d2", "#2e7d32", "#d32f2f"];

//   // 🟢 Pie Chart Percentage Label Function
//   const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
//     const RADIAN = Math.PI / 180;
//     const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
//     const x = cx + radius * Math.cos(-midAngle * RADIAN);
//     const y = cy + radius * Math.sin(-midAngle * RADIAN);

//     return (
//       <text
//         x={x}
//         y={y}
//         fill="white"
//         textAnchor="middle"
//         dominantBaseline="central"
//         fontSize={14}
//         fontWeight="bold"
//       >
//         {`${(percent * 100).toFixed(0)}%`}
//       </text>
//     );
//   };

//   return (
//     <div style={{ padding: 20 }}>
//       <h3 className="mb-3">📊 Members Dashboard</h3>

//       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
//         {/* 🥧 Pie Chart with Percentage */}
//         <div style={{ height: 400 }}>
//           <ResponsiveContainer>
//             <PieChart>
//               <Pie
//                 data={chartData}
//                 dataKey="count"
//                 nameKey="name"
//                 cx="50%"
//                 cy="50%"
//                 outerRadius={120}
//                 label={renderCustomizedLabel} // ✅ Percentage Label
//               >
//                 {chartData.map((_, index) => (
//                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                 ))}
//               </Pie>
//               <ReTooltip />
//               <ReLegend />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>

//         {/* 📊 Bar Chart with Different Colors */}
//         <div style={{ height: 400 }}>
//           <ResponsiveContainer>
//             <BarChart data={chartData}>
//               <XAxis dataKey="name" />
//               <YAxis allowDecimals={false} />
//               <ReTooltip />
//               <ReLegend />
//               <Bar dataKey="count">
//                 {chartData.map((_, index) => (
//                   <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
//                 ))}
//               </Bar>
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MemberDashboard;


           //Pie Chart me percentage + actual count

//  import React, { useMemo } from "react";
// import {
//   PieChart, Pie, Cell, Tooltip as ReTooltip, Legend as ReLegend,
//   BarChart, Bar, XAxis, YAxis, ResponsiveContainer
// } from "recharts";

// const MemberDashboard = ({ reportData }) => {
//   // 🟢 Chart Data Banana
//  const chartData = useMemo(() => {
//   const total = reportData.length;
//   const active = reportData.filter(m => m.member_active === "Y").length;
//   const inactive = reportData.filter(m => m.member_active === "N").length;

//   return [
//     { name: "All Members", count: total },
//     { name: "Active Members", count: active },
//     { name: "Inactive Members", count: inactive }
//   ];
// }, [reportData]);


//   const COLORS = ["#1976d2", "#2e7d32", "#d32f2f"];

//   // 🟢 Pie Chart Label: Percentage + Count
//   const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
//     const RADIAN = Math.PI / 180;
//     const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
//     const x = cx + radius * Math.cos(-midAngle * RADIAN);
//     const y = cy + radius * Math.sin(-midAngle * RADIAN);
//     const count = chartData[index].count;

//     return (
//       <text
//         x={x}
//         y={y}
//         fill="white"
//         textAnchor="middle"
//         dominantBaseline="central"
//         fontSize={12}
//         fontWeight="bold"
//       >
//         {`${(percent * 100).toFixed(0)}% (${count})`}
//       </text>
//     );
//   };

//   return (
//     <div style={{ padding: 20 }}>
//       <h3 className="mb-3">📊 Members Dashboard</h3>

//       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
//         {/* 🥧 Pie Chart */}
//         <div style={{ height: 400 }}>
//           <ResponsiveContainer>
//             <PieChart>
//               <Pie
//                 data={chartData}
//                 dataKey="count"
//                 nameKey="name"
//                 cx="50%"
//                 cy="50%"
//                 outerRadius={120}
//                 label={renderCustomizedLabel} // ✅ Percentage + Count
//               >
//                 {chartData.map((_, index) => (
//                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                 ))}
//               </Pie>
//               <ReTooltip />
//               <ReLegend />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>

//         {/* 📊 Bar Chart with Different Colors */}
//         <div style={{ height: 400 }}>
//           <ResponsiveContainer>
//             <BarChart data={chartData}>
//               <XAxis dataKey="name" />
//               <YAxis allowDecimals={false} />
//               <ReTooltip />
//               <ReLegend />
//               <Bar dataKey="count">
//                 {chartData.map((_, index) => (
//                   <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
//                 ))}
//               </Bar>
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MemberDashboard;


// import React, { useMemo } from "react";
// import {
//   PieChart, Pie, Cell, Tooltip as ReTooltip, Legend as ReLegend,
//   BarChart, Bar, XAxis, YAxis, ResponsiveContainer
// } from "recharts";

// const MemberDashboard = ({ reportData }) => {
//   // Chart Data Banana
//   const chartData = useMemo(() => {
//     const total = reportData.length;
//     const active = reportData.filter(m => m.member_active === "Y").length;
//     const inactive = reportData.filter(m => m.member_active === "N").length;

//     return [
//       { name: "All Members", count: total },
//       { name: "Active Members", count: active },
//       { name: "Inactive Members", count: inactive }
//     ];
//   }, [reportData]);

//   const COLORS = ["#1976d2", "#2e7d32", "#d32f2f"];

//   //  Pie Chart Label: Percentage + Count
//   const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
//     const RADIAN = Math.PI / 180;
//     const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
//     const x = cx + radius * Math.cos(-midAngle * RADIAN);
//     const y = cy + radius * Math.sin(-midAngle * RADIAN);
//     const count = chartData[index].count;

//     return (
//       <text
//         x={x}
//         y={y}
//         fill="white"
//         textAnchor="middle"
//         dominantBaseline="central"
//         fontSize={12}
//         fontWeight="bold"
//       >
//         {`${(percent * 100).toFixed(0)}% (${count})`}
//       </text>
//     );
//   };

//   //  Tooltip Content for Pie Chart
//   const CustomTooltip = ({ active, payload }) => {
//     if (active && payload && payload.length) {
//       const { name, value } = payload[0];
//       const total = chartData.reduce((acc, cur) => acc + cur.count, 0);
//       const percent = ((value / total) * 100).toFixed(0);
//       return (
//         <div style={{ backgroundColor: "#fff", padding: 10, border: "1px solid #ccc", borderRadius: 5 }}>
//           <strong>{name}</strong>
//           <br />
//           Count: {value}
//           <br />
//           {percent}% of total
//         </div>
//       );
//     }
//     return null;
//   };

//   return (
//     <div style={{ padding: 20 }}>
//       <h3 className="mb-3">📊 Members Dashboard</h3>

//       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
//         {/*  Pie Chart */}
//         <div style={{ height: 400 }}>
//           <ResponsiveContainer>
//             <PieChart>
//               <Pie
//                 data={chartData}
//                 dataKey="count"
//                 nameKey="name"
//                 cx="50%"
//                 cy="50%"
//                 outerRadius={120}
//                 label={renderCustomizedLabel}
//               >
//                 {chartData.map((_, index) => (
//                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                 ))}
//               </Pie>
//               <ReTooltip content={CustomTooltip} />
//               <ReLegend />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>

//         {/*  Bar Chart */}
//         <div style={{ height: 400 }}>
//           <ResponsiveContainer>
//             <BarChart data={chartData}>
//               <XAxis dataKey="name" />
//               <YAxis allowDecimals={false} />
//               <ReTooltip />
//               <ReLegend />
//               <Bar dataKey="count">
//                 {chartData.map((_, index) => (
//                   <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
//                 ))}
//               </Bar>
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MemberDashboard;

import React, { useMemo } from "react";
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip, Legend as ReLegend,
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer
} from "recharts";

const MemberDashboard = ({ reportData }) => {
  // Chart Data Banana
  const { total, active, inactive } = useMemo(() => {
    const total = reportData.length;
    const active = reportData.filter(m => m.member_active === "Y").length;
    const inactive = reportData.filter(m => m.member_active === "N").length;
    return { total, active, inactive };
  }, [reportData]);

  const pieData = [
    { name: "Active Members", count: active },
    { name: "Inactive Members", count: inactive }
  ];

  const barData = [
    { name: "All Members", count: total },
    { name: "Active Members", count: active },
    { name: "Inactive Members", count: inactive }
  ];

  const COLORS = ["#2e7d32", "#d32f2f"]; // Active = Green, Inactive = Red

  // Pie Chart Label: Percentage + Count
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const count = pieData[index].count;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}% (${count})`}
      </text>
    );
  };

  // Tooltip Content for Pie Chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0];
      const totalCount = pieData.reduce((acc, cur) => acc + cur.count, 0);
      const percent = ((value / totalCount) * 100).toFixed(0);
      return (
        <div style={{ backgroundColor: "#fff", padding: 10, border: "1px solid #ccc", borderRadius: 5 }}>
          <strong>{name}</strong>
          <br />
          Count: {value}
          <br />
          {percent}% of total
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ padding: 20 }}>
      <h3 className="mb-3">📊 Members Dashboard</h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/*  Pie Chart */}
        <div style={{ height: 400 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={renderCustomizedLabel}
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>

              {/* Center me Total Members */}
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={14}
                fontWeight="bold"
              >
                Total Members: {total}
              </text>

              <ReTooltip content={CustomTooltip} />
              <ReLegend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/*  Bar Chart */}
        <div style={{ height: 400 }}>
          <ResponsiveContainer>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <ReTooltip />
              <ReLegend />
              <Bar dataKey="count">
                {barData.map((_, index) => (
                  <Cell
                    key={`bar-${index}`}
                    fill={
                      index === 0
                        ? "#1976d2" // All Members = Blue
                        : COLORS[index - 1]
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;

