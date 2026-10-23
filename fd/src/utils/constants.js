export const BASE_API_URL = import.meta.env.VITE_BASE_API_URL


// ALL MODLE MENU DATA -- ALSO I OFFLOAD THIS DATA INTO APPHELPERS FOLDER IN MENUCONFIG FILE ON 27-12-2024
export const membershipModuleMenu = [
    {
        name: "Form",
        id: 1,
        formName: "Membership",
        item: [
            {
                id: "01",
                formName: "Dealer Uploading",
                url: "dealer_upload",
            },

            {
                id: "02",
                formName: "Member Onboarding",
                url: "member_onboarding_master",
            },
        ],
    },
    {
        name: "Form",
        id: 2,
        formName: "Loan",
        item: [
            {
                id: "01",
                formName: "Loan Type/Category",
                url: "loan_type",
            },
            {
                id: "02",
                formName: "Loan Repayment Schedule",
                url: "loan_repayment_schedule",
            },
            {
                id: "03",
                formName: "Loan Schedule Calculation",
                url: "loan_schedule_cal",
            },
            {
                id: "04",
                formName: "Loan Approval for Member",
                url: "loan_approval_member",
            },
            {
                id: "05",
                formName:
                    "Loan Receipt & Payment Adjustment Against Scheduled EMI's",
                url: "loan_rec_&_pay_adj",
            },
        ],
    },
    {
        name: "Report",
        id: 2,
        formName: "Membership Management",
        item: [
            {
                id: 1,
                formName: "All Member",
                url: "all_member",
            },
            {
                id: 2,
                formName: "All Dealer",
                url: "all_dealer",
            },
        ],
    },
];
export const adminModuleMenu = [
    {
        name: "Form",
        id: 1,
        formName: "Admin Management",
        item: [
            {
                id: 1,
                formName: "User Master",
                url: "user_master",
            },
            {
                id: 2,
                formName: "User Access Control Management",
                url: "user_acc_ctrl_mng",
            },
            {
                id: 3,
                formName: "Statewise Master",
                url: "statewise_master",
            },
            {
                id: 4,
                formName: "Finance Section Master",
                url: "fin_sec_master",
            },
            {
                id: 5,
                formName: "User Section Wise Access",
                url: "user_sec_wise_acc",
            },
            {
                id: 6,
                formName: "General Parameter(Division Wise)",
                url: "gen_param_divwise",
            },
            {
                id: 7,
                formName: "Tax Parameter Master",
                url: "tax_param_master",
            },
            {
                id: 8,
                formName: "General Parameter",
                url: "gen_param",
            },
            {
                id: 9,
                formName: "Aging Parameter",
                url: "age_param",
            },
            {
                id: 10,
                formName: "New User Creation",
                url: "new_uer_creation",
            },
            {
                id: 11,
                formName: "Division Master ",
                url: "div_mstr",
            },
            {
                id: 12,
                formName: "Year Opening Updation ",
                url: "year_open_update",
            },
            {
                id: 13,
                formName: "Code Definiton(Multiple Master)",
                url: "code_defination",
            },
            {
                id: 14,
                formName: "Financial Year Opening/Closing Transfer",
                url: "fin_year_open_or_close",
            },
            {
                id: 15,

                formName: "Email Alert Master",
                url: "email_alert_master",
            },

            {
                id: 16,

                formName: "Bulk Emailing for Dealer/Member Invoices",
                url: "bulk_email_debtor_or_member_inv",
            },

            {
                id: 17,
                formName: "Bulk Emailing for Debtor/Member ledger",
                url: "bulk_email_debtor_or_member_ledger",
            },

            {
                id: 18,

                formName: "Bulk Emailing for Upcoming EMI Due",
                url: "bulk_email_emi_due",
            },

            {
                id: 19,
                formName: "Bulk Emailing for Member Loan Overdue",
                url: "builk_email_member_loan",
            },

            {
                id: 20,
                formName: "Bulk Emailing for Vendor Ledger",
                url: "bulk_email_vendor",
            },
        ],
    },
];
export const purchaseModuleMenu = [
    {
        name: "Form",
        id: 1,
        formName: "Purchase Management",
        item: [
            {
                id: 1,
                formName: "Supplier Master",
                url: "supplier_master",
            },
            {
                id: 2,
                formName: "PO Category",
                url: "po_category",
            },
            {
                id: 3,
                formName: "Purchase Requisition(PR) based on Dealer Purchase",
                url: "purchase_requisition",
            },
            {
                id: 4,
                formName: "Purchase Order & Amendment",
                url: "purchase_odr_&_amendment",
            },
            {
                id: 5,
                formName: "PO Signatory",
                url: "po_signatory",
            },
            {
                id: 6,
                formName: "Payment Terms",
                url: "payment_term",
            },
            {
                id: 7,
                formName: "Stock opening balances(YOY)",
                url: "stock_opening_bal",
            },
        ],
    },
    {
        name: "Report",
        id: 2,
        formName: "Purchase Management",
        item: [
            {
                id: 1,
                formName: "Monthly Purchase Summary",
                url: "monthly_purchase_summ",
            },
            {
                id: 2,
                formName: "Vendor-Wise Item Purchase",
                url: "vendor_wise_item_purchase",
            },
            {
                id: 3,
                formName: "Vendor-wise Total Purchase",
                url: "vendor_wise_total_purchase",
            },
            {
                id: 4,
                formName: "Daily Material Receipt",
                url: "daily_material_receipt",
            },
            {
                id: 5,
                formName: "Daily Material Receipt",
                url: "daily_material_receipt",
            },
            {
                id: 6,
                formName: "Production Pendancy - WC wise",
                url: "production_pendancy_wc_wise",
            },


 
        ],
    },
];
export const saleModuleMenu = [
    {
        name: "Form",
        id: 1,
        formName: "Sale Management",
        item: [
            {
                id: 1,
                formName: "Customer Master",
                url: "cutomer_master",
            },
            {
                id: 2,
                formName: "Import Dealer Master",
                url: "import_dealer_master",
            },
            {
                id: 3,
                formName: "Product Master",
                url: "product_master",
            },
            {
                id: 4,
                formName: "Invoicing",
                url: "invoicing",
            },
            {
                id: 5,
                formName: "Price Master",
                url: "price_master",
            },
            {
                id: 6,
                formName: "E-Invoicing Interface",
                url: "e_invoicing_interface",
            },
            {
                id: 7,
                formName: "Bulk Invoicing Upload for Service Charges",
                url: "bulk_invoicing_upload",
            },
            {
                id: 8,
                formName: "Sales Return Process",
                url: "sales_return_process",
            },
        ],
        // url: "cutomer_master",
    },
    {
        name: "Report",
        id: 2,
        formName: "Sales Management",
        item: [
            {
                id: 1,
                formName: "Sales By Items",
                url: "sales_by_item",
            },
            {
                id: 2,
                formName: "Sales By State",
                url: "sales_by_state",
            },
            {
                id: 3,
                formName: "Sales By Customer",
                url: "sales_by_customer",
            },
            {
                id: 4,
                formName: "Invoice Summary",
                url: "invoice_summary",
            },
        ],
    },
];
export const whModuleMenu = [
    {
        name: "Form",
        id: 1,
        formName: "Warehouse Managment",
        item: [
            {
                id: 1,
                formName: "Item Master Managment",
                url: "item_master_mng",
            },
            {
                id: 2,
                formName: "WH Store Master",
                url: "wh_store_master",
            },
            {
                id: 3,
                formName: "Transaction Master",
                url: "transaction_master",
            },
            {
                id: 4,
                formName: "Goods Inward",
                url: "goods_inward",
            },
            {
                id: 5,
                formName: "Store Management",
                url: "store_mng",
            },
            {
                id: 6,
                formName: "Material Issue",
                url: "material_issue",
            },
            {
                id: 7,
                formName: "Inventory Ledger",
                url: "inventory_ledger",
            },
            {
                id: 8,
                formName: "Unit Master",
                url: "unit_master",
            },
            {
                id: 9,
                formName: "Unit Conversion Master",
                url: "unit_conversion_master",
            },
            {
                id: 10,
                formName: "Store Opening Balances(YOY)",
                url: "store_opening_bal",
            },
        ],
    },
    {
        name: "Report",
        id: 2,
        formName: "Warehouse Managment",
        item: [
            {
                id: 1,
                formName: "Bin Kard",
                url: "bin_kard",
            },
            {
                id: 2,
                formName: "Inventory Ledger",
                url: "inventory_ledger",
            },
        ],
    },
];
export const finModuleMenu = [
    {
        name: "Form",
        id: 1,
        formName: "Finance Management",
        item: [
            {
                id: 1,
                formName: "Expense Voucher",
                url: "exp_voucher",
            },
            {
                id: 2,
                formName: "GL Master",
                url: "gl_master",
            },
            {
                id: 3,
                formName: "Concept of Control Accounting",
                url: "control_accounting",
            },
            {
                id: 4,
                formName: "AP Bill for Purchase",
                url: "ap_bill_for_purchase",
            },
            {
                id: 5,
                formName:
                    "Roll Up Master for B/S & P/L Schedules/Sub Schedules",
                url: "roll_up_master",
            },
            {
                id: 6,
                formName: "Journal Voucher",
                url: "journal_voucher",
            },
            {
                id: 7,
                formName: "Bank Voucher for loan Repayments",
                url: "bank_voucher_loan_repay",
            },
            {
                id: 8,
                formName: "Bank Voucher for Dealer Payment Receipts",
                url: "bank_voucher_dealer_pay_receipt",
            },
            {
                id: 9,
                formName: "Payment Advice for Vendors",
                url: "payment_advice_for_vender",
            },
            {
                id: 10,
                formName: "Cash Voucher",
                url: "cash_voucher",
            },
            {
                id: 11,
                formName: "Debit/Credit Note Vouchers (w/o GST)",
                url: "debit_credit_not_voucher",
            },
            {
                id: 12,
                formName: "Cost Centre linked with Expenses",
                url: "cost_centre_with_exp",
            },
            {
                id: 13,
                formName: "Bank Reco",
                url: "bank_reco",
            },
            {
                id: 14,
                formName:
                    "Opening Balances for Debtors/Creditors for start off",
                url: "opening_bal_for_debtors_creditors",
            },
            {
                id: 15,
                formName: "A/c Detail Query for any single account on screen",
                url: "acc_detail_query_single",
            },
            {
                id: 16,
                formName: "Vendor TDS Master",
                url: "vendor_tds_master",
            },
            {
                id: 17,
                formName: "Upload Voucher in Bulk for all types",
                url: "uplaod_voucher_bulk",
            },
            {
                id: 18,
                formName: "A/c Grouping between code & sub codes",
                url: "acc_group_code_subcode",
            },
        ],
    },
    {
        name: "Form",
        id: 2,
        formName: "GST",
        item: [
            {
                id: 1,
                formName: "State Wise GST",
                url: "state_wise_gst_mstr",
            },
            {
                id: 2,
                formName: "GST Accounts ",
                url: "gst_acc_master",
            },
            {
                id: 3,
                formName: "GST Debit/Credit Notes ",
                url: "gst_debit_credit_note_with_financials",
            },
            {
                id: 4,
                formName: "GSTR1 & 3returns",
                url: "gstR1_3return",
            },
            {
                id: 5,
                formName: "ITC Entry",
                url: "itc_entry",
            },
        ],
    },
    {
        name: "Report",
        id: 2,
        formName: "Finance Management",
        item: [
            {
                id: 1,
                formName: "Bank Book",
                url: "bank_book",
            },
            {
                id: 2,
                formName: "GSTR-1 and GSTR-3B",
                url: "gstr_1_3b",
            },
            {
                id: 3,
                formName: "Vendor-Wise Outstanding",
                url: "vender_wise_outstanding",
            },
            {
                id: 4,
                formName: "Account Ledger",
                url: "acc_ledger",
            },
            {
                id: 5,
                formName: "Bank Reco",
                url: "bank_reco"
            },
            {
                id: 6,
                formName: "Party Ledger Dump",
                url: "party_ledger_dump",
            },
        ],
    },
];