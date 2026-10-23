import React from "react";
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { APP_PROD_API } from "../../../../utils/api";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState, useEffect } from "react";
import ProductMasterDtl from "./product_masterDtl";
import { formatOptions } from "../../../../lib";
import toast from "react-hot-toast";

const ProductMaster = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({ active: "1", rep_prod: 'N', apply_tax_paid_price: 'N'});
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus } =
    useFormStatus();

  const [selectedCategory, setSelectedCategory] = useState("");

  const [filteredSubCat, setFilteredSubCat] = useState([]);
  const [rawSubCatData, setRawSubCatData] = useState([]);

  // for dropdownData

  const [product, setProduct] = useState([]);
  const [mainCat, setMainCat] = useState([]);
  const [subCat, setSubCat] = useState([]);
  const [commodity, setCommodity] = useState([]);

  // fetch drop down data
  useEffect(() => {
    const fetchConstantList = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.GET_PRODUCT_MSTR_DROPDOWNDATA
          }`
        );
        if (response.status === 200) {
          const data = await response.json();
          setProduct([
            { value: "", label: "" },
            ...formatOptions(data.product || [], "it_group", "it_grp_desc"),
          ]);
          setMainCat([
            { value: "", label: "" },
            ...formatOptions(
              data.mainCat || [],
              "main_cat_id",
              "main_cat_desc"
            ),
          ]);
          setSubCat([
            { value: "", label: "" },
            ...formatOptions(data.subCat || [], "sub_cat_id", "sub_cat_desc"),
          ]);
          setCommodity([
            { value: "", label: "" },
            ...formatOptions(
              data.commodity || [],
              "commodity_code",
              "commodity_desc"
            ),
          ]);
          setRawSubCatData(data.subCat || []);

          // setSelectedCategory(data.mainCat[0]?.value)
          setSelectedCategory(data.mainCat[0]?.main_cat_id || "");

          console.log("mainCat raw from API:", data.mainCat);
        }
      } catch (err) {
        console.error("Error fetching constants:", err);
      }
    };
    fetchConstantList();
  }, [formStatus]);

  useEffect(() => {
    if (selectedCategory && rawSubCatData.length > 0) {
      console.log("Selected Category:", selectedCategory);

      const filteredRawSubCat = rawSubCatData.filter(
        (item) => item.sub_cat_id === selectedCategory
      );

      console.log("Filtered Raw Sub Cat:", filteredRawSubCat);

      const formatted = formatOptions(
        filteredRawSubCat,
        "sub_cat_id",
        "sub_cat_desc"
      );
      setFilteredSubCat([{ value: "", label: "" }, ...formatted]);
    } else {
      setFilteredSubCat([]);
    }
  }, [selectedCategory, rawSubCatData]);

  const tabs = ["Product Master"];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate form
      const productMasterForm = document.getElementById("product-master-form");
      const productFormValidity = productMasterForm.checkValidity();
      if (!productFormValidity) {
        if (productMasterForm.reportValidity) {
          productMasterForm.reportValidity();
        } else {
          throw new Error(
            "Please fill all the required fields in product master"
          );
        }
        return;
      }

      // Fields to check for negative values
      const negativeFields = [
        { key: "net_wt", label: "Net Weight" },
        { key: "gross_wt", label: "Gross Weight" },
        { key: "it_rate", label: "Item Rate" },
        { key: "selling_price", label: "Selling Price" },
        { key: "price_accessories", label: "Price Accessories" },
        { key: "tax_paid_price", label: "Tax Paid Price" },
      ];

      // Check for negative values
      for (let { key, label } of negativeFields) {
        if (formData[key] < 0) {
          toast.error(`${label} cannot be negative`);
          return;
        }
      }

      // Prepare body
      let body =
        formStatus === "Update" ? formData : { formData: { ...formData } };

      console.log("Final body to send:", body);

      // Send the API request
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.POST_PRODUCT_MASTER_DATA
        }?form_status=${formStatus}`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Something went wrong");
      }

      toast.success("Data saved successfully!");
      formCleanup();
    } catch (error) {
      toast.error(
        error.error ||
          "Please check all the form fields or contact administrator"
      );
    }

    console.log("Form submitted", formData);
  };

  function handleOffset(data) {
    setCurrentRecordNo(data);
  }

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    releaseFormStatus();
    setFormData({});
  }, []);

  // form cleanup on cance and on submit
  const formCleanup = async () => {
    handleCancel();
  };

  // const handleChange = useCallback(
  //   (name, value) => {

  //     const upper = value.toUpperCase();

  //     if (!["Insert", "Update", "Search"].includes(formStatus)) {
  //       return;
  //     }
  //     setFormData((prev) => ({ ...prev, [name]: upper }));

  //   },
  //   [formStatus]
  // );

  const handleChange = useCallback(
    (name, value, e = null) => {
      if (!["Insert", "Update", "Search"].includes(formStatus)) return;

      if (e && e.target.type !== "number") {
        const { selectionStart, selectionEnd } = e.target;
        const upper = value.toUpperCase();

        setFormData((prev) => ({ ...prev, [name]: upper }));

        requestAnimationFrame(() => {
          e.target.setSelectionRange(selectionStart, selectionEnd);
        });
      } else {
        setFormData((prev) => ({ ...prev, [name]: value.toUpperCase() }));
      }
    },
    [formStatus]
  );

  const setupQueryData = useCallback(
    (queryData, btnClicked) => {
      if (btnClicked === "Query") {
        setTotalRecordCount(queryData.count || totalRecordCount);
      }

      setFormData(queryData);
    },
    [formStatus, currentRecordNo]
  );

  console.log("formStatus from memberform", formStatus);
  return (
    <React.Fragment>
      <FormSetup
        navType="tabs"
        activeTab={activeTab}
        tabs={tabs}
        updateActiveTab={updateActiveTab}
        formStatus={formStatus}
        currentRecordNo={currentRecordNo}
        totalRecordCount={totalRecordCount}
        pageCount={1}
        totalPageCount={1}
        isSingleQuery={true}
        setupQueryData={setupQueryData}
        handleSubmit={handleSubmit}
        handleCancel={handleCancel}
        handleOperation={handleOperation}
        formData
        handleOffset={handleOffset}
        QUERY_API={APP_PROD_API.GET_PRODUCT_MASTER_DATA}
        formName={""}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <ProductMasterDtl
              formData={formData}
              formStatus={formStatus}
              handleChange={handleChange}
              commodity={commodity}
              mainCat={mainCat}
              subCat={subCat}
              product={product}
              filteredSubCat={filteredSubCat}
              setSelectedCategory={setSelectedCategory}
            />
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default ProductMaster;
