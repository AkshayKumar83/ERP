// const emailQueue = require('../../../utility/emailQueue');
const { db } = require("../../../config/dbConnection");

const custEmailId = [
  { cust_code: 'M3598', email: 'amitrawat9810@gmail.com', name: 'Test1' },
  { cust_code: 'M4848', email: 'learnwithme210698@gmail.com', name: 'Test2' },
  { cust_code: 'M6081', email: 'amitrawat981063@gmail.com', name: 'Test3' },
  { cust_code: 'M6146', email: 'learnwithpradeep17@gmail.com', name: 'Test4' },
];

exports.queueInvoices = async (req, res) => {
  try {
    const users = await getUserList(); // returns an array

    for (const user of users) {
      await emailQueue.add('sendEmail', {
        email: user.email,
        name: user.name,
        userId: user.inv_id,
      });
    }

    res.status(200).json({ message: 'Invoices queued successfully', count: users.length });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error while queueing emails' });
  }
};

const getUserList = async () => {
  const getCustomerList = await db.query(
    `SELECT DISTINCT c_code FROM mhsminv WHERE trans_year = $1 AND inv_type = $2`,
    ['2025', 'V']
  );

  if (getCustomerList.rowCount === 0) {
    throw new Error('No customer found');
  }

  const customerData = await Promise.all(
    getCustomerList.rows.map(async (row) => {
      const code = row.c_code;
      const invoiceRes = await db.query(
        `SELECT * FROM mhsminv WHERE c_code = $1 ORDER BY inv_dt DESC LIMIT 1`,
        [code]
      );

      const invoice = invoiceRes.rows[0];
      const emailMatch = custEmailId.find((item) => item.cust_code === code);

      if (!emailMatch || !invoice) return null;

      return {
        email: emailMatch.email,
        name: emailMatch.name,
        inv_id: invoice.inv_id,
      };
    })
  );

  // Filter out any nulls (customers not in test list or missing invoice)
  return customerData.filter(Boolean);
};
