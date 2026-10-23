import React, { useCallback, useState } from "react";
import { TabContent, TabPane, Row, Col, Form } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import TextField from "../../../../components/basic/textField";
import RadioGroup from "../../../../components/basic/radioGroup";
import ItemLocationMasterDtl from "./item_location_masterDtl";
import {
  formDetailInitData,
  formDataInitData,
  itemHelpListHeader,
  binHelpListHeader,
  rackHelpListHeader,
  physicalListHeader, 
  createSearchPayloadForBVSpecificSearch
} from "./item_location_master_helper";
import HelpList from "../../../../components/HelpList";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { APP_PROD_API } from "../../../../utils/api";
import { useSelector } from "react-redux";
import { validateForm } from "../../../../utils/fn";
//import { APP_PROD_API } from '../../../../utils/api'; 
import { fetchAppData } from "../../../../utils/fetchUtils";


const ItemLocationMaster = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState(formDataInitData);
  const [formDetailData, setFormDetailData] = useState([formDetailInitData]);
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus,  searchQuery,
    setSearchQuery, } =
    useFormStatus();

  const [activeRowIndex, setActiveRowIndex] = useState(null);
  const [focusedRowIndex, setFocusedRowIndex] = useState(0); 

   const [deletedRecord, setDeletedRecord] = useState([])
  

  // GLOBAL USERDATA
  const { user } = useSelector((state) => state.auth);

  const tabs = ["Item Location Master"];

  // for help list

  const [helpList, setHelpList] = useState(false);
  const [helpFor, setHelpFor] = useState("");
  const [helpListHeader, setHelpListHeader] = useState([]);

  const [isHelpModelOpen, setIsHelpModelOpen] = useState();
  const toggleHelpModal = () => setHelpList(!helpList);

  const handleHelpList = (data) => {
    setHelpList(data);
  };

  const onSelectHelpItem = (data) => {
    console.log("Selected Data:", data);

    // Update detail data (table rows)
    if (
      ["item", "rack", "physical", "bin"].includes(helpFor) &&
      activeRowIndex !== null
    ) {
      setFormDetailData((prev) => {
        const updated = [...prev];
        const currentRow = { ...updated[activeRowIndex] };

        switch (helpFor) {
          case "item":
            currentRow.it_code = data.it_code;
            currentRow.description = data.it_name;

            break;

          case "physical":
            currentRow.physical_loca = data.physical_loca;

            break;

          case "bin":
            currentRow.bin_no = data.bin_no;

            break;

          case "rack":
            currentRow.rack_no = data.rack_no;

            break;
        }

        updated[activeRowIndex] = currentRow;
        return updated;
      });
    }
  };

  const whereClauseForHelp = (helpFor) => {
    console.log("formData data", formData);
    if (helpFor === "item") {
      return { wc_id: formData.wc_id };
    }

    if (helpFor === "rack") {
      return { physical_loca: formDetailData[focusedRowIndex].physical_loca };
    }

    if (helpFor === "bin") {
      return {
        physical_loca: formDetailData[focusedRowIndex].physical_loca,
        rack_no: formDetailData[focusedRowIndex].rack_no,
      };
    }

    return {};
  };  


  // for search record -----------------------  

  // For Search Record
    const handleSearch = async () => {
      try {
        setTotalRecordCount(0);
        setCurrentRecordNo(0);
        const searchPayload = createSearchPayloadForBVSpecificSearch(formData);
        const queryList = new URLSearchParams(searchPayload);
  
        if ([...queryList].length === 0) {
          toast.error("Please enter search criteria");
          return;
        }
  
        setSearchQuery(searchPayload);
  
        const data = await fetchAppData(
          `${APP_PROD_API.GET_DATA_FOR_ITEM_LOCATION_MASTER}?formStatus=${formStatus}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&userId=${user?.id}&${queryList}`
        );
  
        if (data?.error) {
          toast.error(data?.error);
          return;
        }
        setupQueryData(data, "Query");
        handleOperation("Query");
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(error?.message || "Some error occurred");
      }
    };

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const itemLocationForm = document.getElementById(
        "item-location-master-dtl-form"
      );
      const itemLocFormValidity = itemLocationForm.checkValidity();
      if (!itemLocFormValidity) {
        if (itemLocationForm.reportValidity) {
          itemLocationForm.reportValidity();
        } else {
          throw new Error(
            "Please fill all the required details in item location form"
          );
        }
        return;
      }

      if (formStatus === "Update") {
        // 3. Validation logic
      }

      let body = {
        formData: formData,
        formDetailData: formDetailData,
         transYear: user?.global_fin_year,
       // divisionId: user?.global_division_id,
      };

      //  Modify the body for "Update" status
      if (formStatus === "Update") {
        body = {
          ...body,
          deletedData: deletedRecord,
        };
      }

      console.log("Final body to send:", body);
      const response = await fetch(
        ` ${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_DATA_FOR_ITEM_LOCATION_MASTER
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
      handleCancel();
    } catch (error) {
      toast.error(
        error.message ||
        "Please check all the form fields or contact administrator"
      );
    }
  };

  const handleOffset = (data) => {
    setCurrentRecordNo(data);
  };

  const handleCancel = useCallback(() => {
    releaseFormStatus();
    //setFormData({});
    if (formStatus === "Insert" || formStatus === "Search") {
      setFormData({ ...formDataInitData });
    }

    setFormData({ ...formDataInitData }); 
    setFormDetailData([formDetailInitData])
  }, [releaseFormStatus]);

  const handleChange = useCallback(
    (type, name, value, rowIndex = null, e) => {
      if (!["Insert", "Update", "Search"].includes(formStatus)) {
        return;
      }  
      if (
              [
                "it_code",
                 "physical",
                 "bin_no",
                 "rack_no"

              ].includes(name)
            ) {
              toast.error("Please select from helplist");
              return;
            }  

             const isNumberField = e?.target?.type === "number";
      const isStringField = typeof value === "string";
      const processedValue = isStringField ? value.toUpperCase() : value;  

       const inputType = e?.target?.type;
      const supportsSelection =
        inputType === "text" || inputType === "search" || inputType === "textarea";

      const getUpdatedValue = () => {
        if (supportsSelection && e?.target) {
          const { selectionStart, selectionEnd } = e.target;
          const newValue = processedValue;

          requestAnimationFrame(() => {
            e.target.setSelectionRange(selectionStart, selectionEnd);
          });

          return newValue;
        }
        return processedValue;
      };
      

      switch (type) {
        case "formData":
          setFormData((prev) => ({
            ...prev,
            [name]: getUpdatedValue()
          }));
          break;

        case "formDetailData":
          setFormDetailData((prev) => {
            if (rowIndex !== null && rowIndex >= 0) {
              const newData = [...prev];
              newData[rowIndex] = {
                ...newData[rowIndex],
                [name]: getUpdatedValue()
              };
              return newData;
            } else {
              return prev.map((row) => ({
                ...row,
                [name]: getUpdatedValue()
              }));
            }
          });
          break;

        default:
          console.log("handleChange is not properly defined");
      }
    },
    [formStatus]
  );

  // ADD NEW ROW
  const handleAddRow = useCallback(async () => {
    //  Required field check
    const itemLocationForm = document.getElementById(
      "item-location-master-dtl-form"
    );
    const itemLocFormValidity = itemLocationForm.checkValidity();
    if (!itemLocFormValidity) {
      if (itemLocationForm.reportValidity) {
        itemLocationForm.reportValidity();
      } else {
        throw new Error(
          "Please fill all the required details in item location form"
        );
      }
      return;
    }   



   // Duplicate check
    if (formDetailData?.length > 1) {
      const seen = new Set();
      for (const row of formDetailData) {
        const key = `${row.it_code}| ${row.rack_no} | ${row.bin_no} | ${row.physical_loca}`;
        if (seen.has(key)) {
          toast.error("Duplicate record found with same entry");
          return;
        }
        seen.add(key);
      }
    }  

     //  If no rows yet, directly add the first row
  if (!formDetailData || formDetailData.length === 0) {
    setFormDetailData([formDetailInitData]);
    return;
  }


    // validation
    // if (formStatus === "Update" || formStatus === "Insert") {
    //   const isChecked =
    //     formDetailData[focusedRowIndex]?.init_item_code === formDetailData[focusedRowIndex]?.item_code;
    //   formDetailData[focusedRowIndex]?.init_physical_loca === formDetailData[focusedRowIndex]?.physical_loca;
    //   formDetailData[focusedRowIndex]?.init_rack_no === formDetailData[focusedRowIndex]?.rack_no;
    //   formDetailData[focusedRowIndex]?.init_bin_no === formDetailData[focusedRowIndex]?.bin_no;

    //   if (!isChecked) {
    //     //console.log('get validate called')
    //     const result = await getValidateData(
    //       "acc_no",
    //       formDetailData[focusedRowIndex]?.acc_no,
    //       otherQueryPera,
    //       focusedRowIndex
    //     );
    //     if (!result) return;
    //   }
    // }

    // 4. Add new row
    setFormDetailData((prevData) => [...prevData, formDetailInitData]);
  }, [formDetailData, formStatus]);

  // DELETE ROW
   const handleDeleteRow = useCallback((data, index) => {
     console.log("Deleting row", index, data);
 
     //  Always get the latest deletedRecord
     setDeletedRecord((prevDeleted) => [...prevDeleted, data]);
 
     setFormDetailData((prev) => {
       if (prev.length === 0) return prev;
 
       const newData = prev.filter((_, i) => i !== index);
       console.log("Row deleted:", data);
 
       setFocusedRowIndex((currentFocusIndex) => {
         if (index === currentFocusIndex) {
           return index > 0 ? index - 1 : 0;
         } else if (index < currentFocusIndex) {
           return currentFocusIndex - 1;
         } else {
           return currentFocusIndex;
         }
       });
 
       return newData;
     });
 
   }, []);
 

  const setupQueryData = useCallback(
    (queryData, btnClicked) => {
      // Handle failure case
      if (queryData.recordCount === 0) {
        toast.error(queryData.message);
        handleCancel();
        return;
      }

      if (btnClicked === "Query") {
        setTotalRecordCount(queryData.count || totalRecordCount);
      }

      setFormData(queryData.mommwcData);

      // Set ass_lib_sch_exp_flag = init_flag for every item
      const updatedMdmmstokData = queryData.mdmmStokData?.map((item) => ({
        ...item,
        init_it_code: item.it_code,
        init_physical_loca: item.physical_loca,
        init_rack_no: item.rack_no,
        init_bin_no: item.bin_no,
      }));

      setFormDetailData(updatedMdmmstokData);
    },
    [formStatus, currentRecordNo]
  );

  // const otherQueryPera = {
  //   wc_id: formData?.wc_id,
  //   physical_loca: formDetailData[focusedRowIndex]?.physical_loca,
  //   rack_no: formDetailData[focusedRowIndex]?.rack_no
  // };   


  const otherQueryPera =
  formDetailData?.length > 0 && focusedRowIndex != null
    ? {
        wc_id: formData?.wc_id,
        physical_loca: formDetailData[focusedRowIndex]?.physical_loca,
        rack_no: formDetailData[focusedRowIndex]?.rack_no,
      }
    : {
        wc_id: formData?.wc_id,
        physical_loca: null,
        rack_no: null,
      };


  const fetchValidation = async (
    param,
    fieldValue,
    otherQueryPera = {},
    rowIndex = null
  ) => {
    try {
      const queryParams = new URLSearchParams({
        param,
        [param]: fieldValue,
        ...otherQueryPera,
        appDivisionId: user?.global_division_id,
        appFinYear: user?.global_fin_year,
        appUserId: user?.id,
      });

      const API_STRING = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_ITEM_LOCATION_MASTER_FOR_VALID_DATA
        }/?${queryParams.toString()}`;

      const response = await fetch(API_STRING);
      const data = await response.json();

      return { ok: response.ok, data };
    } catch (err) {
      console.error("Error validating:", err);
      toast.error("Something went wrong while validating the data.");
      return { ok: false, data: { error: "Network error" } };
    }
  };

  const getValidateData = async (
    param,
    value,
    otherQueryPera = {},
    rowIndex = null
  ) => {
    switch (param) {
      case "it_code":
        return await getValidateItemData(value, otherQueryPera, rowIndex);

      case "physical_loc":
        return await getValidatePhysicalData(value, otherQueryPera, rowIndex);

      case "bin_no":
        return await getValidateBinData(value, otherQueryPera, rowIndex);

      case "rack_no":
        return await getValidateRackData(value, otherQueryPera, rowIndex);

      default:
        console.warn(`Validation not implemented for param: ${param}`);
        return true;
    }
  };

  // for item level
  const getValidateItemData = async (
    fieldValue,
    otherQueryPera = {},
    rowIndex = null
  ) => {
    const { ok, data } = await fetchValidation(
      "it_code",
      fieldValue,
      otherQueryPera,
      rowIndex
    );

    if (!ok || data.error) {
      toast.error(data.error || "Invalid Item");

      return false;
    }

    if (data.data && rowIndex !== null) {
      const itemData = data.data;
      setFormDetailData((prev) => {
        const updated = [...prev];
        if (updated[rowIndex]) {
          updated[rowIndex] = {
            ...updated[rowIndex],
            description: itemData.it_name,
            it_code: fieldValue,
          };
        }
        return updated;
      });
    }

    return true;
  };

  // physical loc

  const getValidatePhysicalData = async (
    fieldValue,
    otherQueryPera = {},
    rowIndex = null
  ) => {
    const { ok, data } = await fetchValidation(
      "physical_loca",
      fieldValue,
      otherQueryPera
    );

    if (!ok || data.error) {
      toast.error(data.error || "Invalid Physical Location");
      if (rowIndex !== null) {
      }
      return false;
    }

    return true;
  };

  // qty

  const getValidateRackData = async (
    fieldValue,
    otherQueryPera = {},
    rowIndex = null
  ) => {
    const { ok, data } = await fetchValidation(
      "rack_no",
      fieldValue,
      otherQueryPera
    );

    if (!ok || data.error) {
      toast.error(data.error || "Invalid Quantity");

      return false;
    }

    return true;
  };

  const getValidateBinData = async (
    fieldValue,
    otherQueryPera = {},
    rowIndex = null
  ) => {
    const { ok, data } = await fetchValidation(
      "bin_no",
      fieldValue,
      otherQueryPera
    );

    if (!ok || data.error) {
      toast.error(data.error || "Invalid Quantity");

      return false;
    }

    return true;
  };

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
        formData={formData}
        handleOffset={handleOffset}
        QUERY_API={APP_PROD_API.GET_DATA_FOR_ITEM_LOCATION_MASTER}
        formName={""}
        // opterationBtn={[
        //   {
        //     name:
        //       formData.cancel === "Y" ? "Revert Cancellation" : "Cancel WOR",
        //   },
        // ]} 
         searchQueryPayload={formData}
        handleSearch={handleSearch}
        formPayload={{ searchQuery }}
        setSearchQuery={setSearchQuery}
        isQueryReqOnInsertBtn={true}
        isQueryReqOnNextPreBtn={true}
        reqCurrentQueryRecOnInsert={true}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <Row>
              <Col xl={2}>
                <TextField
                  label="Work Center ID"
                  required
                  type="text"
                  name="wc_id"
                  value={formData.wc_id || ""}
                  disabled = {formStatus === 'Query' || formStatus === 'Insert' || formStatus === 'Update'}
                  maxLength={15}
                  onChange={(e) =>
                    handleChange("formData", "wc_id", e.target.value, null, e)
                  }
                />
              </Col>

              <Col xl={4}>
                <TextField
                  label="Work Center No"
                  type="text"
                  name="wc_no"
                  disabled
                  value={formData.wc_no || ""}
                  onChange={(e) =>
                    handleChange("formData", "wc_no", e.target.value, null, e)
                  }
                />
              </Col>

              <Col xl={4} className="">
                <TextField
                  label="Description"
                  type="text"
                  name="description"
                  disabled
                  value={formData.description || ""}
                  onChange={(e) =>
                    handleChange("formData", "description", e.target.value, null, e)
                  }
                />
              </Col>
            </Row>

            <ItemLocationMasterDtl
              formDetailData={formDetailData}
              handleChange={handleChange}
              formStatus={formStatus}
              handleAddRow={handleAddRow}
              handleDelete={handleDeleteRow}
              setActiveRowIndex={setActiveRowIndex}
              focusedRowIndex={focusedRowIndex}
              setFocusedRowIndex={setFocusedRowIndex}
              handleHelpList={handleHelpList}
              setHelpFor={setHelpFor}
              setHelpListHeader={setHelpListHeader}
              getValidateData={getValidateData}
              otherQueryPera={otherQueryPera}
            />
          </TabPane>
          {helpList && (
            <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
              <ModalHeader toggle={toggleHelpModal}></ModalHeader>
              <ModalBody>
                <HelpList
                  // formStatus={formStatus='Insert'}
                  formStatus={"Insert"}
                  helpFor={helpFor}
                  apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_DATA_FOR_ITEM_LOCATION_MASTER
                    }`}
                  helpListHeader={helpListHeader}
                  handleHelpList={handleHelpList}
                  onSelectHelpItem={onSelectHelpItem}
                  queryPera={{ needAppGlobalData: "Y" }}
                  whereClause={whereClauseForHelp(helpFor)}
                />
              </ModalBody>
            </Modal>
          )}
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default ItemLocationMaster;
