
import Chart from "react-apexcharts";
import { ArrowLeft } from "lucide-react";

const PurchaseBrandPieChart = ({
  data = [],
  poType = "A",
  selectedMonth,
  selectedChart,
  creatorSummary = [],
  onBack,
}) => {


  const creatorColors = [
  "#16a34a",
  "#6f42c1",
  "#fd7e14",
  "#06b6d4",
  "#65a30d",
  "#dc2626",
  "#f59e0b",
  "#7c3aed",
  "#0891b2",
];

const brandColors = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#dc2626",
  "#7c3aed",
  "#06b6d4",
];
 

  const isCreatorChart =
    selectedChart !== "total" &&
    selectedChart !== null &&
    selectedChart !== undefined;




  const selectedCreator = isCreatorChart
    ? creatorSummary.find(
        (creator) =>
          Number(creator.userId) ===
          Number(selectedChart)
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




const totalColor = isCreatorChart
  ? getCreatorColor(selectedChart)
  : "#2563eb";


  const total = data.reduce(
    (sum, item) =>
      sum + Number(item.total),
    0
  );


  // =====================================================
  // PIE OPTIONS
  // =====================================================

  const options = {

    chart: {
      type: "pie",

      toolbar: {
        show: true,
      },
    },

    labels: data.map(
      (item) => item.brand_name
    ),

    legend: {
      show: false,
    },

    dataLabels: {

      enabled: true,

      formatter: (val) =>
        `${val.toFixed(1)}%`,

      style: {
        fontSize: "11px",
      },
    },

    tooltip: {

      y: {
        formatter: (value) =>
          value,
      },

    },

   colors: brandColors,
  };


  const series = data.map(
    (item) =>
      Number(item.total)
  );


  return (

    <div className="card mt-3 shadow-sm">

      {/* ================= HEADER ================= */}

      <div className="card-header d-flex justify-content-between align-items-center">

        <div className="d-flex align-items-center">

          <button
            className="btn btn-link text-decoration-none fw-semibold p-0 me-3"
            onClick={onBack}
          >

            <ArrowLeft
              size={17}
              className="me-1"
            />

            Monthly Trend

          </button>


          <h6 className="mb-0 fw-bold">

            {poType === "A"
              ? "Brand Wise Purchase Advice"
              : "Brand Wise Purchase Orders"}

            {creatorName &&
              ` - ${creatorName}`}

            {selectedMonth &&
              ` (${selectedMonth})`}

          </h6>

        </div>


        {/* ================= TOTAL ================= */}

        <div className="text-end">

          <div
            style={{
              fontSize: 18,
              fontWeight: 700,

              // 🔥 Dynamic user color
              color: totalColor,

              lineHeight: 1,
            }}
          >

            {data.length > 0
              ? `Total ${total}`
              : ""}

          </div>

        </div>

      </div>


      {/* ================= BODY ================= */}

      <div className="card-body pt-2 pb-2">

        {data.length === 0 ? (

          <div
            className="d-flex justify-content-center align-items-center"
            style={{
              height: 300,
            }}
          >

            <div
              className="card border-0 shadow-sm bg-warning"
              style={{
                maxWidth: 430,
                width: "100%",
                background: "#f8fafc",
                borderRadius: 12,
              }}
            >

              <div className="card-body text-center py-4">

                <div
                  className="mx-auto mb-3 d-flex justify-content-center align-items-center"
                  style={{
                    width: 65,
                    height: 65,
                    borderRadius: "50%",
                    background: "#e0f2fe",
                    color: "#0284c7",
                    fontSize: 28,
                  }}
                >
                  📊
                </div>

                <h5 className="fw-semibold text-dark mb-2">
                  Brand-wise Analysis Unavailable
                </h5>

                <p
                  className="alert alert-warning mb-0"
                  style={{
                    fontSize: 14,
                    lineHeight: 1.6,
                  }}
                >

                  Brand information was not assigned while
                  creating

                  <br />

                  Purchase Orders for{" "}

                  <strong>
                    {selectedMonth}
                  </strong>.

                </p>

              </div>

            </div>

          </div>

        ) : (

          <div className="row">

            {/* ================= PIE ================= */}

            <div className="col-lg-6 d-flex justify-content-center align-items-start">

              <Chart
                options={options}
                series={series}
                type="pie"
                height={270}
              />

            </div>


            {/* ================= SUMMARY ================= */}

            <div className="ms-4 col-lg-5 d-flex justify-content-end">

              <div
                className="mt-4"
                style={{
                  width: "320px",
                  marginTop: "7px",
                }}
              >

                {data.map(
                  (item, index) => (

                    <div
                      key={item.brand_code}
                      className="d-flex justify-content-between align-items-start mt-2"
                    >

                      <div className="d-flex align-items-start">

                        <span
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",

                            backgroundColor:
                            brandColors[
                              index % brandColors.length
                            ],

                            marginTop: 5,
                            marginRight: 10,
                            flexShrink: 0,
                          }}
                        />

                        <span
                          style={{
                            fontSize: 12,
                            lineHeight: "18px",
                            fontWeight: 500,
                            maxWidth: "230px",
                            wordBreak: "break-word",
                          }}
                        >
                          {item.brand_name}
                        </span>

                      </div>


                      <span
                        style={{
                          color:
                        brandColors[
                          index % brandColors.length
                        ],

                          fontWeight: 700,
                          fontSize: 14,
                          marginLeft: 15,
                          flexShrink: 0,
                        }}
                      >
                        {item.total}
                      </span>

                    </div>

                  )
                )}

              </div>

            </div>

          </div>

        )}

      </div>

    </div>
  );
};

export default PurchaseBrandPieChart;