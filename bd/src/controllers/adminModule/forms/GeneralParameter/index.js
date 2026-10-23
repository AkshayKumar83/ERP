const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { generateSingleInsertQuery, cleanObject } = require("../../../../utility/query");

const TABLE_NAMES = {
  MOMMPARM: "mommparm",
  MOFMPARM: "mofmparm",
  MOSMPARM: "mosmparm",
  MOPRPARM: "moprparm",
  MOITPARM: "moitparm",
  MOPMPARM: "mopmparm",
};

// dropDownData

exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
  const exciseList = await db.query(
    `select description, wc_id:: TEXT wc_id from mommwc order by 1  `
  );

  //console.log("exciseList:", exciseList.rows);

  const floorList = await db.query(
    `select description, wc_id:: TEXT wc_id from mommwc order by 1  `
  );

  const partyList = await db.query(
    `select description, wc_id:: TEXT wc_id from mommwc order by 1  `
  );

  const serviceList = await db.query(
    `select description, wc_id:: TEXT wc_id from mommwc order by 1  `
  );

  const receiveList = await db.query(
    `select description, wc_id:: TEXT wc_id from mommwc order by 1  `
  );

  const floor1List = await db.query(
    `select description, wc_id:: TEXT wc_id from mommwc order by 1  `
  );

  const excise1List = await db.query(
    `select description, wc_id:: TEXT wc_id from mommwc order by 1  `
  );

  const serviceCellList = await db.query(
    `select description, wc_id:: TEXT wc_id from mommwc order by 1  `
  );

  const costCentreList = await db.query(
    `select description, code from vwcostc order by 1  `
  );

  const defaultPrupList = await db.query(
    `select description, code from vwpurp order by 1  `
  );

  const stockDescList = await db.query(
    `select description, code from vwctype order by description`
  );

  const scrapYardList = await db.query(
    `select description, wc_id:: TEXT wc_id from mommwc order by 1  `
  );

  const basicList = await db.query(
    `SELECT 
    CASE 
        WHEN ed_short_desc IS NULL THEN ed_desc 
        ELSE ed_short_desc 
    END AS description, 
    ed_id::text AS ed_id 
FROM MHPMPAY_FACTOR 
ORDER BY ed_desc;
`
  );

  const daList = await db.query(
    `SELECT 
    CASE 
        WHEN ed_short_desc IS NULL THEN ed_desc 
        ELSE ed_short_desc 
    END AS description, 
    ed_id::text AS ed_id 
FROM MHPMPAY_FACTOR 
ORDER BY ed_desc;
   `
  );

  const hraList = await db.query(
    `SELECT 
    CASE 
        WHEN ed_short_desc IS NULL THEN ed_desc 
        ELSE ed_short_desc 
    END AS description, 
    ed_id::text AS ed_id 
FROM MHPMPAY_FACTOR 
ORDER BY ed_desc;
   `
  );

  const perPayList = await db.query(
    `SELECT 
    CASE 
        WHEN ed_short_desc IS NULL THEN ed_desc 
        ELSE ed_short_desc 
    END AS description, 
    ed_id::text AS ed_id 
FROM MHPMPAY_FACTOR 
ORDER BY ed_desc;
 `
  );

  const pfundList = await db.query(
    `SELECT 
    CASE 
        WHEN ed_short_desc IS NULL THEN ed_desc 
        ELSE ed_short_desc 
    END AS description, 
    ed_id::text AS ed_id 
FROM MHPMPAY_FACTOR 
ORDER BY ed_desc;
 `
  );

  const vpfList = await db.query(
    `SELECT 
    CASE 
        WHEN ed_short_desc IS NULL THEN ed_desc 
        ELSE ed_short_desc 
    END AS description, 
    ed_id::text AS ed_id 
FROM MHPMPAY_FACTOR 
ORDER BY ed_desc;
  `
  );
  const esiList = await db.query(
    `SELECT 
    CASE 
        WHEN ed_short_desc IS NULL THEN ed_desc 
        ELSE ed_short_desc 
    END AS description, 
    ed_id::text AS ed_id 
FROM MHPMPAY_FACTOR 
ORDER BY ed_desc;
  `
  );

  const negativeList = await db.query(
    `SELECT 
    CASE 
        WHEN ed_short_desc IS NULL THEN ed_desc 
        ELSE ed_short_desc 
    END AS description, 
    ed_id::text AS ed_id 
FROM MHPMPAY_FACTOR 
ORDER BY ed_desc;
 `
  );

  const tmcList = await db.query(
    `SELECT 
    CASE 
        WHEN ed_short_desc IS NULL THEN ed_desc 
        ELSE ed_short_desc 
    END AS description, 
    ed_id::text AS ed_id 
FROM MHPMPAY_FACTOR 
ORDER BY ed_desc;
  `
  );

  const lmcList = await db.query(
    `SELECT 
    CASE 
        WHEN ed_short_desc IS NULL THEN ed_desc 
        ELSE ed_short_desc 
    END AS description, 
    ed_id::text AS ed_id 
FROM MHPMPAY_FACTOR 
ORDER BY ed_desc;
  `
  );

  const ytdList = await db.query(
    `SELECT 
    CASE 
        WHEN ed_short_desc IS NULL THEN ed_desc 
        ELSE ed_short_desc 
    END AS description, 
    ed_id::text AS ed_id 
FROM MHPMPAY_FACTOR 
ORDER BY ed_desc;
  `
  );

  const ytdSurList = await db.query(
    `SELECT 
    CASE 
        WHEN ed_short_desc IS NULL THEN ed_desc 
        ELSE ed_short_desc 
    END AS description, 
    ed_id::text AS ed_id 
FROM MHPMPAY_FACTOR 
ORDER BY ed_desc;
 `
  );

  const arrearList = await db.query(
    `SELECT 
  CASE 
      WHEN ed_short_desc IS NULL THEN ed_desc 
      ELSE ed_short_desc 
  END AS description, 
  ed_id::text AS ed_id 
FROM MHPMPAY_FACTOR 
ORDER BY ed_desc;
`
  );

  const mnthlyitaxList = await db.query(
    `SELECT 
    CASE 
        WHEN ed_short_desc IS NULL THEN ed_desc 
        ELSE ed_short_desc 
    END AS description, 
    ed_id::text AS ed_id 
  FROM MHPMPAY_FACTOR 
  ORDER BY ed_desc;
  `
  );

  const mnthlysurchList = await db.query(
    `SELECT 
      CASE 
          WHEN ed_short_desc IS NULL THEN ed_desc 
          ELSE ed_short_desc 
      END AS description, 
      ed_id::text AS ed_id 
    FROM MHPMPAY_FACTOR 
    ORDER BY ed_desc;
    `
  );

  const ytdTaxList = await db.query(
    `SELECT 
        CASE 
            WHEN ed_short_desc IS NULL THEN ed_desc 
            ELSE ed_short_desc 
        END AS description, 
        ed_id::text AS ed_id 
      FROM MHPMPAY_FACTOR 
      ORDER BY ed_desc;
      `
  );

  const ytdSurchList = await db.query(
    `SELECT 
          CASE 
              WHEN ed_short_desc IS NULL THEN ed_desc 
              ELSE ed_short_desc 
          END AS description, 
          ed_id::text AS ed_id 
        FROM MHPMPAY_FACTOR 
        ORDER BY ed_desc;
        `
  );

  const deathBenvList = await db.query(
    `SELECT 
            CASE 
                WHEN ed_short_desc IS NULL THEN ed_desc 
                ELSE ed_short_desc 
            END AS description, 
            ed_id::text AS ed_id 
          FROM MHPMPAY_FACTOR 
          ORDER BY ed_desc;
          `
  );

  const actualList = await db.query(
    `SELECT 
              CASE 
                  WHEN ed_short_desc IS NULL THEN ed_desc 
                  ELSE ed_short_desc 
              END AS description, 
              ed_id::text AS ed_id 
            FROM MHPMPAY_FACTOR 
            ORDER BY ed_desc;
            `
  );

  const payDaysList = await db.query(
    `SELECT 
                CASE 
                    WHEN ed_short_desc IS NULL THEN ed_desc 
                    ELSE ed_short_desc 
                END AS description, 
                ed_id::text AS ed_id 
              FROM MHPMPAY_FACTOR 
              ORDER BY ed_desc;
              `
  );

  const conveyanceList = await db.query(
    `SELECT 
                  CASE 
                      WHEN ed_short_desc IS NULL THEN ed_desc 
                      ELSE ed_short_desc 
                  END AS description, 
                  ed_id::text AS ed_id 
                FROM MHPMPAY_FACTOR 
                ORDER BY ed_desc;
                `
  );

  const epfList = await db.query(
    `SELECT 
                    CASE 
                        WHEN ed_short_desc IS NULL THEN ed_desc 
                        ELSE ed_short_desc 
                    END AS description, 
                    ed_id::text AS ed_id 
                  FROM MHPMPAY_FACTOR 
                  ORDER BY ed_desc;
                  `
  );

  const esiProdList = await db.query(
    `SELECT 
                      CASE 
                          WHEN ed_short_desc IS NULL THEN ed_desc 
                          ELSE ed_short_desc 
                      END AS description, 
                      ed_id::text AS ed_id 
                    FROM MHPMPAY_FACTOR 
                    ORDER BY ed_desc;
                    `
  );

  const ProdIncList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc;
                      `
  );

  const OtherDedList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc;
                      `
  );

  const EsiWagesList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc;
                      `
  );

  const FfdayList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc;
                      `
  );

  const ConveyanceEdList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc;
                      `
  );

  const TmCoinList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc;
                      `
  );

  const MonthList = await db.query(
    `SELECT MONTH_NAME, MONTH_NO FROM MOPMMONTHS;
                      `
  );
  const OvertimeList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc;
                      `
  );

  const SocietyList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc;
                      `
  );

  const CanteenList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc;
                      `
  );

  const NightList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc;
                      `
  );

  const adjPaypList = await db.query(
    `select atnd_desc, atnd_id:: TEXT atnd_id from  mopmatndfactor
order by 1 
                      `
  );

  const adjPaydList = await db.query(
    `select atnd_desc, atnd_id:: TEXT atnd_id from  mopmatndfactor
order by 1 
                      `
  );

  const latehrsList = await db.query(
    `select atnd_desc, atnd_id:: TEXT atnd_id from  mopmatndfactor
order by 1 
                      `
  );

  const spfList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc 
                      `
  );

  const educationList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc
                      `
  );

  const busList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc
                      `
  );

  const caList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc
                      `
  );

  const leaveList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc
                      `
  );

  const bondsList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc
                      `
  );

  const gratList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc
                      `
  );

  const stddList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc
                      `
  );
  const esiotList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc
                      `
  );

  const overtimeatndList = await db.query(
    `select atnd_desc, atnd_id:: TEXT atnd_id from  mopmatndfactor
order by 1 
                      `
  );

  const fpfList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc
                      `
  );

  const specialList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc
                      `
  );

  const conveyanceed1List = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc
                      `
  );

  const washList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc
                      `
  );

  const svpfList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc
                      `
  );

  const guredList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc
                      `
  );

  const adhocList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc
                      `
  );

  const otherallList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc
                      `
  );

  const ccaedList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc
                      `
  );
  const basicarrearList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc
                      `
  );

  const overtimeEdList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc
                      `
  ); 

  const superattList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc
                      `
  );

  const attendanceList = await db.query(
    `select atnd_desc, atnd_id:: TEXT atnd_id from  mopmatndfactor
order by 1
                      `
  );

  const paymentList = await db.query(
    `select atnd_desc, atnd_id:: TEXT atnd_id from  mopmatndfactor
order by 1
                      `
  );

  const spayList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc
                      `
  );

  const commList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc
                      `
  );

  const loanList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc
                      `
  );

  const othersList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc
                      `
  );

  const leaseArrList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc
                      `
  );

  const imprestList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc
                      `
  );

  const proftaxList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc
                      `
  );

  const medInsList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc
                      `
  );

  const monthlyatndList = await db.query(
    `select atnd_desc, atnd_id:: TEXT atnd_id from  mopmatndfactor
order by 1
                      `
  );

  const perkEdList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc
                      `
  );

  const rentList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc
                      `
  );

  const resleaseList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc
                      `
  );

  const vrsAllowList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc
                      `
  );

  const vrsDedList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc
                      `
  );

  const busEdList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc
                      `
  );

  const leaseAdvList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc
                      `
  );

  const excessList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc
                      `
  );

  const convDedList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc
                      `
  );

  const sec88cList = await db.query(
    `SELECT 
                        CASE 
                            WHEN ed_short_desc IS NULL THEN ed_desc 
                            ELSE ed_short_desc 
                        END AS description, 
                        ed_id::text AS ed_id 
                      FROM MHPMPAY_FACTOR 
                      ORDER BY ed_desc
                      `
  );

  return res.status(200).json({
    excise: exciseList.rows,
    party: partyList.rows,
    service: serviceList.rows,
    floor: floorList.rows,
    receive: receiveList.rows,
    excise1: excise1List.rows,
    scrapYard: scrapYardList.rows,
    serviceCell: serviceCellList.rows,
    floor1: floor1List.rows,
    costCentre: costCentreList.rows,
    defaultPurp: defaultPrupList.rows,
    stockDesc: stockDescList.rows,
    basic: basicList.rows,
    da: daList.rows,
    hra: hraList.rows,
    perPay: perPayList.rows,
    pfund: pfundList.rows,
    vpf: vpfList.rows,
    esi: esiList.rows,
    negative: negativeList.rows,
    tmc: tmcList.rows,
    lmc: lmcList.rows,
    ytdTds: ytdList.rows,
    ytdSur: ytdSurList.rows,
    arrear: arrearList.rows,
    MnthlyTax: mnthlyitaxList.rows,
    MnthlySurch: mnthlysurchList.rows,
    ytdList: ytdTaxList.rows,
    ytdSurch: ytdSurchList.rows,
    deathBenv: deathBenvList.rows,
    actual: actualList.rows,
    paydays: payDaysList.rows,
    conveyance: conveyanceList.rows,
    epf: epfList.rows,
    esiProd: esiProdList.rows,
    prodInc: ProdIncList.rows,
    OtherDed: OtherDedList.rows,
    EsiWages: EsiWagesList.rows,
    FfDay: FfdayList.rows,
    society: SocietyList.rows,
    ConveyanceEd: ConveyanceEdList.rows,
    Tmcoin: TmCoinList.rows,
    Month: MonthList.rows,
    overtime: OvertimeList.rows,
    canteen: CanteenList.rows,
    night: NightList.rows,
    adjPaydayp: adjPaypList.rows,
    adjPaydayd: adjPaydList.rows,
    latehrs: latehrsList.rows,
    bus: busList.rows,
    spf: spfList.rows,
    education: educationList.rows,
    leave: leaveList.rows,
    ca: caList.rows,
    bonds: bondsList.rows,
    gratuity: gratList.rows,
    stdded: stddList.rows,
    esiot: esiotList.rows,
    overtimeatnd: overtimeatndList.rows,
    fpf: fpfList.rows,
    special: specialList.rows,
    conveyanceEd1: conveyanceed1List.rows,
    wash: washList.rows,
    svpf: svpfList.rows,
    gured: guredList.rows,
    adhoc: adhocList.rows,
    otherall: otherallList.rows,
    ccaed: ccaedList.rows,
    basicarrear: basicarrearList.rows,
    overtimeEd: overtimeEdList.rows,
    super: superattList.rows,
    attendance: attendanceList.rows,
    payment: paymentList.rows,
    spay: spayList.rows,
    comm: commList.rows,
    loan: loanList.rows,
    others: othersList.rows,
    leaseArr: leaseArrList.rows,
    imprest: imprestList.rows,
    proftax: proftaxList.rows,
    medIns: medInsList.rows,
    monthlyatnd: monthlyatndList.rows,
    PerkEd: perkEdList.rows,
    rent: rentList.rows,
    reslease: resleaseList.rows,
    vrsAllow: vrsAllowList.rows,
    vrsDed: vrsDedList.rows,
    busEd: busEdList.rows,
    leaseAdv: leaseAdvList.rows,
    excess: excessList.rows,
    convDed: convDedList.rows,
    sec88c: sec88cList.rows,
  });
});

const helpListData = async (req, res) => {
  const { help_list, form_status,  appDivisionId, appFinYear, } = req.query;

  if (
    help_list === "cvd" &&
    (form_status === "Insert" ||
      form_status === "Update" ||
      form_status === "Query")
  ) {
    try {
      const cvdAccList = await db.query(
        `SELECT acc_desc,acc_no FROM vwmdfmglm WHERE trans_year=$1
        AND division_id=$2
        AND coalesce(active,'N')='Y'
        ORDER BY 2`, [appFinYear, appDivisionId]
      );

      //console.log("cvdAccList:", cvdAccList);
      return res.status(200).json(cvdAccList.rows);
    } catch (error) {
      console.error("Database query error:", error); // Log the error
      return res.status(500).json({ error: "Internal server error" }); // Handle the error gracefully
    }
  }   else if (  help_list === "modvat" &&
    (form_status === "Insert" ||
      form_status === "Update" ||
      form_status === "Query")
    
  ) { 
    try {
      const modvatAccList = await db.query(
        `SELECT acc_desc,acc_no FROM vwmdfmglm WHERE trans_year=$1
        AND division_id=$2
        AND coalesce(active,'N')='Y'
        ORDER BY 2`, [appFinYear, appDivisionId]
      );

      //console.log("modvatList:", modvatAccList);
      return res.status(200).json(modvatAccList.rows);
    } catch (error) {
      console.error("Database query error:", error); // Log the error
      return res.status(500).json({ error: "Internal server error" }); // Handle the error gracefully
    }

  }

  else {
    return res.status(400).json({ error: "Invalid request" }); // Handle invalid requests
  }
};

const getGeneralDataOnQuery = async (req, res) => {
  try {
    let queryParameter = `ORDER BY parm_id LIMIT 1 OFFSET ${
      req.query.offset || 0
    }`;

    let dataCount;
    console.log("quey:", req?.query);
    console.log("Offset value:", req.query.offset);
    switch (req?.query?.get_data) {
      case "Query":
      case "First": {
        const getCount = await db.query(
          `SELECT COUNT(*) FROM ${TABLE_NAMES.MOITPARM}`
        );
        dataCount = getCount.rows[0]?.count;
        break;
      }

      case "Last": {
        queryParameter = "ORDER BY parm_id DESC LIMIT 1";
        break;
      }

      default:
        queryParameter = `ORDER BY parm_id LIMIT 1 OFFSET ${
          req.query.offset || 0
        }`;
        break;
    }

    const moitparmData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.MOITPARM} ${queryParameter}`
    );
    //console.log("moitparam Data:", moitparmData.rows[0]);

    if (!moitparmData.rows.length) {
      return res.status(404).send({ message: "No user data found" });
    }

    const mommparmData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.MOMMPARM}`
    );

    const mofmparmData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.MOFMPARM}`
    );  

    const cvdCode = mofmparmData.rows[0].cvd_acc_code 
    const cvdDesc = await db.query(`SELECT acc_desc,acc_no FROM vwmdfmglm WHERE trans_year='2024'
        AND division_id=1
        AND coalesce(active,'N')='Y'
        AND acc_no = $1`,
      [cvdCode]
    );   

    const modrecCode = mofmparmData.rows[0].modvat_rec_acc 
    
    const modrecDesc = await db.query(`SELECT acc_desc,acc_no FROM vwmdfmglm WHERE trans_year='2024'
      AND division_id=1
      AND coalesce(active,'N')='Y'
      AND acc_no = $1`,
    [modrecCode]
  );   
    

    console.log("cvd_acc_desc:", cvdDesc.rows[0]?.acc_desc)

    const moprparmData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.MOPRPARM}`
    );

    const mosmparmData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.MOSMPARM}`
    );

    const mopmparmData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.MOPMPARM}`
    );

    const response = {
      MOITPARM: moitparmData.rows?.[0] || {},
      MOFMPARM: mofmparmData.rows?.[0] || {},
      MOSMPARM: mosmparmData.rows?.[0] || {},
      MOPRPARM: moprparmData.rows?.[0] || {},
      MOPMPARM: mopmparmData.rows?.[0] || {},
      MOMMPARM: mommparmData.rows?.[0] || {},
      count: dataCount || 0,
      cvd_acc_desc: cvdDesc.rows[0]?.acc_desc,
      modrec_acc_desc: modrecDesc.rows[0]?.acc_desc
    };

    return res.send(response);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Internal server error on query" });
  }
};  

// const updateGeneralDetails = async (req, res) => {
//   console.log("for update:", req.body); 
//   const {MOMMPARM, MOFMPARM, MOPMPARM, MOITPARM, MOSMPARM, MOPRPARM} = req.body; 

//   try { 
//     await db.query("BEGIN");

//     if(MOITPARM && MOITPARM.length > 0) {  

//       if (Object.keys(req.body).length !== 0) {
//         const moitparmForInsert = {MOITPARM}  

//         const cleanmoitparmDataForUpdate = cleanObject(moitparmForInsert)
//         const columns = Object.keys(cleanmoitparmDataForUpdate);
//         const values = Object.values(cleanmoitparmDataForUpdate);
//         console.log("updated columns:", columns)
//         console.log("updated values:", values)  

//          // Create SET clause for SQL UPDATE query
//       const setClause = columns
//       .map((column, index) => `${column} = $${index + 1}`)
//       .join(", ");

//       }  
      
//       // Generate the full SQL query
//       const query = `UPDATE ${
//         TABLE_NAMES.MOITPARM
//       } SET ${setClause} WHERE parm_id = $${columns.length + 1} `;

//       console.log("here updated formData query: ", query);
       
//       try {
//         // Execute the update query
//         await db.query(query, [...values, parm_id]);  
//          // Commit the transaction
//         await db.query("COMMIT");
//         console.log("updated successfully")
//       } catch (error) {
//         throw new Error(error);
//       } 

//     }  

//     if(MOMMPARM && MOMMPARM.length > 0) {  

//       if (Object.keys(req.body).length !== 0) {
//         const mommparmForInsert = {MOMMPARM}  

//         const cleanmommparmDataForUpdate = cleanObject(mommparmForInsert)
//         const columns = Object.keys(cleanmommparmDataForUpdate);
//         const values = Object.values(cleanmommparmDataForUpdate);
//         console.log("updated columns:", columns)
//         console.log("updated values:", values)  

//          // Create SET clause for SQL UPDATE query
//       const setClause = columns
//       .map((column, index) => `${column} = $${index + 1}`)
//       .join(", ");

//       }  
      
//       // Generate the full SQL query
//       const query = `UPDATE ${
//         TABLE_NAMES.MOMMPARM
//       } SET ${setClause} WHERE parm_id = $${columns.length + 1} `;

//       console.log("here updated formData query: ", query);
//       try {
//         // Execute the update query
//         await db.query(query, [...values, parm_id]);  
//          // Commit the transaction
//         await db.query("COMMIT");
//         console.log("updated successfully")
//       } catch (error) {
//         throw new Error(error);
//       } 

//     }  

//     if(MOPRPARM && MOPRPARM.length > 0) {  

//       if (Object.keys(req.body).length !== 0) {
//         const moprparmForInsert = {MOPRPARM}  

//         const cleanmoprparmDataForUpdate = cleanObject(moprparmForInsert)
//         const columns = Object.keys(cleanmoprparmDataForUpdate);
//         const values = Object.values(cleanmoprparmDataForUpdate);
//         console.log("updated columns:", columns)
//         console.log("updated values:", values)  

//          // Create SET clause for SQL UPDATE query
//       const setClause = columns
//       .map((column, index) => `${column} = $${index + 1}`)
//       .join(", ");

//       }  
      
//       // Generate the full SQL query
//       const query = `UPDATE ${
//         TABLE_NAMES.MOPRPARM
//       } SET ${setClause} WHERE parm_id = $${columns.length + 1} `;

//       console.log("here updated formData query: ", query);
//       try {
//         // Execute the update query
//         await db.query(query, [...values, parm_id]);  
//          // Commit the transaction
//         await db.query("COMMIT");
//         console.log("updated successfully")
//       } catch (error) {
//         throw new Error(error);
//       } 

//     }  

//     if(MOFMPARM && MOFMPARM.length > 0) {  

//       if (Object.keys(req.body).length !== 0) {
//         const mofmparmForInsert = {MOFMPARM}  
        
//         delete mofmparmForInsert.cvd_acc_desc;
//         delete mofmparmForInsert.modrec_acc_desc;


//         const cleanmofmparmDataForUpdate = cleanObject(mofmparmForInsert)
//         const columns = Object.keys(cleanmofmparmDataForUpdate);
//         const values = Object.values(cleanmofmparmDataForUpdate);
//         console.log("updated columns:", columns)
//         console.log("updated values:", values)  

//          // Create SET clause for SQL UPDATE query
//       const setClause = columns
//       .map((column, index) => `${column} = $${index + 1}`)
//       .join(", ");

//       }  
      
//       // Generate the full SQL query
//       const query = `UPDATE ${
//         TABLE_NAMES.MOSMPARM
//       } SET ${setClause} WHERE parm_id = $${columns.length + 1} `;

//       console.log("here updated formData query: ", query);
//       try {
//         // Execute the update query
//         await db.query(query, [...values, parm_id]);  
//          // Commit the transaction
//         await db.query("COMMIT");
//         console.log("updated successfully")
//       } catch (error) {
//         throw new Error(error);
//       } 

//     }  

//     if(MOSMPARM && MOSMPARM.length > 0) {  

//       if (Object.keys(req.body).length !== 0) {
//         const mosmparmForInsert = {MOSMPARM}  

//         const cleanmosmparmDataForUpdate = cleanObject(mosmparmForInsert)
//         const columns = Object.keys(cleanmosmparmDataForUpdate);
//         const values = Object.values(cleanmosmparmDataForUpdate);
//         console.log("updated columns:", columns)
//         console.log("updated values:", values)  

//          // Create SET clause for SQL UPDATE query
//       const setClause = columns
//       .map((column, index) => `${column} = $${index + 1}`)
//       .join(", ");

//       }  
      
//       // Generate the full SQL query
//       const query = `UPDATE ${
//         TABLE_NAMES.MOSMPARM
//       } SET ${setClause} WHERE parm_id = $${columns.length + 1} `;

//       console.log("here updated formData query: ", query);
//       try {
//         // Execute the update query
//         await db.query(query, [...values, parm_id]);  
//          // Commit the transaction
//         await db.query("COMMIT");
//         console.log("updated successfully")
//       } catch (error) {
//         throw new Error(error);
//       } 

//     }  

//     if(MOPMPARM && MOPMPARM.length > 0) {  

//       if (Object.keys(req.body).length !== 0) {
//         const mopmparmForInsert = {MOPMPARM}  

//         const cleanmopmparmDataForUpdate = cleanObject(mopmparmForInsert)
//         const columns = Object.keys(cleanmopmparmDataForUpdate);
//         const values = Object.values(cleanmopmparmDataForUpdate);
//         console.log("updated columns:", columns)
//         console.log("updated values:", values)  

//          // Create SET clause for SQL UPDATE query
//       const setClause = columns
//       .map((column, index) => `${column} = $${index + 1}`)
//       .join(", ");

//       }  
      
//       // Generate the full SQL query
//       const query = `UPDATE ${
//         TABLE_NAMES.MOPMPARM
//       } SET ${setClause} WHERE parm_id = $${columns.length + 1} `;

//       console.log("here updated formData query: ", query);
     
//       try {
//         // Execute the update query
//         await db.query(query, [...values, parm_id]);  
//          // Commit the transaction
//         await db.query("COMMIT");
//         console.log("updated successfully")
//       } catch (error) {
//         throw new Error(error);
//       } 

//     } 

//     return res.status(200).send({status: "successfully updated"})


//   } 
  
//   catch (error) {
//     console.error(`Error : `, error);
//     await db.query("ROLLBACK");
//   }

// }  

const updateGeneralDetails = async (req, res) => {
  console.log("for update:", req.body);
  const { MOMMPARM, MOFMPARM, MOPMPARM, MOITPARM, MOSMPARM, MOPRPARM, parm_id, } = req.body;

  if (!parm_id) {
    return res.status(400).send({ error: "parm_id is required for update" });
  }

  try {
    await db.query("BEGIN");

    const updateTable = async (tableName, data) => {
      if (!data || Object.keys(data).length === 0) return;

      const cleanedData = cleanObject(data);
      const columns = Object.keys(cleanedData);
      const values = Object.values(cleanedData);

      if (columns.length === 0) {
        //console.log(`No valid columns for ${tableName}`);
        return;
      }

      const setClause = columns.map((col, index) => `${col} = $${index + 1}`).join(", ");
      const query = `UPDATE ${TABLE_NAMES[tableName]} SET ${setClause} WHERE parm_id = $${columns.length + 1}`;

      //console.log(`Executing query for ${tableName}:`, query);
      await db.query(query, [...values, parm_id]);
    };

    await updateTable("MOITPARM", MOITPARM);
    await updateTable("MOMMPARM", MOMMPARM);
    await updateTable("MOPRPARM", MOPRPARM);

    // **Remove cvd_acc_desc from MOFMPARM before updating**
    if (MOFMPARM) {
      delete MOFMPARM.cvd_acc_desc,
      delete MOFMPARM.modrec_acc_desc
    }
    await updateTable("MOFMPARM", MOFMPARM);

    await updateTable("MOSMPARM", MOSMPARM);
    await updateTable("MOPMPARM", MOPMPARM);

    await db.query("COMMIT");
    return res.status(200).send({ status: "Successfully updated" });

  } catch (error) {
    console.error(`Error: `, error);
    await db.query("ROLLBACK");
    return res.status(500).send({ error: "Update failed" });
  }
};



exports.handleFormOperation = catchAsync(async (req, res, next) => {
  if (req?.query?.help_list) {
    await helpListData(req, res);
    return;
  }

  if (req?.query?.get_data) {
    await getGeneralDataOnQuery(req, res);
    return;
  }
});  

exports.handlePostFormData = catchAsync(async (req, res, next) => {
  if (req?.query?.form_status && req?.query?.form_status === "Update") 
    await updateGeneralDetails(req, res);
    return;
})
