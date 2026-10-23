import { useState } from "react";
import Chart from "react-apexcharts";
import "./DashboardCard.scss";
import {
  Users,
  Building2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const MemberDealerStatusChart = ({
  memberData = [],
  dealerData = [],
}) => {
  const [chartType, setChartType] = useState("member");
  const [statusType, setStatusType] = useState("active");

  const chartData =
    chartType === "member"
      ? memberData
      : dealerData;

  const series = chartData.map((item) =>
    Number(
      statusType === "active"
        ? item.active
        : item.inactive
    )
  );

  const labels = chartData.map((item) => item.category);

  const options = {
    chart: {
      type: "donut",
      toolbar: {
        show: true,
  //        offsetX: -170,
  // offsetY: -6,
      },
    },

    colors: [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Yellow
  "#ef4444", // Red
  "#8b5cf6", // Violet
   "#ec4899", // Pink
  "#14b8a6", // Teal
  "#84cc16", // Lime
  "#f97316", // Orange
  "#6366f1", // Indigo
  "#0ea5e9", // Sky
  "#a855f7", // Purple
],

    labels,

    // legend: {
    //   position: "bottom",
    //   fontSize: "12px",
    // },

    legend: {
  position: "bottom",
  horizontalAlign: "center",
  fontSize: "11px",
  show: false,
  itemMargin: {
    horizontal: 10,
    vertical: 5,
  },
},

    // title: {
    //   text:
    //     chartType === "member"
    //       ? `Division Wise ${
    //           statusType === "active"
    //             ? "Active"
    //             : "Inactive"
    //         } Members`
    //       : `Dealer Type Wise ${
    //           statusType === "active"
    //             ? "Active"
    //             : "Inactive"
    //         } Dealers`,
    //   align: "left",
    // },

    plotOptions: {
      pie: {
        donut: {
          size: "60%",
          labels: {
            show: true,

            total: {
              show: true,
              label:
                statusType === "active"
                  ? "Active"
                  : "Inactive",

              formatter: () =>
                series
                  .reduce((a, b) => a + b, 0)
                  .toLocaleString("en-IN"),
            },
          },
        },
      },
    },

    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(1)}%`,
    },

    tooltip: {
      y: {
        formatter: (val) =>
          val.toLocaleString("en-IN"),
      },
    },

    responsive: [
      {
        breakpoint: 768,
        options: {
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

const titleColor =
  chartType === "member"
    ? "#2563eb" // Blue
    : "#7c3aed"; // Purple

const countColor =
  statusType === "active"
    ? "#16a34a" // Green
    : "#dc2626"; // Red

  return (
    <div className="card h-100 shadow-sm">

      <div className="card-body">

        {/* Top Buttons */}

        <div className="d-flex justify-content-between mb-3">

          {/* Member Dealer */}


      <div className="segment-switch">

        <button
          className={
            chartType === "member"
              ? "active member"
              : ""
          }
          onClick={() => setChartType("member")}
        >
          <Users size={16} className="me-2" />
          Members
        </button>

        <button
          className={
            chartType === "dealer"
              ? "active dealer"
              : ""
          }
          onClick={() => setChartType("dealer")}
        >
          <Building2 size={16} className="me-2" />
          Dealers
        </button>

      </div>

          {/* Active Inactive */}

      <div className="segment-switch">

      <button
        className={statusType === "active" ? "active success" : ""}
        onClick={() => setStatusType("active")}
      >
        <CheckCircle2 size={16} className="me-2" />
        Active
      </button>

      <button
        className={statusType === "inactive" ? "active danger" : ""}
        onClick={() => setStatusType("inactive")}
      >
        <XCircle size={16} className="me-2" />
        Inactive
      </button>

    </div>
          

        </div>

        {/* <Chart
          options={options}
          series={series}
          type="donut"
          height={300}
        /> */}

        <div className="row align-items-center">

  {/* Donut */}

  <div className="d-flex justify-content-between align-items-center mb-3">

  <h5 className="mb-0 fw-bold">
    {chartType === "member"
      ? `Division Wise ${
          statusType === "active"
            ? "Active"
            : "Inactive"
        } Members`
      : `Dealer Type Wise ${
          statusType === "active"
            ? "Active"
            : "Inactive"
        } Dealers`}
  </h5>

  <div className="text-end">

   <div
  className="d-flex align-items-center justify-content-end"
  style={{
    gap: "10px",
    fontWeight: 700,
    fontSize: 18,
  }}
>
  <span style={{ color: titleColor }}>
    Total
  </span>

  <span
    style={{
      color: countColor,
      fontSize: 18,
      lineHeight: 1,
    }}
  >
    {series.reduce((a, b) => a + b, 0).toLocaleString("en-IN")}
  </span>
</div>

  </div>

</div>

  <div className="col-lg-6 d-flex justify-content-center">

    <Chart
      options={options}
      series={series}
      type="donut"
      height={280}
    />

  </div>

  {/* Summary */}

  <div className="col-lg-6">

    {chartData.map((item, index) => (

    <div
  key={item.category}
  className="d-flex justify-content-between align-items-center mb-3"
>

        <div className="d-flex align-items-center">

          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: options.colors[index],
               marginTop: 2,
              marginRight: 10,
              flexShrink: 0,
            }}
          />

          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              lineHeight: "14px",
              maxWidth: "180px",
            }}
          >
            {item.category}
          </span>

        </div>

       <span
          style={{
            color: options.colors[index],
            fontWeight: 700,
            fontSize: 15,
            display: "flex",
            alignItems: "center",
          }}
        >
          {statusType === "active"
            ? Number(item.active).toLocaleString("en-IN")
            : Number(item.inactive).toLocaleString("en-IN")}
        </span>

      </div>

    ))}

  </div>

</div>

      </div>

    </div>
  );
};

export default MemberDealerStatusChart;