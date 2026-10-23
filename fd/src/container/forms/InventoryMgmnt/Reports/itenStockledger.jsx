import React, { useEffect, useState } from "react";
import { Card, Col, Container, Form, Modal, ModalBody, ModalHeader, Row } from "reactstrap";
import ButtonUi from "../../../../components/basic/button";
import HelpList from "../../../../components/HelpList";
import GenericReportPage from "../../../../components/common/GenericReportPage";
import { APP_PROD_API } from "../../../../utils/api";
import { useSelector } from "react-redux";
import { validateForm } from "../../../../utils/fn";
import toast from "react-hot-toast";
import { formatOptions } from "../../../../lib";
import MuiSelectField from "../../../../components/basic/muiSelectField";
import MuiTextField from "../../../../components/basic/muiTextField";
import MuiDateField from "../../../../components/basic/MuiDateField";
import Checkbox from "../../../../components/basic/checkbox";

const ItemStockLedger = () => {

      const { user } = useSelector((state) => state.auth);

  const FormUI = ({ onSubmit }) => {

    const initialForm = {
      ok_rej: "",
      active_flag: "",
      wc_id: "",
      to_wc_id: "",
      wc_no: "",
      to_wc_no: "",
      to_wc_desc: "",
      wc_description: "",
      all_item: "N",
      it_code: "",
      it_code1: "",
      tempItem: "",
      it_type: "",
      it_base: "",
      it_sub_c: "",  
      dest_type: "",
      from_date: "",
      to_date: "",
     

    };
  

   const [formData, setFormData] = useState(initialForm);
     // for helpList
      const [helpList, setHelpList] = useState(false);
      const [helpFor, setHelpFor] = useState("");
      const [helpListHeader, setHelpListHeader] = useState([]);
      const toggleHelpModal = () => setHelpList(!helpList);
          // for dropdown state 
       const [itemType, setItemType] = useState([]);
        const [itemBase, setItemBase] = useState([]);
        const [itemSubCat, setItemSubCat] = useState([]);
        // const [poNo, setPoNo]  = useState([]);
       
        // const [disableField, setDisableField] = useState({
        //     v_code: true,
        //     it_code: true,
        //     po_no: true,
        //     po_category: true,
        //     ge_no_from: true,
        //     ge_no_to: true,
        //     mrir_no:true,
        //   });


     

    const VCodeHelpListHeader = [
      { label: "Wc Id", key: "wc_id" },
      { label: "Wc No", key: "wc_no" },
      { label: "Description", key: "description" },
    ];
    const toStoreHelpListHeader = [
      { label: "Wc Id", key: "wc_id" },
      { label: "Wc No", key: "wc_no" },
      { label: "Description", key: "description" },
    ];

    const ItCodeHelpListHeader = [
      { label: "Item Code", key: "it_code" },
      { label: "Item Name", key: "it_name" },
  
    ];
    const toHelpListHeader = [
      { label: "Item Code", key: "it_code" },
      { label: "Item Name", key: "it_name" },
  
    ];



      useEffect(() => {
        const fetchLevel1 = async () => {
          const response = await fetch(
            `${import.meta.env.VITE_BASE_API_URL}${
              APP_PROD_API.GET_ITEM_STOCK_LEDGER_DROPDOWN_DATA
            }`,
            { credentials: "include" }
          );
          const data = await response.json();
          setItemType([ { value: "", label: "" }, ...formatOptions(data.level1 || [], "level1", "cat_desc"), ]);
        //    setPoNo([{value:'', label:''}, ...formatOptions(data.poCategoryList || [],"po_cat_prefix", "po_cat_description" )])
        
        };
    
        fetchLevel1();
      }, []);

       useEffect(() => {
      const fetchLevel2 = async () => {
        if (formData.it_type) {
          const response = await fetch(
            `${import.meta.env.VITE_BASE_API_URL}${
              APP_PROD_API.GET_ITEM_STOCK_LEDGER_DROPDOWN_DATA
            }?level1=${formData.it_type}`,
            { credentials: "include" }
          );
          const data = await response.json();
          setItemBase([
            { value: "", label: "" },
            ...formatOptions(data.level2 || [], "level2", "cat_desc"),
          ]);
          setItemSubCat([]);
        } else {
          setItemBase([]);
          setItemSubCat([]);
        }
      };
      fetchLevel2();
    }, [formData.it_type]);
     
      // Level3 load based on Level1 + Level2 selection
      useEffect(() => {
      const fetchLevel3 = async () => {
        if (formData.it_type && formData.it_base) {
          const response = await fetch(
            `${import.meta.env.VITE_BASE_API_URL}${
              APP_PROD_API.GET_ITEM_STOCK_LEDGER_DROPDOWN_DATA
            }?level1=${formData.it_type}&level2=${formData.it_base}`,
            { credentials: "include" }
          );
          const data = await response.json();
          setItemSubCat([ { value: "", label: "" },...formatOptions(data.level3 || [], "level3", "cat_desc"), ]);
        } else {
          setItemSubCat([]);
        }
      };
      fetchLevel3();
    }, [formData.it_type, formData.it_base]);

    const handleDoubleClick = (field, header) => {
      setHelpFor(field);
      setHelpListHeader(header);
      setHelpList(true);
    };

   const onSelectHelpItem = async (data) => {

  // Common validation for both stores
  if (helpFor === "FromStore" || helpFor === "ToStore") {

    const isValid = await handleFromStoreValidate(data.wc_no);

    if (!isValid) return;
  }

  // From Store Mapping
  if (helpFor === "FromStore") {

    setFormData((prev) => ({
      ...prev,
      wc_no: data.wc_no,
      wc_description: data.description,
      wc_id: data.wc_id,
    }));

    setHelpList(false);
  }

  // To Store Mapping
  if (helpFor === "ToStore") {

    setFormData((prev) => ({
      ...prev,
      to_wc_no: data.wc_no,
      to_wc_desc: data.description,
      to_wc_id: data.wc_id,
    }));

    setHelpList(false);
  }

 if (helpFor === "FromItem") {

  let fromItem = data.it_code;
  let toItem = formData.it_code1;

  // Swap if needed
  if (toItem && fromItem > toItem) {
    [fromItem, toItem] = [toItem, fromItem];
  }

  setFormData((prev) => ({
    ...prev,
    it_code: fromItem,
    it_code1: toItem || prev.it_code1,
    it_name: data.it_name,
  }));

  setHelpList(false);
}


if (helpFor === "ToItem") {

  let fromItem = formData.it_code;
  let toItem = data.it_code;

  // Swap if needed
  if (fromItem && fromItem > toItem) {
    [fromItem, toItem] = [toItem, fromItem];
  }

  setFormData((prev) => ({
    ...prev,
    it_code: fromItem || prev.it_code,
    it_code1: toItem,
    it_name: data.it_name,
  }));

  setHelpList(false);
}
};

    // const handleSelectionLogic = (selection) => {
    //   let d = {
    //     v_code: true,
    //     it_code: true,
    //     po_no: true,
    //     po_category: true,
    //     ge_no_from: true,
    //     ge_no_to: true,
    //     mrir_no:true,
    //   };

    //     // RESET all values ( :item := null)
    //     setFormData(prev => ({
    //       ...prev,
    //       v_code: "",
    //       v_name: "",
    //       it_code: "",
    //       it_name: "",
    //       po_no: "",
    //       po_id: "",
    //       po_category: "",
    //       ge_no_from: "",
    //       ge_no_to: "",
    //       mrir_no:"",
    //     }));

      
    //       if (selection === "D" || selection === "V" || selection === "L") {
    //         d.v_code = false;
    //       }
    //       else if (selection === "I") {
    //         d.it_code = false;
    //       }
    //       else if (selection === "P") {
    //         d.po_no = false;
    //       }
    //       else if (selection === "C") {
    //         d.po_category = false;
    //       }
    //       else if (selection === "G") {
    //         d.ge_no_from = false;
    //         d.ge_no_to = false;
    //       }
    //       else if (selection === "S") {
    //          d.mrir_no = false;
    //         }

    //       else {
    //         d.v_code = false;
    //         d.it_code = false;
    //       }

    //       setDisableField(d);
    //  };

 const handleCancel = () => {
      setFormData(initialForm);
    };

  const handleChange = (e) => {

  const { name, value, type, checked } = e.target;

  const finalValue =
    type === "checkbox"
      ? (checked ? "Y" : "N")
      : value;

  setFormData((prev) => {

    let updated = {
      ...prev,
      [name]: finalValue,
    };

    // If level1 changes → reset level2 & level3
    if (name === "it_type") {
      updated.it_base = "";
      updated.it_sub_c = "";
    }

    // If level2 changes → reset level3
    if (name === "it_base") {
      updated.it_sub_c = "";
    }

    return updated;
  });
};

const handleFromStoreValidate = async (wc_no) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_ITEM_STOCK_LEDGER_WC_NO_DATA}?wc_no=${wc_no}`,
      { credentials: "include" }
    );

    const data = await res.json();

    if (!data.success) {
      toast.error(data.message || "Store does not exist");

      setFormData((prev) => ({
        ...prev,
        wc_no: "",
        wc_id: "",
        wc_description: "",
      }));

      return false;
    }

    return true;

  } catch (err) {

    setFormData((prev) => ({
      ...prev,
      wc_no: "",
      wc_id: "",
      wc_description: "",
    }));

    toast.error("Error validating Store");
    return false;
  }
};

const handleAllItem = async (checked) => {

  if (checked) {

    const res = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_ITEM_STOCK_LEDGER_ALL_ITEM_DATA}`,
      { credentials: "include" }
    );

    const data = await res.json();

    setFormData((prev) => ({
      ...prev,
      all_item: "Y",
      it_code: data.min_it_code,
      it_code1: data.max_it_code,
    }));

  } else {

    setFormData((prev) => ({
      ...prev,
      all_item: "N",
      it_code: "",
      it_code1: "",
    }));
  }
};

 const handleSubmit = async (e) => {
  e.preventDefault();

  const valid = validateForm("item-stock-ledger", "Item Stock Ledger");
  if (!valid) return;

   const from = new Date(formData.from_date);
      const to = new Date(formData.to_date);

      if (to < from) {
        toast.error("To Date cannot be less than From Date.");
        return; 
      }
  
  const payload = {
      division_id: user?.global_division_id,
      trans_year: user?.global_fin_year,
      user_id:user?.id,
      ok_rej: formData?.ok_rej || "O",
      active_flag: formData?.active_flag,
      wc_id: formData?.wc_id,
      to_wc_id: formData?.to_wc_id,
      wc_no: formData?.wc_no,
      to_wc_no: formData?.to_wc_no,
      all_item: formData?.all_item,
      it_code: formData?.it_code,
      it_code1: formData?.it_code1,
      it_type: formData?.it_type,
      it_base: formData?.it_base,
      it_sub_c: formData?.it_sub_c,  
      from_date: formData?.from_date,
      to_date: formData?.to_date,
  };

  try {
    const response = await fetch(
    `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_ITEM_STOCK_LEDGER_DATA}`,
      {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      toast.error(data.message || "Error while submitting form");
      return;
    }

    toast.success("Data fetched successfully!");

    onSubmit(data);
    handleCancel();
  } catch (error) {
    toast.error("Something went wrong");
  }
};



  return (
    <>
           <Form id="item-stock-ledger">
             <div className="d-flex justify-content-center mt-3">
               <Card className="report-card p-2 shadow-lg" style={{width:"90%"}}>
                 <Container>
                   <h4 className="d-flex justify-content-center">Item Stock Ledger</h4>
 
            <Row className="d-flex justify-content-center mt-3">
            <Col  xl={5} className="">
                <div className="radio-big-box d-flex flex-wrap justify-content-around gap-3">

                {[
                    { text: "Ok", value: "O" },
                    { text: "Rejection", value: "R" },
                  
                  ].map((item, i) => (
                   <div key={i} className="radio-item">
                    <label className="d-flex align-items-center gap-2"
                          style={{ fontWeight: "600" }} >
                      <input
                        type="radio"
                        name="ok_rej"
                        value={item.value}
                        checked={formData?.ok_rej === item.value}
                        onChange={(e) => {
                              handleChange(e);              
                            //   handleSelectionLogic(e.target.value); 
                            }}
                      />
                      {item.text}
                    </label>
                  </div>
                ))}

                </div>
            </Col>
            {/* <Col  xl={2} className="mt-2">
  <Checkbox
                text="Include All Stores"
                onChange={(e) =>
                  handleChange("all_wc", e.target.checked ? "Y" : "N")
                }
                checked={formData?.all_wc === "Y"}
              />
            </Col>
            <Col  xl={2} className="mt-2">
  <Checkbox
                text="Summary"
                onChange={(e) =>
                  handleChange("it_summary", e.target.checked ? "Y" : "N")
                }
                checked={formData?.it_summary === "Y"}
              />
            </Col>
            <Col  xl={2} className="mt-2"   >
  <Checkbox
                text="Group By Stock"
                onChange={(e) =>
                  handleChange("grpstock", e.target.checked ? "Y" : "N")
                }
                checked={formData?.grpstock === "Y"}
              />
            </Col> */}
            </Row>

    <Row className="mt-3">
                     <Col lg={3}>
                   

              <MuiTextField
                type="text"
                label="From Store"
                name="wc_no"
                value={formData.wc_no}
                onChange={handleChange}
                onDoubleClick={() => handleDoubleClick("FromStore", VCodeHelpListHeader)}
                // disabled={disableField.wc_no}
                // showHelpIcon
                required
              />


                     </Col>
   
                     <Col lg={9}>
                       <MuiTextField
                         type="text"
                        //  label="Name"
                         name="wc_description"
                         value={formData.wc_description}
                         onChange={handleChange}
                         disabled
                       />
                     </Col>
  </Row>
          <Row className="mt-3">
                      <Col lg={3}>
                       <MuiTextField
                         type="text"
                         label="To Store"
                         name="to_wc_no"
                         value={formData.to_wc_no}
                         onChange={handleChange}
                          onDoubleClick={() => handleDoubleClick("ToStore", toStoreHelpListHeader)}
                        //    disabled={disableField.it_code}
                        //    showHelpIcon
                           required
                       />
                     </Col>
   
                     <Col lg={9}>
                       <MuiTextField
                         type="text"
                        //  label="Name"
                         name="to_wc_desc"
                         value={formData.to_wc_desc}
                         onChange={handleChange}
                         disabled
                       />
                     </Col>
             </Row>

<Row className="mt-3">
          <Col lg={3} className="">
                       <MuiTextField
                         type="text"
                         label="From Item"
                         name="it_code"
                         value={formData.it_code}
                         onChange={handleChange}
                        onDoubleClick={() => handleDoubleClick("FromItem", ItCodeHelpListHeader)}
                        disabled={formData.all_item === "Y"}
                        required
                       />
                     </Col>
   
                    
                 
              
                      <Col lg={3}  className="">
                       <MuiTextField
                         type="text"
                         label="To Item"
                         name="it_code1"
                         value={formData.it_code1}
                         onChange={handleChange}
                          onDoubleClick={() => handleDoubleClick("ToItem", toHelpListHeader)}
                          disabled={formData.all_item === "Y"}
                        required
                       />
                     </Col>

    <Col xl={2} className ="mt-1">
     <Checkbox
  text="All Items"
  name="all_item"
   onChange={(e) => {
    handleChange(e);
    handleAllItem(e.target.checked);
  }}
  checked={formData?.all_item === "Y"}
/>
    </Col>
     <Col xl={4}>
  <div style={{ position: "relative" }}>
    
    <span
      style={{
        position: "absolute",
        top: "-10px",
        left: "15px",
        background: "#fff",
      fonstWeight: "700",
        // padding: "0 8px",
        fontSize: "13px",
        zIndex: 1,
      }}
    >
      Item in Store
    </span>

    <div
      className="radio-big-box d-flex flex-wrap justify-content-around gap-3"
      style={{
        border: "1px solid #ccc",
        borderRadius: "5px",
        padding: "7px",
       
      }}
    >
      {[
        { text: "Active", value: "Y" },
        { text: "Inactive", value: "N" },
        { text: "Both", value: "B" },
      ].map((item, i) => (
        <div key={i} className="radio-item">
          <label className="d-flex align-items-center gap-2"
           style={{ fontWeight: "600" }}>
            <input
              type="radio"
              name="active_flag"
              value={item.value}
              checked={formData?.active_flag === item.value}
              onChange={(e) => {
                handleChange(e);
                // handleSelectionLogic(e.target.value);
              }}
            />
            {item.text}
          </label>
        </div>
      ))}
    </div>
  </div>
</Col>



</Row>

      {/* <Row className="mt-1">
   
        <Col>
    <div
      className="radio-big-box d-flex flex-wrap justify-content-around gap-3"
     
    >
      {[
        { text: "Without Zero Qty Item", value: "A" },
        { text: "Only Zero Qty Item", value: "I" },
        { text: "Both", value: "B" },
      ].map((item, i) => (
        <div key={i} className="radio-item">
          <label className="d-flex align-items-center gap-2"
           style={{ fontWeight: "600" }}>
            <input
              type="radio"
              name="selection"
              value={item.value}
              checked={formData?.selection === item.value}
              onChange={(e) => {
                handleChange(e);
                handleSelectionLogic(e.target.value);
              }}
            />
            {item.text}
          </label>
        </div>
      ))}
    </div>
</Col>
                    
      </Row> */}
       <Row className="mt-3">
          <Col xl={6}>
          

            <MuiSelectField
              label="Item Type"
              name="it_type"
              value={formData.it_type}
              onChange={handleChange}
              options={itemType}
            />

          </Col>
        
          <Col xl={6}>
          
             <MuiSelectField
              label="Item Base"
              name="it_base"
              value={formData.it_base}
              onChange={handleChange}
              options={itemBase}
            />
          </Col>
      </Row>

        <Row className="mt-3">
          <Col xl={6} >
         
             <MuiSelectField
              label="Item Sub Cat"
              name="it_sub_c"
              value={formData.it_sub_c}
              onChange={handleChange}
              options={itemSubCat}
            />
          </Col>
         
          <Col lg={2}>
          <MuiDateField
          label="From Date"
          name="from_date"
          value={formData.from_date}
          onChange={handleChange}
           required
        />

      </Col>

        <Col lg={2}>
          <MuiDateField
        label="To Date"
        name="to_date"
        value={formData.to_date}
        onChange={handleChange}
         required
      />

        </Col>
      </Row>

        <Row className=" d-flex justify-content-center mt-2">
        <Col xl={2}>
        
          <ButtonUi onClick={handleSubmit} style={{ width: "80px" }}>
            OK
          </ButtonUi>
      </Col>
        <Col xl={2}>
          <ButtonUi
            color="danger"
            onClick={handleCancel}
            style={{ width: "80px" }}
          >
            Cancel
          </ButtonUi>
        </Col>

       </Row>

                    
        </Container>
    </Card>
             </div>
   
             {helpList && (
               <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
                 <ModalHeader toggle={toggleHelpModal}></ModalHeader>
                 <ModalBody>
                   <HelpList
                     formStatus="Insert"
                     helpFor={helpFor}
                     apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_ITEM_STOCK_LEDGER_DATA}`}
                     helpListHeader={helpListHeader}
                     handleHelpList={setHelpList}
                     onSelectHelpItem={onSelectHelpItem}
                     queryPera={{ needAppGlobalData: "Y" }}
                      whereClause={{ wc_id: formData.wc_id, to_wc_id: formData.to_wc_id }}
                   />
                 </ModalBody>
               </Modal>
             )}
           </Form>
 </>
  )
}

 return (
    <GenericReportPage
      FormComponent={FormUI}
      apiUrl="POST_ITEM_STOCK_LEDGER_DATA"
      reportTitle="Item Stock Ledger Report"
       rightAlignedFields={[
    'Opening Balance As on',
    'Total Receipt Quantity',
    'Total Issue Quantity',
    'Closing Balance As on',
    'Rate',
    'Value',
    'At Gate',
    'Under Inspection',
    'Cleared But not Recd. in Store'
  ]}
    />
  );

}

export default ItemStockLedger;