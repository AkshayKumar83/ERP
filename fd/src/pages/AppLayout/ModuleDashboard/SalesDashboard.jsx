
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
import SaleChart from "../ModuleDashboardComponents/SaleChart";

const SalesDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  const [dashboardData, setDashboardData] = useState({});
  const [loading, setLoading] = useState(false);



  useEffect(() => {
    fetchPurchaseDashboard();
  }, []);

  const fetchPurchaseDashboard = async () => {
    try {
      setLoading(true);

      const data = await fetchAppData(
        `${APP_PROD_API.GET_DATA_FOR_SALE_DASHBOARD}?appDivisionId=${user.global_division_id}&appFinYear=${user.global_fin_year}&userId=${user.id}`
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
    title: "Total Customers",
    value: dashboardData?.totalCustomers || 0,
    icon: <Users size={28} />,
    color: "blue",
  },

  {
    title: "Active Customers",
    value: dashboardData?.activeCustomers || 0,
    icon: <UserCheck size={28} />,
    color: "green",
  },

  {
    title: "Inactive Customers",
    value: dashboardData?.inactiveCustomers || 0,
    icon: <UserX size={28} />,
    color: "red",
  },

  // {
  //   title: "Pending Members",
  //   value: dashboardData?.pendingMembers || 0,
  //   icon: <UserPlus size={28} />,
  //   color: "orange",
  // },


  // {
  //   title: "Total Dealers",
  //   value: dashboardData?.totalDealers || 0,
  //   icon: <Building2 size={28} />,
  //   color: "purple",
  // },

  // {
  //   title: "Active Dealers",
  //   value: dashboardData?.activeDealers || 0,
  //   icon: <Building2 size={28} />,
  //   color: "green",
  // },

  // {
  //   title: "Inactive Dealers",
  //   value: dashboardData?.inactiveDealers || 0,
  //   icon: <Building2 size={28} />,
  //   color: "red",
  // },

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

{/* chart div */}

<div className="row mt-4">

    <div className="col-6">

       <SaleChart
            total={dashboardData?.totalCustomers || 0}
            active={dashboardData?.activeCustomers || 0}
            inactive={dashboardData?.inactiveCustomers || 0}
        />


    </div>

      <div className="col-lg-6 mt-3">
        {/* <PurchaseGateEntryAndNRGPChart
            data={dashboardData?.monthlyChart  || []}
        /> */}
    </div>

</div>

    </div>
  );
};

export default SalesDashboard
