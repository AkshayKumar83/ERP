const { db } = require("../../../config/dbConnection");

async function getDivisionList(req, res) {
    console.log('function call')
    try {
        const getDivisionData = await db.query(
            `SELECT division_id , name from moitdivision`
        );

        return res.status(200).json({
            success: true,
            data: getDivisionData.rows,
        });
    } catch (error) {
        console.error("Error fetching Division list:", error);
        return res.status(500).json({
            success: false,
            error: `An error occurred while fetching divisions: ${error.message}`,
        });
    }
}

module.exports = { getDivisionList };
