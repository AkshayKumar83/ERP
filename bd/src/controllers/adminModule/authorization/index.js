const { db } = require("../../../config/dbConnection");
const catchAsync = require("../../../utility/catchAsync");

const getModuleRights = async (req, res) => {
    try {
        const { user } = req.query;

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User ID is required",
            });
        }

        const query = `
            SELECT
              distinct mi.program_id,
                mi.submod_form_name AS module_name,
                mi.program_desc,
                mi.menu_name,
                module_name as module_id,

                CASE
                    WHEN uam.activity_id IS NOT NULL THEN true
                    ELSE false
                END AS "canAccess"

            FROM module_info mi

            LEFT JOIN user_activity uam
                ON uam.program_id = mi.program_id
                AND uam.user_id = $1

            WHERE mi.module_flag = 'M'

            ORDER BY mi.program_id;
        `;

        const { rows } = await db.query(query, [user]);

        return res.status(200).json({
            success: true,
            data: rows,
        });

    } catch (error) {
        console.error("getModuleRights error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch module rights",
        });
    }
};

// const getMenuRights = async (req, res) => {
//     try {
//         // menu rights logic
//     } catch (error) {
//         // error handling
//     }
// };

const getMenuRights = async (req, res) => {
  try {
    const userId = req?.query?.user;



    const query = `
      SELECT
          mi.program_id,
          mi.form_rep_id,
          mi.menu_name,
          mi.url_form_path,
          mi.module_flag,
          mi.module_name,

          split_part(mi.menu_name, '.', 1) AS module_menu_name,
          split_part(mi.menu_name, '.', 2) AS submodule_name,
          split_part(mi.menu_name, '.', 3) AS form_name,

          ARRAY_AGG(
            DISTINCT ua.activity_id
            ORDER BY ua.activity_id
          ) AS activities

      FROM module_info mi

      INNER JOIN user_activity ua
          ON ua.program_id = mi.program_id
          AND ua.user_id = $1

    WHERE mi.module_flag IN ('F', 'R')

      GROUP BY
          mi.program_id,
          mi.form_rep_id,
          mi.menu_name,
          mi.url_form_path,
          mi.module_flag,
          mi.module_name

      ORDER BY mi.form_rep_id;
    `;

    const result = await db.query(query, [userId]);

    console.log(result.rows)

    const menuConfig = buildMenuConfig(result.rows);

    return res.status(200).json({
      success: true,
      data: menuConfig,
    });

  } catch (error) {
    console.error("getUserMenu error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user menu",
    });
  }
};

const formatName = (value) => {
  if (!value) return "";

  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

// const buildMenuConfig = (rows) => {
//   const moduleMap = new Map();

//   rows.forEach((row) => {
//     const moduleName = row.module_menu_name;
//     const submoduleName = row.submodule_name;

//     /*
//      * You need to map your DB module names to
//      * the route names currently used by your React app.
//      *
//      * Example:
//      *
//      * SALES      -> saleMgmnt
//      * MEMBERSHIP -> memberMgmnt
//      */
//     const moduleKeyMap = {
//       MEMBERSHIP: "memberMgmnt",
//       ADMIN: "adminMgmnt",
//       MATERIAL: "materialMgmnt",
//       SALES: "saleMgmnt",
//       WH: "whMgmnt",
//       FINANCE: "financeMgmnt",
//       HR: "hrMgmnt",
//     };

//     const moduleKey = moduleKeyMap[moduleName];

//     if (!moduleKey) {
//       return;
//     }

//     if (!moduleMap.has(moduleKey)) {
//       moduleMap.set(moduleKey, {
//         moduleKey,
//         menu: [],
//       });
//     }

//     const moduleData = moduleMap.get(moduleKey);

//     /*
//      * Use submodule name as the grouping key.
//      */
//     let group = moduleData.menu.find(
//       (item) => item.formName === formatName(submoduleName)
//     );

//     if (!group) {
//       group = {
//         name: "Form",
//         id: String(row.form_rep_id).substring(0, 3),
//         formName: formatName(submoduleName),
//         item: [],
//       };

//       moduleData.menu.push(group);
//     }

//     group.item.push({
//       id: String(row.form_rep_id),
//       formName: formatName(row.form_name),
//       url: row.url_form_path,
//       activities: row.activities,
//       programId: row.program_id,
//     });
//   });

//   return Object.fromEntries(
//     Array.from(moduleMap.values()).map((module) => [
//       module.moduleKey,
//       module.menu,
//     ])
//   );
// };


const buildMenuConfig = (rows) => {
  const moduleMap = new Map();

  rows.forEach((row) => {
    const moduleName = row.module_menu_name;
    const submoduleName = row.submodule_name;

     const moduleKeyMap = {
      MEMBERSHIP: "memberMgmnt",
      ADMIN: "adminMgmnt",
      PROCURMENT: "materialMgmnt",
      SALES: "saleMgmnt",
      PRODUCTION: "whMgmnt",
      FINANCIALS: "financeMgmnt",
      HR: "hrMgmnt",
    };

    const moduleKey = moduleKeyMap[moduleName];

    if (!moduleKey) {
      return;
    }

    if (!moduleMap.has(moduleKey)) {
      moduleMap.set(moduleKey, {
        moduleKey,
        menu: [],
      });
    }

    const moduleData = moduleMap.get(moduleKey);

    // -----------------------------------------
    // Form or Report
    // -----------------------------------------
    const menuType =
      row.module_flag === "R"
        ? "Report"
        : "Form";

    // -----------------------------------------
    // Find existing group
    // -----------------------------------------
    let group = moduleData.menu.find(
      (item) =>
        item.name === menuType &&
        item.formName === formatName(submoduleName)
    );

    // -----------------------------------------
    // Create group if it doesn't exist
    // -----------------------------------------
    if (!group) {
      group = {
        name: menuType,
        id: String(row.form_rep_id).substring(0, 3),
        formName: formatName(submoduleName),
        item: [],
      };

      moduleData.menu.push(group);
    }

    // -----------------------------------------
    // Add form/report item
    // -----------------------------------------
    group.item.push({
      id: String(row.form_rep_id),
      formName: formatName(row.form_name),
      url: row.url_form_path,
      activities: row.activities,
      programId: row.program_id,
    });
  });

  return Object.fromEntries(
    Array.from(moduleMap.values()).map((module) => [
      module.moduleKey,
      module.menu,
    ])
  );
};

const getFormRights = async (req, res) => {
    try {
        // form rights logic
    } catch (error) {
        // error handling
    }
};


module.exports = {
    getModuleRights,
    getMenuRights,
    getFormRights,
};