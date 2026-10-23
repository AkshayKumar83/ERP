const {db} = require("../../config/dbConnection");

const emptyRemover = (obj) => {
    return Object.fromEntries(
        Object.entries(obj).filter(
            ([key, value]) => value !== "" && value !== null
        )
    );
};

const uploadCsvRecord = async (req, res) => {
    const recordList = req.body;

    // Function to remove empty fields or convert empty strings to null
    const cleanRecord = (record) => {
        const cleanedRecord = {};
        for (const key in record) {
            if (record.hasOwnProperty(key)) {
                cleanedRecord[key] = record[key] === "" ? null : record[key];
            }
        }
        return cleanedRecord;
    };

    try {
        // Clean and filter records to remove any empty rows
        const cleanedRecordList = recordList
            .map(emptyRemover)
            .filter((item) => Object.keys(item).length > 0)
            .map(cleanRecord); // Apply the cleanRecord function

        if (cleanedRecordList.length === 0) {
            return res
                .status(400)
                .json({ message: "No valid data in CSV file" });
        }

        // Generate the SQL insert statement
        const col = Object.keys(cleanedRecordList[0]);
        const values = cleanedRecordList.map((item) => Object.values(item));
        const placeholders = values
            .map(
                (_, i) =>
                    `(${col
                        .map((_, j) => `$${i * col.length + j + 1}`)
                        .join(", ")})`
            )
            .join(", ");
        const flatValues = values.flat();

        const insertRec = `
                INSERT INTO temp_vend (${col.join(", ")})
                VALUES ${placeholders}
            `;

        // Execute the query
        await db.query(insertRec, flatValues);
        res.status(200).json({ message: "Data inserted successfully" });
    } catch (err) {
        console.error("Error inserting detail:", err);
        res.status(500).json({ message: err.message });
    }
};

const getCsvData = async (req, res) => {
    const makeQuery = req.query?.q;
    try {
        const getData = await db.query(makeQuery);
        if (getData.rows.length > 0) {
            res.status(200).json(getData.rows);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `Internal server Error ${error}` });
    }
};

const emptyTempVend = async (req, res) => {
    try {
        const removeData = await db.query("delete from temp_vend");
        if (removeData.rows.length === 0) {
            res.status(200).json({ message: "successfully form cancel" });
        } else {
            res.status(200).json({ message: "form not canceled" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `Internal server Error ${error}` });
    }
};

const CheckException = async (req, res) => {
    console.log("CheckException is running");
    try {
        await db.query(`
           DO $$
           DECLARE
             record_count INTEGER;
           BEGIN

			SELECT COUNT(*) INTO record_count
			FROM temp_vend
			WHERE v_code is null;

			IF record_count > 0 THEN
			  RAISE EXCEPTION '% Vendor code cannot be blank', record_count USING ERRCODE = 'P0001';
			END IF;

			select count(*) into record_count
			from temp_vend
			where bill_no is null;

			if record_count > 0 then
				raise exception '% Bill No cannot be blank', record_count USING ERRCODE = 'P0001';
			end if;


			select count(*) into record_count
			from temp_vend
			where bill_dt is null;

			if record_count > 0 then
				raise exception '% Bill Date cannot be blank', record_count USING ERRCODE = 'P0001';
			end if;


            select count(*) into record_count
			from temp_vend
			where amount < 0;

			if record_count > 0 then
				raise exception '% Bill amount cannot be in negative', record_count USING ERRCODE = 'P0001';
			end if;

            select count(*) into record_count
			from temp_vend
			where amount = 0;

			if record_count > 0 then
				raise exception '% Bill amount cannot be 0', record_count USING ERRCODE = 'P0001';
			end if;
            
            
            select count(*) into record_count
			from temp_vend x
			where not exists
			(select 1 from integral.mommvend y where x.v_code = y.v_code);

			if record_count>0 then
				raise exception '% Invalid vendor code', record_count using errcode = 'P0001';
			end if;


             SELECT COUNT(*) INTO record_count
             FROM temp_vend x
             WHERE EXISTS (
               SELECT 1 
               FROM integral.tdfmtran y 
               WHERE y.acc_no = 'S' || x.v_code
                 AND y.bill_no = x.bill_no
                 AND y.bill_dt = x.bill_dt
             );

             IF record_count > 0 THEN
               RAISE EXCEPTION '% Bill already uploaded', record_count USING ERRCODE = 'P0001';
             END IF;
           END $$;
        `);
        res.status(200).json({ message: "All records are valid" });
    } catch (error) {
        if (error.code === "P0001") {
            res.status(400).json({ message: error.message });
        } else {
            console.error(error);
            res.status(500).json({ message: "An unexpected error occurred" });
        }
    }
};

const getExceptionReport = async (req, res) => {
    try {
        const getData = await db.query(`
            	select h.*, TO_CHAR(bill_dt, 'YYYY-MM-DD') AS bill_dt, 'vendor null' as reason
	from temp_vend h
	where v_code is null
	
	union
	
	select h.*, TO_CHAR(bill_dt, 'YYYY-MM-DD') AS bill_dt, 'Bill no null' as reason
	from temp_vend h
	where bill_no is null
	
	union

	select h.*, TO_CHAR(bill_dt, 'YYYY-MM-DD') AS bill_dt, 'Bill dt null' as reason
	from temp_vend h
	where bill_dt is null
	
	union
	
	select h.*, TO_CHAR(bill_dt, 'YYYY-MM-DD') AS bill_dt, 'Amount null' as reason
	from temp_vend h
	where amount is null
	
	union
	
	select h.*, TO_CHAR(bill_dt, 'YYYY-MM-DD') AS bill_dt, 'Amount is 0' as reason
	from temp_vend h
	where amount = 0
	
	union
	
	select h.*, TO_CHAR(bill_dt, 'YYYY-MM-DD') AS bill_dt, 'Amount in negative' as reason
	from temp_vend h
	where amount < 0
	
	union
	
	select h.*, TO_CHAR(bill_dt, 'YYYY-MM-DD') AS bill_dt, 'vendor code is invalid' as reason
	from temp_vend h
	where not exists
	(select 1 from integral.mommvend y where h.v_code = y.v_code)
	
	union
	
	select h.*, TO_CHAR(bill_dt, 'YYYY-MM-DD') AS bill_dt, 'Vendor bill already exist' as reason
	from temp_vend h
	WHERE EXISTS (
               SELECT 1 
               FROM integral.tdfmtran y 
               WHERE y.acc_no = 'S' || h.v_code
                 AND y.bill_no = h.bill_no
                 AND y.bill_dt = h.bill_dt
             )

    union

    SELECT h.*, 
       TO_CHAR(h.bill_dt, 'YYYY-MM-DD') AS bill_dt,
       'Duplicate bill in excel' as reason
FROM temp_vend h
WHERE EXISTS (
               SELECT 1 
               FROM temp_vend y 
               WHERE y.v_code = h.v_code
                 AND y.bill_no = h.bill_no
                 AND TO_CHAR(y.bill_dt, 'YYYY-MM-DD') = TO_CHAR(h.bill_dt, 'YYYY-MM-DD')
               GROUP BY y.v_code, y.bill_no, TO_CHAR(y.bill_dt, 'YYYY-MM-DD')
               HAVING COUNT(*) > 1
             );

            `);
        if (getData.rows.length > 0) {
            res.status(200).json(getData.rows);
        } else {
            res.status(400).json({ message: `All record are valid` });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `Internal server error ${error}` });
    }
};

module.exports = {
    uploadCsvRecord,
    getCsvData,
    emptyTempVend,
    CheckException,
    getExceptionReport,
};
