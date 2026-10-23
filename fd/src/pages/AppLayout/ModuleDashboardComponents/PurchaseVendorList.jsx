

import { useState } from "react";

const PurchaseVendorList = ({
  data = [],
  poType = "A",
  selectedChart = "total",
  selectedMonth,
  creatorSummary = [],
  setSelectedVendor,
  fetchVendorSummary,
  setOpenSummary,
}) => {

  const [showAll, setShowAll] =
    useState(false);


  const vendors = showAll
    ? data
    : data.slice(0, 9);





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
];;


  // =====================================================
  // SELECTED CREATOR
  // =====================================================

  const selectedCreator =
    selectedChart !== "total"
      ? creatorSummary.find(
          (creator) =>
            Number(creator.userId) ===
            Number(selectedChart)
        )
      : null;


  const creatorName =
    selectedCreator?.userName || "";


  // =====================================================
  // DYNAMIC COLOR
  // =====================================================

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


  // =====================================================
  // BADGE COLOR
  // =====================================================

const badgeColor =
  selectedChart === "total"
    ? "#2563eb"
    : getCreatorColor(selectedChart);


  // =====================================================
  // DOCUMENT NAME
  // =====================================================

  const documentName =
    poType === "A"
      ? "Purchase Advice"
      : "Purchase Orders";


  return (

    <div
      className="card mt-3 shadow-sm"
      style={{
        height: "330px",
      }}
    >

      {/* ================= HEADER ================= */}

      <div className="card-header d-flex justify-content-between align-items-center">

        <h5 className="mb-0 fw-semibold">

          Vendor Wise {documentName}

          {selectedChart !== "total" &&
            creatorName && (
              <>

                {" - "}

                <span
                  style={{
                    color: badgeColor,
                    fontWeight: 700,
                  }}
                >
                  {creatorName}
                </span>

              </>
            )}

          {" "}

          (
          {selectedMonth
            ? `${selectedMonth}-${data.length}`
            : data.length}
          )

        </h5>


        {/* ================= VIEW ALL ================= */}

        {data.length > 9 && (

          <button
            className="btn btn-sm btn-outline-primary"
            type="button"
            onClick={() =>
              setShowAll(!showAll)
            }
            style={{
              padding: "2px 7px",
              fontSize: "11px",
              lineHeight: "1.2",
              height: "24px",
              whiteSpace: "nowrap",
            }}
          >

            {showAll
              ? "Show Less"
              : "View All"}

          </button>

        )}

      </div>


      {/* ================= VENDOR LIST ================= */}

      <div
        className="list-group list-group-flush"
        style={{
          height: "279px",

          overflowY:
            showAll &&
            data.length > 9
              ? "auto"
              : "hidden",
        }}
      >

        {vendors.map(
          (vendor, index) => (

            <button
              key={vendor.v_code}
              className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"

              style={{
                paddingTop: "4px",
                paddingBottom: "4px",
                minHeight: "31px",
              }}

              onClick={() => {

                setSelectedVendor(vendor);

                fetchVendorSummary(vendor);

              }}
            >

              {/* ================= VENDOR NAME ================= */}

              <div
                style={{
                  fontSize: "14px",
                  lineHeight: "20px",
                }}
              >

                <strong>
                  {index + 1}.
                </strong>

                {" "}

                {vendor.v_name}

              </div>


              {/* ================= COUNT ================= */}

              <span
                className="badge rounded-pill"

                style={{
                  backgroundColor:
                    badgeColor,

                  fontSize: "10px",
                  padding: "4px 8px",
                }}
              >

                {vendor.total}

              </span>

            </button>

          )
        )}

      </div>

    </div>
  );
};

export default PurchaseVendorList;