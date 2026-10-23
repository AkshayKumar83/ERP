

 import Chart from "react-apexcharts";

const PurchaseGateEntryAndNRGPChart = ({ data = [] }) => {

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
      "#7C3AED",   // Gate Entry
      "#EF4444",   // NRGP
    ],

    legend: {
      position: "top",
    },

    title: {
      text: "Monthly Gate Entry / NRGP",
      align: "left",
    }

  };

  const series = [

    {
      name: "Gate Entry",
      data: data.map(item => item.gateEntry),
    },

    {
      name: "NRGP",
      data: data.map(item => item.nrgp),
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



export default PurchaseGateEntryAndNRGPChart;