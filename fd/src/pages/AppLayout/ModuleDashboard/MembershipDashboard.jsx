
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Building2,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import StatCard from "../ModuleDashboardComponents/StatCard";
import { APP_PROD_API } from "../../../utils/api";
import { fetchAppData } from "../../../utils/fetchUtils";
import MemberMonthlyChart from "../ModuleDashboardComponents/MemberMonthlyChart ";
import DashboardCards from "../ModuleDashboardComponents/DashboardCards";
import MemberDealerStatusChart from "../ModuleDashboardComponents/MemberDealerStatusChart";
import MemberLoanType from "../ModuleDashboardComponents/MemberLoanType";

const MembershipDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  const [dashboardData, setDashboardData] = useState({});
  const [loading, setLoading] = useState(false);

  // A = Advice , O = Order
  const [poType, setPoType] = useState("A");

  useEffect(() => {
    fetchPurchaseDashboard();
  }, [poType]);

  const fetchPurchaseDashboard = async () => {
    try {
      setLoading(true);

      const data = await fetchAppData(
        `${APP_PROD_API.GET_DATA_FOR_MEMBER_DASHBOARD}?appDivisionId=${user.global_division_id}&appFinYear=${user.global_fin_year}&userId=${user.id}`
      );

      if (!data) return;

      setDashboardData(data);
    } catch (error) {
      toast.error(error?.message || "Error fetching dashboard");
    } finally {
      setLoading(false);
    }
  };

const dashboardCards = [

  // Members
  {
    title: "Total Members",
    value: dashboardData?.totalMembers || 0,
    icon: <Users size={28} />,
    color: "blue",
  },

  {
    title: "Active Members",
    value: dashboardData?.activeMembers || 0,
    icon: <UserCheck size={28} />,
    color: "green",
  },

  {
    title: "Inactive Members",
    value: dashboardData?.inactiveMembers || 0,
    icon: <UserX size={28} />,
    color: "red",
  },

  // {
  //   title: "Pending Members",
  //   value: dashboardData?.pendingMembers || 0,
  //   icon: <UserPlus size={28} />,
  //   color: "orange",
  // },

  // Dealers
  {
    title: "Total Dealers",
    value: dashboardData?.totalDealers || 0,
    icon: <Building2 size={28} />,
    color: "purple",
  },

  {
    title: "Active Dealers",
    value: dashboardData?.activeDealers || 0,
    icon: <Building2 size={28} />,
    color: "green",
  },

  {
    title: "Inactive Dealers",
    value: dashboardData?.inactiveDealers || 0,
    icon: <Building2 size={28} />,
    color: "red",
  },

];
  return (
    <div className="container-fluid py-1">



{/*  card div */}
      {/* <div className="row g-3">

        {dashboardCards.map((card, index) => (

          <div
            key={index}
            className="col-xl-3 col-lg-4 col-md-6"
          >
            <StatCard {...card} />
          </div>

        ))}

      </div> */}

     <DashboardCards
    cards={dashboardCards}
    cardsPerRow={3}
/>


{/* chart div */}

<div className="row mt-4">

    {/* <div className="col-6">

        <MemberMonthlyChart
            data={dashboardData?.monthlyChart || []}
        />

    </div> */}

      <div className="col-lg-6">
      <MemberDealerStatusChart
          memberData={dashboardData?.memberDivisionChart || []}
          dealerData={dashboardData?.dealerTypeChart || []}
      />
    </div>

      <div className="col-lg-6">
     <MemberLoanType
        data={dashboardData?.loanTypeChart || []}
        />
    </div>

</div>

    </div>
  );
};

export default MembershipDashboard
