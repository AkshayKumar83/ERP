import toast from "react-hot-toast";

export const uploadHeaders = [
  { label: "Sr.No", required: true, width: "5%" },
  { label: "Item Code", required: true, width: "17%",  },
  { label: "Item Name", required: true, width: "35%" },
  { label: "UOM Code", required: true, width: "3%" },
  { label: "Batch/ Sr.No.", required: true, width: "20%" },
  { label: "Batch Date", required: true, width: "3%" },
  { label: "Make", required: true, width: "10%" },
  { label: "Quantity", required: true, width: "5%" },
];

export const tempPhyinvUploadInitData = {
    wc_id:"",
    wc_name:"",
    inv_date:"",
    file_name:"",
    it_code:"",
    qty:"",
    it_name:"",
    rec_id:"",
    inv_month:"",
    uom:"",
    make:"",
    batch_no:"",
    batch_date:"",
}


export const WcNoHelpListHeader = [
  {label: "Wc Id",key:'wc_id'},
  {label: "Wc No",key:"wc_no"},
]

export const itCodeHelpListHeader = [
  {label: "Item Code",key:"it_code"},
  {label: "Item Name",key:"it_name"},
]

export const handleValidateHeaderField = (e, formStatus) => {
  if (formStatus !== "Update") return;

  const { name, value } = e.target;

  //  Only run validation for Inventory Date
  if (name === "inv_date") {
    const invDate = value ? new Date(value) : null;

    //  Check blank
    if (!invDate) {
      toast.error("Inventory Date cannot be left blank");
      e.target.focus();
      return;
    }

    //  Check if > current date + 1
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    // remove time part from comparison
    invDate.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);

    if (invDate > tomorrow) {
      toast.error("Inventory Date cannot be more than current date + 1");
      e.target.focus();
      return;
    }
  }
};






// export const tempInitData = {
//     file_name:"",
// }
    

//  post query fro TEMP_PHYINV_UPLOAD main table bhi yhi hai order by REC_ID, IT_CODE

// begin
//      Select it_name into :temp_phyinv_upload.IT_NAME from mommitem where it_code = :temp_phyinv_upload.IT_CODE;
// exception when no_data_found then
// 	  :temp_phyinv_upload.IT_NAME := 'Invalid Item Code';
// end;

// begin
// 	select wc_no into :temp_phyinv_upload.WC_NAME from mommwc
// 	where wc_id =  :temp_phyinv_upload.wc_id;
// exception when no_data_found then 
// 	null;
// end;	

// BEGIN
// 	select um_code into :temp_phyinv_upload.uom from mommitem m--,temp_phyinv_upload n
//    where m.IT_CODE=  :temp_phyinv_upload.IT_CODE;
// exception when no_data_found then
// 	null;
// END;

// item level Trigger inv-date
// if :TEMP_PHYINV_UPLOAD.inv_date is not null then
//   select to_char(:TEMP_PHYINV_UPLOAD.inv_date, 'MM') INTO :TEMP_PHYINV_UPLOAD.INV_MONTH FROM DUAL;
// end if;

// if :control.di_formstatus = 'UPDATE' then
// 	if :INV_DATE is null then
// 		error_message('Inventory Date cannot be left blank');
// 	  raise form_trigger_failure;
// 	end if;  
	  
// 	if :INV_DATE  > trunc(sysdate+1) then
// 	  error_message('Inventory Date cannot be more than current date+1.');
// 	  raise form_trigger_failure;
// 	end if;  
// end if;	
	

// helplist or it_code and wc_name ,month ki hai select field
// select it_code,it_name from mommitem a
// where not exists (select 1 from temp_phyinv_upload b
//                           where a.it_code = b.it_code)

// Select wc_no,wc_id from mommwc where division_id = :global.G_DIVISION_ID
// union
// select  wc_no,w.wc_id from mommwc w,moitparmdiv m where
// w. division_id = :global.G_DIVISION_ID and m.division_id=w.division_id
// and m.floor_stock_wc_id = w.wc_id

// select cmonth, to_char(to_number(month)) from vwmonths


  // --------------
// CREATE OR REPLACE PROCEDURE proc_gen_csv(
//     p_file_name IN VARCHAR,s
//     p_trans_year IN VARCHAR,
//     p_generated_file INOUT VARCHAR
// )
// LANGUAGE plpgsql
// AS $$
// DECLARE
//     v_html_path VARCHAR(1000);
//     v_fname VARCHAR(1000);
//     v_csv_path VARCHAR(1000);
//     v_row_count INT := 0;
// BEGIN
//     -- Fetch CSV path from moitparm
//     BEGIN
//         SELECT gst_return_csv_path INTO v_html_path FROM moitparm LIMIT 1;
//         IF v_html_path IS NULL THEN
//             RAISE EXCEPTION 'GST RETURN CSV PATH not defined in parameter master';
//         END IF;
//     EXCEPTION WHEN NO_DATA_FOUND THEN
//         RAISE EXCEPTION 'Package directory not defined in parameter master';
//     END;

//     -- Generate filename (e.g., HHMMSSphy_DATEWISE.csv)
//     v_fname := TO_CHAR(CURRENT_TIMESTAMP, 'HH24MISS') || 'phy_DATEWISE.csv';
//     v_csv_path := v_html_path || v_fname;

//     -- Create temporary table for CSV data
//     CREATE TEMP TABLE temp_csv_output (
//         item_code VARCHAR(100),
//         item_description VARCHAR(200),
//         error_type VARCHAR(100)
//     ) ON COMMIT DROP;

//     -- Insert exception data into temp table
//     INSERT INTO temp_csv_output (item_code, item_description, error_type)
//     SELECT 
//         t.it_code,
//         COALESCE((
//             SELECT it_name 
//             FROM mommitem 
//             WHERE it_code = t.it_code
//         ), '') AS item_description,
//         'Invalid Item Code' AS error_type
//     FROM temp_phyinv_upload t
//     WHERE t.file_name = p_file_name
//     AND NOT EXISTS (
//         SELECT 1 
//         FROM mommitem m 
//         WHERE m.it_code = t.it_code
//     )
//     UNION
//     SELECT DISTINCT 
//         t.it_code,
//         COALESCE((
//             SELECT it_name 
//             FROM mommitem 
//             WHERE it_code = t.it_code
//         ), '') AS item_description,
//         'Store Not Defined' AS error_type
//     FROM temp_phyinv_upload t
//     WHERE t.file_name = p_file_name
//     AND NOT EXISTS (
//         SELECT 1 
//         FROM mommitem m
//         JOIN mommstok o ON m.it_code = o.it_code
//         WHERE t.it_code = m.it_code
//         AND o.trans_year = p_trans_year
//         AND t.wc_id = o.wc_id
//     )
//     UNION
//     SELECT 
//         t.it_code,
//         COALESCE((
//             SELECT it_name 
//             FROM mommitem 
//             WHERE it_code = t.it_code
//         ), '') AS item_description,
//         'Negative Qty' AS error_type
//     FROM temp_phyinv_upload t
//     WHERE t.file_name = p_file_name
//     AND t.qty < 0
//     ORDER BY error_type;

//     -- Check if any rows were inserted
//     GET DIAGNOSTICS v_row_count = ROW_COUNT;
//     IF v_row_count = 0 THEN
//         DROP TABLE temp_csv_output;
//         p_generated_file := NULL;
//         RETURN;
//     END IF;

//     -- Write to CSV file
//     EXECUTE format(
//         'COPY (SELECT item_code, item_description, error_type FROM temp_csv_output) TO %L WITH (FORMAT CSV, HEADER TRUE, DELIMITER '','')',
//         v_csv_path
//     );

//     -- Fetch HTML path for URL
//     BEGIN
//         SELECT html_path INTO v_html_path FROM moitparm LIMIT 1;
//         IF v_html_path IS NULL THEN
//             RAISE EXCEPTION 'Package help directory not defined in parameter master under HTML PATH';
//         END IF;
//     EXCEPTION WHEN NO_DATA_FOUND THEN
//         RAISE EXCEPTION 'Package directory not defined in parameter master';
//     END;

//     -- Set OUT parameter with file URL
//     p_generated_file := v_html_path || v_fname;
// END;
// $$;