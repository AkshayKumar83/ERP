import {
  ShoppingCart,
  ClipboardCheck,
  Truck,
  FileCheck,
  FileText,
  PackageCheck,
  FolderOpen,
  CheckCircle2,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

// import StatCard from "../ModuleDashboardComponents/StatCard";
import { APP_PROD_API } from "../../../utils/api";
import { fetchAppData } from "../../../utils/fetchUtils";
import PurchaseMonthlyChart from "../ModuleDashboardComponents/PurchaseMonthlyChart";
// import PurchaseGateEntryAndNRGPChart from "../ModuleDashboardComponents/PurchaseGateEntryAndNRGPChart";
import PurchaseVendorList from "../ModuleDashboardComponents/PurchaseVendorList";
import PurchaseVendorSummary from "../ModuleDashboardComponents/PurchaseVendorSummary";
import DashboardCards from "../ModuleDashboardComponents/DashboardCards";
import PurchaseBrandPieChart from "../ModuleDashboardComponents/PurchaseBrandPieChart";




const PurchaseDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  const [dashboardData, setDashboardData] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedChart, setSelectedChart] = useState("total");
  const [selectedVendor,setSelectedVendor]=useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [vendorData, setVendorData] = useState([]);
  const [vendorSummary, setVendorSummary] = useState([]);
  const [openSummary, setOpenSummary] = useState(false);

  // A = Advice , O = Order
  const [poType, setPoType] = useState("A");

  const [chartView, setChartView] = useState("monthly");   // monthly | pie

  const [brandData, setBrandData] = useState([]);

  useEffect(() => {
    fetchPurchaseDashboard();
  }, [poType]);

  const fetchPurchaseDashboard = async () => {
    try {
      setLoading(true);

      const data = await fetchAppData(
        `${APP_PROD_API.GET_DATA_FOR_PURCHASE_DASHBOARD}?appDivisionId=${user.global_division_id}&appFinYear=${user.global_fin_year}&userId=${user.id}&poType=${poType}`
      );

      if (!data) return;

      setDashboardData(data);
      // setVendorData(data.vendorChart || []);
    } catch (error) {
      toast.error(error?.message || "Error fetching dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorByMonth = async () => {

  try {

    const data = await fetchAppData(

      `${APP_PROD_API.GET_VENDOR_BY_MONTH}?appDivisionId=${user.global_division_id}&appFinYear=${user.global_fin_year}&poType=${poType}&selectedChart=${selectedChart}&month=${selectedMonth}`

    );

    if (!data) return;

    // setVendorData(data);
    setVendorData(data.vendorData || []);
    setBrandData(data.brandData || []);


 } catch (error) {
      toast.error(error?.message || "Error fetching dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorSummary = async (vendor) => {

    try{

        const data = await fetchAppData(

`${APP_PROD_API.GET_VENDOR_PO_SUMMARY}?appDivisionId=${user.global_division_id}&appFinYear=${user.global_fin_year}&poType=${poType}&selectedChart=${selectedChart}&month=${selectedMonth}&vCode=${vendor.v_code}`

        );

        setVendorSummary(data);
       setOpenSummary(true); 

    }catch(error){

        toast.error(error.message);

    }

}

// useEffect(() => {

//   if (poType === "O") {

//     setSelectedChart("total");
//     setSelectedMonth(null);
//     setSelectedVendor(null);
//     setVendorData([]);
//     setBrandData([])
//   }

// }, [poType]);

const resetDashboardState = () => {
  setChartView("monthly");
  setSelectedChart("total");
  setSelectedMonth(null);
  setSelectedVendor(null);
  setVendorData([]);
  setBrandData([]);
  setVendorSummary([]);
  setOpenSummary(false);
};

useEffect(() => {

  if (!selectedMonth) return;

  fetchVendorByMonth();

}, [selectedMonth, selectedChart, poType]);

const creatorColors = [
  "green",
  "purple",
  "orange",
  "cyan",
  "lime",
  "red",
  "yellow",
  "violet",
  "teal",
];

const getCreatorColor = (userId) => {
  const index = dashboardData?.creatorSummary?.findIndex(
    (creator) =>
      Number(creator.userId) === Number(userId)
  );

  if (index === -1 || index === undefined) {
    return "blue";
  }

  return creatorColors[
    index % creatorColors.length
  ];
};

const dashboardCards = [
  {
    title:
      poType === "A"
        ? "Total Purchase Advice"
        : "Total Purchase Orders",

    value:
      poType === "A"
        ? dashboardData?.purchaseAdvice || 0
        : dashboardData?.purchaseOrders || 0,

    icon:
      poType === "A" ? (
        <FileText size={28} />
      ) : (
        <ShoppingCart size={28} />
      ),

    color: "blue",

    onClick: () => {
      resetDashboardState();
      setSelectedChart("total");
    },
  },

  // ================= DYNAMIC CREATOR CARDS =================

    ...(dashboardData?.creatorSummary || []).map((creator, index) => ({
      title: `Created By ${creator.userName}`,
      value: creator.count || 0,
      icon: <CheckCircle2 size={28} />,
      color: getCreatorColor(creator.userId, index),

      onClick: () => {
        resetDashboardState();
        setSelectedChart(String(creator.userId));
      },
    })),

  // ================= PENDING AUTHORIZATION =================

  {
    title: "Pending Authorization",

    value: dashboardData?.pendingAuthorization || 0,

    icon: <ClipboardCheck size={28} />,

    color: "red",
  },

  // ================= AUTHORIZED =================

  {
    title: "Authorized",

    value: dashboardData?.authorized || 0,

    icon: <CheckCircle2 size={28} />,

    color: "yellow",
  },
];


  return (
    <div className="container-fluid py-1">

      {/* Advice / Order Toggle */}

    <div className="d-flex justify-content-end align-items-center mb-2">

    {/* <h5 className="mb-0 fw-bold">
        Purchase Dashboard
    </h5> */}

    <div style={{ width: "170px" }}>

        <select
            className="form-select shadow-sm"
            value={poType}
            // onChange={(e) => setPoType(e.target.value)}
             onChange={(e) => {
              resetDashboardState();
              setPoType(e.target.value);
            }}
        >
            <option value="A">Purchase Advice</option>
            <option value="O">Purchase Order</option>
        </select>

    </div>

</div>

{/*  card div */}
      {/* <div className="row g-4">

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
    cardsPerRow={5}
/>


{/* chart div */}

<div className="row mt-4">

    <div className="col-lg-6">

      {/* <PurchaseMonthlyChart
        data={dashboardData?.monthlyChart || []}
        poType={poType}
        selectedChart={selectedChart}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
    /> */}
    {
  chartView === "monthly" ? (
      <PurchaseMonthlyChart
        data={dashboardData?.monthlyChart || []}
        poType={poType}
        selectedChart={selectedChart}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        setChartView={setChartView}
        creatorSummary={dashboardData?.creatorSummary || []}
      />
  ) : (
   <PurchaseBrandPieChart
  data={brandData}
  poType={poType}
  selectedMonth={selectedMonth}
  selectedChart={selectedChart}
  creatorSummary={dashboardData?.creatorSummary || []}
  onBack={() => setChartView("monthly")}
/>
  )
}

    </div>

    {selectedMonth && (

    <div className="col-lg-6">

        {/* <PurchaseVendorList
            data={vendorData}
            poType={poType}
            selectedChart={selectedChart}
            selectedMonth={selectedMonth}
            setSelectedVendor={setSelectedVendor}
            fetchVendorSummary={fetchVendorSummary}
        /> */}

      <PurchaseVendorList
        data={vendorData}
        poType={poType}
        selectedChart={selectedChart}
        selectedMonth={selectedMonth}
        creatorSummary={dashboardData?.creatorSummary || []}
        setSelectedVendor={setSelectedVendor}
        fetchVendorSummary={fetchVendorSummary}
        setOpenSummary={setOpenSummary}
      />

    </div>

)}

{/* {selectedVendor && (

<div className="row mt-3">

    <div className="col-12">

        <PurchaseVendorSummary
            vendor={selectedVendor}
            data={vendorSummary}
        />

    </div>

</div>

)} */}

<PurchaseVendorSummary
    open={openSummary}
    onClose={() => setOpenSummary(false)}
    vendor={selectedVendor}
    data={vendorSummary}
     poType={poType}
/>

</div>

    </div>
  );
};

export default PurchaseDashboard;