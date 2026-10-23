const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const bcrypt = require("bcrypt");
const {
  generateSingleInsertQuery,
  cleanObject,
} = require("../../../../utility/query");

const TABLE_NAMES = {
  USERMASTER: "user_master",
};

// exports.updatePasswordDetails = catchAsync(async (req, res) => {
//   console.log("for update:", req.body);

//   const userId = req.body.userId;

//   const { new_pass, old_pass, ...formData } = req.body.formData;
//   //console.log("Plain old_pass to send:", old_pass);
//   try {
//     await db.query("BEGIN");
//     if (!new_pass || !old_pass || !formData?.retype_pass) {
//       throw new Error("Please fill all required field to update passward");
//     }

//     if(new_pass === formData?.retype_pass){
//         throw new Error('Your New passward not match with re-type passward')
//     }

//     // check Old passward
//     const checkPassword = await db.query(
//       `SELECT user_password FROM ${TABLE_NAMES.USERMASTER} WHERE user_id = $1`,
//       [userId]
//     );

//     const storedPassword = checkPassword.rows[0]?.user_password;

//     //console.log("old_pass:", old_pass);
//     //console.log("storedPassword:", storedPassword);

//     // COMPAIR PASSWORD
//     const isPasswordValid = await bcrypt.compare(old_pass, storedPassword);
//     if (!isPasswordValid) {
//       return res.status(401).json({ error: "Old Passward is incorrect" });
//     }

//     // if (!old_pass || !storedPassword) {
//     //     throw new Error("Missing old password or stored password for comparison.");
//     // }

//     // make new hash passward
//     const hashedPassword = await bcrypt.hash(new_pass, 10);

//     // doing update the password
//     const updatePass = await db.query(`update ${TABLE_NAMES.USERMASTER} set user_password = $1 where user_id = $2`,[hashedPassword, userId])

//     await db.query('commit')

//   } catch (error) {
//     console.error("Error :", error);
//     await db.query("ROLLBACK");
//     return res.status(500).send({ type:'error', message:  error.message || "Update failed" });
//   }
// });



exports.updatePasswordDetails = catchAsync(async (req, res) => {
  console.log("for update:", req.body);

  const userId = req.body.userId;
  const { new_pass, old_pass, ...formData } = req.body.formData;

  try {
    await db.query("BEGIN");

    if (!new_pass || !old_pass || !formData?.retype_pass) {
      throw new Error("Please fill all required fields to update password");
    }

    if (new_pass !== formData?.retype_pass) {
      throw new Error("Your new password does not match the re-typed password");
    }

    const checkPassword = await db.query(
      `SELECT user_password FROM ${TABLE_NAMES.USERMASTER} WHERE user_id = $1`,
      [userId]
    );

    const storedPassword = checkPassword.rows[0]?.user_password;

    const isPasswordValid = await bcrypt.compare(old_pass, storedPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Old password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(new_pass, 10);

    await db.query(
      `UPDATE ${TABLE_NAMES.USERMASTER} SET user_password = $1 WHERE user_id = $2`,
      [hashedPassword, userId]
    );

    await db.query("COMMIT");

    return res.status(200).json({ type: 'success', message: 'Password updated successfully' });
  } catch (error) {
    console.error("Error:", error);
    await db.query("ROLLBACK");
    return res.status(500).send({ type: 'error', message: error.message || "Update failed" });
  }
});
