
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
import FinancePieChart from "../ModuleDashboardComponents/FinancePieChart";
import FinanceStackedBar from "../ModuleDashboardComponents/FinanceStackedBar";

const FinanceDashboard = () => {
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
        `${APP_PROD_API.GET_DATA_FOR_FINANCE_DASHBOARD}?appDivisionId=${user.global_division_id}&appFinYear=${user.global_fin_year}&userId=${user.id}`
      );

      if (!data) return;

      setDashboardData(data);
    } catch (error) {
      toast.error(error?.message || "Error fetching dashboard");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="container-fluid py-1">


<div className="row mt-2">

    {/* <div className="col-6">

      <FinancePieChart
        financeAccounts={dashboardData?.financeAccounts || []}
    />


    </div> */}
    <div className="col-12">

      <FinanceStackedBar
        stackedBar={dashboardData?.stackedBar || []}
    />


    </div>


</div>

    </div>
  );
};

export default FinanceDashboard

