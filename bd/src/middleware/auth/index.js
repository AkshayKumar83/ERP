require("dotenv").config();
const { db } = require("../../config/dbConnection");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY_FOR_AUTH;

const TABLE_NAME = {
    USER_LIST: "user_master",
};

const userAuth = async (req, res, next) => {
    console.log('userAuth is call')
    try {

        if (req.originalUrl.includes("/email-action")) {
            return next();
        }

        const token = req.cookies.auth_token;
        // console.log(token)
        // here only stateless bases authentication is used
        if (!token) {
            return res
                .status(401)
                .json({ success: false, message: "Access Token Required." });
        }

        const decoded = jwt.verify(token, SECRET_KEY);

        const { user_id } = decoded;
        // console.log(user_id);

        // const user = await db.query(`SELECT * FROM ${TABLE_NAME.USER_LIST} WHERE user_id = $1`, [user_id]);

        // if (user.rows.length === 0) {
        //   return res.status(403).json({ success: false, message: "Token Not Valid" });
        // }

        // let getUserDivision  = await db.query(`select u.division_id, d.name from
        //       user_division u, moitdivision d
        //       where user_id = $1
        //       and default_division = $2
        //       and d.division_id = u.division_id
        //   `,[user.user_id, 'Y'])
        // let userInfo={global_user_id:user.user_id, global_division_id:getUserDivision.division_id}

        let userInfo = { user_id: user_id }; 

        req.userInfo = userInfo;
        next();
    } catch (error) {
        return res.status(403).send(`Error: ${error.message}`);
    }
};

module.exports = { userAuth };
