

import { useState } from "react";
import Chart from "react-apexcharts";
import toast from "react-hot-toast";
import MemberLoanModal from "./MemberLoanModal";
import { APP_PROD_API } from "../../../utils/api";
import { fetchAppData } from "../../../utils/fetchUtils";
import "./DashboardCard.scss";

const MemberLoanType = ({ data = [] }) => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleLoanClick = async (loan) => {
    try {
      setLoading(true);

      setSelectedLoan(loan);

      const response = await fetchAppData(
        `${APP_PROD_API.GET_MEMBER_LOAN_DETAILS}?loan_id=${loan.loan_id}`
      );


      setMembers(response || []);

      setOpenModal(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const options = {
    chart: {
      type: "bar",
      toolbar: {
        show: true,
      },

      // events: {
      //   dataPointSelection: (event, chartContext, config) => {
      //     handleLoanClick(data[config.dataPointIndex]);
      //   },
      // },

      events: {
      dataPointSelection: (event, chartContext, config) => {

        handleLoanClick({
          ...data[config.dataPointIndex],
          color: options.colors[config.dataPointIndex],
        });

      },
     },
    },

    legend: {
      show: false,
    },

    plotOptions: {
      bar: {
        borderRadius: 5,
        columnWidth: "45%",
        distributed: true,
      },
    },

    dataLabels: {
      enabled: true,
      style: {
        fontSize: "11px",
        fontWeight: "bold",
      },
    },

    xaxis: {
      categories: data.map((i) => i.loan_purpose_desc),
      labels: {
        rotate: -45,
        rotateAlways: true,
        style: {
          fontSize: "10px",
          fontWeight: 700,
        },
      },
    },

    yaxis: {
      title: {
        text: "Members",
      },
    },

    tooltip: {
      y: {
        formatter: (val) => `${val} Members`,
      },
    },

    colors: [
      "#3B82F6",
      "#10B981",
      "#F59E0B",
      "#EF4444",
      "#8B5CF6",
      "#06B6D4",
      "#EC4899",
    ],
  };

  const series = [
    {
      name: "Members",
      data: data.map((i) => Number(i.member_count)),
    },
  ];

  return (
    <>
      <div className="card shadow-sm h-100">
        <div className="card-body">

          <h5 className="fw-bold mb-3">
            Loan Wise Members
          </h5>

          <Chart
            className="purchase-chart"
            options={options}
            series={series}
            type="bar"
            height={340}
          />

        </div>
      </div>

      <MemberLoanModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        loan={selectedLoan}
        members={members}
        loading={loading}
      />
    </>
  );
};

export default MemberLoanType;