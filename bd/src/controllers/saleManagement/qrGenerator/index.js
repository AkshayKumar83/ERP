const QRCode = require("qrcode");

const { v4: uuidv4 } = require("uuid");

const { db } = require("../../../config/dbConnection");

const catchAsync = require("../../../utility/catchAsync");


// SEARCH INVOICE
exports.searchInvoiceForQR = catchAsync(async (req, res) => {

  const { inv_no } = req.query;

  if (!inv_no) {
    return res.status(400).json({
      type: "error",
      message: "Invoice no is required",
    });
  }

  // HEADER DATA
  const hdrQuery = `
  
      SELECT
          inv_no,
          inv_dt,
          c_code,
          c_name,
          cust_gst,
          cust_add
      FROM mhsminv
      WHERE inv_no = $1
  
  `;

  const hdrResult = await db.query(hdrQuery, [inv_no]);

  if (hdrResult.rowCount === 0) {
    return res.status(404).json({
      type: "error",
      message: "Invoice not found",
    });
  }

  // ITEM DATA
  const dtlQuery = `
  
      SELECT
          it_code,
          it_desc,
          it_um_cd,
          qty,
          rate,
          batch_no
      FROM mdsminv
      WHERE inv_id = (
          SELECT inv_id
          FROM mhsminv
          WHERE inv_no = $1
      )
      ORDER BY sr_no
  
  `;

  const dtlResult = await db.query(dtlQuery, [inv_no]);

  return res.status(200).json({
    type: "success",
    data: {
      ...hdrResult.rows[0],
      items: dtlResult.rows,
    },
  });

});


// GENERATE QR
exports.generateInvoiceQR = catchAsync(async (req, res) => {

  const { inv_no } = req.body;

  if (!inv_no) {
    return res.status(400).json({
      type: "error",
      message: "Invoice no required",
    });
  }

  await db.query("BEGIN");

  try {

    // FETCH HEADER
    const hdrResult = await db.query(
      `
      SELECT
          inv_no,
          inv_dt,
          c_code,
          c_name,
          cust_gst,
          cust_add
      FROM mhsminv
      WHERE inv_no = $1
      `,
      [inv_no]
    );

    if (hdrResult.rowCount === 0) {

      await db.query("ROLLBACK");

      return res.status(404).json({
        type: "error",
        message: "Invoice not found",
      });
    }

    // FETCH ITEMS
    const dtlResult = await db.query(
      `
      SELECT
          it_code,
          it_desc,
          it_um_cd,
          qty,
          rate,
          batch_no
      FROM mdsminv
      WHERE inv_id = (
          SELECT inv_id
          FROM mhsminv
          WHERE inv_no = $1
      )
      ORDER BY sr_no
      `,
      [inv_no]
    );

    const invoiceHdr = hdrResult.rows[0];

    const invoiceItems = dtlResult.rows;

    // GENERATE QR ID
    const qr_id = uuidv4();

    // INSERT HEADER
    await db.query(
      `
      INSERT INTO mosminv_qr_hdr(
          qr_id,
          inv_no,
          inv_dt,
          c_code,
          c_name,
          cust_gst,
          cust_add
      )
      VALUES(
          $1,$2,$3,$4,$5,$6,$7
      )
      `,
      [
        qr_id,
        invoiceHdr.inv_no,
        invoiceHdr.inv_dt,
        invoiceHdr.c_code,
        invoiceHdr.c_name,
        invoiceHdr.cust_gst,
        invoiceHdr.cust_add,
      ]
    );

    // INSERT DETAILS
    for (const item of invoiceItems) {

      await db.query(
        `
        INSERT INTO mosminv_qr_dtl(
            qr_id,
            it_code,
            it_name,
            uom,
            rate,
            qty,
            batch_no
        )
        VALUES(
            $1,$2,$3,$4,$5,$6,$7
        )
        `,
        [
          qr_id,
          item.it_code,
          item.it_desc,
          item.it_um_cd,
          item.rate,
          item.qty,
          item.batch_no,
        ]
      );

    }

    // QR PAYLOAD
    const qrPayload = JSON.stringify({
      qr_id,
      inv_no,
    });

    // GENERATE QR IMAGE
    const qrImage = await QRCode.toDataURL(qrPayload);

    await db.query("COMMIT");

    return res.status(200).json({
      type: "success",
      qr_id,
      qrImage,
    });

  } catch (error) {

    await db.query("ROLLBACK");

    console.error(error);

    return res.status(500).json({
      type: "error",
      message: error.message,
    });

  }

});