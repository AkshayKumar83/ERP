


import Chart from "react-apexcharts";
import "./DashboardCard.scss";

const PurchaseMonthlyChart = ({
  data = [],
  poType = "A",
  selectedChart = "total",
  selectedMonth,
  setSelectedMonth,
  setChartView,
  creatorSummary = [],
}) => {

const creatorColors = [
  "#16a34a", // Green
  "#6f42c1", // Purple
  "#fd7e14", // Orange
  "#06b6d4", // Cyan
  "#65a30d", // Lime
  "#dc2626", // Red
  "#f59e0b", // Amber
  "#7c3aed", // Violet
  "#0891b2", // Teal
];



  const isCreatorChart =
    selectedChart !== "total" &&
    selectedChart !== null &&
    selectedChart !== undefined;


 
  const selectedCreator = isCreatorChart
    ? creatorSummary.find(
        (creator) =>
          Number(creator.userId) === Number(selectedChart)
      )
    : null;


  const creatorName =
    selectedCreator?.userName || "";


const getCreatorColor = (userId) => {
  const index = creatorSummary.findIndex(
    (creator) =>
      Number(creator.userId) === Number(userId)
  );

  if (index === -1) {
    return "#2563eb";
  }

  return creatorColors[index % creatorColors.length];
};

const chartColor = isCreatorChart
  ? getCreatorColor(selectedChart)
  : "#2563eb";
  // =====================================================
  // APEX OPTIONS
  // =====================================================

  const options = {

    chart: {
      type: "bar",

      events: {

        dataPointSelection(
          event,
          chartContext,
          config
        ) {

          const month =
            data[config.dataPointIndex];

          if (!month) return;

          setSelectedMonth(month.month);
          setChartView("pie");
        },

      },

      stacked: false,

      toolbar: {
        show: true,

        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false,
        },
      },
    },


    stroke: {
      width: [0],
    },


    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "25%",
      },
    },


    dataLabels: {

      enabled: true,

      enabledOnSeries: [0],

      style: {
        colors: ["#000"],
        fontSize: "12px",
        fontWeight: "600",
      },
    },


    // 🔥 MAIN COLOR
    colors: [chartColor],


    fill: {
      opacity: [0.9, 0.9, 1],
    },


    tooltip: {
      shared: true,
      intersect: false,
      theme: "light",
    },


    xaxis: {
      categories: data.map(
        (item) => item.month
      ),
    },


    legend: {
      position: "top",
    },


    title: {
      text: isCreatorChart
        ? `Monthly Purchase ${
            poType === "A"
              ? "Advice"
              : "Order"
          } - ${creatorName}`
        : poType === "A"
        ? "Monthly Purchase Advice Trend"
        : "Monthly Purchase Order Trend",
    },
  };


  // =====================================================
  // SERIES
  // =====================================================

  const series = [
    {
      name: isCreatorChart
        ? creatorName
        : poType === "A"
        ? "Purchase Advice"
        : "Purchase Orders",

      type: "column",

      data: data.map((item) => {

        // ---------------------------------------------
        // TOTAL
        // ---------------------------------------------

        if (!isCreatorChart) {
          return item.total;
        }


        // ---------------------------------------------
        // CREATOR
        // ---------------------------------------------

        const creator =
          (item.creators || []).find(
            (creator) =>
              Number(creator.userId) ===
              Number(selectedChart)
          );


        return creator?.count || 0;
      }),
    },
  ];


  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="card mt-3">

      <div className="card-body">

        <Chart
          className="purchase-chart"
          options={options}
          series={series}
          type="bar"
          height={280}
        />

      </div>

    </div>
  );
};

export default PurchaseMonthlyChart;