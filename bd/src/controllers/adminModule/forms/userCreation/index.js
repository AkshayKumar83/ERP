const catchAsync = require("../../../../utility/catchAsync");
const { db } = require("../../../../config/dbConnection");
const bcrypt = require("bcrypt");
const {
  generateSingleInsertQuery,
  cleanObject,
} = require("../../../../utility/query");
const { transToUserMasterDbData } = require("./presentation");

const TABLE_NAMES = {
  USERMASTER: "user_master",
  GET_USER_ID_BY_SEQUENCE: "nextval('integral.s_user_master_user_id')",
};

exports.postUserDetails = catchAsync(async (req, res) => {
  console.log("for insert:", req.body);

  const requestUserId = req.body.userId; // logged-in user
  let { passwrd, retype_pass, ...formData } = req.body.formData;

  try {
    await db.query("BEGIN");

    // ---------------------------
    // VALIDATION
    // ---------------------------
    if (!passwrd || !retype_pass) {
      throw new Error("Please fill all required fields to create user");
    }

    if (passwrd !== retype_pass) {
      throw new Error("Your new password does not match the re-typed password");
    }

    // ---------------------------
    // CHECK PASSWORD STRENGTH
    // ---------------------------
    const checkPassword = await db.query(
      `SELECT check_password_strength($1)`,
      [passwrd]
    );

    // if (!checkPassword.rows[0]?.check_password_strength) {
    //   throw new Error("Password is too weak");
    // }

    // ---------------------------
    // GENERATE NEW USER_ID
    // ---------------------------
    const seqRes = await db.query(
      `SELECT ${TABLE_NAMES.GET_USER_ID_BY_SEQUENCE} AS next_id`
    );

    const newUserId = seqRes.rows[0].next_id;
    console.log("Generated User ID:", newUserId);  

    formData.login_name = formData.login_name || formData.user_name;

    // ---------------------------
    // HASH THE PASSWORD
    // ---------------------------
    const hashedPassword = await bcrypt.hash(passwrd, 10);
    formData.user_password = hashedPassword;

    // ---------------------------
    // PREPARE DATA FOR INSERT
    // ---------------------------
    const userMasterData = transToUserMasterDbData(
      { ...formData, user_id: newUserId },
      requestUserId
    );

    const insertQuery = generateSingleInsertQuery(
      TABLE_NAMES.USERMASTER,
      userMasterData
    );

    const values = Object.values(userMasterData);

    await db.query(insertQuery, values);

    // ---------------------------
    // COMMIT
    // ---------------------------
    await db.query("COMMIT");

    return res.status(200).json({
      type: "success",
      message: "User created successfully",
      user_id: newUserId,
    });

  } catch (error) {
    console.error("Error in postUserDetails:", error);
    await db.query("ROLLBACK");
    return res
      .status(500)
      .send({ type: "error", message: error.message || "Insert failed" });
  }
});
