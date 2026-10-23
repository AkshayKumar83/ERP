 
// data block  thfmpayadv
export const paymentAdviseBillTapData = {
    pay_id:"",
    v_code:"",
    v_name:"",
    paid_b4_due_date_yesno:"",
    rg_bank_cash:"",
    on_acc:"N",
    capital_flag:"N",
    po_id:"",
    po_no:"",
    acc_no:"",
    section:"",
    pay_advno:"",
    pay_advdt:"",
    on_acc_amt:"",
    bank_cd:"",
    bank_name:"",
    cash_acc_no:"",
    computrized_chq:"",
    fund_trf_thru:"",
    chq_acc_payee:"N",
    chq_no:"",
    chq_dt:"",
    chq_amt:"",
    upto_due_date:"",
    chq_in_favour:"",
    show_all:"",
    trans_type:"",
    voucher_id:"",
    voucher_no:"",
    vch_no:"",
    ref_id:"",
    ref_no:"",
    voucher_amt:"",
    trans_amt:"",
    trans_year:"",
    division_id:"",
    di_cancle_status:"",
    narration:"",
    out_amt:"",
    db_cr_amt:"",
    vendor_bank:"",
    create_id:"",
    update_id:"",
    create_date:"",
    update_date:"",
}

  // Bill Tap dataBlock Start Here
  export const billDetailHeaders = [
    { label: "", required: true,},
    { label: "Bill No", required: true, },
    { label: "Bill Date", required: true,  },
    { label: "PO No", required: true,  },
    { label: "Cost Center", required: true,  },
    { label: "Project number", required: true,  },
    { label: "Due Date", required: true, },
    { label: "Initial Amount", required: true,  },
    { label: "Already Adj.Amy.", required: true,  },
    { label: "Amount", required: true,  },
  ];

  // data block tdfmpayadv_bill
export const paymentAdviseBillTapDetailData = {
    pay_id:"",
    row_status:"",
    flag:"N",
    doc_no:"",
    voucher_id:"",
    doc_dt:"",
    due_date:"",
    doc_type:"",
    acc_no:"",
    remarks:"",
    init_db_amt:"",
    init_cr_amt:"",
    amount:"",
    tds_cr_amt:"",
    tds_amt:"",
    tds_sur_amt:"",
    tds_cess_amt:"",
    tds_hsc_amt:"",
    sel_amt:"",
    db_cr:"",
    po_no:"",
    cost_center:"",
    project_no:"",
    item_remarks:"",

}
 // Bill Tap dataBlock End Here

 // Adition Tap dataBlock Start Here

 export const additionTapHeaders = [
    { label: "Naration", required: true, width:"50%" },
    { label: "Acc. No.", required: true,width:"15%" },
    { label: "Bill No.", required: true, width:"10%" },
    { label: "Bill Date", required: true, width:"5%" },
    { label: "Amount", required: true, width:"10%" },
    { label: "Db/Cr", required: true, width:"5%" },
  ];

  export const paymentAdviseAditionTabData={
    row_status:"",
    pay_id:"",
    flag:"N",
    remarks:"",
    acc_no:"",
    acc_name:"",
    doc_no:"",
    doc_dt:"",
    doc_type:"",
    amount:"",
    db_amt:"",
    cr_amt:"",
    db_cr:"",
    tds_cr_amt:"",
    tds_perc:"",
    tds_amt:"",
    tds_sur_perc:"",
    tds_sur_amt:"",
    tds_cess_perc:"",
    tds_cess_amt:"",
    tds_hsc_perc:"",
    tds_hsc_amt:"",
 
  }


  // OnAccAdj Tap dataBlock Start Here
  export const onAccAdjTapHeaders = [
    { label: " ", required: true, },
    { label: "Document No.", required: true, },
    { label: "Doc Date.", required: true,  },
    { label: "Initial Amount", required: true,  },
    { label: "Adjusted Amount", required: true,  },
    { label: "Amount", required: true,  },

  ];

  export const onAccAdjTapHeaders2 = [
    { label: "Document No.", required: true, },
    { label: "Doc Date.", required: true,  },
    { label: "Initial Amount", required: true,  },
    { label: "Adjusted Amount", required: true,  },
    { label: "Amount", required: true,  },
  ];

  export const OnAccAdjData = {
    row_status:"",
    pay_id:"",
    flag:"N",
    doc_no:"",
    doc_dt:"",
    doc_type:"",
    acc_no:"",
    init_db_amt:"",
    init_cr_amt:"",
    amount:"",
    sel_amt:"",
    db_cr:"",

    
  }

   // DebitNote Tap dataBlock Start Here

   export const debitNoteTapHeaders = [
    { label: " ", required: true, },
    { label: "Document No.", required: true, },
    { label: "Doc Date.", required: true,  },
    { label: "Initial Amount", required: true,  },
    { label: "Adjusted Amount", required: true,  },
    { label: "Amount", required: true,  },
  ];

  export const debitNoteData = {
    row_status:"",
    pay_id:"",
    flag:"N",
    doc_no:"",
    doc_dt:"",
    doc_type:"",
    acc_no:"",
    init_db_amt:"",
    init_cr_amt:"",
    amount:"",
    sel_amt:"",
    db_cr:"",
 
  }

  // CreditNote Tap dataBlock Start Here
  export const creditNoteTapHeaders = [
    { label: " ", required: true, },
    { label: "Document No.", required: true, },
    { label: "Doc Date.", required: true,  },
    { label: "Initial Amount", required: true,  },
    { label: "Adjusted Amount", required: true,  },
    { label: "Amount", required: true,  },
  ];

  export const creditNoteData = {
    row_status:"",
    pay_id:"",
    flag:"N",
    doc_no:"",
    doc_dt:"",
    doc_type:"",
    acc_no:"",
    init_db_amt:"",
    init_cr_amt:"",
    amount:"",
    sel_amt:"",
    db_cr:"",
   
    
  }
  
      // RetensionTap dataBlock Start Here
  export const retensionAdjTabHeader = [
    { label: "Naration", required: true, width:"50%" },
    { label: "Acc. No.", required: true,width:"15%" },
    { label: "Bill No.", required: true, width:"10%" },
    { label: "Bill Date", required: true, width:"5%" },
    { label: "Amount", required: true, width:"10%" },
    { label: "Db/Cr", required: true, width:"5%" },
  ];

  export const retensionAdjData = {
    row_status:"",
    pay_id:"",
    flag:"N",
    remarks:"",
    acc_no:"",
    doc_no:"",
    doc_dt:"",
    doc_type:"",
    amount:"",
    db_cr:"",
    acc_name:"",
    total_sel_rt:"",

  }


// BankGAur Tap dataBlock Start Here
  export const bankGaurTabHeader = [
    { label: "Naration", required: true, width:"50%" },
    { label: "Acc. No.", required: true,width:"15%" },
    { label: "Bill No.", required: true, width:"10%" },
    { label: "Bill Date", required: true, width:"5%" },
    { label: "Amount", required: true, width:"10%" },
    { label: "Db/Cr", required: true, width:"5%" },
  ];
  

  export const bankGaurAdjData = {
    row_status:"",
    pay_id:"",
    flag:"N",
    remarks:"",
    acc_no:"",
    acc_name:"",
    doc_no:"",
    doc_dt:"",
    doc_type:"",
    amount:"",
    db_cr:"",

  }


  export const ControlInitData={
    trfdate:"",
    dest_type:"",
    total_sel_bill:"",
    total_sel_oa:"",
    total_sel_dn:"",
    total_sel_rn:"",
    total_sel_rt:"",
    total_sel_bg:"",
    total_db_amt:"",
    total_cr_amt:"",
    db_total:"",   
    cr_total:"",  
    cr_note_total:"",  
    on_acc_total:"",   
    db_note_total:"", 
    bill_total:"",
    first_record:"",
    di_formstatus:"",
    curryear:"",
    userid:"",
  }