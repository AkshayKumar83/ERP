import Chart from "react-apexcharts";

const MemberMonthlyChart = ({ data = [] }) => {

 const options = {

    chart: {
      type: "area",
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
      curve: "smooth",
      width: 3,
    },

    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: .45,
        opacityTo: .05,
      },
    },

    dataLabels: {
      enabled: false,
    },

    xaxis: {
      categories: data.map(item => item.month),
    },

     colors: [
    "#2563eb", // Members
    "#6f42c1", // Dealers
  ],

    legend: {
      position: "top",
    },

    title: {
        text: "Monthly Member / Dealer Registration",
      align: "left",
    }

  };

  const series = [
  {
    name: "Members",
    data: data.map(item => item.members),
  },
  {
    name: "Dealers",
    data: data.map(item => item.dealers),
  },
];

  return (

    <div className="card">

      <div className="card-body">

        <Chart
          options={options}
          series={series}
          type="area"
          height={280}
        />

      </div>

    </div>

  );

};

export default MemberMonthlyChart;