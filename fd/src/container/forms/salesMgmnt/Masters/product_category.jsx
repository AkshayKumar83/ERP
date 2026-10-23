import React from 'react'
import { Form, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState, useEffect } from "react";
import ProductCategoryDetails from './product_category_dtl';
import { formInitData, formDetailInitData } from './product_category_helper';
import { APP_PROD_API } from '../../../../utils/api';
import toast from 'react-hot-toast';


const ProductCategory = () => {
    const [activeTab, setActiveTab] = useState(1);
    const [currentRecordNo, setCurrentRecordNo] = useState(0);
    const [totalRecordCount, setTotalRecordCount] = useState(0);
    const { formStatus, setFormStatus, handleOperation, releaseFormStatus } = useFormStatus();

    const [formData, setFormData] = useState([{ ...formInitData }]);
    const [formDetailData, setFormDetailData] = useState([{ ...formDetailInitData }])

    const [deletedFormdata, setDeletedFormdata] = useState([])
    const [deletedFormDtldata, setDeletedFormDtldata] = useState([])

    const [focusedRowIndex, setFocusedRowIndex] = useState(0);
    const [focusedRowIndex1, setFocusedRowIndex1] = useState(0);

    const [activeFormDetailData, setActiveFormDetailData] = useState([{ ...formDetailInitData }]);

    const [childDataMap, setChildDataMap] = useState({});

    useEffect(() => {
        const initialMap = {};
        formDetailData.forEach((child) => {
            const key = child.main_cat_id;
            if (!initialMap[key]) initialMap[key] = [];
            initialMap[key].push(child);
        });
        setChildDataMap(initialMap);
    }, [formDetailData]);


    const tabs = ["Product Category"];

    const updateActiveTab = useCallback((tab) => {
        setActiveTab(tab);
    }, []);

    const validateFlag = (formData) => {
        const count = formData.filter((item) => item.flag_accessories === "Y").length
        if (count > 1) {
            console.log("Accessories Flag already marked")
            toast.error("Accessories Flag already marked")
            return false
        }
        return true

    }

    const validateSeq = (formData) => {
        const seqCount = {};

        for (const record of formData) {
            const seq = record.main_cat_seq;
            if (seq) {
                seqCount[seq] = (seqCount[seq] || 0) + 1;
            }
        }

        for (const seq in seqCount) {
            if (seqCount[seq] > 1) {
                console.log(`Sequence of Main Category No ${seq} is duplicate`);
                toast.error(`Sequence of Main Category No ${seq} is duplicate`);
                return false;
            }
        }

        return true;
    };

    // You can then directly access:
    const mainCatId = formData[focusedRowIndex]?.main_cat_id;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {

            // Form validation for product category form
            const productMainForm = document.getElementById(
                "product-mainCat-form"
            );
            if (!productMainForm.checkValidity()) {
                productMainForm.reportValidity();
                return;
            }

            const productSubForm = document.getElementById(
                "product-subCat-form"
            );
            if (!productSubForm.checkValidity()) {
                productSubForm.reportValidity();
                return;
            }

            if (!validateFlag(formData)) {
                return;
            }

            if (!validateSeq(formData)) {
                return;
            }

            const modifiedOrNew = Object.values(childDataMap)
                .flat()
                .filter((item) => item.isNew || item.isModified);

            let body = {
                formData: formData,
                formDetailData: modifiedOrNew,
            };

            // Modify the body for "Update" status
            if (formStatus === "Update") {

                body = {
                    ...body,
                    deletedFormDetailData: deletedFormDtldata,
                    deletedFormData: deletedFormdata,
                    //mainCatId: formData?.[focusedRowIndex]?.main_cat_id || null
                }
            }
            console.log("Final body to send:", body);
            const response = await fetch(
                `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_PRODUCT_CATEGORY_DATA}?form_status=${formStatus}`,
                {
                    method: "POST",
                    body: JSON.stringify(body),
                    headers: { "Content-Type": "application/json" },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Something went wrong");
            }

            toast.success(`Data ${formStatus === 'Insert' ? "saved" : "updated"} successfully!`);
            handleCancel();
        } catch (error) {
            toast.error(
                error.message ||
                "Please check all the form fields or contact administrator"
            );
        }
    };

    function handleOffset(data) {
        setCurrentRecordNo(data)
    }

    const handleCancel = useCallback(() => {
        // Implement cancel logic here
        releaseFormStatus()
        setFormData({});
        setFormData([formInitData]);
        setFormDetailData([formDetailInitData]);
        setActiveFormDetailData([formDetailInitData])
        setFocusedRowIndex(0)
    }, []);

    // const handleChange = (type, name, value, rowIndex = null) => { 
    //    if (!["Insert", "Update", "Search"].includes(formStatus)) return;

    //     const upperCasedValue = typeof value === "string" ? value.toUpperCase() : value; 

    //     switch (type) {
    //         case "formData":
    //             setFormData(prev => {
    //                 if (rowIndex !== null && rowIndex >= 0) {
    //                     const newData = [...prev];
    //                     newData[rowIndex] = {
    //                         ...newData[rowIndex],
    //                         [name]: upperCasedValue
    //                     };
    //                     return newData;
    //                 } else {
    //                     return prev.map(row => ({
    //                         ...row,
    //                         [name]: upperCasedValue
    //                     }));
    //                 }
    //             });
    //             break;

    //         case "formDetailData": {
    //             // setActiveFormDetailData(prev => {
    //             //     if (rowIndex !== null && rowIndex >= 0) {
    //             //         const newData = [...prev];
    //             //         newData[rowIndex] = {
    //             //             ...newData[rowIndex],
    //             //             [name]: upperCasedValue
    //             //         };
    //             //         return newData;
    //             //     } else {
    //             //         return prev.map(row => ({
    //             //             ...row,
    //             //             [name]: upperCasedValue
    //             //         }));
    //             //     }
    //             // });
    //             // break;  

    //             if (
    //                 rowIndex === null ||
    //                 rowIndex < 0 ||
    //                 rowIndex >= activeFormDetailData.length ||
    //                 !mainCatId
    //             ) {
    //                 console.warn("Invalid rowIndex or mainCatId");
    //                 return;
    //             }


    //             // Clone the array so we don't mutate state directly
    //             const updatedData = [...activeFormDetailData];

    //             // Clone the record at the given index and update the property
    //             const targetRecord = { ...updatedData[rowIndex], [name]: upperCasedValue };

    //             // Mark as modified if not new
    //             if (!targetRecord.isNew) {
    //                 targetRecord.isModified = true;
    //             }

    //             // Replace the record in the array
    //             updatedData[rowIndex] = targetRecord;

    //             // Update state
    //             setActiveFormDetailData(updatedData);

    //             // Update child map explicitly with vCode key
    //             setChildDataMap((prevMap) => ({
    //                 ...prevMap,
    //                 [mainCatId]: updatedData,
    //             }));

    //             break;
    //         }

    //         default:
    //             console.warn("Invalid type provided to handleChange");
    //     }
    // };  
  
const handleChange = (type, name, value, rowIndex = null, e = null) => {
  if (!["Insert", "Update", "Search"].includes(formStatus)) return;

  const isNumberField = e?.target?.type === "number";
  const isStringField = typeof value === "string";
  const processedValue = isStringField ? value.toUpperCase() : value;

  const getUpdatedValue = () => {
    if (!isNumberField && e?.target) {
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
      setFormData((prev) => {
        if (Array.isArray(prev)) {
          if (rowIndex !== null && rowIndex >= 0) {
            const newData = [...prev];
            newData[rowIndex] = {
              ...newData[rowIndex],
              [name]: getUpdatedValue(),
            };
            return newData;
          } else {
            return prev.map((row) => ({
              ...row,
              [name]: getUpdatedValue(),
            }));
          }
        } else {
          return {
            ...prev,
            [name]: getUpdatedValue(),
          };
        }
      });
      break;

    case "formDetailData":
    case "activeDiscData": {
      const activeData = type === "formDetailData" ? activeFormDetailData : activeDiscData;

      // Combined rowIndex and mainCatId validation
      if (
        !Array.isArray(activeData) ||
        rowIndex === null ||
        rowIndex < 0 ||
        rowIndex >= activeData.length ||
        (type === "formDetailData" && !mainCatId)
      ) {
        console.warn(`Invalid rowIndex or mainCatId for ${type}`);
        return;
      }

      const updatedData = [...activeData];
      const targetRecord = {
        ...updatedData[rowIndex],
        [name]: getUpdatedValue(),
      };

      if (!targetRecord.isNew) targetRecord.isModified = true;
      updatedData[rowIndex] = targetRecord;

      if (type === "formDetailData") setActiveFormDetailData(updatedData);
      if (type === "activeDiscData") setActiveDiscData(updatedData);

      if (mainCatId) {
        setChildDataMap((prev) => ({
          ...prev,
          [mainCatId]: updatedData,
        }));
      }
      break;
    }

    default:
      console.warn("Invalid type provided to handleChange");
  }
};






    // ADD NEW ROW
    const handleAddRow = (tableType) => {


        // Form validation for product category form
        const productMainForm = document.getElementById(
            "product-mainCat-form"
        );
        if (!productMainForm.checkValidity()) {
            productMainForm.reportValidity();
            return;
        }

        const productSubForm = document.getElementById(
            "product-subCat-form"
        );
        if (!productSubForm.checkValidity()) {
            productSubForm.reportValidity();
            return;
        }


        switch (tableType) {
            case "formDataTable":
                setFormData((prevData) => [
                    ...prevData,
                    {
                        ...formInitData,
                        id: prevData.length + 1,
                    }
                ]);
                break;
            case "formDetailData":
                // setActiveFormDetailData((prevData) => [
                //     ...prevData,
                //     {
                //         ...formDetailInitData,
                //         id: prevData.length + 1,
                //         main_cat_id: formData[focusedRowIndex]?.main_cat_id
                //     }
                // ])
                // break; 

                const newRow = {
                    ...formDetailInitData,
                    main_cat_id: mainCatId,
                    id: (childDataMap[mainCatId]?.length || 0) + 1,
                    isNew: true,  // Mark as new
                };

                setActiveFormDetailData((prev) => {
                    const updated = [...prev, newRow];

                    setChildDataMap((prevMap) => ({
                        ...prevMap,
                        [mainCatId]: updated,
                    }));

                    return updated;
                });
                break;

            default:
                console.log("something went wrong")
        }

    };

    // Delete Row 
    const handleDeleteRow = useCallback((type, data, index) => {
        if (type === "formData") {
            let newDeleteData = [...deletedFormdata]

            newDeleteData.push(data)
            setDeletedFormdata(newDeleteData)

            setFormData((prev) => {
                if (prev.length === 0) return prev;
                return prev.filter((_, i) => i !== index);
            });
        }

        if (type === "formDetailData") {

            let newDeleteData = [...deletedFormDtldata]
            newDeleteData.push(data)
            setDeletedFormDtldata(newDeleteData)

            setActiveFormDetailData((prev) => {
                if (prev.length === 0) return prev;
                return prev.filter((_, i) => i !== index);
            });
        }

    }, [deletedFormdata]);


    const setupQueryData = useCallback(
        (queryData, btnClicked) => {

            if (btnClicked === "Query") {
                setTotalRecordCount(queryData.count || totalRecordCount);
            }

            setFormData(queryData.mainCatData);
            setFormDetailData(queryData.subCatData);

        },
        [formStatus, currentRecordNo]
    );

    console.log('formStatus from memberform', formStatus)
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
                QUERY_API={APP_PROD_API.GET_PRODUCT_CATEGORY_DATA}
                formName={"Product Category"}
                isQueryReqOnInsertBtn={true}
            >
                <TabContent activeTab={activeTab}>
                    <TabPane tabId={1}>
                        <Form>
                            <ProductCategoryDetails
                                formStatus={formStatus}
                                formData={formData}
                                formDetailData={formDetailData}
                                handleChange={handleChange}
                                triggerAddRow={handleAddRow}
                                handleDelete={handleDeleteRow}
                                focusedRowIndex={focusedRowIndex}
                                setFocusedRowIndex={setFocusedRowIndex}
                                activeFormDetailData={activeFormDetailData}
                                focusedRowIndex1={focusedRowIndex1}
                                setFocusedRowIndex1={setFocusedRowIndex1}
                                setActiveFormDetailData={setActiveFormDetailData}
                                childDataMap={childDataMap}
                                mainCatId={mainCatId}

                            />
                        </Form>
                    </TabPane>
                </TabContent>
            </FormSetup>
        </React.Fragment>
    );
};

export default ProductCategory;

