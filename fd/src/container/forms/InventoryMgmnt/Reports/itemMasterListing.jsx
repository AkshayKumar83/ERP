

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

const ItemMasterListing = () => {

      const { user } = useSelector((state) => state.auth);

  const FormUI = ({ onSubmit }) => {

    const initialForm = {
      rg_type: "A",
      it_type: "",
      it_base: "",
      it_sub_c: "",  
      rg_item: "A",  
      it_code: "",
      it_code1: "",
      dest_type:"",

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
        // const [destination, setDestination]  = useState([]);
       
    
    const fromHelpListHeader = [
      { label: "From Item", key: "it_code" },
       { label: "Name", key: "it_name" },
     

    ];

    const toHelpListHeader = [
      { label: "To Item", key: "it_code" },
       { label: "Name", key: "it_name" },
     

    ];

    const isAllType = formData.rg_type === "A";
    const isAllItem = formData.rg_item === "A";

    useEffect(() => {
  if (formData.rg_type === "A") {
    setFormData(prev => ({
      ...prev,
      it_type: "",
      it_base: "",
      it_sub_c: "",
    }));
  }
}, [formData.rg_type]);

 
    useEffect(() => {
  if (formData.rg_item === "A") {
    setFormData(prev => ({
      ...prev,
      it_code: "",
      it_code1: "",
      
    }));
  }
}, [formData.rg_item]);

   

      useEffect(() => {
        const fetchLevel1 = async () => {
          const response = await fetch(
            `${import.meta.env.VITE_BASE_API_URL}${
              APP_PROD_API.GET_ITEM_MASTER_LISTING_DROPDOWN_DATA
            }`,
            { credentials: "include" }
          );
          const data = await response.json();
          setItemType([ { value: "", label: "" }, ...formatOptions(data.level1 || [], "level1", "cat_desc"), ]);
          // setDestination([{value:'', label:''}, ...formatOptions(data.destinationList || [],"destype", "rep_param" )])
        
        };
    
        fetchLevel1();
      }, []);

       useEffect(() => {
      const fetchLevel2 = async () => {
        if (formData.it_type) {
          const response = await fetch(
            `${import.meta.env.VITE_BASE_API_URL}${
              APP_PROD_API.GET_ITEM_MASTER_LISTING_DROPDOWN_DATA
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
              APP_PROD_API.GET_ITEM_MASTER_LISTING_DROPDOWN_DATA
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
     
      if (helpFor === "from") {
        setFormData((prev) => ({
          ...prev,
          it_code: data.it_code,
          it_name: data.it_name,
        }));
      }
      if (helpFor === "to") {
        setFormData((prev) => ({
          ...prev,
         it_code1: data.it_code,
        it_name: data.it_name,
        }));
      }
      
    };

 
 const handleCancel = () => {
      setFormData(initialForm);
      
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

  const valid = validateForm("item-mstr-listing", "Item Material Listing");
  if (!valid) return;


  
  const payload = {
      division_id: user?.global_division_id,
      trans_year: user?.global_fin_year,
      rg_type: formData?.rg_type,
      it_type: formData?.it_type,
      it_base: formData?.it_base,
      it_sub_c: formData?.it_sub_c,
      rg_item:formData?.rg_item, 
      it_code: formData?.it_code,
      it_code1: formData?.it_code1,

  };

  try {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_ITEM_MASTER_LISTING_DATA}`,
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
           <Form id="item-mstr-listing">

             <div className="d-flex justify-content-center mt-3">
               <Card className="report-card p-2 shadow-lg" style={{width:"70%"}}>
                 <Container>
                  <Card className="report-card p-2">
                   <h4 className="d-flex justify-content-center">Item Master (Category Wise)</h4>
 
            <Card className="report-card p-3">
                <Row className="">
                <Col  xl={3} className="">

                <Card className="report-card">
                    <div className="ms-2">

                    {[
                        { text: "All", value: "A" },
                        { text: "Selective", value: "S" },
                      
                      ].map((item, i) => (
                      <div key={i} className="radio-item">
                        <label className="d-flex align-items-center gap-2">
                          <input
                            type="radio"
                            name="rg_type"
                            value={item?.value}
                            checked={formData?.rg_type === item.value}
                            onChange={(e) => { handleChange(e)}}
                          />
                          {item.text}
                        </label>
                      </div>
                    ))}

                    </div>
                </Card>

                </Col>
            
              <Col xl={9} className="mt-2">
                <MuiSelectField
                  label="Item Type"
                  name="it_type"
                  value={formData.it_type}
                  onChange={handleChange}
                  options={itemType}
                  disabled={isAllType}
                  required
                />

              </Col>
            
            
          </Row>

            <Row className="mt-3">
              <Col xl={6}>
              
                <MuiSelectField
                  label="Item Base"
                  name="it_base"
                  value={formData.it_base}
                  onChange={handleChange}
                  options={itemBase}
                  disabled={isAllType}
                />
              </Col>
              <Col xl={6} >
            
                <MuiSelectField
                  label="Base Sub Category"
                  name="it_sub_c"
                  value={formData.it_sub_c}
                  onChange={handleChange}
                  options={itemSubCat}
                  disabled={isAllType}
                />
              </Col>
    
          </Row>
            </Card>


   
          <Card className="report-card p-3 mt-4">
      <Row className="">
            <Col  xl={3} className="">
              <Card className="report-card">
                <div className="ms-2">

                {[
                    { text: "All", value: "A" },
                    { text: "Selective", value: "S" },
                   
                  ].map((item, i) => (
                   <div key={i} className="radio-item">
                    <label className="d-flex align-items-center gap-2">
                      <input
                        type="radio"
                        name="rg_item"
                        value={item.value}
                        checked={formData?.rg_item === item.value}
                        onChange={(e) => { handleChange(e) }}
                      />
                      {item.text}
                    </label>
                  </div>
                ))}

                </div>

                </Card>
            </Col>
        
   
               <Col lg={4} className="mt-3">
              <MuiTextField
                type="text"
                label="From Item"
                name="it_code"
                value={formData?.it_code}
                onChange={handleChange}
                onDoubleClick={() => handleDoubleClick("from", fromHelpListHeader)}
                // showHelpIcon
                required
                disabled={isAllItem}
              />
             </Col>

                     <Col lg={4} className="mt-3">
                       <MuiTextField
                         type="text"
                          label="To Item"
                         name="it_code1"
                         value={formData?.it_code1}
                         onChange={handleChange}
                           onDoubleClick={() => handleDoubleClick("to", toHelpListHeader)}
                        // showHelpIcon
                         required
                          disabled={isAllItem}
                       />

                     </Col>
     </Row>
                
          </Card>
     
            {/* <Row className="mt-2 d-flex justify-content-center">
                <Col xl={6} >
                <MuiSelectField
                  label="Destination"
                  name="dest_type"
                  value={formData.dest_type}
                  onChange={handleChange}
                  options={destination}
                />
              </Col>
    
            </Row> */}

       </Card>
        </Container>
        
          <Row className=" d-flex justify-content-center mt-4">
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
    </Card>
             </div>
   
             {helpList && (
               <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
                 <ModalHeader toggle={toggleHelpModal}></ModalHeader>
                 <ModalBody>
                   <HelpList
                     formStatus="Insert"
                     helpFor={helpFor}
                     apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_ITEM_MASTER_LISTING_DATA}`}
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
      apiUrl="POST_ITEM_MASTER_LISTING_DATA"
      reportTitle="Item Master Listing"
      rightAlignedFields={[
        'Conversion Purchase','Conversion BOM',"Reorder Qty",'Reorder Qty','Lead Time Manufacturing','Lead Time Purchase',"Max Stock",
        "Min Stock",'Item Rate'
      ]}
    />
  );

}

export default ItemMasterListing