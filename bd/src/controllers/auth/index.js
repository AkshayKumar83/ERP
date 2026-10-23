const { db } = require("../../config/dbConnection");
const crypto = require("crypto");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../../utility/sendEmail");


const SECRET_KEY = process.env.SECRET_KEY_FOR_AUTH;

const TABLE_NAMES = {
  USERS_LIST: "user_master", //'MOEDUSER_TEST'
  USER_ID_SEQ: "s_user_master_user_id",
};

const userRegister = async (req, res) => {
  const newUser = {
    user_name: req.body.username,
    email: req.body.email,
    password: req.body.password,
  };
  newUser.user_name = newUser.user_name.toUpperCase();

  try {
    // CHECK ALL FIELDS EXIST
    if (!newUser.user_name || !newUser.email || !newUser.password) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    // CHECK IF USER ALREADY EXISTS
    const q = `SELECT * FROM ${TABLE_NAMES.USERS_LIST} WHERE user_name = $1`;
    const isUserExist = await db.query(q, [newUser.user_name]);
    if (isUserExist.rowCount > 0) {
      return res.status(400).json({ error: "User is already registered!" });
    }

    // HASH THE PASSWORD
    const hashedPassword = await bcrypt.hash(newUser.password, 10);

    newUser.password = hashedPassword;

    // GENERATE USER ID
    const userIdResult = await db.query(
      `SELECT nextval('${TABLE_NAMES.USER_ID_SEQ}')`
    );
    const userId = userIdResult.rows[0].nextval;

    // INSERT NEW USER
    const r = `
            INSERT INTO user_master(
                user_id, user_name, login_name, email_id, user_password, is_group, create_dt, create_id
            ) VALUES (
                $1, $2, $3, $4, $5, $6, FETCH_CREATE_UPDATE_DATE(), $7
            )`;
    await db.query(r, [
      userId,
      newUser.user_name,
      newUser.user_name,
      newUser.email,
      newUser.password,
      "N",
      userId,
    ]);

    // // INSERT USER DIVISION
    // const createUserDivQuery = `
    //     INSERT INTO user_division(
    //         user_id, division_id, default_division, create_id, create_date,
    //     ) VALUES (
    //         $1, $2, $3, $4, FETCH_CREATE_UPDATE_DATE()
    //     )`;

    // await db.query(createUserDivQuery, [ userId, 3, 'Y', userId]);

    //  // INSERT USER LOCATION
    //  const createUserLocQuery = `
    //  INSERT INTO user_location(
    //      user_id, division_id, default_division, create_id, create_date,
    //  ) VALUES (
    //      $1, $2, $3, $4, FETCH_CREATE_UPDATE_DATE()
    //  )`;

    // await db.query(createUserDivQuery, [ userId, 3, 'Y', userId]);

    return res
      .status(201)
      .json({ message: "User has been registered successfully!" });
  } catch (err) {
    console.error(err.message);
    return res
      .status(500)
      .json({ error: "An error occurred during user registration." });
  }
};

// login
// const userLogin = async (req, res) => {
//     const { username: email, password } = req.body;
//    // ** The email is User Name **
//     try {
//         if (!email || !password) {
//             return res.status(400).json({ error: "User Name and Password are required." });
//         }
//         let userName = email.toUpperCase()

//         // console.log(userName)

//         // CHECK USER EXISTENCE
//         // const query = `SELECT * FROM ${TABLE_NAMES.USERS_LIST} WHERE email_id = $1`;
//         const query = `SELECT * FROM ${TABLE_NAMES.USERS_LIST} WHERE  user_name = $1`;
//         // const query = `SELECT * FROM pg_user WHERE  UPPER(usename) = $1`;
//         const result = await db.query(query, [userName]);

//         if (!result.rowCount) {
//             return res.status(401).json({ error: "Invalid Credential." });
//         }

//         const user = result.rows[0];

//         // COMPAIR PASSWORD
//         const isPasswordValid = await bcrypt.compare(password, user.user_password);
//         if (!isPasswordValid) {
//             return res.status(401).json({ error: "Invalid Credential." });
//         }

//         // JWT TOKEN GENERATION
//         const token = jwt.sign({ user_id: user.user_id }, SECRET_KEY, {
//             expiresIn: "24h",
//         });

//         //todo:  Confirm the logic for pickingup the default division
//         // Selecting division
//         let getUserDivision  = await db.query(` select u.division_id, d.name from
//                 user_division u, moitdivision d
//                 where user_id = $1
//                 and default_division = $2
//                 and d.division_id = u.division_id
//             `,[user.user_id, 'Y'])

//         //todo: Do confirm pickup division_id
//         if(!getUserDivision.rowCount){
//             getUserDivision.rows = [{division_id: 1}]
//         }

//         let getUnitName = await db.query('select * from moitdivision where division_id = $1', [getUserDivision.rows[0].division_id])
//         if(getUnitName.rowCount){
//             getUnitName.rows = [{name: (`Escorts Dealers Development Association Limited`).toUpperCase()}]
//         }

//         let getCrntFinYear = await db.query(`select * from moitfinyear where flag = $1`, ['C'])

//         let crntDate = new Date();
//         const crntYear = crntDate.getFullYear();

//         if(!getCrntFinYear.rowCount){
//             getCrntFinYear.rows = [{year_code: crntYear }]
//         }

//         // res.cookie("auth_token", token, {
//         //     httpOnly: true,
//         //     secure: process.env.NODE_ENV === "production" ? true : false,
//         //     sameSite: "strict",
//         //     maxAge: 24 * 60 * 60 * 1000, // 24 hours
//         //     path: "/", // Ensure the cookie is available across the entire site
//         // });

//         res.cookie("auth_token", token, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === "production" ? true : false,  // Use `false` for local development
//             sameSite: "none",
//             maxAge: 24 * 60 * 60 * 1000, // 24 hours
//             path: "/",
//         });

//         // Respond with success
//         res.status(200).json({
//             message: "Login successful.",
//             user: {
//                 user_id: user.user_id,
//                 user_name: user.user_name,
//                 division_id:getUserDivision.rows[0]?.division_id,
//                 year_code:getCrntFinYear.rows[0]?.year_code,
//                 division_name:getUnitName.rows[0]?.name
//             },
//         });
//     } catch (error) {
//         console.error("Error logging in:", error);
//         res.status(500).json({
//             error: `An error occurred while logging due to ${error.message}`,
//         });
//     }
// };

// login
// const userLogin = async (req, res) => {
//   const { username: email, password } = req.body;
//   // ** The email is User Name **
//   try {
//     if (!email || !password) {
//       return res
//         .status(400)
//         .json({ error: "User Name and Password are required." });
//     }
//     let userName = email.toUpperCase();

//     // console.log(userName)

//     // CHECK USER EXISTENCE
//     // const query = `SELECT * FROM ${TABLE_NAMES.USERS_LIST} WHERE email_id = $1`;
//     const query = `SELECT * FROM ${TABLE_NAMES.USERS_LIST} WHERE  user_name = $1`;
//     // const query = `SELECT * FROM pg_user WHERE  UPPER(usename) = $1`;
//     const result = await db.query(query, [userName]);

//     if (!result.rowCount) {
//       return res.status(401).json({ error: "Invalid Credential." });
//     }

//     const user = result.rows[0];

//     // COMPAIR PASSWORD
//     const isPasswordValid = await bcrypt.compare(password, user.user_password);
//     if (!isPasswordValid) {
//       return res.status(401).json({ error: "Invalid Credential." });
//     }

//     // console.log('working on crypto')
//     // console.log(user)
//     // // MD5 hash the input password
//     // const md5Password = crypto.createHash('md5').update(password).digest('hex');

//     // // Compare the MD5 hashed password with the one in pg_user
//     // if (md5Password !== user.passwd) {
//     //     return res.status(401).json({ error: "Invalid Credential." });
//     // }

//     // // JWT TOKEN GENERATION
//     // const token = jwt.sign({ user_id: user.user_id }, SECRET_KEY, {
//     //     expiresIn: "1h",
//     // });

//     // JWT TOKEN GENERATION
//     const token = jwt.sign({ user_id: user.user_id }, SECRET_KEY, {
//       expiresIn: "24h",
//     });

//     //todo:  Confirm the logic for pickingup the default division
//     // Selecting division
//     let getUserDivision = await db.query(
//       ` select u.division_id, d.name from
//                 user_division u, moitdivision d
//                 where user_id = $1
//                 and default_division = $2
//                 and d.division_id = u.division_id
//             `,
//       [user.user_id, "Y"]
//     );
//     // let getUserDivision  = await db.query(`select * from user_division where user_id = $1`, [user.usesysid])

//     //todo: Do confirm pickup division_id
//     if (!getUserDivision.rowCount) {
//       getUserDivision.rows = [{ division_id: 1 }];
//     }

//     let getUnitName = await db.query(
//       "select * from moitdivision where division_id = $1",
//       [getUserDivision.rows[0].division_id]
//     );
//     if (getUnitName.rowCount) {
//       getUnitName.rows = [
//         {
//           name: `Escorts Dealers Development Association Limited`.toUpperCase(),
//         },
//       ];
//     }

//     let getCrntFinYear = await db.query(
//       `select * from moitfinyear where flag = $1`,
//       ["C"]
//     );

//     let crntDate = new Date();
//     const crntYear = crntDate.getFullYear();

//     if (!getCrntFinYear.rowCount) {
//       getCrntFinYear.rows = [{ year_code: crntYear }];
//       // console.log('pickup self builded current year')
//     }

//     res.cookie("auth_token", token, {
//       httpOnly: true,
//       // secure: process.env.NODE_ENV === "production" ? true : false,
//       secure: false,
//       // sameSite: "strict",
//       sameSite: "lax",
//       maxAge: 24 * 60 * 60 * 1000, // 24 hours
//       path: "/", // Ensure the cookie is available across the entire site
//     });

//     // Respond with success
//     res.status(200).json({
//       message: "Login successful.",
//       user: {
//         user_id: user.user_id,
//         // user_id: user.usesysid,
//         user_name: user.user_name,
//         // user_name: user.usename,
//         division_id: getUserDivision.rows[0]?.division_id,
//         year_code: getCrntFinYear.rows[0]?.year_code,
//         division_name: getUnitName.rows[0]?.name,
//       },
//     });
//   } catch (error) {
//     console.error("Error logging in:", error);
//     res.status(500).json({
//       error: `An error occurred while logging due to ${error.message}`,
//     });
//   }
// };

// login via OTP
const userLogin = async (req, res) => {
  const { username, otp } = req.body;

  try {
    if (!otp || !username) {
      return res
        .status(400)
        .json({ error: "otp and username required." });
    }

    // CHECK USER EXISTENCE
    const query = `SELECT * FROM ${TABLE_NAMES.USERS_LIST} WHERE  upper(user_name) = upper($1)`;
    const result = await db.query(query, [username]);

    
    if (!result.rowCount) {
        return res.status(401).json({type:'error', message: "Invalid Credential." });
    }
    
    const user = result.rows[0];
    // CHECK OTP EXIST WITH VALID OTP
    const isValidOtp = await db.query(`select 'Y' from ${TABLE_NAMES.USERS_LIST} where user_id = $1 and otp = $2`,[user?.user_id, otp])

    if(isValidOtp.rowCount == 0){
        return res.status(401).json({type:'error', message:"Invalid OTP"})
    }

    // JWT TOKEN GENERATION
    const token = jwt.sign({ user_id: user.user_id }, SECRET_KEY, {
      expiresIn: "24h",
    });

    //todo:  Confirm the logic for pickingup the default division
    // Selecting division
    let getUserDivision = await db.query(
      ` select u.division_id, d.name from
                user_division u, moitdivision d
                where user_id = $1
                and default_division = $2
                and d.division_id = u.division_id
            `,
      [user.user_id, "Y"]
    );
    // let getUserDivision  = await db.query(`select * from user_division where user_id = $1`, [user.usesysid])

    //todo: Do confirm pickup division_id
    if (!getUserDivision.rowCount) {
      getUserDivision.rows = [{ division_id: 1 }];
    }

    let getUnitName = await db.query(
      "select * from moitdivision where division_id = $1",
      [getUserDivision.rows[0]?.division_id]
    );
    // if (getUnitName.rowCount) {
    //   getUnitName.rows = [
    //     {
    //       name: `Escorts Dealers Development Association Limited`.toUpperCase(),
    //     },
    //   ];
    // }

    let getCrntFinYear = await db.query(`select * from moitfinyear where flag = $1`,
      ["C"]
    );

    // let crntDate = new Date();
    // const crntYear = crntDate.getFullYear();

    // if (!getCrntFinYear.rowCount) {
    //   getCrntFinYear.rows = [{ year_code: crntYear }];
    //   // console.log('pickup self builded current year')
    // }

    
    res.cookie("auth_token", token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production" ? true : false,
      secure: false,
      // sameSite: "strict",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: "/", // Ensure the cookie is available across the entire site
    });


    // Respond with success
    res.status(200).json({
      message: "Login successful.",
      user: {
        user_id: user.user_id,
        // user_id: user.usesysid,
        user_name: user.user_name,
        // user_name: user.usename,
        division_id: getUserDivision.rows[0]?.division_id,
        year_code: getCrntFinYear.rows[0]?.year_code,
        division_name: getUnitName.rows[0]?.name,
      },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({
      type:'error', message: `An error occurred while logging due to ${error.message}`,
    });
  }
};


// send opt after athenticate the user via username and passward
const sendOTP = async (req, res) => {
    let { username, password } = req.body;
  try {
    // check field values
     if (!username || !password) {
      return res
        .status(400)
        .json({type:'error', message: "User Name and Password are required." });
    }

     username = username.toUpperCase();

    const isUserExist = await db.query(
      "select * from user_master where upper(user_name) = upper($1)",
      [username]
    );

    if (!isUserExist.rowCount) {
      return res.status(401).json({type:'error', message: "Invalid Login Credential." });
    }

    const user = isUserExist.rows[0];

    // COMPAIR PASSWORD
    const isPasswordValid = await bcrypt.compare(password, user.user_password);
    if (!isPasswordValid) {
      return res.status(401).json({type:'error', message: "Invalid Login Credential." });
    }


    const getEmailText = await db.query(
      `select create_and_send_otp($1) as otp`,
      [username]
    );

const otp = getEmailText.rows[0]?.otp;

const emailSubject = 'Your Verification Code - Eddal Dealers Development Association Limited.';

const emailBody = `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px;">
    <h2 style="color: #333; font-weight: 600;">Your One-Time Password (OTP)</h2>
    <p style="font-size: 14px; color: #555;">Dear User,</p>
    <p style="font-size: 14px; color: #555;">Please use the following OTP to complete your verification process:</p>
    
    <div style="font-size: 15px; font-weight: 600; color: #333; background-color: #f5f5f5; padding: 10px 20px; border-radius: 6px; text-align: center; letter-spacing: 3px; margin: 20px 0;">
      ${otp}
    </div>

    <p style="font-size: 13px; color: #777;">
      This code is valid for the next 10 minutes. Do not share it with anyone for security reasons.
    </p>

    <p style="font-size: 14px; color: #555;">Regards,<br/>
    <strong>Eddal Dealers Development Association Limited.</strong></p>

    <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
    <p style="font-size: 12px; color: #999; text-align: center;">
      This is an automated message. Please do not reply.<br/>
      © ${new Date().getFullYear()} Eddal Dealers Development Association Limited. All rights reserved.
    </p>
  </div>
`;


    await sendEmail(user?.email_id, emailSubject, emailBody);


    // await sendEmail('jatinder@infogen.in', 'Your Verification Code', getEmailText.rows[0]?.otp)
    res.status(200).json({ message: "OTP sent Succesfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ type: "error", message: "Server issue Cannot Sent OTP" });
  }
};

const userLogout = (req, res) => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Make sure it's false for local development
    sameSite: "strict",
    path: "/",
  });
  return res.status(200).json({ message: "Logged out successfully" });
};


const sendResetOTP = async (req, res) => {
  let { email } = req.body;

  try {
    // Validate
    if (!email) {
      return res
        .status(400)
        .json({ type: "error", message: "Email is required." });
    }

    email = email.trim().toLowerCase();

    // Check user existence
    const userCheck = await db.query(
      "SELECT * FROM user_master WHERE LOWER(email_id) = LOWER($1)",
      [email]
    );

    if (!userCheck.rowCount) {
      return res
        .status(404)
        .json({ type: "error", message: "Email not registered." });
    }

    const user = userCheck.rows[0];
    const username = user.user_name;

    // Generate 6-digit secure OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Save OTP & expiry in DB (valid 10 mins)
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await db.query(
      `UPDATE user_master SET otp = $1 WHERE user_id = $2`,
      [otp, user.user_id]
    );

    // Prepare email content
    const emailSubject =
      "Password Reset OTP - Integral Infogen Technologies Pvt. Ltd.";

  const emailBody = `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; background-color: #f9fafc; border-radius: 10px; padding: 30px;">
    <div style="background-color: #ffffff; border-radius: 10px; padding: 30px; border: 1px solid #e6e6e6;">
      <h2 style="color: #0046ad; text-align: center; font-weight: 700; margin-bottom: 25px;">Password Reset Request</h2>

      <p style="font-size: 15px; color: #333;">Hi <strong>${username}</strong>,</p>

      <p style="font-size: 14px; color: #555; line-height: 1.6;">
        You recently requested to reset your password. Please use the OTP below to verify your identity and proceed with resetting your password:
      </p>

      <div style="font-size: 20px; font-weight: 700; color: #0046ad; background-color: #f0f4ff; padding: 15px; border-radius: 8px; text-align: center; letter-spacing: 4px; margin: 25px 0;">
        ${otp}
      </div>

      <p style="font-size: 13px; color: #777;">
        This OTP is valid for <strong>10 minutes</strong>. Please do not share it with anyone for your security.
      </p>

      <p style="font-size: 14px; color: #555; margin-top: 25px;">
        Regards,<br/>
        <strong>Integral Infogen Technologies Pvt. Ltd.</strong>
      </p>
    </div>

    <p style="font-size: 12px; color: #999; text-align: center; margin-top: 25px;">
      This is an automated message. Please do not reply.<br/>
      © ${new Date().getFullYear()} Integral Infogen Technologies Pvt. Ltd. All rights reserved.
    </p>
  </div>
`;



    // Send the OTP email
    await sendEmail(email, emailSubject, emailBody);

    res.status(200).json({
      type: "success",
      message: "OTP sent successfully to your registered email address.",
    });
  } catch (error) {
    console.error("Error sending reset password OTP:", error);
    res.status(500).json({
      type: "error",
      message: "Server error. Cannot send OTP.",
    });
  }
};


const resetNewPsk = async (req, res) => {
  try {
    await db.query('begin')

    const { email, otp, newPassword, confirmPassword } = req.body;

    // Validate fields
    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Fetch OTP record
    const otpCheck = await db.query(
      `SELECT otp FROM user_master WHERE email_id = $1`,
      [email]
    );

    if (otpCheck.rows.length === 0) {
      return res.status(400).json({ message: "No OTP found or expired" });
    }

    const { otp: storedOtp } = otpCheck.rows[0];
    console.log('storedOtp and otp', storedOtp, otp) 
    // Check OTP validity
    if (Number(storedOtp) !== Number(otp)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // if (new Date() > new Date(expires_at)) {
    //   return res.status(400).json({ message: "OTP has expired" });
    // }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in users table
    await db.query(
      `UPDATE user_master SET user_password = $1 WHERE email_id = $2`,
      [hashedPassword, email]
    );

    await db.query('commit')

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    await db.query('rollback')
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};


module.exports = { userRegister, userLogin, userLogout, sendOTP, sendResetOTP, resetNewPsk };
