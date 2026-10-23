import Chart from "react-apexcharts";

const FinancePieChart = ({ financeAccounts = [] }) => {

    const colors = [
  "#008FFB",
  "#00E396",
  "#FEB019",
  "#FF4560",
  "#775DD0",
  "#3F51B5",
  "#546E7A",
  "#D4526E",
  "#8D5B4C",
  "#F86624",
  "#2E294E",
  "#1B998B",
  "#E71D36",
  "#FF9F1C",
  "#6A4C93",
  "#1982C4",
  "#06D6A0",
  "#EF476F",
  "#118AB2",
  "#8338EC",
];

  const options = {
    chart: {
      type: "pie",
      toolbar: {
        show: false,
      },
    },

   labels: financeAccounts.map(
  (item) => `${item.accountCode} - ${item.accountName}`
),

colors,

    legend: {
      position: "bottom",
    },

    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(1)}%`,
    },

    tooltip: {
      y: {
        formatter: (value) =>
          value.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
          }),
      },
    },

    title: {
      text: "Advance Account Summary",
      align: "left",
    },
  };

  const series = financeAccounts.map((item) => Number(item.total));

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <Chart
          options={options}
          series={series}
          type="pie"
          height={500}
        />
      </div>
    </div>
  );
};

export default FinancePieChart;