import React, { useEffect, useRef } from "react";
import { Modal, ModalBody, ModalHeader, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import ExpenseHeader from "./expense_vchr_header";
import ExpenseDetail from "./expense_vchr_detail";
import {
  calculateTransAmt,
  createSearchPayloadForExpSpecificSearch,
  expenseFormControlData,
  genCreateGSTEntries,
  getExpVchReport,
  makeProcInsertDataEntry,
  tdfmtranInitDataTemplate,
  thfmtranInitDataTemplate,
} from "./expense_voucher_helper";
import ExpenseGstDetail from "./expense_gst_canvas";
import { useDispatch, useSelector } from "react-redux";
import { formatOptions } from "../../../../lib";
import { APP_PROD_API } from "../../../../utils/api";
import {
  dateFormatter,
  validateForm,
  validateFormBlock,
} from "../../../../utils/fn";
import HelpList from "../../../../components/HelpList";
import toast from "react-hot-toast";
import { fetchAppData } from "../../../../utils/fetchUtils";
import ConfirmationModal from "../../../../components/Modals/confirmationModal";
import { useLocation } from "react-router-dom";
import Loader from "../../../../components/GenricComponents/Loader";
import {
  selectLoader,
  setLoader,
} from "../../../../features/loader/loaderSlice";

const ExpenseVoucher = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const {
    formStatus,
    setFormStatus,
    handleOperation,
    releaseFormStatus,
    searchQuery,
    setSearchQuery,
  } = useFormStatus();

  const updateFormData = useRef({ expHdr: {}, expDtl: [], deletedExp: [] });

  // GLOBAL USERDATA
  const { user } = useSelector((state) => state.auth);

  // FORM DATA
  const [thfmtranData, setThfmTranData] = useState({
    ...thfmtranInitDataTemplate,
  });

  const [tdfmtranData, setTdfmTranData] = useState([
    { ...tdfmtranInitDataTemplate },
  ]);

  const [formControlData, setFormControlData] = useState([
    { ...expenseFormControlData },
  ]);

  const [gstFormData, setGSTFormData] = useState({});
  const [parameter, setParameter] = useState({
    p_voucher_id: "",
    common_narr: "",
    p_sect: "",
    p_vch_dt: "",
    narr: "",
  });

  const [focusedRowIndex, setFocusedRowIndex] = useState(0); // CONTAINING DETAIL BLOCK CURRENT CURSOR/POINTER INDEX

  const [selectedPartyCode, setSelectedPartyCode] = useState();

  const location = useLocation();

  const tabs = ["Expense Voucher"];

  // DROPDOWN LIST DATA CONTAINING STATE
  const [poCategory, setPoCategory] = useState([]);
  const [registerType, setRegisterType] = useState([]);
  const [section, setSection] = useState([]);
  const [purpose, setPurpose] = useState([]);

  // FOR VIEW GST MODAL
  const [isGSTModalOpen, setIsGSTModalOpen] = useState(false);
  const toggleGSTModal = () => setIsGSTModalOpen(!isGSTModalOpen);

  // FOR HELP LIST
  const [helpList, setHelpList] = useState(false); // this will switch helpList true = on
  const [helpFor, setHelpFor] = useState(""); //fieldName for helpList you want
  const [helpListHeader, setHelpListHeader] = useState([]);

  // FOR VIEW GST MODAL
  const [isHelpModelOpen, setIsHelpModelOpen] = useState();
  const toggleHelpModal = () => setHelpList(!helpList);

  const [confirmationModal, setConfirmationModal] = useState(false);
  const [confirmationConfig, setConfirmationConfig] = useState({});

  const [loadingGst, setLoadingGst] = useState(false);

  const hasAutoCreatedRef = useRef(false);

  const formLoading = useSelector(selectLoader("form"));
  const dispatch = useDispatch();

  useEffect(() => {
    const autoCreateGst = async () => {
      const isFromItcSession =
        sessionStorage.getItem("FROM_ITC_AUTO_CREATE") === "Y";

      if (
        isFromItcSession &&
        location.state?.openMode === "INSERT" &&
        location.state?.from === "ITC" &&
        !hasAutoCreatedRef.current
      ) {
        hasAutoCreatedRef.current = true;

        // CLEAR FLAG IMMEDIATELY
        sessionStorage.removeItem("FROM_ITC_AUTO_CREATE");

        setFormStatus("Insert");
        setLoadingGst(true);

        // GIVE REACT A BREATH TO PAINT LOADER
        await new Promise((resolve) => setTimeout(resolve, 0));

        try {
          await genCreateGSTEntries({
            gstFormData: {
              v_code2: location.state.createGstWithItc,
              v_name2: location.state.partyName,
              bill_no: location.state.billNo,
              bill_date: location.state.billDt,
              gst_id: location.state.gst_id,
            },
            division_id: location.state.divisionId,
            setThfmTranData,
            setTdfmTranData,
            setFormControlData,
          });
        } finally {
          setLoadingGst(false);
        }
      }
    };

    autoCreateGst();
  }, []);

  useEffect(() => {
    const fetchConstantList = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.GET_EXP_LIST_CONSTANTS
          }?formStatus=${formStatus}&appDivisionId=${
            user.global_division_id
          }&appFinYear=${user.global_fin_year}`,
          {
            method: "GET",
            credentials: "include",
          },
        );
        if (response.status === 200) {
          const data = await response.json();
          setPoCategory([
            { value: "", label: "" },
            ...formatOptions(
              data.poCategory || [],
              "po_cat_prefix",
              "po_cat_description",
            ),
          ]);
          setSection([
            { value: "", label: "" },
            ...formatOptions(data.sections || [], "section_id", "section_desc"),
          ]);
          setPurpose([
            { value: "", label: "" },
            ...formatOptions(data.purposes || [], "code", "description"),
          ]);
          // setRegisterType([{value:'', label: ''}, ...formatOptions(data.registerList || [], "register_type","register_type")]);

          // todo: may be it whould only need in formStatus Insert so Check it in when you do Query work
          setThfmTranData((prev) => {
            return {
              ...prev,
              sect: data.sect,
              section: data.sections[0].section_id,
            };
          });

          // set current system date into voucher_dt field
          if (formStatus === "Insert") {
            setFormControlData((prev) => {
              return {
                ...prev,
                curryear: user.global_fin_year || "2017",
                dest_type: formStatus == "Query" ? "PREVIEW" : "", // found from when new record instance
              };
            });

            // thfmtran block pre-insert logic ✅
            setThfmTranData((prev) => {
              return {
                ...prev,
                voucher_dt: new Date().toISOString().split("T")[0],
                trans_year: formControlData.curryear || user.global_fin_year,
                division_id: user.global_division_id || 3,
                curr_code: data?.curr_code,
                exchang_rt: data?.exchang_rt,
                voucher_id: Number(data?.maxVoucherId ?? 99998) + 1,
                voucher_no: `~${Number(data?.maxVoucherId ?? 99998) + 1}`,
              };
            });
            setParameter((prev) => {
              return {
                ...prev,
                common_narr: null,
              };
            });
          }

          //todo: implement that prompt shows which is use in userInsert
          //todo: implement when new record instance preview logic
        }
      } catch (err) {
        console.log(err);
      }
    };

    if ((formStatus && formStatus == "Insert") || formStatus == "Query") {
      fetchConstantList();
      if (formStatus === "Insert" && location.state?.from !== "ITC") {
        if (
          !confirm(
            `Please make sure that Bill has been captured in ITC
              form else auto entries will not be created. You shall
              not be able to proceed. Are you sure to continue ?
            `,
          )
        ) {
          formCleanup();
        }
      }
    }
  }, [formStatus]);

  // SETUP PARTY CODE AND THERE RELATED FIELD ON SELECTIN USING HELP OR MANUALLY
  const handlePartyCode = (data, manual = false) => {
    setSelectedPartyCode(data.acc_no);
    if (!manual) {
      setThfmTranData((prev) => {
        return { ...prev, party_code: data.acc_no, party_name: data.acc_desc };
      });
    }

    setThfmTranData((prev) => {
      return {
        ...prev,
        party_code: data.acc_no,
        party_name: data.acc_desc,
        party_gst_no: data.gst_no,
        gst_registered: data.whether_gst_registered_dlr,
      };
    });
  };

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  // HELP LIST HANDLING
  const handleHelpList = (show) => {
    setHelpList(show);
  };

  // HELP LIST OPENING
  const openHelpList = (fieldName, helpListHeader, index = null) => {
    if (["Insert", "Update"].includes(formStatus)) {
      setHelpFor(fieldName);
      setHelpListHeader(helpListHeader);
      setHelpList(true);
      // setRecordIndex(index);
    }
  };

  // SELECTING ITEM FROM HELPLIST
  const onSelectHelpItem = (data) => {
    //console.log(data);
    let index = focusedRowIndex;

    if (helpFor === "parties") {
      handlePartyCode(data);
    } else if (helpFor === "acc_no") {
      setTdfmTranData((prevData) => {
        const newData = [...prevData];
        const prevRow = newData[index];
        const updatedRow = {
          ...prevRow,
          acc_no: data.acc_no,
          acc_desc: data.acc_desc,
        };
        newData[index] = updatedRow;
        if (
          formStatus === "Update" &&
          (prevRow.acc_no !== data.acc_no || prevRow.acc_desc !== data.acc_desc)
        ) {
          updateFormData.current.expDtl ||= [];
          const alreadyUpdated = updateFormData.current.expDtl.find(
            (r) => r.srl_no === updatedRow.srl_no,
          );
          if (alreadyUpdated) {
            alreadyUpdated.acc_no = data.acc_no;
            alreadyUpdated.acc_desc = data.acc_desc;
          } else {
            updateFormData.current.expDtl.push({
              srl_no: updatedRow.srl_no,
              acc_no: data.acc_no,
              acc_desc: data.acc_desc,
            });
          }
        }
        return newData;
      });
    } else if (helpFor === "cost_centre") {
      setTdfmTranData((prevData) => {
        const newData = [...prevData];
        const prevRow = newData[index];
        const updatedRow = {
          ...prevRow,
          cost: data.prefix,
          cost_pre: data.prefix,
          cost_centr: data.code,
          cost_desc: data.description,
        };
        newData[index] = updatedRow;

        if (
          formStatus === "Update" &&
          (prevRow.cost !== data.prefix ||
            prevRow.cost_centr !== data.code ||
            prevRow.cost_desc !== data.description)
        ) {
          updateFormData.current.expDtl ||= [];
          const alreadyUpdated = updateFormData.current.expDtl.find(
            (r) => r.srl_no === updatedRow.srl_no,
          );
          if (alreadyUpdated) {
            alreadyUpdated.cost = data.prefix;
            alreadyUpdated.cost_pre = data.prefix;
            alreadyUpdated.cost_centr = data.code;
            alreadyUpdated.cost_desc = data.description;
          } else {
            updateFormData.current.expDtl.push({
              srl_no: updatedRow.srl_no,
              cost: data.prefix,
              cost_pre: data.prefix,
              cost_centr: data.code,
              cost_desc: data.description,
            });
          }
        }

        return newData;
      });
    } else if (helpFor === "wo_no") {
      setThfmTranData((prev) => {
        const updated = {
          ...prev,
          wo_no: data.po_no,
          po_id: data.po_id,
        };

        if (
          formStatus === "Update" &&
          (prev.wo_no !== data.po_no || prev.po_id !== data.po_id)
        ) {
          updateFormData.current.expHdr = {
            ...updateFormData.current.expHdr,
            wo_no: data.po_no,
            po_id: data.po_id,
          };
        }

        return updated;
      });
    } else if (helpFor === "itc_ref") {
      setGSTFormData((prev) => {
        return {
          ...prev,
          ...data,
          itc_ref: data?.itc_sr_no,
          disp_party: data?.v_name,
          bill_date: data?.doc_date,
          bill_no: data?.doc_no,
        };
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let payload;
    let method = "POST";

    const isValidFormData = validateForm(
      "exp-thfmtran-form",
      "Bank Voucher Header Form",
    );
    if (!isValidFormData) {
      toast.error("Please fill required header data first");
      return;
    }

    const isValidNarration = validateForm(
      "exp-tdmftran-form",
      "Bank Voucher Detail Form",
    );
    if (!isValidNarration) {
      return;
    }

    const { party_amt } = formControlData;
    const { exp_work } = thfmtranData;

    const isContraBuild = makeProcInsertDataEntry(
      thfmtranData,
      tdfmtranData,
      user,
      formControlData,
    );

    if (formStatus === "Update") {
      // let getNewExpEntries = tdfmtranData.filter(
      //   (item) => item.voucher_id === "",
      // );

      let getNewExpEntries = tdfmtranData.filter(
        (item) => !item.voucher_id,
      );
      let updatedDetails = updateFormData.current.expDtl.filter(
        (item) => item?.srl_no != "",
      );

      method = "PUT";
      payload = {
        updatedExpHdr: {
          ...updateFormData.current.expHdr,
          trans_amt: formControlData.party_amt,
          voucher_id: thfmtranData.voucher_id,
        },
        updatedExpEntries: updatedDetails || [],
        deletedExpEntries: updateFormData.current.deletedExp || [],
        newExpEntries: getNewExpEntries || [],
        expMasterData: thfmtranData,
      };
    } else {
      payload = {
        expenseVoucher: {
          ...thfmtranData,
          trans_amt: party_amt,
          trans_type: exp_work === "E" ? "P0" : exp_work,
        },
        expenseDetails: tdfmtranData,
        procInsertContra: {
          ...isContraBuild?.contra,
          tran_type: exp_work === "E" ? "P0" : exp_work,
        },
      };
    }

    //console.log('form Payload :: ', payload)
    //console.log('tdfmtran data::', tdfmtranData)

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.POST_EXPENSE_VOUCHER_DATA
        }?form_status=${formStatus}&userId=${user.id}`,
        {
          method,
          body: JSON.stringify(payload),
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      if (response.ok) {
        toast.success(`Record saved successfully`);
        const responseData = await response.json();
        //console.log(responseData)
        if (formStatus == "Insert") {
          showGeneratedVouhcerNo(responseData?.gen_voucher_no);
        }
        formCleanup();
      } else {
        const errorMsg = await response.json();
        toast.error(errorMsg.message);
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error || "Something went wrong during submission");
    }
  };

  // ADD NEW ROW
  function handleAddRow() {
    setTdfmTranData((prevData) => {
      const maxSrlNo = prevData.reduce(
        (max, row) => Math.max(max, Number(row.srl_no || 0)),
        0,
      );

      return [
        ...prevData,
        {
          ...tdfmtranInitDataTemplate,
          srl_no: maxSrlNo + 1,
          row_id: Date.now(),
        },
      ];
    });
  }


  const handleDeleteRow = (data, row_id) => {
    const rowToDelete = tdfmtranData.find((row) => row.row_id === row_id);
    //console.log(row_id)

    if (rowToDelete?.srl_no) {
      updateFormData.current.deletedExp ||= [];

      const alreadyDeleted = updateFormData.current.deletedExp.find(
        (d) => d.srl_no === rowToDelete.srl_no,
      );

      // Avoid duplicates
      if (!alreadyDeleted) {
        updateFormData.current.deletedExp.push({ srl_no: rowToDelete.srl_no });
      }
    }

    // Now remove it from the state
    setTdfmTranData((prevData) =>
      prevData.filter((row) => row.row_id !== row_id),
    );
  };


  function handleOffset(data) {
    setCurrentRecordNo(data);
  }

  
  // CLEANUP FORM WHILE IN INSERT
  const formCleanup = () => {
    setThfmTranData({ ...thfmtranInitDataTemplate });
    setTdfmTranData([tdfmtranInitDataTemplate]);
    // if (formStatus === 'Insert') {
    //   // Doing this to call the useEffect as per new When new Form Instance and user insert logic required
    //   setFormStatus('Insert');
    // }else{0
    //   setFormStatus('')
    // }
    setFormControlData({ ...expenseFormControlData });
    setGSTFormData({});
    setParameter({ p_voucher_id: "", common_narr: "" });
    // releaseFormStatus();
  };

  const handleCancel = useCallback(() => {
    formCleanup();
    if (formStatus !== "Insert") {
      releaseFormStatus();
    }
  }, []);

  const runHdrValidation = () => {
    const isValidFormData = validateFormBlock(
      "exp-thfmtran-form",
      "Expense Header",
    );
    if (!isValidFormData) {
      return false;
    }
    return true;
  };

  // common handle change for both hdr and detail
  const handleChange = (event, name, value, index = null, block = null) => {
    if (!["Insert", "Update", "Search"].includes(formStatus)) {
      return;
    }
    if (block == "tdfmtran") {
      let isValidHdrBlock = runHdrValidation();
      if (!isValidHdrBlock) {
        return;
      }
    }
    const cursorPosition = event?.target?.selectionStart;
    let newVal = value;

    if (typeof value !== "number" && typeof value === "string") {
      newVal = newVal.toUpperCase();
    }

    switch (block) {
      case "thfmtran":
        setThfmTranData((prev) => {
          const updated = { ...prev, [name]: newVal };

          // Only track changes in Update mode
          if (formStatus === "Update" && prev[name] !== newVal) {
            updateFormData.current.expHdr = {
              ...(updateFormData.current.expHdr || {}),
              [name]: newVal,
            };
          }

          return updated;
        });
        break;

      case "tdfmtran":
        setTdfmTranData((prevData) => {
          const newData = [...prevData];
          const prevRow = newData[index];
          const updatedRow = { ...prevRow, [name]: newVal };
          newData[index] = updatedRow;

          if (formStatus === "Update" && prevRow[name] !== newVal) {
            updateFormData.current.expDtl ||= [];

            const alreadyUpdated = updateFormData.current.expDtl.find(
              (r) => r.srl_no === updatedRow.srl_no,
            );
            if (alreadyUpdated) {
              alreadyUpdated[name] = newVal;
            } else {
              updateFormData.current.expDtl.push({
                srl_no: updatedRow.srl_no,
                [name]: newVal,
              });
            }
          }

          // Recalculate party amount if amount/db_cr changed
          if (name === "amount" || name === "db_cr") {
            const totalAmount = calculateTransAmt(newData);
            setFormControlData((prev) => ({
              ...prev,
              party_amt: totalAmount,
            }));
          }

          return newData;
        });
        break;

      default:
        break;
    }

    // Restore cursor position
    if (
      event?.target &&
      event.target.tagName === "INPUT" &&
      !["number", "radio", "checkbox", "date"].includes(event.target.type)
    ) {
      setTimeout(() => {
        event.target.setSelectionRange(cursorPosition, cursorPosition);
      }, 0);
    }
  };

  // SETUP QUERY DATA AT ON CLICK QUERY BTN
  const setupQueryData = useCallback(
    (data, btnClicked) => {
      // for seting loader
      if (btnClicked == "Query") {
        dispatch(setLoader({ key: "form", value: true }));
      }
      if (btnClicked == "Query" && data.count == 0) {
        toast.error(data.message);
        handleCancel();
        return;
      }

      setThfmTranData((prev) => ({ ...data.expenseVoucher }));
      if (data.type === "found") {
        const hasDirectory = data?.expenseDetail?.length > 0;
        setThfmTranData((prev) => ({
          ...prev,
          bill_dt: dateFormatter(data.expenseVoucher.bill_dt) || "",
          voucher_dt: dateFormatter(data.expenseVoucher.voucher_dt) || "",
          // party_amt: data.expenseVoucher.trans_amt,
        }));
        setTdfmTranData(
          hasDirectory
            ? data.expenseDetail
            : [expenseDetailInitialFormDataTemplate],
        );
        setFormControlData((prev) => ({
          ...prev,
          party_amt: data.expenseVoucher.trans_amt,
        }));
      }
      if (btnClicked === "Query") {
        setTotalRecordCount(data.count);
      }
      if (btnClicked == "Query") {
        setTimeout(() => {
          dispatch(setLoader({ key: "form", value: false }));
        }, 0);
      }
    },
    [formStatus, currentRecordNo],
  );

  const handleSearch = async () => {
    try {
      setTotalRecordCount(0);
      setCurrentRecordNo(0);
      const searchPayload =
        createSearchPayloadForExpSpecificSearch(thfmtranData);
      const queryList = new URLSearchParams(searchPayload);

      if ([...queryList].length === 0) {
        toast.error("Please enter search criteria");
        return;
      }

      setSearchQuery(searchPayload);

      const data = await fetchAppData(
        `${APP_PROD_API.GET_EXP_FORM_DATA}?formStatus=${formStatus}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&${queryList}`,
      );

      if (data?.count === 0) {
        toast.error("No matching data record found");
        return;
      }

      setupQueryData(data, "Query");
      handleOperation("Query");
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(error?.message || "Some error occurred");
    }
  };

  //console.log("gstCanFormData :: ", gstFormData)

  // Voucher Authorization logic
  const handleAuthVch = async () => {
    // //console.log('data need to be authorize',formData?.ref_id)
    const {
      memo_vchr,
      posted,
      cancel,
      trans_type,
      section,
      pay_rec,
      voucher_id,
    } = thfmtranData;
    const { id } = user;

    if (memo_vchr === "Y") {
      alert("Memorandom Voucher cannot be Authorise");
      return;
    }
    if (cancel === "Y") {
      alert("Voucher is Cancelled, cannot Post Voucher.");
      return;
    }
    if (posted === "Y") {
      alert("Voucher has been already Posted, no modifications possible.");
      return;
    }

    if (thfmtranData?.posted === "N") {
      if (confirm("Do you want to Post this Expense Voucher? ")) {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.AUTHORIZED_EXP_VCH
          }`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              vchrData: {
                id,
                posted: "Y",
                division_id: user?.global_division_id,
                trans_year: user?.global_fin_year,
                trans_type,
                section,
                pay_rec,
                voucher_id,
              },
            }),
            credentials: "include",
          },
        );
        if (response.ok) {
          const result = await response.json();
          toast.success(result?.message);
          setThfmTranData((prev) => ({
            ...prev,
            posted: "Y",
            // voucher_dt: DateTime.fromISO(result?.voucher_dt).toFormat("yyyy-MM-dd"),
            // voucher_no: result?.voucher_no,
          }));
        } else {
          const result = await response.json();
          toast.error(result?.message);
        }
      }
    }
  };

  // Voucher Cancellation logic
  const handleCancelVch = async () => {
    let { voucher_id, memo_vchr, posted, cancel } = thfmtranData;
    const { id } = user;

    if (posted === "Y") {
      alert(
        "This Expense Voucher is already posted, no modifications possible.",
      );
      return;
    }

    let newCancelValue = cancel;

    if (cancel === "Y") {
      const confirmRevert = confirm(
        "Voucher already cancelled. Do you want to revert the cancelled Expense Voucher?",
      );
      if (confirmRevert) {
        newCancelValue = "N";
      } else {
        return; // don't proceed if user says no
      }
    } else {
      const confirmCancel = confirm(
        "Do you really want to cancel this Expense Voucher?",
      );
      if (confirmCancel) {
        newCancelValue = "Y";
      } else {
        return; // don't proceed if user says no
      }
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.CANCELLATION_EXP_VCH
        }`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vchrData: { voucher_id, id, cancel: newCancelValue },
          }),
          credentials: "include",
        },
      );

      if (response.ok) {
        const result = await response.json();
        toast.success(result?.message || "Voucher updated successfully.");
        setThfmTranData((prev) => ({ ...prev, cancel: newCancelValue }));
      } else {
        toast.error("Failed to update voucher status.");
      }
    } catch (error) {
      console.error("Error updating voucher:", error);
      toast.error("An error occurred while updating the voucher.");
    }
  };

  const onSuccessConfirmation = useCallback(
    (confirm, vch_no) => {
      if (confirm && vch_no) {
        //console.log('generated_voucher_no is :', vch_no)
      }
      setConfirmationConfig({});
      setConfirmationModal(false);
    },
    [thfmtranData],
  );

  const showGeneratedVouhcerNo = useCallback((vch_no) => {
    setConfirmationConfig({
      title: "Voucher No. generated",
      description: `New Expense voucher no generated is ${vch_no}`,
      uniqKey: "vch_no",
    });
    setConfirmationModal(true);
  }, []);

  console.log("Expense Voucher Detail:: ", tdfmtranData);

  return (
    <React.Fragment>
      {loadingGst && <Loader overlayContainer />}
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
        handleOffset={handleOffset}
        QUERY_API={APP_PROD_API.GET_EXP_FORM_DATA}
        formName={""}
        isQueryReqOnInsertBtn={false}
        handlePrint={() => getExpVchReport(thfmtranData, formStatus, dispatch)}
        handleSearch={handleSearch}
        formPayload={{ searchQuery }}
        setSearchQuery={setSearchQuery}
        handleAuthRecord={handleAuthVch}
        authority={{
          insert: "Y",
          update:
            thfmtranData?.posted === "Y" || thfmtranData?.cancel === "Y"
              ? "N"
              : "Y",
          message:
            thfmtranData?.posted === "Y"
              ? "Voucher has been already Posted, no modifications possible."
              : thfmtranData?.cancel === "Y"
                ? "Voucher has been Cancelled, no modifications possible."
                : "",
        }}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            {formLoading && <Loader overlayContainer />}
            <ExpenseHeader
              formData={thfmtranData}
              formStatus={formStatus}
              handleChange={(e, name, value) =>
                handleChange(e, name, value, null, "thfmtran")
              }
              openGSTCanvas={() => {
                setIsGSTModalOpen(true);
              }}
              section={section}
              poCategory={poCategory}
              setParameter={(data) =>
                setParameter((prev) => {
                  return { ...prev, ...data };
                })
              }
              handleHelpList={handleHelpList}
              openHelpList={openHelpList}
              onSelectHelpItem={onSelectHelpItem}
              formControlData={formControlData}
              setThfmTranData={setThfmTranData}
            />
            <ExpenseDetail
              formData={tdfmtranData}
              thfmtranData={thfmtranData}
              setTdfmTranData={setTdfmTranData}
              formStatus={formStatus}
              formControlData={formControlData}
              handleChange={(e, name, value, index) =>
                handleChange(e, name, value, index, "tdfmtran")
              }
              handleAddRow={handleAddRow}
              purpose={purpose}
              registerType={registerType}
              handleHelpList={handleHelpList}
              openHelpList={openHelpList}
              onSelectHelpItem={onSelectHelpItem}
              focusedRowIndex={focusedRowIndex}
              setFocusedRowIndex={(data) => setFocusedRowIndex(data)}
              parameter={parameter}
              setParameter={setParameter}
              handleDeleteRow={handleDeleteRow}
              updateFormData={updateFormData}
              handleCancelVch={handleCancelVch}
            />
            {isGSTModalOpen && (
              <ExpenseGstDetail
                formData={gstFormData}
                setGSTFormData={setGSTFormData}
                formStatus={formStatus}
                handleChange={handleChange}
                toggleModal={toggleGSTModal}
                isModalOpen={isGSTModalOpen}
                openHelpList={openHelpList}
                division_id={user?.global_division_id}
                setTdfmTranData={setTdfmTranData}
                setThfmTranData={setThfmTranData}
                setFormControlData={setFormControlData}
              />
            )}

            {helpList && (
              <Modal
                id="help-list-modal"
                isOpen={helpList}
                toggle={toggleHelpModal}
                size="lg"
              >
                <ModalHeader toggle={toggleHelpModal}></ModalHeader>
                <ModalBody>
                  <HelpList
                    formStatus={formStatus}
                    helpFor={helpFor}
                    apiUrl={`${import.meta.env.VITE_BASE_API_URL}${
                      APP_PROD_API.GET_EXP_FORM_DATA
                    }`}
                    helpListHeader={helpListHeader}
                    handleHelpList={handleHelpList}
                    onSelectHelpItem={onSelectHelpItem}
                    queryPera={{ needAppGlobalData: "Y" }}
                    whereClause={
                      helpFor === "wo_no"
                        ? { f_party_code: thfmtranData.party_code }
                        : {}
                    }
                  />
                </ModalBody>
              </Modal>
            )}

            {confirmationModal && (
              <ConfirmationModal
                isOpen={confirmationModal}
                onClose={() => {
                  onSuccessConfirmation(false, confirmationConfig);
                  setConfirmationModal(false);
                }}
                {...confirmationConfig}
                onSuccess={() =>
                  onSuccessConfirmation(true, confirmationConfig)
                }
              />
            )}
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default ExpenseVoucher;
