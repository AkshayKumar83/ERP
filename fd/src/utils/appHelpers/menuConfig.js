import membershipModule from "../../assets/images/membership.png";
import purchaseModule from "../../assets/images/purchase.png";
import saleModule from "../../assets/images/sale.png";
import wareHouseModule from "../../assets/images//werehouse.png";
import FinanceModule from "../../assets/images/Finance1.png";
import AdminModule from "../../assets/images/admin_pic.png";
import HrModule from "../../assets/images/humanResource.png";
import { APP_PROD_API } from "../api";

export const moduleIconConfig = [
  {
    module: membershipModule,
    moduleName: "MEMBERSHIP ",
    routeName: "memberMgmnt",
  },
  {
    module: purchaseModule,
    moduleName: "PURCHASE ",
    routeName: "materialMgmnt",
  },
  {
    module: saleModule,
    moduleName: "SALE ",
    routeName: "saleMgmnt",
  },
  {
    module: wareHouseModule,
    moduleName: "WHEREHOUSE ",
    routeName: "whMgmnt",
  },
  {
    module: FinanceModule,
    moduleName: "FINANCIAL ",
    routeName: "financeMgmnt",
  },
  {
    module: AdminModule,
    moduleName: "ADMIN ",
    routeName: "adminMgmnt",
  },
  {
    module: HrModule,
    moduleName: "HR ",
    routeName: "hrMgmnt",
  },
];

export const membershipModuleMenu = [
  {
    name: "Form",
    id: "101",
    formName: "Membership",
    item: [
      {
        id: "10101",
        formName: "Dealer Uploading",
        url: "dealer_upload",
      },
      {
        id: "10102",
        formName: "Member Onboarding",
        url: "member_onboarding_master",
      },
      {
        id: "10103",
        formName: "Member Detail Uploading",
        url: "member_dtl_upload",
      },
    ],
  },
  {
    name: "Form",
    id: "102",
    formName: "EMFA",
    item: [
      {
        id: "10201",
        formName: "EMFA Master",
        url: "emfa_master",
      },

      {
        id: "10202",
        formName: "EMFA For Member",
        url: "emfa_for_member",
      },
      {
        id: "10203",
        formName: "EMFA Receipt",
        url: "emfa_receipt",
      },
      {
        id: "10204",
        formName: "EMFA pre closure",
        url: "emfa_preclosure",
      },
      {
        id: "10205",
        formName: "Vehicle Detail",
        url: "vehicle_detail",
      },
      // {
      //     id: "10206",
      //     formName: "EMFA Eligibility",
      //     url: "emfa_eligibilty",
      // },
    ],
  },
  //  {
  //   name: "Form",
  //   id: "104",
  //   formName: "Board Meeting",
  //   item: [
  //     {
  //       id: "10401",
  //       formName: "Board Meeting Register",
  //       url: "board_meeting_master",
  //     },

  //   ],
  // },
  {
    name: "Report",
    id: "103",
    formName: "Member Report",
    item: [
      {
        id: "10301",
        formName: "All Member",
        url: "all_member",
      },
      {
        id: "10302",
        formName: "All Dealer",
        url: "all_dealer",
      },
      {
        id: "10303",
        formName: "Pan Card Wise TDS",
        url: "pan_car_wise_tds",
      },
      {
        id: "10304",
        formName: "EMFA Status View",
        url: "loan_status_view",
      },
      {
        id: "10305",
        formName: "EMI Overdue Ageing",
        url: "emi_overdue_ageing",
      },
      {
        id: "10306",
        formName: "EMFA Ledger All Member",
        url: "loan_ledger_all_member",
      },
      {
        id: "10307",
        formName: "Invoice Generation & Bulk Mail",
        url: "inv_bulk_mail",
      },
      // {
      //   id: "10308",
      //   formName: "All Member React Report",
      //   url: "all_member_react",
      // },
       {
        id: "10308",
        formName: "Emfa Status All Members",
        url: "all_member_react",
      },
    ],
  },
];

export const adminModuleMenu = [
  {
    name: "Form",
    id: "501",
    formName: "User",
    item: [
      {
        id: "50101",
        formName: "User Master",
        url: "user_master",
      },
      // {
      //     id: "50102",
      //     formName: "User Activity",
      //     url: "user_activity",
      // },
      {
        id: "50103",
        formName: "DashBoard User Rights",
        url: "dashboard_user_rights",
      },
      {
        id: "50104",
        formName: "DashBoard Link Rights",
        url: "dashboard_link_rights",
      },

      {
        id: "50105",
        formName: "Change Password",
        url: "change_password",
      },
      {
        id: "50106",
        formName: "User Grant Transfer",
        url: "user_grant_transfer",
      },
      {
        id: "50107",
        formName: "User Creation",
        url: "user_create",
      },
    ],
  },
  {
    name: "Form",
    id: "502",
    formName: "Financial",
    item: [
      {
        id: "50201",
        formName: "Financial Year Opening Updation",
        url: "fin_year_open_updt",
      },
      {
        id: "50202",
        formName: "Financial Year Open Period",
        url: "fin_year_open_period",
      },
      // {
      //     id: "50203",
      //     formName: "Financial Period Closing",
      //     url: "fin_period_closing",
      // },
    ],
  },
  {
    name: "Form",
    id: "503",
    formName: "Parameters",
    item: [
      {
        id: "50301",
        formName: "General Perameters",
        url: "gen_perameters",
      },
      {
        id: "50302",
        formName: "Division Wise Parameters",
        url: "fin_year_open_period",
      },
      {
        id: "50303",
        formName: "Ageing Parameters",
        url: "age_parameter",
      },
      {
        id: "50304",
        formName: "Tax Parameters Master",
        url: "tax_parameter_master",
      },
    ],
  },
  {
    name: "Form",
    id: "504",
    formName: "Sections",
    item: [
      {
        id: "50401",
        formName: "Finance Section",
        url: "fin_section",
      },
      {
        id: "50402",
        formName: "User Wise Section",
        url: "user_wise_section",
      },
    ],
  },
  {
    name: "Form",
    id: "505",
    formName: "General Master",
    item: [
      {
        id: "50501",
        formName: "Code Definition",
        url: "code_definition",
      },
      {
        id: "50502",
        formName: "Division Master",
        url: "div_master",
      },
      {
        id: "50503",
        formName: "Currency Master",
        url: "curr_master",
      },
      {
        id: "50504",
        formName: "Email Description",
        url: "email_description",
      },
      {
        id: "50505",
        formName: "Email Alert Master",
        url: "email_alert-master",
      },
      {
        id: "50506",
        formName: "Calendar",
        url: "calendar",
      },
      {
        id: "50507",
        formName: "State Wise Master",
        url: "statewise_master",
      },
    ],
  },
];

export const saleModuleMenu = [
  {
    name: "Form",
    id: "201",
    formName: "Masters",
    item: [
      {
        id: "20101",
        formName: "Product Master",
        url: "product_master",
      },
      {
        id: "20102",
        formName: "Customer Master",
        url: "customer_master",
      },
      {
        id: "20103",
        formName: "Price List",
        url: "price_list",
      },
      {
        id: "20104",
        formName: "Payment Terms",
        url: "payment_term",
      },

      {
        id: "20105",
        formName: "Product Category",
        url: "product_category",
      },
      {
        id: "20106",
        formName: "Customer Rate Master",
        url: "customer_rate_master",
      },

    ],
  },
  {
    name: "Form",
    id: "202",
    formName: "Sales Order Processing",
    item: [
      {
        id: "20201",
        formName: "Sales Order",
        url: "sales_order",
      },
      {
        id: "20202",
        formName: "Service Order",
        url: "service_order",
      },
      {
        id: "20203",
        formName: "Scrap Order",
        url: "scrap_order",
      },
    ],
  },
  {
    name: "Form",
    id: "203",
    formName: "Invoicing",
    item: [
      // {
      //   id: "20301",
      //   formName: "Normal Invoicing",
      //   url: "normal_invoicing",
      // },
      {
        id: "20302",
        formName: "Scrap Invoicing",
        url: "scrap_invoicing",
      },
      {
        id: "20303",
        formName: "Invoice",
        url: "service_invoicing",
      },
      {
        id: "20306",
        formName: "Bulk Invoice Upload",
        url: "bulk_invoice_upload",
      },
      {
        id: "20304",
        formName: "Sales Return",
        url: "sales_return",
      },

      {
        id: "20305",
        formName: "Invoice Category",
        url: "invoice_category",
      },

      {
        id: "20307",
        formName: "QR Generator",
        url: "qr_generator",
      },
    ],
  },
  {
    name: "Report",
    id: "204",
    formName: "Sales Management",
    item: [
      {
        id: '20401',
        formName: "Sales By State",
        url: "sales_by_state",
      },
      {
        id: '20402',
        formName: "Sales By Customer",
        url: "sales_by_customer",
      },
      {
        id: '20403',
        formName: "Invoice Summary",
        url: "invoice_summary",
      },
      {
        id: '20404',
        formName: "Item-wise HSN Report",
        url: "item_wise_hsn",
      },
      {
        id: '20405',
        formName: 'B2B GST WISE',
        url: "b2b_gst_wise",
      },
      {
        id: '20406',
        formName: "Sale Return",
        url: "sale_return",
      },
    ],
  },
];

export const finModuleMenu = [
  {
    name: "Form",
    id: "401",
    formName: "Masters",
    item: [
      {
        id: "40101",
        formName: "GL Rollup Master",
        url: "gl_rollup_mstr",
      },

      {
        id: "40102",
        formName: "Item Wise Account Entry",
        url: "item_wise_acc_entry",
      },
      {
        id: "40103",
        formName: "Standard Remarks",
        url: "std_remarks",
      },
      {
        id: "40104",
        formName: "State Wise GST Master",
        url: "state_wise_gst_mstr",
      },
      {
        id: "40105",
        formName: "Account Code for GST",
        url: "acc_code_for_gst",
      },
      {
        id: "40106",
        formName: "Year Opening for Bank Reco",
        url: "year_opening_bank_reco",
      },
      {
        id: "40107",
        formName: "Bank Details",
        url: "bank_details",
      },
      {
        id: "40108",
        formName: "Bank Reco Statement Upload",
        url: "bank_reco_upload",
      },

      {
        id: "40109",
        formName: "GL Master",
        url: "gl_mstr",
      },
      {
        id: "40110",
        formName: " Bulk Upload Bills",
        url: "bulk_upl_bills",
      },
      {
        id: "40111",
        formName: " Uploaded Document Tracker",
        url: "upl_doc_tracker",
      },
      {
        id: "40112",
        formName: "Dealer Subsidy Account Master",
        url: "dlr_subsidy_account_mstr",
      },
      {
        id: "40113",
        formName: "GL Rollup BSPL",
        url: "gl_rollup_bspl",
      },

    ],
  },
  {
    name: "Form",
    id: "402",
    formName: "Accounts Payables",
    item: [
      // {
      //   id: "40201",
      //   formName: "AP Bill Entry",
      //   url: "ap_bill_entry",
      // },
      {
        id: "40202",
        formName: "Expense Voucher",
        url: "exp_vchr",
      },
      {
        id: "40203",
        formName: "Block Payment Option",
        url: "block_pymt_optn",
      },
      {
        id: "40204",
        formName: "Account Wise TDS Master",
        url: "acc_wise_tds_mstr",
      },
      {
        id: "40205",
        formName: "Vendor TDS Declaration",
        url: "vendor_tds_decl",
      },
      {
        id: "40206",
        formName: "Payment Advice",
        url: "payment_advice",
      },
      // commented this form from menu as per pm sir to make new replica of expense voucher for purchase voucher
      // {
      //   id: "40207",
      //   formName: "Purchase Voucher Query",
      //   url: "purchase_voucher_query",
      // },

      {
        id: "40211",
        formName: "Purchase Voucher",
        url: "purchase_voucher",
      },


      {
        id: "40208",
        formName: "Unlink AP Bill",
        url: "unlink_ap_bill",
      },
      {
        id: "40209",
        formName: "Account Code For Purchase Voucher",
        url: "acc_code_purchase_voucher",
      },
      {
        id: "40210",
        formName: "Purchase Category Defination",
        url: "purchase_category_defination",
      },
    ],
  },
  {
    name: "Form",
    id: "403",
    formName: "Accounts Receivables",
    item: [
      {
        id: "40301",
        formName: "Outstanding Payments",
        url: "outstanding_payments",
      },
      {
        id: "40302",
        formName: "Payment Received Entry",
        url: "payment_received_entry",
      },
      {
        id: "40303",
        formName: "Customer TDS Declaration",
        url: "customer_tds_decl",
      },
      {
        id: "40304",
        formName: "Sale Voucher",
        url: "sale_voucher",
      },
    ],
  },
  {
    name: "Form",
    id: "404",
    formName: "Vouchers",
    item: [
      {
        id: "40401",
        formName: "Cash Voucher",
        url: "cash_voucher",
      },
      {
        id: "40402",
        formName: "Bank Voucher",
        url: "bank_voucher",
      },
      {
        id: "40403",
        formName: "Journal Voucher",
        url: "journal_voucher",
      },

      {
        id: "40404",
        formName: "Debit Credit Note",
        url: "debit_credit_note",
      },
      {
        id: "40405",
        formName: "GST Debit Credit Note",
        url: "gst_debit_credit_note",
      },
      {
        id: "40406",
        formName: "ITC",
        url: "itc",
      },

      // {
      //   id: "40407",
      //   formName: "Bulk Upload of Vouchers",
      //   url: "bulk_upload_vouchers",
      // },
      
      {
        id: "40408",
        formName: "Reverse Charge Invoice",
        url: "reverse_charge_invoice",
      },
      {
        id: "40409",
        formName: "Bulk Upload JV",
        url: "bulk_upload_jv",
      },
      {
        id: "40410",
        formName: "Bulk Printing",
        url: "bulk_printing",
      },
      {
        id: "40411",
        formName: "Staging Purchase Voucher",
        url: "staging_purch_vchr",
      },
    ],
  },
  {
    name: "Form",
    id: "405",
    formName: "Chart of Accounts",
    item: [
      {
        id: "40501",
        formName: "Balance Sheet / Profit and Loss",
        url: "balance_sheet",
      },
      {
        id: "40502",
        formName: "P/L Schd. Mat Consumption",
        url: "p/l_schd_consmp",
      },
      {
        id: "40503",
        formName: "P/L Schd. Mat Consumption closing",
        url: "p/l_schd_consmp_closing",
      },
      {
        id: "40504",
        formName: "Balance Sheet Formulae Detail",
        url: "bal_sheet_form_dtl",
      },

      {
        id: "40505",
        formName: "Balance Sheet Inv. Account Linkage",
        url: "bal_sheet_inv_acc_link",
      },

      {
        id: "40506",
        formName: "Closing Inv. For Balance Sheet",
        url: "close_inv_for_bal_sheet",
      },

      {
        id: "40507",
        formName: "Provision for Balance Sheet",
        url: "provision_for_bal_sheet",
      },
    ],
  },
  {
    name: "Form",
    id: "406",
    formName: "General Ledger",
    item: [
      // {
      //     id: "40601",
      //     formName: "Voucher Authorisation Lim IT Definition",
      //     url: "vch_auth_lim_it_definition",
      // },
      {
        id: "40602",
        formName: "Voucher Authorisation",
        url: "vch_auth",
      },
      {
        id: "40603",
        formName: "Unposting Voucher",
        url: "unpost_vch",
      },
      {
        id: "40604",
        formName: "Cheque Book Entry",
        url: "chq_book_entry",
      },

      {
        id: "40605",
        formName: "Bank Reco Entry",
        url: "bank_reco_entry",
      },

      {
        id: "40606",
        formName: "Bank Reco Updation",
        url: "bank_reco_upd",
      },

      {
        id: "40607",
        formName: "Payment Reverse",
        url: "payment_revserse",
      },
      {
        id: "40608",
        formName: "Account Wise Detail Entry",
        url: "account_wise_dtl_entry",
      },
    ],
  },
  {
    name: "Report",
    id: "407",
    formName: "Finance Management",
    item: [
      {
        id: "40700",
        formName: "Reference Voucher Printing",
        url: "ref_vch_no",
      },
      {
        id: "40701",
        formName: "GSTR-1 and GSTR-3B",
        url: "gstr_1_3b",
      },
      {
        id: "40702",
        formName: "Bank Book",
        url: "bank_book",
      },
      {
        id: "40703",
        formName: "Account Ledger",
        url: "acc_ledger",
      },
      {
        id: "40715",
        formName: "Member Account Ledger",
        url: "member_acc_ledger",
      },
      {
        id: "40716",
        formName: "Dealer Credit Balance",
        url: "dlr_cr_bal",
      },
      {
        id: "40704",
        formName: "Bank Reco",
        url: "bank_reco",
      },
      {
        id: "40705",
        formName: "Account Ledger Dump",
        url: "party_ledger_dump",
      },
      {
        id: "40706",
        formName: "Debtor's Outstanding",
        url: "debtors_outstanding",
      },
      {
        id: "40707",
        formName: "Vendor-Wise Outstanding",
        url: "creditors_outstanding",
      },
      {
        id: "40708",
        formName: "Customer Receipt",
        url: "customer_receipt",
      },
      // {
      //   id: 40709,
      //   formName: "Purchase Voucher Report",
      //   url: "purchase_vchr",
      // },
      {
        id: '40710',
        formName: "Expense Voucher Report",
        url: "exp_vchr",
      },
      {
        id: '40711',
        formName: "Open GRN Pending For Billing",
        url: "open_grn_pending",
      },
      {
        id: '40712',
        formName: "Purchase Book",
        url: "purchase_book",
      },
      {
        id: '40713',
        formName: "Trial Balance",
        url: "trial_bal",
      },
      {
        id: '40614',
        formName: "Balance Sheet",
        url: "bal_sheet_dummy_report",
      },
      {
        id: "40714",
        formName: "Audit Trial",
        url: "audit_trial",
      },
      {
        id: "40720",
        formName: "Pan Card Wise TDS Report",
        url: "tds_report",
      },
      {
        id: "40725",
        formName: "Balance Sheet/Profit Loss Period Wise",
        url: "bal_sheet_pl_period_wise",
      },
      {
        id: "40726",
        formName: "Voucher Dump",
        url: "voucher_dump",
      },
      {
        id: "40730",
        formName: "Voucher Report",
        url: "voucher_report",
      },
      {
        id: "40731",
        formName: "HSN Wise Purchase Summary",
        url: "hsn_wise_purch_sum",
      },
    ],
  },
];


export const whModuleMenu = [
  {
    name: "Form",
    id: "301",
    formName: "Masters",
    item: [
      {
        id: "30101",
        formName: "Unit Master",
        url: "unit_master",
      },
      {
        id: "30102",
        formName: "Item Master",
        url: "item_master",
      },
      {
        id: "30103",
        formName: "Unit Conversion Master",
        url: "unit_conversionMaster",
      },
      {
        id: "30104",
        formName: "Item Stock Opening Master",
        url: "item_stack_opening_master",
      },
      {
        id: "30105",
        formName: "Item Opening Rate Master",
        url: "item_opening_rate_master",
      },
      {
        id: "30106",
        formName: "WareHouse Master (Work Center Master)",
        url: "work_center",
      },
      {
        id: "30107",
        formName: "Item Min Max Stock Levels",
        url: "item_min_max_stock_level",
      },
      {
        //added new
        id: "30108",
        formName: "Item Code Category Classification",
        url: "item_code_category_classification",
      },
      // {
      //     // added new
      //     id: "30109",
      //     formName: "gencddsp",
      //     url: "gencddsp",
      // },
      {
        //added new
        id: "30110",
        formName: "Bin Kard",
        url: "bin_kard",
      },
      {
        //added new
        id: "30111",
        formName: "Transaction Master",
        url: "transaction_master",
      },
      {
        //added new
        id: "30112",
        formName: "Item Location Master",
        url: "item_location_master",
      },
      {
        //added new
        id: "30115",
        formName: "Physical Inventory",
        url: "physical_inventory",
      },
      {
        //added new
        id: "30113",
        formName: "Update Physical Inventory",
        url: "update_physical_inventory",
      },
      {
        //added new
        id: "30114",
        formName: "Upload Physical Inventory",
        url: "upload_physical_inventory",
      },
       {
        //added new
        id: "30119",
        formName: "Bill of Material",
        url: "bill_of_material",
      },
      {
        //added new
        id: "30116",
        formName: "Routing Maintenance",
        url: "routing_maintenance",
      },
      {
        //added new
        id: "30117",
        formName: "Define Operations",
        url: "define_operation",
      },
      {
        //added new
        id: "30118",
        formName: "Copy Routing",
        url: "copy_routing",
      },


    ],
  },

  {
    name: "Report",
    id: "2",
    formName: "Report ",
    item: [
      {
        id: '30201',
        formName: "Material Acceptance",
        url: "material_acceptance",
      },
      {
        id: "30202",
        formName: "Material Issue Printing",
        url: "material_issue_printing",
      },
      {
        id: "30203",
        formName: "Incoming Material Detail",
        url: "incoming_material_detail",
      },
      {
        id: "30204",
        formName: "Item Master Listing",
        url: "item_mstr_listing",
      },
      {
        id: "30205",
        formName: "Item Stock Ledger",
        url: "item_stock_ledger",
      },
      {
        id: "30206",
        formName: "Stock Issue Report",
        url: "stock_issue_report",
      },
      {
        id: "30207",
        formName: "Item Issue To",
        url: "item_issue_to",
      },

    ],
  },
];

export const purchaseModuleMenu = [
  {
    name: "Form",
    id: "601",
    formName: "Masters",
    item: [
      {
        id: "60101",
        formName: "Supplier master",
        url: "supplier_master",
      },
      {
        id: "60102",
        formName: "PO category",
        url: "po_category",
      },
      {
        id: "60103",
        formName: "Payment Terms",
        url: "payment_term",
      },
      {
        id: "60106",
        formName: "Gate Entry",
        url: "gate_entry",
      },
      {
        id: "60110",
        formName: "RMGP",
        url: "rmgp",
      },
       {
        id: "60114",
        formName: "Rate Master",
        url: "rate_master",
      },
      {
        id: "60115",
        formName: "Bulk PO Creation",
        url: "bulk_po_create",
      },
       {
        id: "60116",
        formName: "Item Wise Dealer Subsidy",
        url: "item_wise_dealer_subsidy",
      },
     
      {
        id: "60111",
        formName: "Purchase Order",
        url: "purchase_order",
      },
      {
        id: "60112",
        formName: "Stock Adustment Batch",
        url: "stock_adjustmemt_batch",
      },    
      {
        id: "60113",
        formName: "Wor Internal",
        url: "wor_internal",
      },
      {
        id: "60117",
        formName: "NRGP",
        url: "nrgp",
      },
       {
        id: "60118",
        formName: "Pending PO Authorization",
        url: "pending_po_auth",
      },
      {
        id: "60119",
        formName: "Update Purchase Order",
        url: "update_purchase_order",
      },
      {
        id: "60120",
        formName: "PO Closure",
        url: "po_closure",
      },
    ],
  },
  {
    name: "Form",
    id: "701",
    formName: "Quality",
    item: [
      {
        id: "70101",
        formName: "Inter Transfer Memo",
        url: "inter_transfer_memo",
      },
      {
        id: "70102",
        formName: "Incoming Quality Inspection",
        url: "incomimg_quality_inspection",
      },
        {
        id: "70103",
        formName: "Material Issue",
        url: "materail_issue",
      },
    ],
  },

  {
    name: "Report",
    id: "602",
    formName: "Purchase Management",
    item: [
      {
        id: "60201",
        formName: "Vendor Master",
        url: "vendor_master",
      },
      {
        id: "60202",
        formName: "Vendor-Wise Item Purchase",
        url: "vendor_wise_item_purchase",
      },
      {
        id: "60203",
        formName: "Vendor-wise Total Purchase",
        url: "vendor_wise_total_purchase",
      },
      {
        id: "60204",
        formName: "Daily Material Receipt",
        url: "daily_material_receipt",
      },
      {
        id: "60205",
        formName: "Monthly Purchase Summary",
        url: "monthly_purchase_summ",
      },
      {
        id: "60206",
        formName: "PO Dump",
        url: "po_dump",
      },
    ],
  },
];

export const hrModuleMenu = [
  {
    name: "Form",
    id: "801",
    formName: "Masters",
    item: [
      {
        id: "80101",
        formName: "Department Master",
        url: "department_master",
      },   

       {
        id: "80102",
        formName: "Grade and Cateory",
        url: "grade_category",
      },  

        {
        id: "80103",
        formName: "Grade",
        url: "grade",
      },
       {
        id: "80104",
        formName: "Contractor Master",
        url: "contractor_master",
      },

      {
        id: "80105",
        formName: "Daily Bulletin",
        url: "daily_bulletin",
      },

      {
        id: "80106",
        formName: "Increaments",
        url: "increaments",
      },
     
    ],
  }, 

   
];


// #### MENU CONFIG FETCH API
export const getUserMenuConfig = async ({
  division_id,
  fin_year,
  user_id,
}) => {
  const response = await fetch(
    `${import.meta.env.VITE_BASE_API_URL}${
      APP_PROD_API.USER_MENU_RIGHTS
    }?appDivisionId=${division_id}&appFinYear=${fin_year}&user=${user_id}`,
    {
      method: "GET",
      credentials: "include",
    }
  );


  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return await response.json();
};