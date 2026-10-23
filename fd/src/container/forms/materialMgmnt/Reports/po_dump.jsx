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

const PODump = () => {

      const { user } = useSelector((state) => state.auth);
      const [reportType, setReportType] = useState("");

  const FormUI = ({ onSubmit }) => {

    const initialForm = {
      po_type: "",
      po_status: "",
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
      { label: "Trans year", key: "year_code" },
      
    
    ];
    const toStoreHelpListHeader = [
      { label: "Division", key: "division_id" },
      { label: "Name", key: "name" },
     
      
    ];





    const handleDoubleClick = (field, header) => {
      setHelpFor(field);
      setHelpListHeader(header);
      setHelpList(true);
    };

const onSelectHelpItem = (data) => {
 
 if (helpFor === "Year") {
        setFormData((prev) => ({
          ...prev,
          trans_year: data.year_code,
         
        }));
      }
    //   if (helpFor === "Division") {
    //     setFormData((prev) => ({
    //       ...prev,
    //       division_id: data.division_id,
    //       name: data.name,
    //     }));
    //   }

    };


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

    return updated;
  });
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
    //   user_id:user?.id,
      po_type: formData?.po_type ,
      po_status: formData?.po_status,
      // trans_year: formData?.trans_year,
    //   division_id: formData?.division_id,
      from_date: formData?.from_date,
      to_date: formData?.to_date,
       report_type: reportType
  };

  try {
    const response = await fetch(
    `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_PO_DUMP_DATA}`,
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
               <Card className="report-card p-2 shadow-lg" style={{width:"60%"}}>
                 <Container>
                   <h4 className="d-flex justify-content-center">PO DUMP</h4>


<Row className="d-flex justify-content-center mt-4 gap-3">

  <Col xl="auto">
    <ButtonUi
      outline={reportType !== "DETAIL"}
      color={reportType === "DETAIL" ? "primary" : "secondary"}
      onClick={() => setReportType("DETAIL")}
      style={{
        minWidth: "120px",
        fontWeight: "600",
        borderRadius: "8px",
      }}
    >
      Details
    </ButtonUi>
  </Col>

  <Col xl="auto">
    <ButtonUi
      outline={reportType !== "SUMMARY"}
      color={reportType === "SUMMARY" ? "primary" : "secondary"}
      onClick={() => setReportType("SUMMARY")}
      style={{
        minWidth: "120px",
        fontWeight: "600",
        borderRadius: "8px",
      }}
    >
      Summary
    </ButtonUi>
  </Col>

</Row>
 
 {reportType && (
  <>
 <Row className="justify-content-center mt-3 ms-5">
  <Col xl={5}>
    <div
      className="d-flex justify-content-between align-items-center"
      style={{
        border: "1px solid #cfcfcf",
        borderRadius: "8px",
        minHeight: "40px",
        gap: "25px",
        padding: "8px 12px",
      }}
    >
      {[
        { text: "Advice", value: "A" },
        { text: "Order", value: "O" },
        { text: "ALL", value: "ALL" },
      ].map((item, i) => (
        <label
          key={i}
          className="d-flex align-items-center mb-0"
          style={{
            gap: "6px",
            fontWeight: 600,
            whiteSpace: "nowrap",
            cursor: "pointer",
          }}
        >
          <input
            type="radio"
            name="po_type"
            value={item.value}
            checked={formData?.po_type === item.value}
            onChange={handleChange}
          />
          {item.text}
        </label>
      ))}
    </div>
  </Col>

  <Col xl={6}>
    <div
      className="d-flex justify-content-between align-items-center"
      style={{
        border: "1px solid #cfcfcf",
        borderRadius: "8px",
        minHeight: "40px",
        gap: "10px",
        padding: "8px 12px",
      }}
    >
      {[
        { text: "Authorized", value: "Authorized" },
        { text: "Unauthorized", value: "Unauthorized" },
        { text: "ALL", value: "both" },
      ].map((item, i) => (
        <label
          key={i}
          className="d-flex align-items-center mb-0"
          style={{
            gap: "6px",
            fontWeight: 600,
            whiteSpace: "nowrap",
            cursor: "pointer",
          }}
        >
          <input
            type="radio"
            name="po_status"
            value={item.value}
            checked={formData?.po_status === item.value}
            onChange={handleChange}
          />
          {item.text}
        </label>
      ))}
    </div>
  </Col>
</Row>

    <Row className="mt-4 d-flex justify-content-center">
                     {/* <Col lg={3}>
                   

              <MuiTextField
                type="text"
                label="Financial Year"
                name="trans_year"
                value={formData.trans_year}
                onChange={handleChange}
                onDoubleClick={() => handleDoubleClick("Year", VCodeHelpListHeader)}
                 disabled={disableField.wc_no}
                // showHelpIcon
                required
              />


                     </Col> */}
   
                     {/* <Col lg={9}>
                       <MuiTextField
                         type="text"
                         label="Division"
                         name="name"
                         value={formData.name}
                         onChange={handleChange}
                        required
                onDoubleClick={() => handleDoubleClick("Division", toStoreHelpListHeader)}

                       />
                     </Col> */}
                           <Col lg={3}>
          <MuiDateField
          label="From Date"
          name="from_date"
          value={formData.from_date}
          onChange={handleChange}
           required
        />

      </Col>

        <Col lg={3}>
          <MuiDateField
        label="To Date"
        name="to_date"
        value={formData.to_date}
        onChange={handleChange}
         required
      />

        </Col>
  </Row>
        
        <Row className="mt-3 d-flex justify-content-center">
          
        <Col xl={2} >
        
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

         </>
)}             
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
                     apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_PO_DUMP_DATA}`}
                     helpListHeader={helpListHeader}
                     handleHelpList={setHelpList}
                     onSelectHelpItem={onSelectHelpItem}
                     queryPera={{ needAppGlobalData: "Y" }}
                    
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
      apiUrl="POST_PO_DUMP_DATA"
      reportTitle="Purchase Order Dump"
       rightAlignedFields={[
        'RATE',
        'QTY ORDER',
        'QTY RECEIVED',
        'QTY BALANCE',
        'PENDING AGE IN DAYS' 
  ]}

    rowColorRules={[
    {
      field: "PO STATUS",  // column header name
      value: "COMPLETE",    // row value name
      bgColor: "#108f2d",
      // textColor: "#fff",
    },
    // {
    //   field: "PO STATUS",
    //   value: "PENDING",
    //   bgColor: "#c00f33",
    //   textColor: "#fff",
    // },
  ]}
      />
  );

}

export default PODump;