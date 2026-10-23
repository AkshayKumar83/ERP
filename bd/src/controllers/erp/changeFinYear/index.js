const { db } = require("../../../config/dbConnection");

async function getFinYearList(req, res) {
    console.log('function call')
    try {
        const getFinYearData = await db.query(
            `SELECT 
                TO_CHAR(st_date, 'DD/MM/YYYY') || ' - ' || TO_CHAR(end_date, 'DD/MM/YYYY') AS year,
                year_code 
             FROM moitfinyear 
             ORDER BY year_code DESC`
        );

        return res.status(200).json({
            success: true,
            data: getFinYearData.rows,
        });
    } catch (error) {
        console.error("Error fetching financial year list:", error);
        return res.status(500).json({
            success: false,
            error: `An error occurred while fetching financial years: ${error.message}`,
        });
    }
}

module.exports = { getFinYearList };
