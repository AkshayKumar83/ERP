import membershipModule from "../../assets/images/membership.png";
import purchaseModule from "../../assets/images/purchase.png";
import saleModule from "../../assets/images/sale.png";
import wareHouseModule from "../../assets/images//werehouse.png";
import FinanceModule from "../../assets/images/Finance1.png";
import AdminModule from "../../assets/images/admin_pic.png";


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
];

export const membershipModuleMenu = [
    {   name:'Form',
        id: 101,
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
        ],
    },
    {
        name:'Form',
        id: 102,
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
                formName: "EMFA Repayment",
                url: "emfa_repayment",
            },
            {
                id: "10204",
                formName: "EMFA pre closure",
                url: "emfa_preclosure",
            },
            {
                id: "10205",
                formName: "Vehical Detail",
                url: "vehical_detail",
            },
            // {
            //     id: "10206",
            //     formName: "EMFA Eligibility",
            //     url: "emfa_eligibilty",
            // },
         ],
    },
    {   name:'Report',
        id: 103,
        formName: "Member Report",
        item:[
            {
                id: '10301',
                formName: "All Memeber",
                url: "all_member",
            },
            {
                id: '10302',
                formName: "All Dealer",
                url: "all_dealer",
            },
            {
                id: '10303',
                formName: "Pan Card Wise TDS",
                url: "pan_car_wise_tds",
            },
            {
                id: '10304',
                formName: "EMFA Status View",
                url: "loan_status_view",
            },
            {
                id: '10305',
                formName: "EMI Overdue Ageing",
                url: "emi_overdue_ageing",
            },
            {
                id: '10306',
                formName: "EMFA Ledger All Member",
                url: "loan_ledger_all_member",
            },
        ]
       
    },
];

export const adminModuleMenu = [
    {
        name:'Form',
        id: 501,
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
            // {
            //     id: "50103",
            //     formName: "DashBoard User Rights",
            //     url: "dashboard_user_rights",
            // },
            // {
            //     id: "50104",
            //     formName: "DashBoard Link Rights",
            //     url: "dashboard_link_rights",
            // },  

            {
                id: "50105",
                formName: "Change Password",
                url: "change_password",
            },    
        ],
    },
    {
        name:'Form',
        id: 502,
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
        name:'Form',
        id: 503,
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
        name:'Form',
        id: 504,
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
        name:'Form',
        id: 505,
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
  {
    name: "Form",
    id: 506,
    formName: "Email Notify",
    item: [
      {
        id: "90101",
        formName: "Send Email Notification",
        url: "send_email_notification",
      },
    
    ],
  },
];

export const saleModuleMenu = [
    {
        name:'Form',
        id: 201,
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
        ],
    },
    {
        name:'Form',
        id: 202,
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
        name:'Form',
        id: 203,
        formName: "Invoicing",
        item: [
            {
                id: "20301",
                formName: "Normal Invoicing",
                url: "normal_invoicing",
            },
            {
                id: "20302",
                formName: "Scrap Invoicing",
                url: "scrap_invoicing",
            },
            {
                id: "20303",
                formName: "Service Invoice",
                url: "service_invoicing",
            },
            {
                id: "20304",
                formName: "Sales Return",
                url: "sales_return",
            },
            {
                id: "20305",
                formName: "Bulk Invoice Upload",
                url: "bulk_inv_upload",
            },
        ],
    },
    {
        name: "Report",
        id: 204,
        formName: "Sales Management",
        item: [
            {
                id: 20401,
                formName: "Sales By State",
                url: "sales_by_state",
            },
            {
                id: 20402,
                formName: "Sales By Customer",
                url: "sales_by_customer",
            },
            {
                id: 20403,
                formName: "Invoice Summary",
                url: "invoice_summary",
            },
            {
                id: 20404,
                formName: "Item-wise HSN Report",
                url: "item_wise_hsn",
            },
        ],
    },
];

export const finModuleMenu = [
    {
        name: 'Form',
        id: 401,
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
        ],
    },
    {
        name: 'Form',
        id: 402,
        formName: "Accounts Payables",
        item: [
            // {
            //     id: "40201",
            //     formName: "AP Bill Entry",
            //     url: "ap_bill_entry",
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
            {
                id: "40207",
                formName: "Purchase Voucher Entry",
                url: "purchase_voucher_entry",
            },
            {
                id: "40208",
                formName: "Unlink AP Bill",
                url: "unlink_ap_bill",
            },
        ],
    },
    {
        name: 'Form',
        id: 403,
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
        name: 'Form',
        id: 404,
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
            
            {
                id: "40407",
                formName: "Bulk Upload of Vouchers",
                url: "bulk_upload_vouchers",
            },
            {
                id: "40408",
                formName: "Reverse Charge Invoice",
                url: "reverse_charge_invoice",
            },
        ],
    },   

    {
        name: 'Form',
        id: 405,
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
        name: 'Form',
        id: 406,
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
        ],
    },
    {
        name: "Report",
        id: 407,
        formName: "Finance Management",
        item: [  

            {
                id: 40700,
                formName: "Reference Voucher Printing",
                url: "ref_vch_no",
            },
         {
                id: 40701,
                formName: "GSTR-1 and GSTR-3B",
                url: "gstr_1_3b",
            },
            {
                id: 40702,
                formName: "Bank Book",
                url: "bank_book",
            },
            {
                id: 40703,
                formName: "Account Ledger",
                url: "acc_ledger",
            },
            {
                id: 40704,
                formName: "Bank Reco",
                url: "bank_reco"
            },
            {
                id: 40705,
                formName: "Account Ledger Dump",
                url: "party_ledger_dump",
            },
            {
                id: 40706,
                formName: "Debtor's Outstanding",
                url: "debtors_outstanding",
            },
            {
                id: 40707,
                formName: "Vendor-Wise Outstanding",
                url: "creditors_outstanding",
            },
            {
                id: 40708,
                formName: "Customer Receipt",
                url: "customer_receipt",
            },
            {
                id: 40709,
                formName: "Purchase Voucher Report",
                url: "purchase_vchr",
            },
            {
                id: 40710,
                formName: "Expense Voucher Report",
                url: "exp_vchr",
            },
            {
                id: 40711,
                formName: "Open GRN Pending For Billing",
                url: "open_grn_pending",
            },
            {
                id: 40712,
                formName: "Purchase Book",
                url: "purchase_book",
            }, 
            {
                id: 40713,
                formName: "Trial Balance",
                url: "trial_bal",
            },

        ],
    },
];

export const whModuleMenu = [
    {
        name:'Form',
        id: 301,
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

        ],
    },

    {   name:'Report',
        id: 2,
        formName: "Report ",
        item:[

            {
                id: 1,
                formName: "Bin kard",
                url: "bin_kard",
            },
            {
                id: 2,
                formName: "Inventory ledger",
                url: "inventory_ledger",
            },
            
        ]
       
    },
  
];

export const purchaseModuleMenu = [
    {
        name:'Form',
        id: 601,
        formName: "Masters",
        item: [
            {
                id: 60101,
                formName: "Supplier master",
                url: "supplier_master",
            },
            {
                id: 60102,
                formName: "PO category",
                url: "po_category",
            },
            {
                id: 60103,
                formName: "Payment Terms",
                url: "payment_term",
            },

        ]
    },
    {
        name: "Report",
        id: 602,
        formName: "Purchase Management",
        item: [
            {
                id: 60201,
                formName: "Vendor Master",
                url: "vendor_master",
            },
            {
                id: 60202,
                formName: "Vendor-Wise Item Purchase",
                url: "vendor_wise_item_purchase",
            },
            {
                id: 60203,
                formName: "Vendor-wise Total Purchase",
                url: "vendor_wise_total_purchase",
            },
            {
                id: 60204,
                formName: "Daily Material Receipt",
                url: "daily_material_receipt",
            },
            {
                id: 60205,
                formName: "Monthly Purchase Summary",
                url: "monthly_purchase_summ",
            },

        ],
    },
];



