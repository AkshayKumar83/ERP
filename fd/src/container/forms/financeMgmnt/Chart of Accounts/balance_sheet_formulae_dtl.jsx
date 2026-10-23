import React from 'react'
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import { Row, Col, Form, Table } from 'reactstrap'
import TextField from '../../../../components/basic/textField'
import Select from '../../../../components/basic/select'
import Checkbox from '../../../../components/basic/checkbox'
import SimpleBar from 'simplebar-react'
import RadioGroup from '../../../../components/basic/radioGroup';
import RowAction from '../../../../components/common/rowAction'
import ButtonUi from '../../../../components/basic/button'
import RadioButton from '../../../../components/basic/radioButton';
import { formInitialData, formDetailInitData, seqhHelpListHeader } from './balance_sheet_formula_helper';
import BalanceSheetFormulaDtl from './balance_sheet_formulaDtl';
import toast from 'react-hot-toast';
import { APP_PROD_API } from '../../../../utils/api';
import { FcInfo } from 'react-icons/fc';
import HelpList from '../../../../components/HelpList';
import { Modal, ModalHeader, ModalBody } from "reactstrap"
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from 'react-redux';



const BalanceSheetFormula = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({ ...formInitialData });
  const [formDetailData, setFormDetailData] = useState([formDetailInitData])
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus } = useFormStatus();

  const [activeRowIndex, setActiveRowIndex] = useState(null);
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);

  const [deletedRecord, setDeletedRecord] = useState([])


  // GLOBAL USERDATA
  const { user } = useSelector((state) => state.auth);

  // for help list 

  const [helpList, setHelpList] = useState(false)
  const [helpFor, setHelpFor] = useState('')
  const [helpListHeader, setHelpListHeader] = useState([])

  const [isHelpModelOpen, setIsHelpModelOpen] = useState()
  const toggleHelpModal = () => setHelpList(!helpList)

  const handleHelpList = (data) => {
    setHelpList(data);
  }

  const onSelectHelpItem = (data) => {
    console.log("Selected Data:", data);

    // Update main form data
    if (["seqh"].includes(helpFor)) {
      setFormData((prev) => {
        switch (helpFor) {
          case "seqh":
            return {
              ...prev, seq_no: data.sno, seqh: data.description
            };

          default:
            return prev;
        }
      });
    }

    // Update detail data (table rows)
    if (["seqd"].includes(helpFor) && activeRowIndex !== null) {
      setFormDetailData((prev) => {
        const updated = [...prev];
        const currentRow = { ...updated[activeRowIndex] };

        switch (helpFor) {
          case "seqd":
            currentRow.seq_no = data.sno;
            currentRow.seqd = data.description;


            break;
        }

        updated[activeRowIndex] = currentRow;
        return updated;
      });
    }
  };

  const handleDoubleClick = (field, header) => {
    if (formStatus) {
      setHelpFor(field); // Set the help type dynamically
      setHelpListHeader(header); // Set the appropriate header list
      handleHelpList(true); // Open the modal
    }
  };

  const whereClauseForHelp = (helpFor) => {
    console.log("formData data", formData)
    if (helpFor === 'seqh') {
      return { bs_pl_flag: formData.bs_pl_flag };
    }

    if (helpFor === 'seqd') {
      return { bs_pl_flag: formData.bs_pl_flag };
    }
    return {};
  }

  // validateRequiredField
  const validateRequiredField = (e, fieldLabel) => {
    const value = e.target.value?.trim();
    if (!value) {
      toast.error(`this ${fieldLabel} field is required`);
      e.preventDefault();
      e.target.focus();
      return false;
    }
    return true;
  };

  const validateForFlag = (data) => {
    if (!['I', 'L', 'A', 'E', 'P', 'S', 'U'].includes(data)) {
      toast.error("Please Enter One of the Flag Values: I,L,A,E,P,S,U")
      return true
    }
    return false
  }

  const validateForPlus = (data) => {
    if (!['+', '-'].includes(data)) {
      toast.error("PLEASE ENTER + OR - SYMBOL ONLY")
      return true
    }
    return false
  }

  const otherQueryPera = {
    bs_pl_flag: formData.bs_pl_flag,
    ass_lib_inc_exp_sch_flag: formData.ass_lib_inc_exp_sch_flag

  };

  // for validation
  const getValidateData = async (
    fieldName,
    fieldValue,
    otherQueryPera = {},
    rowIndex = null
  ) => {
    let API_STRING;

    try {
      if (!Object.keys(otherQueryPera).length) {
        API_STRING = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_BALANCE_SHEET_FORMULA_DETAIL_VALID_DATA}?${fieldName}=${fieldValue}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}`;
      } else {
        const otherParams = new URLSearchParams(otherQueryPera).toString();
        API_STRING = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_BALANCE_SHEET_FORMULA_DETAIL_VALID_DATA}?${fieldName}=${fieldValue}&${otherParams}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}`;
      }

      console.log("API URL:", API_STRING);

      const response = await fetch(API_STRING);

      if (response.status === 400) {
        const data = await response.json();
        console.log("Received data:", data);
        if (data.error) {
          toast.error(data.error);
          return false
        }
      } else if (response.status === 200) {
        const { message } = await response.json();
        toast.error(message);
        // setFormData((prev) => ({
        //   ...prev,
        //   [fieldName]: ''  
        // })); 

        return true;
      } else if (response.status === 500) {
        const errmsg = await response.json();
        throw new Error(errmsg.message);
      } else if (response.status === 204) {
        toast.info("State not found");
      } else {
        console.error("Unexpected status:", response.status);
      }
    } catch (err) {
      console.error("Error fetching validation data:", err);
      toast.error("Something went wrong while validating the data.");
    }
  };



  const tabs = ["Balance Sheet Formulae Details"];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);


  // handle handleValidateBlur

  const handleValidate = async (e, rowIndex, name) => {
    if (!["Insert", "Update"].includes(formStatus)) {
      return;
    }

    const field = e.target;
    const value = field.value;

    validateRequiredField({ target: field }, `${name}`);



    try {
      const result = await getValidateData(
        name,
        value,
        otherQueryPera,
        rowIndex
      );
      console.log("Validation result:", result);

      if (!result.valid) {
        // Only focus if INVALID
        field.focus();
      } else if (result.data) {

      }
    } catch (err) {
      console.error("Validation error:", err);
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const balFormInvForm = document.getElementById("balance-sheet-formula-dtl-form")
      const balFormValidity = balFormInvForm.checkValidity()
      if (!balFormValidity) {
        if (balFormInvForm.reportValidity) {
          balFormInvForm.reportValidity()
        } else {
          throw new Error("Please fill all the required details in Balance sheet formulae")
        }
        return
      }

      const validateFormFields = (fields) => {
        for (const [field, message] of Object.entries(fields)) {
          if (!formData[field]) {
            toast.error(message);
            return false;
          }
        }
        return true;
      };

      // Usage
      const isValid = validateFormFields({
        ass_lib_inc_exp_sch_flag: "Ass lib inc exp sch flag cannot be null",
        seq_no: "Seq No cannot be null",

      });

      if (!isValid) return;

      // 3. Validate each row of formDetailData

      for (let i = 0; i < formDetailData.length; i++) {
        const row = formDetailData[i];


        if (!row.plus_minus && !row.ass_lib_inc_exp_sch_flag) {
          continue;
        }


        if (row.ass_lib_inc_exp_sch_flag &&
          !["I", "L", "A", "E", "P", "S", "U"].includes(row.ass_lib_inc_exp_sch_flag)) {
          toast.error(
            `Row ${i + 1}: Ass Lib Inc Exp Sch Flag must be one of "I", "L", "A", "E", "P", "S", "U"`
          );
          return;
        }


        if (row.plus_minus && !["+", "-"].includes(row.plus_minus)) {
          toast.error(`Row ${i + 1}: Plus/Minus must be + or -`);
          return;
        }

      }


      let body = {
        formDetailData: formDetailData,
        formData: formData,
        divisionId: user.global_division_id,
        transYear: user.global_fin_year,
      };

      // Modify the body for "Update" status
      if (formStatus === "Update") {
        body = {
          ...body,
          deletedData: deletedRecord,

        };
      }

      console.log("Final body to send:", body);
      const response = await fetch(
        ` ${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_BALANCE_SHEET_FORMULA_DETAIL}?form_status=${formStatus}&step=submit`,
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

  function handleOffset(data) {
    setCurrentRecordNo(data)
  }

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    releaseFormStatus()
    setFormData(formInitialData);
    setFormDetailData([formDetailInitData])
  }, []);

  const handleChange = useCallback((type, name, value, rowIndex = null) => {
    if (!['Insert', 'Update', 'Search'].includes(formStatus)) {
      return
    }

    if (["Insert", "Update"].includes(formStatus) && ["seq_no"].includes(name)) {
      toast.error("Please select from Helplist");
      return
    }
    switch (type) {

      case "formData":
        setFormData(prev => ({
          ...prev,
          [name]: typeof value === "string" ? value.toUpperCase() : value
        }));
        break;

      case "formDetailData":
        setFormDetailData(prev => {
          if (rowIndex !== null && rowIndex >= 0) {
            // Update a specific row
            const newData = [...prev];
            newData[rowIndex] = {
              ...newData[rowIndex],
              [name]: typeof value === "string" ? value.toUpperCase() : value
            };
            return newData;
          } else {
            // Update all rows (used for Select field outside table)
            return prev.map(row => ({
              ...row,
              [name]: typeof value === "string" ? value.toUpperCase() : value
            }));
          }
        });
        break;

      default:
        console.log("handleChange is not properly defined");
    }


  }, [formStatus]);

  // ADD NEW ROW
  const handleAddRow = useCallback(async () => {
    // 1. Form validity check
    const balFormInvForm = document.getElementById("balance-sheet-formula-dtl-form");
    if (balFormInvForm && !balFormInvForm.checkValidity()) {
      if (balFormInvForm.reportValidity) {
        balFormInvForm.reportValidity();
      } else {
        throw new Error("Please fill all the required details in Balance sheet formulae");
      }
      return;
    }

    // 2. Required top-level fields
    const validateFormFields = (fields) => {
      for (const [field, message] of Object.entries(fields)) {
        if (!formData[field]) {
          toast.error(message);
          return false;
        }
      }
      return true;
    };

    const isValid = validateFormFields({
      ass_lib_inc_exp_sch_flag: "Ass lib inc exp sch flag cannot be null",
      seq_no: "Seq No cannot be null",
    });
    if (!isValid) return;

    // 3. Validate each row of formDetailData
    for (let i = 0; i < formDetailData.length; i++) {
      const row = formDetailData[i];

      if (!["I", "L", "A", "E", "P", "S", "U"].includes(row.ass_lib_inc_exp_sch_flag)) {
        toast.error(`Row ${i + 1}: Ass Lib Inc Exp Sch Flag value should be ${`"I", "L", "A", "E", "P", "S", "U"`}`);
        return;
      }

      if (!["+", "-"].includes(row.plus_minus)) {
        toast.error(`Row ${i + 1}: Plus/Minus must be + or -`);
        return;
      }
    }

    // 4. Duplicate entry check
    const seen = new Set();
    for (const item of formDetailData) {
      const key = `${item.ass_lib_inc_exp_sch_flag}-${item.seq_no}-${item.bs_pl_flag}-${item.trans_year}`;
      if (seen.has(key)) {
        toast.error("Duplicate record found.");
        return;
      }
      seen.add(key);
    }

    // 5. Row-level validation (only when Update/Insert)
    const fields = [
      {
        name: "ass_lib_inc_exp_sch_flag",
        value: formDetailData[focusedRowIndex]?.ass_lib_inc_exp_sch_flag,
      },
      { name: "seq_no", value: formDetailData[focusedRowIndex]?.seq_no },
      { name: "bs_pl_flag", value: formDetailData[focusedRowIndex]?.bs_pl_flag },
    ];

    if (formStatus === "Update" || formStatus === "Insert") {
      const isChecked =
        formDetailData[focusedRowIndex]?.init_flag ===
        formDetailData[focusedRowIndex]?.ass_lib_inc_exp_sch_flag &&
        formDetailData[focusedRowIndex]?.init_seq_no ===
        formDetailData[focusedRowIndex]?.seq_no &&
        formDetailData[focusedRowIndex]?.init_bs_pl_flag ===
        formDetailData[focusedRowIndex]?.bs_pl_flag;

      if (!isChecked) {
        for (const f of fields) {
          const result = await getValidateData(
            f.name,
            f.value,
            otherQueryPera,
            focusedRowIndex
          );
          if (!result) return;
        }
      }
    }

    // 6. Add new row
    setFormDetailData((prevData) => [...prevData, formDetailInitData]);
  }, [formData, formDetailData, formStatus, focusedRowIndex, otherQueryPera, formDetailInitData]);


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
        handleCancel()
        return;
      }

      if (btnClicked === "Query") {
        setTotalRecordCount(queryData.count || totalRecordCount);
      }

      setFormData(queryData.mhfmData);

      // Set ass_lib_sch_exp_flag = init_flag for every item
      const updatedMdfmData = queryData.mdfmData.map((item) => ({
        ...item,
        init_flag: item.ass_lib_inc_exp_sch_flag,
        init_bs_pl_flag: item.bs_pl_flag,
        init_seq_no: item.seq_no,
        init_trans_year: item.trans_year,

      }));

      setFormDetailData(updatedMdfmData);
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
        //  isQueryReqOnInsertBtn={true}
        QUERY_API={APP_PROD_API.GET_BALANCE_SHEET_FORMULA_DETAIL}
        formName={""}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <Row>
              <Col xl={12}>
                <div className='box-border p-3 m-auto'>
                  <Row>

                    <Col xl={10} className='m-auto'>

                      <Row>
                        <Col xl={3}>
                          <TextField
                            required
                            label="Formula ID"
                            type="number"
                            name="formula_id"
                            value={formData.formula_id || ""}
                            disabled
                            maxLength={11}
                            onChange={(e) => handleChange("formData", "formula_id", e.target.value)}
                          />
                        </Col>
                        <Col xl={3}>
                          <TextField
                            required
                            label="Ass Lib Inc Exp Sch Flag"
                            type="text"
                            name="ass_lib_inc_exp_sch_flag"
                            value={formData.ass_lib_inc_exp_sch_flag || ""}
                            maxLength={1}
                            onChange={(e) => handleChange("formData", "ass_lib_inc_exp_sch_flag", e.target.value)}
                            onBlur={(e) => {
                              if (formStatus === 'Insert' || formStatus === "Update") {
                                validateRequiredField(e, "Ass Lib Inc Exp Sch Flag");
                                const isValid = validateForFlag(e.target.value);
                                if (!isValid) {

                                  return;
                                }
                                else {
                                  //console.log('validate')
                                }
                              }
                            }}
                          />
                        </Col>
                        <Col className='mt-2' xl={5}>
                          <RadioGroup
                            //style
                            className="button-group-wrapper box-border p-2 d-flex justify-content-evenly"
                            options={[
                              { text: "B Sheet", value: "B" },
                              { text: "P/L", value: "P" },
                            ]}
                            onChange={(e) => handleChange("formData", "bs_pl_flag", e.target.value)}
                            checked={formData?.bs_pl_flag}
                          />
                        </Col>
                      </Row>
                    </Col>
                  </Row>

                  <Row className='mt-2'>
                    <Col xl={10} className='m-auto'>

                      <Row>
                        <Col xl={3}>
                          <TextField
                            // required
                            label="Seq No"
                            type="text"
                            name="seq_no"
                            value={formData.seq_no || ""}
                            maxLength={7}
                            onChange={(e) => handleChange("formData", "seq_no", e.target.value)}
                            onDoubleClick={() => handleDoubleClick("seqh", seqhHelpListHeader)}
                            onBlur={(e) => {
                              console.log('onblur called')
                              if (formStatus === 'Insert' || formStatus === 'Update' || formStatus === 'Search') {
                                handleValidate(e, null, 'seq_no')
                              }
                              // handleValidate(e, rowIndex, 'seq_no')
                            }}
                          />
                        </Col>

                        <Col className='mt-4' xl={7}>
                          <TextField
                            // required
                            type="text"
                            name="seqh"
                            value={formData.seqh || ""}
                            maxLength={80}
                            disabled
                            onChange={(e) => handleChange("formData", "seqh", e.target.value)}
                          />
                        </Col>
                      </Row>
                    </Col>
                  </Row>

                </div>
              </Col>
            </Row>
            <BalanceSheetFormulaDtl
              formDetailData={formDetailData}
              formStatus={formStatus}
              handleChange={handleChange}
              handleAddRow={handleAddRow}
              handleDelete={handleDeleteRow}
              setActiveRowIndex={setActiveRowIndex}
              focusedRowIndex={focusedRowIndex}
              validateRequiredField={validateRequiredField}
              validateForFlag={validateForFlag}
              validateForPlus={validateForPlus}
              handleHelpList={handleHelpList}
              setHelpFor={setHelpFor}
              setHelpListHeader={setHelpListHeader}
              setFocusedRowIndex={setFocusedRowIndex}


            />
          </TabPane>

          {helpList && (
            <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
              <ModalHeader toggle={toggleHelpModal}></ModalHeader>
              <ModalBody>
                <HelpList
                  // formStatus={formStatus='Insert'}
                  formStatus={'Insert'}
                  helpFor={helpFor}
                  apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_BALANCE_SHEET_FORMULA_DETAIL}`}
                  helpListHeader={helpListHeader}
                  handleHelpList={handleHelpList}
                  onSelectHelpItem={onSelectHelpItem}
                  queryPera={{ needAppGlobalData: 'Y' }}
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

export default BalanceSheetFormula;

