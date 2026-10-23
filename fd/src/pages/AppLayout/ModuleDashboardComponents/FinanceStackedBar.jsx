

import React, { useMemo, useState } from "react";
import Chart from "react-apexcharts";

const monthMap = {
  "04": "Apr",
  "05": "May",
  "06": "Jun",
  "07": "Jul",
  "08": "Aug",
  "09": "Sep",
  "10": "Oct",
  "11": "Nov",
  "12": "Dec",
  "01": "Jan",
  "02": "Feb",
  "03": "Mar",
};

const FinanceStackedBar = ({ stackedBar = [] }) => {
  const [selectedMonth, setSelectedMonth] = useState(0);

  const { categories, series, colors } = useMemo(() => {
    if (!stackedBar.length) {
      return {
        categories: [],
        series: [],
        colors: [],
      };
    }

    const months = [...new Set(stackedBar.map((x) => x.mth))].sort();

    const categories = months.map((m) => {
      const month = m.split("/")[1];
      return monthMap[month] || month;
    });

    const accounts = [...new Set(stackedBar.map((x) => x.acc_desc))];

    const series = accounts.map((acc) => ({
      name: acc,
      data: months.map((month) => {
        const row = stackedBar.find(
          (x) => x.mth === month && x.acc_desc === acc
        );

        return row ? Math.abs(Number(row.sum)) : 0;
      }),
    }));

    const colors = accounts.map((_, index) => {
      const hue = (index * 137.508) % 360;
      return `hsl(${hue},70%,55%)`;
    });

    return {
      categories,
      series,
      colors,
    };
  }, [stackedBar]);

  // Selected Month Summary
  const monthSummary = useMemo(() => {
    return series
      .map((item, index) => ({
        name: item.name,
        total: item.data[selectedMonth] || 0,
        color: colors[index],
      }))
      .filter((item) => item.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [series, colors, selectedMonth]);

  const options = {
    chart: {
      type: "bar",
      stacked: true,

      toolbar: {
        show: true,
      },

      // events: {  // this event work only user click
      //   dataPointSelection(event, chartContext, config) {
      //     setSelectedMonth(config.dataPointIndex);
      //   },
      // },
      events: {  // this event work only user hover
  dataPointMouseEnter(event, chartContext, config) {
    setSelectedMonth(config.dataPointIndex);
  },
},

    },

    colors,

    legend: {
      show: false,
    },

    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "25%",
        borderRadius: 3,
      },
    },

    dataLabels: {
      enabled: false,
    },

    stroke: {
      width: 1,
      colors: ["#fff"],
    },

    fill: {
      opacity: 1,
    },

    xaxis: {
      categories,
      title: {
        text: "Month",
      },
    },

    yaxis: {
      title: {
        text: "Amount",
      },
      labels: {
        formatter: (val) =>
          Number(val).toLocaleString("en-IN"),
      },
    },

    tooltip: {
      y: {
        formatter: (val) =>
          Number(val).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
      },
    },

    title: {
      text: "Month Wise Loan / Advance Summary",
      align: "left",
    },

    grid: {
      borderColor: "#e5e7eb",
    },
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">

        <div className="row">

          {/* Chart */}

          <div className="col-lg-8">

            <Chart
              options={options}
              series={series}
              type="bar"
              height={500}
            />

          </div>

          {/* Account Summary */}

          <div className="col-lg-4">

            <h5 className="fw-bold mb-3">
              Account Summary ({categories[selectedMonth]})
            </h5>

            <div
              style={{
                maxHeight: 500,
                overflowY: "auto",
                paddingRight: 10,
              }}
            >
              {monthSummary.map((item, index) => (
                <div
                  key={index}
                  className="d-flex justify-content-between align-items-center mb-2"
                >
                  <div
                    className="d-flex align-items-center"
                    style={{ width: "70%" }}
                  >
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: item.color,
                        marginRight: 8,
                        flexShrink: 0,
                      }}
                    />

                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    >
                      {item.name}
                    </span>
                  </div>

                  <span
                    style={{
                      color: "#2563eb",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    ₹{" "}
                    {item.total.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default FinanceStackedBar;