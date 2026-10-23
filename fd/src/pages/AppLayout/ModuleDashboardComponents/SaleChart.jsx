import Chart from "react-apexcharts";

const SaleChart = ({ total, active, inactive,  monthlyData = [], }) => {

  const options = {
    chart: {
      type: "donut",
      toolbar: {
        show: false,
      },
    },

    labels: ["Active", "Inactive"],

    colors: [
      "#16a34a",
      "#ef4444",
    ],

    legend: {
      position: "bottom",
    },

    dataLabels: {
      enabled: true,
    },

    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,

            total: {
              show: true,
              label: "Customers",
              formatter: () => total,
            },
          },
        },
      },
    },

    title: {
      text: "Customer Status",
      align: "left",
    },
  };

  const series = [
    active,
    inactive,
  ];
  

  return (
    <div className="card">
      <div className="card-body">

        <Chart
          options={options}
          series={series}
          type="donut"
          height={300}
        />

      </div>
    </div>
  );
};

export default SaleChart;