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

const IncomingMaterialDetail = () => {

      const { user } = useSelector((state) => state.auth);

  const FormUI = ({ onSubmit }) => {

    const initialForm = {
      selection: "",
      v_code: "",
      v_name: "",
      it_code: "",
      it_name: "",
      po_no: "",
      po_category: "",
      ge_no_from: "",
      ge_no_to: "",
      it_type: "",
      it_base: "",
      it_sub_c: "",  
      dest_type: "",
      from_date: "",
      to_date: "",
      mrir_no:"",

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
        const [poNo, setPoNo]  = useState([]);
       
        const [disableField, setDisableField] = useState({
            v_code: true,
            it_code: true,
            po_no: true,
            po_category: true,
            ge_no_from: true,
            ge_no_to: true,
            mrir_no:true,
          });


     

    const VCodeHelpListHeader = [
      { label: "Vendor", key: "v_code" },
      { label: "Name", key: "v_name" },
    ];

    const ItemCodeHelpListHeader = [
      { label: "Item Code", key: "it_code" },
      { label: "Item Name", key: "it_name_long" },
      { label: "Fc Code", key: "fc_code" },
   ];

    const PoNoHelpListHeader = [
      { label: "Po Id", key: "po_id" },
      { label: "Po No", key: "po_no" },
      { label: "Vendor", key: "v_code" },
      { label: "Name", key: "v_name" },

    ];

    const fromHelpListHeader = [
      { label: "Ge No", key: "ge_no" },
      { label: "Ge Date", key: "ge_date" },
      { label: "Chln No", key: "chln_no" },
      { label: "Chln Date", key: "chln_date" },

    ];

    const toHelpListHeader = [
      { label: "Ge No", key: "ge_no" },
      { label: "Ge Date", key: "ge_date" },
      { label: "Chln No", key: "chln_no" },
      { label: "Chln Date", key: "chln_date" },

    ];

    const mrirCodeHelpListHeader = [
      { label: "MRIR No", key: "mrir_no" },
    ];

      useEffect(() => {
        const fetchLevel1 = async () => {
          const response = await fetch(
            `${import.meta.env.VITE_BASE_API_URL}${
              APP_PROD_API.GET_INCOMING_MATERIAL_DETAIL_DROPDOWN_DATA
            }`,
            { credentials: "include" }
          );
          const data = await response.json();
          setItemType([ { value: "", label: "" }, ...formatOptions(data.level1 || [], "level1", "cat_desc"), ]);
           setPoNo([{value:'', label:''}, ...formatOptions(data.poCategoryList || [],"po_cat_prefix", "po_cat_description" )])
        
        };
    
        fetchLevel1();
      }, []);

       useEffect(() => {
      const fetchLevel2 = async () => {
        if (formData.it_type) {
          const response = await fetch(
            `${import.meta.env.VITE_BASE_API_URL}${
              APP_PROD_API.GET_INCOMING_MATERIAL_DETAIL_DROPDOWN_DATA
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
              APP_PROD_API.GET_INCOMING_MATERIAL_DETAIL_DROPDOWN_DATA
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

    const onSelectHelpItem = (data) => {
      if (helpFor === "vendor") {
        setFormData((prev) => ({
          ...prev,
          v_code: data.v_code,
          v_name: data.v_name,
        }));
      }
      if (helpFor === "item") {
        setFormData((prev) => ({
          ...prev,
          it_code: data.it_code,
          it_name: data.it_name_long,
          fc_code: data.fc_code,
        }));
      }
      if (helpFor === "PoNo") {
        handlePoNoValidate(data.po_no).then((valid) => {
          if (!valid) return;
        setFormData((prev) => ({
                  ...prev,
                  po_id: data.po_id,
                  po_no: data.po_no,
                  v_code: data.v_code,
                  v_name: data.v_name,
                }));
        })
       
      }
      if (helpFor === "from") {
        setFormData((prev) => ({
          ...prev,
          ge_no_from: data.ge_no,
          ge_date: data.ge_date,
          chln_no: data.chln_no,
          chln_date: data.chln_date,
        }));
      }
      if (helpFor === "to") {
        setFormData((prev) => ({
          ...prev,
          ge_no_to: data.ge_no,
          ge_date: data.ge_date,
          chln_no: data.chln_no,
          chln_date: data.chln_date,
        }));
      }
      if (helpFor === "mrir") {
        setFormData((prev) => ({
          ...prev,
          mrir_no: data.mrir_no,
        }));
      }
    };

    const handleSelectionLogic = (selection) => {
      let d = {
        v_code: true,
        it_code: true,
        po_no: true,
        po_category: true,
        ge_no_from: true,
        ge_no_to: true,
        mrir_no:true,
      };

        // RESET all values ( :item := null)
        setFormData(prev => ({
          ...prev,
          v_code: "",
          v_name: "",
          it_code: "",
          it_name: "",
          po_no: "",
          po_id: "",
          po_category: "",
          ge_no_from: "",
          ge_no_to: "",
          mrir_no:"",
        }));

      
          if (selection === "D" || selection === "V" || selection === "L") {
            d.v_code = false;
          }
          else if (selection === "I") {
            d.it_code = false;
          }
          else if (selection === "P") {
            d.po_no = false;
          }
          else if (selection === "C") {
            d.po_category = false;
          }
          else if (selection === "G") {
            d.ge_no_from = false;
            d.ge_no_to = false;
          }
          else if (selection === "S") {
             d.mrir_no = false;
            }

          else {
            d.v_code = false;
            d.it_code = false;
          }

          setDisableField(d);
     };

 const handleCancel = () => {
      setFormData(initialForm);
      setDisableField({  
            v_code: true,
            it_code: true,
            po_no: true,
            po_category: true,
            ge_no_from: true,
            ge_no_to: true,
            mrir_no:true,
            })
    };

   const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData((prev) => {
    let updated = { ...prev, [name]: value };

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

  const handlePoNoValidate = async (po_no) => { 
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_INCOMING_MATERIAL_DETAIL_VALIDATE_PO_NO_DATA}?po_no=${po_no}`,
        { credentials: "include" }
      );

      const data = await res.json();

      if (!data.success) {
        toast.error("PO No. does not exist");         
        setFormData(prev => ({
          ...prev,
          po_no: "",
          po_id: "",
          v_code: "",
          v_name: "",
        }));

        return false;  
      }

      return true;     

    } catch (err) {
      toast.error("Error while validating PO No.");
      return false;   
    }
  };

  const handlePoCategoryValidate = async (po_category) => {
    if (!po_category) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_VALIDATE_PO_CATEGORY}?po_category=${po_category}`,
        { credentials: "include" }
      );

      const data = await res.json();

      if (!data.success) {
        toast.error(data.message);
        setFormData(prev => ({ ...prev, po_category: "" }));
        return;
      }

      // SUCCESS → min & max store
      setFormData(prev => ({
        ...prev,
        from_po_id: data.from_po_id,
        to_po_id: data.to_po_id,
      
      }));

    } catch (err) {
      toast.error("Error validating PO Category");
    }
  };


 const handleSubmit = async (e) => {
  e.preventDefault();

  const valid = validateForm("mat-accptn", "Material Acceptance");
  if (!valid) return;

   const from = new Date(formData.from_date);
      const to = new Date(formData.to_date);

      if (to < from) {
        toast.error("To Date cannot be less than From Date.");
        return;
      }
  
  const payload = {
      division_id: user?.appDivisionId,
      trans_year: user?.appFinYear,
      user_id:user?.appUserId,
      selection: formData?.selection,
      v_code: formData?.v_code,
      it_code: formData?.it_code,
      po_no: formData?.po_no,
      po_category: formData?.po_category,
      ge_no_from: formData?.ge_no_from,
      ge_no_to: formData?.ge_no_to,
      it_type: formData?.it_type,
      it_base: formData?.it_base,
      it_sub_c: formData?.it_sub_c,  
      dest_type: formData?.dest_type,
      from_date: formData?.from_date,
      to_date: formData?.to_date,
      po_id: formData?.po_id,
      mrir_no: formData?.mrir_no,
  };

  try {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_INCOMING_MATERIAL_DETAIL_DATA}`,
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
           <Form id="mat-accptn">
             <div className="d-flex justify-content-center mt-3">
               <Card className="report-card p-2 shadow-lg" style={{width:"90%"}}>
                 <Container>
                   <h4 className="d-flex justify-content-center">Incoming Material Details</h4>
 
            <Row className="d-flex justify-content-center mt-3">
            <Col sm={12} md={12} xl={12} className="d-flex justify-content-center">
                <div className="radio-big-box d-flex flex-wrap justify-content-between">

                {[
                    { text: "Vendor Wise", value: "V" },
                    { text: "Item Wise", value: "I" },
                    { text: "PO Category Wise", value: "C" },
                    { text: "Vendor/Challan Wise", value: "L" },
                    { text: "Vendor Date Wise", value: "D" },
                    { text: "Vendor/Item Wise", value: "B" },
                    { text: "PO Wise", value: "P" },
                    { text: "Gate Entry No. Wise", value: "G" },
                    { text: "Pending For Inspection", value: "S" },
                  ].map((item, i) => (
                   <div key={i} className="radio-item">
                    <label className="d-flex align-items-center gap-2">
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
            </Row>

    <Row className="mt-3">
                     <Col lg={2}>
                   

              <MuiTextField
                type="text"
                label="Vendor"
                name="v_code"
                value={formData.v_code}
                onChange={handleChange}
                onDoubleClick={() => handleDoubleClick("vendor", VCodeHelpListHeader)}
                disabled={disableField.v_code}
                showHelpIcon
                required
              />


                     </Col>
   
                     <Col lg={10}>
                       <MuiTextField
                         type="text"
                        //  label="Name"
                         name="v_name"
                         value={formData.v_name}
                         onChange={handleChange}
                         disabled
                       />
                     </Col>
          </Row>
              <Row className="mt-3">
                      <Col lg={2}>
                       <MuiTextField
                         type="text"
                         label="Item"
                         name="it_code"
                         value={formData.it_code}
                         onChange={handleChange}
                          onDoubleClick={() => handleDoubleClick("item", ItemCodeHelpListHeader)}
                           disabled={disableField.it_code}
                           showHelpIcon
                           required
                       />
                     </Col>
   
                     <Col lg={10}>
                       <MuiTextField
                         type="text"
                        //  label="Name"
                         name="it_name"
                         value={formData.it_name}
                         onChange={handleChange}
                         disabled
                       />
                     </Col>
    </Row>

      <Row className="mt-3">
                  <Col lg={2} className="">
                       <MuiTextField
                         type="text"
                         label="PO No."
                         name="po_no"
                         value={formData.po_no}
                         onChange={handleChange}
                          onDoubleClick={() => handleDoubleClick("PoNo", PoNoHelpListHeader)}
                         disabled={disableField.po_no}
                         showHelpIcon
                         required
                       />
                     </Col>
   
                     <Col lg={4} className="">
                   
                        <MuiSelectField
                        label="PO Category"
                        name="po_category"
                        value={formData.po_category}
                         onChange={(e) => {
                            handleChange(e);
                            handlePoCategoryValidate(e.target.value);
                        }}
                       options={poNo}
                       disabled={disableField.po_category}
                       required
                       
                      />
                     </Col>
              
                      <Col lg={3}  className="">
                       <MuiTextField
                         type="text"
                         label="GE No. From"
                         name="ge_no_from"
                         value={formData.ge_no_from}
                         onChange={handleChange}
                          onDoubleClick={() => handleDoubleClick("from", fromHelpListHeader)}
                         disabled={disableField.ge_no_from}
                         showHelpIcon
                         required
                       />
                     </Col>
   
                     <Col lg={3}  className="">
                       <MuiTextField
                         type="text"
                         label="GE No. To"
                         name="ge_no_to"
                         value={formData.ge_no_to}
                         onChange={handleChange}
                         onDoubleClick={() => handleDoubleClick("to", toHelpListHeader)}
                         disabled={disableField.ge_no_to}
                         showHelpIcon
                         required
                       />
                     </Col>
      </Row>
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
              label="Base Sub Category"
              name="it_sub_c"
              value={formData.it_sub_c}
              onChange={handleChange}
              options={itemSubCat}
            />
          </Col>
          <Col lg={2} className="">
                       <MuiTextField
                         type="text"
                         label="MRIR No."
                         name="mrir_no"
                         value={formData.mrir_no}
                         onChange={handleChange}
                          onDoubleClick={() => handleDoubleClick("mrir", mrirCodeHelpListHeader)}
                          disabled={disableField.mrir_no}
                           showHelpIcon
                           required
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
                     apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_INCOMING_MATERIAL_DETAIL_DATA}`}
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
      apiUrl="POST_MATERIAL_ACCEPTANCE_DATA"
      reportTitle="Material Acceptance Report"
      rightAlignedFields={[
         'qty_recd', 'qty_accepted','dev_no', 'dev_qty','under_seg','under_dc','ge_id','batch_qty_recd','batch_qty_accptd'
      ]}
    />
  );

}

export default IncomingMaterialDetail