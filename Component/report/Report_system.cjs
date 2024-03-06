const express = require("express");
const oracledb = require("oracledb");
const path = require("path");
const uploadsPath = path.join(__dirname, "../uploads");
const app = express();
const port = 5000;
app.use(express.json());

oracledb.initOracleClient({
    tnsnames: process.env.TNS_ADMIN,
  });

const AVO = {
  user: "avo",
  password: "avo",
  connectString: "TCIX01",
};

const QAD = {
  user: "qad",
  password: "qad",
  connectString: "TCIX01",
};

const CUSR = {
  user: "cusr",
  password: "cusr",
  connectString: "TCIX01",
};
/// May
module.exports.getFamDetailReport = async function (req, res) {
    try {
      // console.log("g-hllll")
      const{ RequestType,FAMNo }=  req.body;
      console.log(RequestType,FAMNo)
      const connect = await oracledb.getConnection(AVO);
      const query = `
      select
      CF.FACTORY_NAME AS FACTORY ,
      H.FAM_REQ_CC,
      H.FRH_FAM_NO,
      1 AS iSEQ,
      D.FRD_ASSET_CODE,
      D.FRD_COMP,
      D.FRD_OWNER_CC,
      D.FRD_ASSET_NAME,
      D.FRD_CODE_NO,
      D.FRD_BOI_PROJ,
      D.FRD_QTY,
      D.FRD_INV_NO,
      TO_CHAR( D.FRD_INV_DATE,'DD/MM/YYYY' ) AS FRD_INV_DATE,
      TO_CHAR(D.FRD_ACQ_COST, '999,999,999,999,999,999,999.99') AS FRD_ACQ_COST,
      D.FRD_BOOK_VALUE,
      D.FRD_NEW_CC,
      D.FRD_NEW_BOI_PROJ,
      D.FRD_REMARK
        FROM
          FAM_REQ_DETAIL D ,
          FAM_REQ_HEADER H
        LEFT JOIN CUSR.CU_FACTORY_M CF ON
          CF.FACTORY_CODE = H.FAM_FACTORY
        WHERE
          H.FRH_FAM_NO = D.FRD_FAM_NO
          AND H.FAM_REQ_TYPE = '${RequestType}'
          AND H.FRH_FAM_NO IN (
          SELECT
            TRIM(REGEXP_SUBSTR('${FAMNo}', '[^,]+', 1, LEVEL))
          FROM
            DUAL
          CONNECT BY
            LEVEL <= REGEXP_COUNT('${FAMNo}', ',') + 1
                  )
        ORDER BY
          H.FRH_FAM_NO,
          D.FRD_ASSET_CODE,
          D.FRD_COMP
       `;
       console.log(query);
      const result = await connect.execute(query);
   
      connect.release();
      res.json(result.rows);
    } catch (error) {
      console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
    }
  };
   
  module.exports.getRequstType = async function (req, res) {
    try {
      const connect = await oracledb.getConnection(AVO);
      const query = `
      SELECT T.FCM_CODE,T.FCM_DESC FROM FAM_CODE_MASTER T WHERE T.FCM_GROUP_ID = 'GP01' AND T.FCM_STATUS = 'A' ORDER BY T.FCM_SORT,T.FCM_DESC
       `;
      const result = await connect.execute(query);
     
      connect.release();
      res.json(result.rows);
    } catch (error) {
      console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
    }
  };
   
  module.exports.getFAM_FILE_ATTACH = async function (req, res) {
    try {
       console.log("g-hllll")
       const{FamNo}=  req.body;
      console.log(FamNo)
      const connect = await oracledb.getConnection(AVO);
      const query = `
      SELECT T.FFA_FAM_NO,T.FFA_ATT_FROM,T.FFA_FILE_SEQ,T.FFA_FILE_NAME,FFA_FILE_SERVER                                                                      
      FROM FAM_FILE_ATTACH T WHERE T.FFA_FAM_NO = '${FamNo}'                                                                        
      ORDER BY T.FFA_FAM_NO,T.FFA_ATT_FROM,T.FFA_FILE_SEQ,T.FFA_FILE_NAME
       `;
      const result = await connect.execute(query);
      console.log(query);
      connect.release();
      res.json(result.rows);
    } catch (error) {
      console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
    }
  };