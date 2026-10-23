import React from 'react'
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormLoading } from '../../../../hooks/useFormLoading';
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState, useEffect } from "react";
import General from './general_param_General';
import Material from './general_param_Material';
import Production from './general_param_Production';
import Sales from './general_param_Sales';
import Finance from './general_param_Finance';
import Finance1 from './general_param_finance1';
import Personnel from './general_param_Personnel';
import Personnel1 from './general_param_Personnel1';
import Personnel2 from './general_param_Personnel2';
import Personnel3 from './general_param_Personnel3';
import Personnel4 from './general_parameter_personnel4';
import { formatOptions } from '../../../../lib';
import { MOFMPARMInitialFormDataTemplate, MOITPARMInitialFormdataTemplate, MOMMPARMInitialFormDataTemplate, MOPRPARMInitialFormDataTemplate, MOPMPARMInitialFormDataTemplate, MOSMPARMInitialFormDataTemplate } from './general_param_helpers';
import { APP_PROD_API } from "../../../../utils/api"
import HelpList from '../../../../components/HelpList';
import { Modal, ModalHeader, ModalBody } from "reactstrap"
import toast from 'react-hot-toast';



const GeneralParameters = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({});
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus } = useFormStatus();
  const { loading, setLoading, formLoading, setFormLoading } = useFormLoading();



  const [MOITPARM, setMOITPARM] = useState(MOITPARMInitialFormdataTemplate)
  const [MOMMPARM, setMOMMPARM] = useState(MOMMPARMInitialFormDataTemplate);
  const [MOPRPARM, setMOPRPARM] = useState(MOPRPARMInitialFormDataTemplate);
  const [MOSMPARM, setMOSMPARM] = useState(MOSMPARMInitialFormDataTemplate);
  const [MOFMPARM, setMOFMPARM] = useState(MOFMPARMInitialFormDataTemplate);
  const [MOPMPARM, setMOPMPARM] = useState(MOPMPARMInitialFormDataTemplate);

  // DROPDOWN DATA 

  const [excise, setExcise] = useState([]);
  const [floor, setFloor] = useState([]);
  const [party, setParty] = useState([]);
  const [service, setService] = useState([]);
  const [receive, setReceive] = useState([]);

  // for production
  const [excise1, setExcise1] = useState([]);
  const [floor1, setFloor1] = useState([]);
  const [scrapYard, setScrapYard] = useState([]);
  const [serviceCell, setServiceCell] = useState([]);

  // for finance 

  const [defaultCost, setDefaultCost] = useState([]);
  const [defaultPurp, setDefaultPurp] = useState([])

  // for sales 

  const [stockDesc, setStockDesc] = useState([])

  // for Personnel 

  const [basic, setBasic] = useState([])
  const [da, setDa] = useState([])
  const [hra, setHra] = useState([])
  const [perPay, setPerPay] = useState([])
  const [pfund, setPfund] = useState([])
  const [vpf, setVpf] = useState([])
  const [esi, setEsi] = useState([])
  const [arrear, setArrear] = useState([])
  const [negative, setNegative] = useState([])
  const [tmc, setTmc] = useState([])
  const [lmc, setLmc] = useState([])
  const [ytdTds, setYtdTds] = useState([])
  const [ytdSur, setYtdSur] = useState([])

  // for personnel1   

  const [MnthlyTax, setMonthlyTax] = useState([])
  const [MnthlySurch, setMonthlySurch] = useState([])
  const [ytdTax, setYtdTax] = useState([])
  const [ytdSurch, setYtdSurch] = useState([])
  const [deathBenv, setDeathBenv] = useState([])
  const [actual, setActual] = useState([])
  const [paydays, setPaydays] = useState([])
  const [conveyance, setConveyance] = useState([])
  const [epf, setEpf] = useState([])
  const [esiProd, setEsiProd] = useState([])
  const [prodInc, setProdInc] = useState([])

  // for personnel2 

  const [OtherDed, setOtherDed] = useState([])
  const [EsiWages, setEsiWages] = useState([])
  const [FfDay, setFfDay] = useState([])
  const [ConveyanceEd, setConveyanceEd] = useState([])
  const [Tmcoin, setTmCoin] = useState([])
  const [Month, setMonth] = useState([])
  const [overtime, setOvertime] = useState([])
  const [society, setSociety] = useState([])
  const [canteen, setCanteen] = useState([])
  const [night, setNight] = useState([])

  const [adjPaydayp, setAdjPaydayp] = useState([])
  const [adjPaydayd, setAdjPaydayd] = useState([])
  const [spf, setSpf] = useState([])
  const [education, setEducation] = useState([])
  const [bus, setBus] = useState([])
  const [bonds, setBonds] = useState([])
  const [ca, setCa] = useState([])
  const [leave, setLeave] = useState([])
  const [latehrs, setLatehrs] = useState([])

  // for Personnel3 

  const [gratuity, setGratuity] = useState([])
  const [stdded, setStdded] = useState([])
  const [esiot, setEsiot] = useState([])
  const [overtimeatnd, setOvertimeatnd] = useState([])
  const [fpf, setFpf] = useState([])
  const [special, setSpecial] = useState([])
  const [conveyanceEd1, setConveyanceEd1] = useState([])
  const [wash, setWash] = useState([])
  const [svpf, setSvpf] = useState([])

  const [gured, setGured] = useState([])
  const [adhoc, setAdhoc] = useState([])
  const [otherall, setOtherall] = useState([])
  const [ccaed, setCcaed] = useState([])
  const [basicarrear, setBasicarrear] = useState([])
  const [overtimeEd, setOvertimeEd] = useState([])
  const [superAtt, setSuperAtt] = useState([])

  // for personnel4  

  const [attendance, setAttendance] = useState([])
  const [payment, setPayment] = useState([])
  const [spay, setSpay] = useState([])
  const [comm, setComm] = useState([])
  const [loan, setLoan] = useState([])
  const [others, setOthers] = useState([])
  const [leaseAcc, setLeaseAcc] = useState([])
  const [imprest, setImprest] = useState([])
  const [proftax, setProftax] = useState([])
  const [medIns, setMedIns] = useState([])
  const [monthlyatnd, setMonthlyatnd] = useState([])

  const [PerkEd, setPerkEd] = useState([])
  const [leaseArr, setLeaseArr] = useState([])
  const [rent, setRent] = useState([])
  const [reslease, setReslease] = useState([])
  const [vrsAllow, setVrsAllow] = useState([])
  const [vrsDed, setVrsDed] = useState([])
  const [busEd, setBusEd] = useState([])
  const [leaseAdv, setLeaseAdv] = useState([])
  const [excess, setExcess] = useState([])
  const [convDed, setConvDed] = useState([])
  const [sec88c, setSec88c] = useState([])

  // for help list 

  const [helpList, setHelpList] = useState(false) // this will switch helpList true = on
  const [helpFor, setHelpFor] = useState('') //fieldName for helpList you want   
  const [helpListHeader, setHelpListHeader] = useState([])


  const [isHelpModelOpen, setIsHelpModelOpen] = useState()
  const toggleHelpModal = () => setHelpList(!helpList)


  // fetch drop down data
  useEffect(() => {
    const fetchConstantList = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_GENERAL_PARAMETER_DROPDOWNDATA}`,{credentials:'include',},
        )
        if (response.status === 200) {
          const data = await response.json()
          setExcise([
            { value: "", label: "" },
            ...formatOptions(data.excise || [], "wc_id", "description"),
          ]);
          setFloor([
            { value: "", label: "" },
            ...formatOptions(data.floor || [], "wc_id", "description"),
          ]);
          setParty([
            { value: "", label: "" },
            ...formatOptions(data.party || [], "wc_id", "description"),
          ]);
          setService([
            { value: "", label: "" },
            ...formatOptions(data.service || [], "wc_id", "description"),
          ]);
          setReceive([
            { value: "", label: "" },
            ...formatOptions(data.receive || [], "wc_id", "description"),
          ]);

          setExcise1([
            { value: "", label: "" },
            ...formatOptions(data.excise1 || [], "wc_id", "description"),
          ]);
          setFloor1([
            { value: "", label: "" },
            ...formatOptions(data.floor1 || [], "wc_id", "description"),
          ]);
          setScrapYard([
            { value: "", label: "" },
            ...formatOptions(data.scrapYard || [], "wc_id", "description"),
          ]);
          setServiceCell([
            { value: "", label: "" },
            ...formatOptions(data.serviceCell || [], "wc_id", "description"),
          ]);

          setDefaultCost([
            { value: "", label: "" },
            ...formatOptions(data.costCentre || [], "code", "description"),
          ]);

          setDefaultPurp([
            { value: "", label: "" },
            ...formatOptions(data.defaultPurp || [], "code", "description"),
          ]);

          setStockDesc([
            { value: "", label: "" },
            ...formatOptions(data.stockDesc || [], "code", "description"),
          ]);


          setBasic([
            { value: "", label: "" },
            ...formatOptions(data.basic || [], "ed_id", "description"),
          ]);
          setHra([
            { value: "", label: "" },
            ...formatOptions(data.hra || [], "ed_id", "description"),
          ]);
          setDa([
            { value: "", label: "" },
            ...formatOptions(data.da || [], "ed_id", "description"),
          ]);
          setPerPay([
            { value: "", label: "" },
            ...formatOptions(data.perPay || [], "ed_id", "description"),
            console.log("perpay", data.perPay)
          ]);
          setPfund([
            { value: "", label: "" },
            ...formatOptions(data.pfund || [], "ed_id", "description"),
          ]);
          setVpf([
            { value: "", label: "" },
            ...formatOptions(data.vpf || [], "ed_id", "description"),
          ]);
          setEsi([
            { value: "", label: "" },
            ...formatOptions(data.esi || [], "ed_id", "description"),
          ]);
          setNegative([
            { value: "", label: "" },
            ...formatOptions(data.negative || [], "ed_id", "description"),
          ]);
          setTmc([
            { value: "", label: "" },
            ...formatOptions(data.tmc || [], "ed_id", "description"),
          ]);
          setLmc([
            { value: "", label: "" },
            ...formatOptions(data.lmc || [], "ed_id", "description"),
          ]);
          setYtdTds([
            { value: "", label: "" },
            ...formatOptions(data.ytdTds || [], "ed_id", "description"),
          ]);
          setYtdSurch([
            { value: "", label: "" },
            ...formatOptions(data.ytdSur || [], "ed_id", "description"),
          ]);

          setArrear([
            { value: "", label: "" },
            ...formatOptions(data.arrear || [], "ed_id", "description"),
          ]);

          setMonthlyTax([
            { value: "", label: "" },
            ...formatOptions(data.MnthlyTax || [], "ed_id", "description"),
          ]);

          setMonthlySurch([
            { value: "", label: "" },
            ...formatOptions(data.MnthlySurch || [], "ed_id", "description"),
          ]);

          setYtdTax([
            { value: "", label: "" },
            ...formatOptions(data.ytdList || [], "ed_id", "description"),
            console.log("ytdtax", data.ytdList)
          ]);

          setYtdSur([
            { value: "", label: "" },
            ...formatOptions(data.ytdSurch || [], "ed_id", "description"),
          ]);

          setDeathBenv([
            { value: "", label: "" },
            ...formatOptions(data.deathBenv || [], "ed_id", "description"),
          ]);

          setActual([
            { value: "", label: "" },
            ...formatOptions(data.actual || [], "ed_id", "description"),
          ]);



          setPaydays([
            { value: "", label: "" },
            ...formatOptions(data.paydays || [], "ed_id", "description"),
          ]);

          setConveyance([
            { value: "", label: "" },
            ...formatOptions(data.conveyance || [], "ed_id", "description"),
          ]);

          setEpf([
            { value: "", label: "" },
            ...formatOptions(data.epf || [], "ed_id", "description"),
          ]);

          setEsiProd([
            { value: "", label: "" },
            ...formatOptions(data.esiProd || [], "ed_id", "description"),
          ]);

          setProdInc([
            { value: "", label: "" },
            ...formatOptions(data.prodInc || [], "ed_id", "description"),
          ]);

          setOtherDed([
            { value: "", label: "" },
            ...formatOptions(data.OtherDed || [], "ed_id", "description"),
          ]);

          setEsiWages([
            { value: "", label: "" },
            ...formatOptions(data.EsiWages || [], "ed_id", "description"),
          ]);

          setFfDay([
            { value: "", label: "" },
            ...formatOptions(data.FfDay || [], "ed_id", "description"),
          ]);

          setConveyanceEd([
            { value: "", label: "" },
            ...formatOptions(data.ConveyanceEd || [], "ed_id", "description"),
          ]);
          setTmCoin([
            { value: "", label: "" },
            ...formatOptions(data.Tmcoin || [], "ed_id", "description"),
          ]);
          setMonth([
            { value: "", label: "" },
            ...formatOptions(data.Month || [], "month_no", "month_name"),
          ]);
          setOvertime([
            { value: "", label: "" },
            ...formatOptions(data.overtime || [], "ed_id", "description"),
          ]);

          setSociety([
            { value: "", label: "" },
            ...formatOptions(data.society || [], "ed_id", "description"),
          ]);

          setCanteen([
            { value: "", label: "" },
            ...formatOptions(data.canteen || [], "ed_id", "description"),
          ]);

          setNight([
            { value: "", label: "" },
            ...formatOptions(data.night || [], "ed_id", "description"),
          ]);

          setAdjPaydayp([
            { value: "", label: "" },
            ...formatOptions(data.adjPaydayp || [], "atnd_id", "atnd_desc"),
          ]);

          setAdjPaydayd([
            { value: "", label: "" },
            ...formatOptions(data.adjPaydayd || [], "atnd_id", "atnd_desc"),
          ]);

          setSpf([
            { value: "", label: "" },
            ...formatOptions(data.spf || [], "ed_id", "description"),
          ]);

          setBus([
            { value: "", label: "" },
            ...formatOptions(data.bus || [], "ed_id", "description"),
          ]);

          setEducation([
            { value: "", label: "" },
            ...formatOptions(data.education || [], "ed_id", "description"),
          ]);

          setBonds([
            { value: "", label: "" },
            ...formatOptions(data.bonds || [], "ed_id", "description"),
          ]);

          setCa([
            { value: "", label: "" },
            ...formatOptions(data.ca || [], "ed_id", "description"),
          ]);

          setLeave([
            { value: "", label: "" },
            ...formatOptions(data.leave || [], "ed_id", "description"),
          ]);

          setLatehrs([
            { value: "", label: "" },
            ...formatOptions(data.latehrs || [], "atnd_id", "atnd_desc"),
          ]);

          setGratuity([
            { value: "", label: "" },
            ...formatOptions(data.gratuity || [], "ed_id", "description"),
          ]);

          setStdded([
            { value: "", label: "" },
            ...formatOptions(data.stdded || [], "ed_id", "description"),
          ]);

          setEsiot([
            { value: "", label: "" },
            ...formatOptions(data.esiot || [], "ed_id", "description"),
          ]);

          setOvertimeatnd([
            { value: "", label: "" },
            ...formatOptions(data.overtimeatnd || [], "atnd_id", "atnd_desc"),
          ]);

          setFpf([
            { value: "", label: "" },
            ...formatOptions(data.fpf || [], "ed_id", "description"),
          ]);

          setSpecial([
            { value: "", label: "" },
            ...formatOptions(data.special || [], "ed_id", "description"),
          ]);

          setConveyanceEd1([
            { value: "", label: "" },
            ...formatOptions(data.conveyanceEd1 || [], "ed_id", "description"),
          ]);

          setWash([
            { value: "", label: "" },
            ...formatOptions(data.wash || [], "ed_id", "description"),
          ]);

          setSvpf([
            { value: "", label: "" },
            ...formatOptions(data.svpf || [], "ed_id", "description"),
          ]);

          setGured([
            { value: "", label: "" },
            ...formatOptions(data.gured || [], "ed_id", "description"),
          ]);

          setAdhoc([
            { value: "", label: "" },
            ...formatOptions(data.adhoc || [], "ed_id", "description"),
          ]);

          setOtherall([
            { value: "", label: "" },
            ...formatOptions(data.otherall || [], "ed_id", "description"),
          ]);

          setCcaed([
            { value: "", label: "" },
            ...formatOptions(data.ccaed || [], "ed_id", "description"),
          ]);

          setBasicarrear([
            { value: "", label: "" },
            ...formatOptions(data.basicarrear || [], "ed_id", "description"),
          ]);

          setOvertimeEd([
            { value: "", label: "" },
            ...formatOptions(data.overtimeEd || [], "ed_id", "description"),
          ]);


          setSuperAtt([
            { value: "", label: "" },
            ...formatOptions(data.super || [], "ed_id", "description"),
          ]);


          setAttendance([
            { value: "", label: "" },
            ...formatOptions(data.attendance || [], "atnd_id", "atnd_desc"),
          ]);

          setPayment([
            { value: "", label: "" },
            ...formatOptions(data.payment || [], "atnd_id", "atnd_desc"),
          ]);

          setSpay([
            { value: "", label: "" },
            ...formatOptions(data.spay || [], "ed_id", "description"),
          ]);

          setComm([
            { value: "", label: "" },
            ...formatOptions(data.comm || [], "ed_id", "description"),
          ]);

          setLoan([
            { value: "", label: "" },
            ...formatOptions(data.loan || [], "ed_id", "description"),
          ]);

          setComm([
            { value: "", label: "" },
            ...formatOptions(data.comm || [], "ed_id", "description"),
          ]);

          setLoan([
            { value: "", label: "" },
            ...formatOptions(data.loan || [], "ed_id", "description"),
          ]);

          setOthers([
            { value: "", label: "" },
            ...formatOptions(data.others || [], "ed_id", "description"),
          ]);

          setLeaseAcc([
            { value: "", label: "" },
            ...formatOptions(data.leaseAcc || [], "ed_id", "description"),
          ]);

          setImprest([
            { value: "", label: "" },
            ...formatOptions(data.imprest || [], "ed_id", "description"),
          ]);

          setProftax([
            { value: "", label: "" },
            ...formatOptions(data.proftax || [], "ed_id", "description"),
          ]);

          setMedIns([
            { value: "", label: "" },
            ...formatOptions(data.medIns || [], "ed_id", "description"),
          ]);

          setMonthlyatnd([
            { value: "", label: "" },
            ...formatOptions(data.monthlyatnd || [], "atnd_id", "atnd_desc"),
          ]);

          setPerkEd([
            { value: "", label: "" },
            ...formatOptions(data.PerkEd || [], "ed_id", "description"),
          ]);

          setLeaseArr([
            { value: "", label: "" },
            ...formatOptions(data.leaseArr || [], "ed_id", "description"),
          ]);

          setRent([
            { value: "", label: "" },
            ...formatOptions(data.rent || [], "ed_id", "description"),
          ]);

          setReslease([
            { value: "", label: "" },
            ...formatOptions(data.reslease || [], "ed_id", "description"),
          ]);

          setVrsAllow([
            { value: "", label: "" },
            ...formatOptions(data.vrsAllow || [], "ed_id", "description"),
          ]);

          setVrsDed([
            { value: "", label: "" },
            ...formatOptions(data.vrsDed || [], "ed_id", "description"),
          ]);

          setBusEd([
            { value: "", label: "" },
            ...formatOptions(data.busEd || [], "ed_id", "description"),
          ]);

          setLeaseAdv([
            { value: "", label: "" },
            ...formatOptions(data.leaseAdv || [], "ed_id", "description"),
          ]);

          setExcess([
            { value: "", label: "" },
            ...formatOptions(data.excess || [], "ed_id", "description"),
          ]);

          setConvDed([
            { value: "", label: "" },
            ...formatOptions(data.convDed || [], "ed_id", "description"),
          ]);

          setSec88c([
            { value: "", label: "" },
            ...formatOptions(data.sec88c || [], "ed_id", "description"),
          ]);

        }
      } catch (err) {
        console.error("Error fetching constants:", err)
      }
    }
    fetchConstantList()
  }, [formStatus])

  const handleHelpList = (data) => {
    setHelpList(data);
  }

  const onSelectHelpItem = (data) => {
    console.log("Selected Data:", data);
    setMOFMPARM((prev) => {
      switch (helpFor) {
        case "cvd":
          return { ...prev, cvd_acc_code: data.acc_no, cvd_acc_desc: data.acc_desc };
        case "modvat":
          return { ...prev, modvat_rec_acc: data.acc_no, modrec_acc_desc: data.acc_desc };
        default:
          return prev;
      }
    });
  };



  const tabs = ["General", "Material", "Production", "Sales", "Finance", "Finance1", "Personnel", "Personnel1", "Personnel2", "Personnel3", "Personnel4"];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      let body = {
        MOITPARM: MOITPARM,
        MOMMPARM: MOMMPARM,
        MOFMPARM: MOFMPARM,
        MOPRPARM: MOPRPARM,
        MOSMPARM: MOSMPARM,
        MOPMPARM: MOPMPARM,
        parm_id: MOITPARM?.parm_id || MOMMPARM?.parm_id || MOFMPARM?.parm_id || MOPRPARM?.parm_id || MOSMPARM?.parm_id || MOPMPARM?.parm_id, // Ensure parm_id is included
      };

      if (formStatus === "Update") {

      }

      console.log("Final body to send", body)

      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_GENERAL_PARAMETER_DATA}?form_status=${formStatus}`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
          credentials:'include',
        }
      );

      // Check the response
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong");
      }

      toast.success(
        `Data Updated successfully!`
      );
      formCleanup();


    } catch (error) {
      toast.error(
        error.message ||
        "Please check all the form fields or contact administrator"
      );
    }
  }

  function handleOffset(data) {
    setCurrentRecordNo(data)
  }

  const formCleanup = () => { 
    handleCancel()
  }

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    releaseFormStatus()
    setFormData();
    setMOFMPARM(MOFMPARMInitialFormDataTemplate);
    setMOITPARM(MOITPARMInitialFormdataTemplate);
    setMOSMPARM(MOSMPARMInitialFormDataTemplate);
    setMOPMPARM(MOPMPARMInitialFormDataTemplate);
    setMOPRPARM(MOPRPARMInitialFormDataTemplate);

  }, []);

  const handleChange = useCallback((name, value, type) => { 

    if (!['Insert', 'Update', 'Search'].includes(formStatus)) {
      return
    }
    if (type === "MOITPARM") {
      setMOITPARM((prevData) => {
        const newData = {
          ...prevData,
          [name]
            : type === "number"
              ? value === "" || /^[0-9]*$/.test(value)
                ? (name === "shifts_working" ?
                  value.slice(0, 1)
                  : value.slice(0, 6))
                : prevData[name]
              : value.toUpperCase()
        };
        console.log("Updated Data:", newData);
        return newData;
      });
    }

    if (type === "MOMMPARM") {
      setMOMMPARM((prevData) => {
        const newData = {
          ...prevData,
          [name]: type === "radio"
            ? (checked ? "Y" : "N")
            : type === "number"
              ? value === "" || /^[0-9]*$/.test(value)
                ? value.slice(0, 5)
                : prevData[name]
              : value.toUpperCase()
        };
        console.log("Updated Data:", newData);
        return newData;
      });
    }

    if (type === "MOPRPARM") {
      setMOPRPARM((prevData) => ({
        ...prevData,
        [name]:
          type === "radio"
            ? checked
              ? value
              : prevData[name]
            : value.toUpperCase(),
      }));
    }

    if (type === "MOPMPARM") {
      setMOPMPARM((prevData) => {
        const newData = {
          ...prevData,
          [name]:
            type === "number"
              ? value === "" || /^[0-9]*$/.test(value)
                ? (() => {
                  if (name === "pf_rperc") return value.slice(0, 7);
                  if (name === "pf_fpflimit") return value.slice(0, 17);
                  if (name === "pf_fpfperc") return value.slice(0, 7);
                  if (name === "pf_eperc") return value.slice(0, 5);
                  if (name === "esi_rperc") return value.slice(0, 7);
                  if (name === "esi_eperc") return value.slice(0, 7);
                  if (name === "esi_limit") return value.slice(0, 17);
                  if (name === "bonus_calc_on") return value.slice(0, 17);
                  if (name === "bonus_limit") return value.slice(0, 17);
                  if (name === "bonus_perc") return value.slice(0, 7);
                  if (name === "ex_gratia_limit") return value.slice(0, 17);

                  return value;
                })()
                : prevData[name]
              : value
        };

        console.log("Updated Data:", newData);
        return newData;
      });
    }


    if (type === "MOSMPARM") {
      setMOSMPARM((prevData) => {
        const newData = {
          ...prevData,
          [name]: type === "radio"
            ? (checked ? "Y" : "N")
            : type === "number"
              ? value === "" || /^[0-9]*$/.test(value)
                ? value.slice(0, 2)
                : prevData[name]
              : value.toUpperCase()
        };
        console.log("Updated Data:", newData);
        return newData;
      });
    }

    if (type === "MOFMPARM") {
      setMOFMPARM((prevData) => {
        const newData = {
          ...prevData,
          [name]: type === "radio"
            ? (checked ? "Y" : "N")
            : type === "number"
              ? value === "" || /^[0-9]*$/.test(value)
                ? (() => {
                  if (name === "add_local_tax_perc") return value.slice(0, 10);
                  if (name === "tds_surcharge_perc") return value.slice(0, 20);
                  if (name === "days_for_discount") return value.slice(0, 4);
                  if (name === "cvd_land_cost_per") return value.slice(0, 7);
                  if (name === "cvd_ins_per") return value.slice(0, 9);
                  return value;
                })()
                : prevData[name]
              : value.toUpperCase()
        };

        console.log("Updated Data:", newData);
        return newData;
      });
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  }, [formStatus]);

  const setupQueryData = useCallback(
    (queryData, btnClicked) => {
      if (btnClicked === 'Query') { 
          if (queryData.count === 0) {
          toast.error('No record found')
          handleCancel()
          return
        }

        // console.log(queryData.count)
        // console.log("queryData", queryData)
        setMOMMPARM(queryData.MOMMPARM);
        setMOFMPARM(queryData.MOFMPARM);
        setMOFMPARM(prevData => ({
          ...prevData,
          cvd_acc_desc: queryData.cvd_acc_desc, 
          modrec_acc_desc: queryData.modrec_acc_desc
        }));
      
    
  setMOPRPARM(queryData.MOPRPARM);
  setMOITPARM(queryData.MOITPARM);
  setMOPMPARM(queryData.MOPMPARM);
  setMOSMPARM(queryData.MOSMPARM);
  // console.log("mommparm:", queryData.MOMMPARM)
  // console.log("mofmparm:", queryData.MOFMPARM)
  // console.log("moitparm:", queryData.MOITPARM)
  // console.log("mopmparm:", queryData.MOPMPARM)

  setTotalRecordCount(queryData.count)
  // }
}


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
      QUERY_API={APP_PROD_API.GET_GENERAL_PARAMETER_DATA}
      formName={""}
      authority={{ insert: "N", update: "Y" }}

    >
      <TabContent activeTab={activeTab}>
        <TabPane tabId={1}>
          <General
            formData={MOITPARM}
            excise={excise}
            floor={floor}
            party={party}
            service={service}
            receive={receive}
            handleChange={handleChange}
          />
        </TabPane>

        <TabPane tabId={2}>
          <Material
            formData={MOMMPARM}
            handleChange={handleChange}
          />
        </TabPane>

        <TabPane tabId={3}>
          <Production
            formData={MOPRPARM}
            excise1={excise1}
            floor1={floor1}
            scrapYard={scrapYard}
            serviceCell={serviceCell}
            handleChange={handleChange}
          />
        </TabPane>

        <TabPane tabId={4}>
          <Sales
            formData={MOSMPARM}
            stockDesc={stockDesc}
            handleChange={handleChange}
          />
        </TabPane>


        <TabPane tabId={5}>
          <Finance
            formData={MOFMPARM}
            defaultCost={defaultCost}
            defaultPurp={defaultPurp}
            handleChange={handleChange}
          />
        </TabPane>

        <TabPane tabId={6}>
          <Finance1
            formData={MOFMPARM}
            handleChange={handleChange}
            handleHelpList={handleHelpList}
            setHelpFor={setHelpFor}
            formStatus={formStatus}
            setHelpListHeader={setHelpListHeader}
          />
        </TabPane>

        <TabPane tabId={7}>
          <Personnel
            formData={MOPMPARM}
            basic={basic}
            hra={hra}
            da={da}
            perPay={perPay}
            pfund={pfund}
            vpf={vpf}
            esi={esi}
            negative={negative}
            tmc={tmc}
            lmc={lmc}
            ytdTds={ytdTds}
            ytdSur={ytdSur}
            arrear={arrear}
            handleChange={handleChange}
          />
        </TabPane>

        <TabPane tabId={8}>
          <Personnel1
            formData={MOPMPARM}
            handleChange={handleChange}
            MnthlyTax={MnthlyTax}
            MnthlySurch={MnthlySurch}
            ytdTax={ytdTax}
            ytdSurch={ytdSurch}
            deathBenv={deathBenv}
            actual={actual}
            paydays={paydays}
            conveyance={conveyance}
            epf={epf}
            esiProd={esiProd}
            prodInc={prodInc}
          />
        </TabPane>

        <TabPane tabId={9}>
          <Personnel2
            formData={MOPMPARM}
            handleChange={handleChange}
            OtherDed={OtherDed}
            EsiWages={EsiWages}
            FfDay={FfDay}
            ConveyanceEd={ConveyanceEd}
            Tmcoin={Tmcoin}
            Month={Month}
            overtime={overtime}
            society={society}
            canteen={canteen}
            night={night}
            adjPaydayp={adjPaydayp}
            adjPaydayd={adjPaydayd}
            spf={spf}
            bus={bus}
            education={education}
            bonds={bonds}
            ca={ca}
            leave={leave}
            latehrs={latehrs}
          />
        </TabPane>


        <TabPane tabId={10}>
          <Personnel3
            formData={MOPMPARM}
            gratuity={gratuity}
            stdded={stdded}
            esiot={esiot}
            overtimeatnd={overtimeatnd}
            fpf={fpf}
            special={special}
            conveyanceEd1={conveyanceEd1}
            wash={wash}
            svpf={svpf}
            gured={gured}
            adhoc={adhoc}
            otherall={otherall}
            ccaed={ccaed}
            basicarrear={basicarrear}
            overtimeEd={overtimeEd}
            superAtt={superAtt}
            handleChange={handleChange}
          />
        </TabPane>

        <TabPane tabId={11}>
          <Personnel4
            formData={MOPMPARM}
            attendance={attendance}
            payment={payment}
            spay={spay}
            comm={comm}
            loan={loan}
            others={others}
            leaseArr={leaseArr}
            imprest={imprest}
            proftax={proftax}
            medIns={medIns}
            monthlyatnd={monthlyatnd}
            PerkEd={PerkEd}
            rent={rent}
            reslease={reslease}
            vrsAllow={vrsAllow}
            vrsDed={vrsDed}
            busEd={busEd}
            leaseAdv={leaseAdv}
            excess={excess}
            convDed={convDed}
            sec88c={sec88c}
            handleChange={handleChange}
          />

          {helpList && (
            <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
              <ModalHeader toggle={toggleHelpModal}></ModalHeader>
              <ModalBody>
                <HelpList
                  formStatus={formStatus}
                  helpFor={helpFor}
                  apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_GENERAL_PARAMETER_DATA}`}
                  helpListHeader={helpListHeader}
                  handleHelpList={handleHelpList}
                  onSelectHelpItem={onSelectHelpItem}

                />
              </ModalBody>
            </Modal>
          )}
        </TabPane>

      </TabContent>
    </FormSetup>
  </React.Fragment>
);
};

export default GeneralParameters;

