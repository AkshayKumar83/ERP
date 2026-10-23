const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");


// dropDown
exports.getFormBaseConstants = catchAsync(async (req, res) => {
 const { formStatus, appDivisionId, appFinYear, user_id:userId } = req.query;

    const divisionList = await db.query(`
      SELECT 
        h.name, 
        h.division_id::text AS division_id
    FROM moitdivision h
    JOIN user_division d 
        ON h.division_id = d.division_id
    WHERE d.user_id = $1
      `,[userId]);


    const finYearList = await db.query(`
        select to_char(st_date, 'dd-mm-yyyy') ||' - ' || to_char(end_date, 'dd-mm-yyyy'), 
        year_code from moitfinyear order by year_code`)


    const sectionList = await db.query(`
      select s.section_desc, u.section_id 
      from  moitsection s, moitusersection u
      where u.user_id = $1
      and s.section_id = u.section_id
      order by 1`,[userId])
      
  return res.status(200).json({
    divisionList: divisionList.rows,
    finYearList:finYearList.rows,
    sectionList:sectionList.rows,

  });
});


const getDataOnQuery = async (req,res) => {

}

exports.handleFormOperation = catchAsync(async (req, res, next) => {
  console.log("handleoperation");

  if (req?.query?.get_data) {
    await getDataOnQuery(req, res);
    return;
  }
 
});