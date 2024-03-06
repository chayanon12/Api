const express = require("express");
const oracledb = require("oracledb");
const multer = require("multer");
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

//EmpID
module.exports.emp = async function (req, res) {
  try {
    const EmpID = req.query.empID;
    const connect = await oracledb.getConnection(CUSR);
    const query = `
    SELECT M.FACTORY_NAME,
    T.USER_FNAME,
    T.USER_SURNAME,
    T.USER_SITE ,
    T.USER_FNAME||'  ' ||T.USER_SURNAME AS USER_LOGIN
    FROM  CU_USER_M T 
    INNER JOIN  CU_FACTORY_M M ON M.FACTORY_CODE  = T.USER_SITE
     WHERE  T.USER_EMP_ID = '${EmpID}' `;
    const result = await connect.execute(query);
    connect.release();
    // // // console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
  }
};
//Homepage
module.exports.gethome_page = async function (req, res) {
  try {
    const User_login = req.query.user_for_login;
    const connect = await oracledb.getConnection(AVO);
    const query = `
    SELECT
    COUNT(CASE WHEN TT.FFM_CODE = 'FLTR001' THEN 1 ELSE NULL END) AS T_CREATE,
    COUNT(CASE WHEN TT.FFM_CODE = 'FLTR002' THEN 1 ELSE NULL END) AS T_WAIT_DM,
    COUNT(CASE WHEN TT.FFM_CODE = 'FLTR003' THEN 1 ELSE NULL END) AS T_WAIT_SDC,
    COUNT(CASE WHEN TT.FFM_CODE = 'FLTR004' THEN 1 ELSE NULL END) AS T_WAIT_BOI_SC,
    COUNT(CASE WHEN TT.FFM_CODE = 'FLTR005' THEN 1 ELSE NULL END) AS T_WAIT_BOI_M,
    COUNT(CASE WHEN TT.FFM_CODE = 'FLTR006' THEN 1 ELSE NULL END) AS T_WAIT_FACTORY_M,
    COUNT(CASE WHEN TT.FFM_CODE = 'FLTR007' THEN 1 ELSE NULL END) AS T_WAIT_ACC_SC,
    COUNT(CASE WHEN TT.FFM_CODE = 'FLTR008' THEN 1 ELSE NULL END) AS T_WAIT_O_C,
    COUNT(CASE WHEN TT.FFM_CODE = 'FLTR009' THEN 1 ELSE NULL END) AS T_WAIT_RECEIVER_A,
    COUNT(CASE WHEN TT.FFM_CODE = 'FLTR010' THEN 1 ELSE NULL END) AS T_WAIT_ACC_SUD,
    COUNT(CASE WHEN TT.FFM_CODE = 'FLTR011' THEN 1 ELSE NULL END) AS T_WAIT_ACC_MGR,
    COUNT(CASE WHEN TT.FFM_CODE = 'FLTR012' THEN 1 ELSE NULL END) AS T_WAIT_SERVICE_DC
FROM FAM_FLOW_MASTER TT
LEFT JOIN FAM_REQ_HEADER HT ON HT.FAM_REQ_STATUS = TT.FFM_CODE
LEFT JOIN FAM_REQ_TRANSFER A ON A.FRT_FAM_NO = HT.FRH_FAM_NO
WHERE
    TT.FFM_TYPE = 'TRANSFER'
    AND TT.FFM_STATUS = 'A'
    AND (
        HT.FAM_REQ_BY = '${User_login}' AND HT.FAM_REQ_STATUS = 'FLTR001'
        OR HT.FAM_MGR_DEPT = '${User_login}' AND HT.FAM_REQ_STATUS = 'FLTR002'
        OR HT.FAM_SERVICE_BY = '${User_login}' AND HT.FAM_REQ_STATUS = 'FLTR003'
        OR HT.FAM_BOI_CHK_BY = '${User_login}' AND HT.FAM_REQ_STATUS = 'FLTR004'
        OR HT.FAM_BOI_MGR_BY = '${User_login}' AND HT.FAM_REQ_STATUS = 'FLTR005'
        OR HT.FAM_FM_BY = '${User_login}' AND HT.FAM_REQ_STATUS = 'FLTR006'
        OR HT.FAM_ACC_CHK_BY = '${User_login}' AND HT.FAM_REQ_STATUS = 'FLTR007'
        OR HT.FAM_OWNER_SEND_BY = '${User_login}' AND HT.FAM_REQ_STATUS = 'FLTR008'
        OR A.FRT_RECEIVE_BY = '${User_login}' AND HT.FAM_REQ_STATUS = 'FLTR009'
        OR HT.FAM_ACC_REC_BY = '${User_login}' AND HT.FAM_REQ_STATUS = 'FLTR010'
        OR HT.FAM_ACC_MGR_BY = '${User_login}' AND HT.FAM_REQ_STATUS = 'FLTR011'
        OR HT.FAM_SERVICE_CLOSE_BY = '${User_login}' AND HT.FAM_REQ_STATUS = 'FLTR012'
    )`;
    const result = await connect.execute(query);
    connect.release();
    // // // console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
  }
};
// Factory
module.exports.factory = async function (req, res) {
  try {
    const connect = await oracledb.getConnection(AVO);
    const query = `
        SELECT T.FACTORY_CODE,T.FACTORY_NAME 
        FROM CUSR.CU_FACTORY_M T 
        WHERE T.FACTORY_STATUS = 'A' 
        ORDER BY T.FACTORY_CODE
           `;
    const result = await connect.execute(query);
    connect.release();
    // // // console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
  }
};
//Dept
module.exports.dept = async function (req, res) {
  try {
    const IdFactory = req.query.idFactory;
    const connect = await oracledb.getConnection(AVO);
    const query = `
      SELECT T.FDM_DEPT_SHORT 
      FROM FAM_DEPT_MASTER T 
      WHERE T.FDM_FACTORY = '${IdFactory}'
      AND T.FDM_STATUS = 'A' 
      ORDER BY T.FDM_SORT,T.FDM_DEPT_SHORT`;
    const result = await connect.execute(query);
    connect.release();
    // // // console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
  }
};
//CostCenter
module.exports.cost = async function (req, res) {
  try {
    const connect = await oracledb.getConnection(AVO);
    const query = `
      SELECT DISTINCT T.CC_CTR,
      T.CC_DESC FROM CUSR.CU_MFGPRO_CC_MSTR T 
      WHERE  T.CC_ACTIVE = '1' ORDER BY T.CC_CTR
         `;
    const result = await connect.execute(query);
    connect.release();
    // // // console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
  }
};
//RequestType
module.exports.type = async function (req, res) {
  try {
    const connect = await oracledb.getConnection(AVO);
    const query = `
      SELECT T.FCM_CODE,T.FCM_DESC
      FROM FAM_CODE_MASTER T 
      WHERE T.FCM_GROUP_ID = 'GP01'
      AND T.FCM_STATUS = 'A' 
      ORDER BY T.FCM_SORT,T.FCM_DESC
         `;
    const result = await connect.execute(query);
    connect.release();
    // // // console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
  }
};
// RequestBy
module.exports.by = async function (req, res) {
  try {
    const By = req.query.By;
    const connect = await oracledb.getConnection(CUSR);
    const query = `
    SELECT  H.EMPCODE,H.ENAME,H.ESURNAME,T.USER_LOGIN
    ,H.EMPCODE || ' : ' || H.ENAME || ' ' || H.ESURNAME
    FROM CU_USER_HUMANTRIX H 
    LEFT JOIN  CU_USER_M T  ON  T.USER_EMP_ID = H.EMPCODE
   WHERE  T.USER_LOGIN = '${By}' `;
    const result = await connect.execute(query);
    connect.release();
    // // // console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
  }
};
//Search
module.exports.search = async function (req, res) {
  try {
    const userlogin = req.query.UserLogin;
    const factory = req.query.FacCode;
    const dept = req.query.DeptCode;
    const famno = req.query.FamNo;
    const famto = req.query.FamTo;
    const cost = req.query.Costcenter;
    const asset = req.query.FixAsset;
    const type = req.query.ReType;
    const date = req.query.ReDate;
    const dateto = req.query.ReDateTo;
    const connect = await oracledb.getConnection(AVO);
    const query = `
    SELECT
    DISTINCT M.FACTORY_NAME AS FACTORY,
    T.FAM_REQ_CC AS COSTCENTER,
    T.FRH_FAM_NO AS FAMNO,
    TO_CHAR(T.FAM_REQ_DATE, 'DD/MM/YYYY') AS ISSUEDATE,
    T.FAM_REQ_BY AS ISSUEBY,
    R.FCM_DESC AS RETYPE,
(SELECT TO_CHAR(WM_CONCAT(DISTINCT CD.FRD_ASSET_CODE))FROM FAM_REQ_DETAIL CD WHERE CD.FRD_FAM_NO = T.FRH_FAM_NO ) AS FIXED_CODE,
    F.FFM_DESC AS STATUS
  FROM
    FAM_REQ_HEADER T
  LEFT JOIN CUSR.CU_FACTORY_M M ON M.FACTORY_CODE = T.FAM_FACTORY
  LEFT JOIN FAM_CODE_MASTER R ON R.FCM_CODE = T.FAM_REQ_TYPE
  LEFT JOIN FAM_FLOW_MASTER F ON F.FFM_CODE = T.FAM_REQ_STATUS
  LEFT JOIN FAM_REQ_DETAIL C ON C.FRD_FAM_NO = T.FRH_FAM_NO
  LEFT JOIN FAM_REQ_TRANSFER A ON A.FRT_FAM_NO = T.FRH_FAM_NO
  WHERE  T.FAM_REQ_BY = '${userlogin}' AND  F.FFM_FLG  IN ('C','R')
    AND (T.FAM_FACTORY = '${factory}' OR '${factory}' IS NULL)
    AND (TRIM(T.FAM_REQ_DEPT) = '${dept}' OR '${dept}' IS NULL)
    AND (T.FRH_FAM_NO >= '${famno}' OR '${famno}' IS NULL)
    AND (T.FRH_FAM_NO <= '${famto}' OR '${famto}'IS NULL)
    AND (TRIM(T.FAM_REQ_CC) = '${cost}' OR '${cost}' IS NULL)
    AND (T.FAM_REQ_TYPE = '${type}' OR '${type}' IS NULL)
    AND ( '${asset}' IS NULL OR C.FRD_ASSET_CODE IN (SELECT TRIM(REGEXP_SUBSTR('${asset}', '[^,]+', 1, LEVEL)) FROM DUAL CONNECT BY LEVEL <= REGEXP_COUNT('${asset}', ',') + 1))
    AND (TO_CHAR(T.FAM_REQ_DATE , 'YYYY-MM-DD') >= '${date}' OR '${date}' IS NULL)
    AND (TO_CHAR(T.FAM_REQ_DATE , 'YYYY-MM-DD') <= '${dateto}' OR '${dateto}' IS NULL)
    ORDER BY T.FRH_FAM_NO DESC
         `;
    // // // console.log(query);
    const result = await connect.execute(query);
    connect.release();
    // // // console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
  }
};
// Serach Approve
module.exports.search2 = async function (req, res) {
  try {
    const userlogin = req.query.UserLogin;
    const factory = req.query.FacCode;
    const dept = req.query.DeptCode;
    const famno = req.query.FamNo;
    const famto = req.query.FamTo;
    const cost = req.query.Costcenter;
    const asset = req.query.FixAsset;
    const type = req.query.ReType;
    const date = req.query.ReDate;
    const dateto = req.query.ReDateTo;
    const connect = await oracledb.getConnection(AVO);
    const query = `
    SELECT
    DISTINCT M.FACTORY_NAME AS FACTORY,
    T.FAM_REQ_CC AS COSTCENTER,
    T.FRH_FAM_NO AS FAMNO,
    TO_CHAR(T.FAM_REQ_DATE, 'DD/MM/YYYY') AS ISSUEDATE,
    T.FAM_REQ_BY AS ISSUEBY,
    R.FCM_DESC AS RETYPE,
(SELECT TO_CHAR(WM_CONCAT(DISTINCT CD.FRD_ASSET_CODE))FROM FAM_REQ_DETAIL CD WHERE CD.FRD_FAM_NO = T.FRH_FAM_NO ) AS FIXED_CODE,
    F.FFM_DESC AS STATUS
  FROM
    FAM_REQ_HEADER T
  LEFT JOIN CUSR.CU_FACTORY_M M ON M.FACTORY_CODE = T.FAM_FACTORY
  LEFT JOIN FAM_CODE_MASTER R ON R.FCM_CODE = T.FAM_REQ_TYPE
  LEFT JOIN FAM_FLOW_MASTER F ON F.FFM_CODE = T.FAM_REQ_STATUS
  LEFT JOIN FAM_REQ_DETAIL C ON C.FRD_FAM_NO = T.FRH_FAM_NO
  LEFT JOIN FAM_REQ_TRANSFER A ON A.FRT_FAM_NO = T.FRH_FAM_NO
  WHERE  (T.FAM_MGR_DEPT = '${userlogin}' AND T.FAM_REQ_STATUS = 'FLTR002'
    OR (T.FAM_SERVICE_BY  = '${userlogin}'  AND T.FAM_REQ_STATUS = 'FLTR003')
    OR (T.FAM_BOI_CHK_BY  = '${userlogin}'  AND T.FAM_REQ_STATUS = 'FLTR004')
    OR (T.FAM_BOI_MGR_BY  = '${userlogin}'  AND T.FAM_REQ_STATUS = 'FLTR005')
    OR (T.FAM_FM_BY  = '${userlogin}'  AND T.FAM_REQ_STATUS = 'FLTR006')
    OR (T.FAM_ACC_CHK_BY  = '${userlogin}'  AND T.FAM_REQ_STATUS = 'FLTR007')
    OR (T.FAM_OWNER_SEND_BY  = '${userlogin}'  AND T.FAM_REQ_STATUS = 'FLTR008')
    OR ( A.FRT_RECEIVE_BY  = '${userlogin}'  AND T.FAM_REQ_STATUS = 'FLTR009')
    OR (T.FAM_ACC_REC_BY  = '${userlogin}'  AND T.FAM_REQ_STATUS = 'FLTR010')
    OR (T.FAM_ACC_MGR_BY  = '${userlogin}'  AND T.FAM_REQ_STATUS = 'FLTR011')
    OR (T.FAM_SERVICE_CLOSE_BY  = '${userlogin}'  AND T.FAM_REQ_STATUS = 'FLTR012'))
    AND (T.FAM_FACTORY = '${factory}' OR '${factory}' IS NULL)
    AND (TRIM(T.FAM_REQ_DEPT) = '${dept}' OR '${dept}' IS NULL)
    AND (T.FRH_FAM_NO >= '${famno}' OR '${famno}' IS NULL)
    AND (T.FRH_FAM_NO <= '${famto}' OR '${famto}'IS NULL)
    AND (TRIM(T.FAM_REQ_CC) = '${cost}' OR '${cost}' IS NULL)
    AND (T.FAM_REQ_TYPE = '${type}' OR '${type}' IS NULL)
    AND ( '${asset}' IS NULL OR C.FRD_ASSET_CODE IN (SELECT TRIM(REGEXP_SUBSTR('${asset}', '[^,]+', 1, LEVEL)) FROM DUAL CONNECT BY LEVEL <= REGEXP_COUNT('${asset}', ',') + 1))
    AND (TO_CHAR(T.FAM_REQ_DATE , 'YYYY-MM-DD') >= '${date}' OR '${date}' IS NULL)
    AND (TO_CHAR(T.FAM_REQ_DATE , 'YYYY-MM-DD') <= '${dateto}' OR '${dateto}' IS NULL)
    ORDER BY T.FRH_FAM_NO DESC
  
         `;
    // // // console.log(query);
    const result = await connect.execute(query);
    connect.release();
    // // // console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
  }
};
//Fixed Asset Code
module.exports.fixcode = async function (req, res) {
  try {
    const fixcode = req.query.Fixcode;
    const cc = req.query.asset_cc;

    // // // console.log(factory,"1")

    const connect = await oracledb.getConnection(QAD);
    const query = `
    SELECT KFA_MSTR.KFA_CODE,  
    KFAD_DET.KFAD_COMP,  
    KFAD_DET.KFAD_CC,  
    KFAD_DET.KFAD_COMP_NAME,  
    KFA_MSTR.KFA_SEARCH3,  
    CODE_MSTR.CODE_CMMT,  
    KFAD_DET.KFAD_QTY,  
    KFIN_DET.KFIN_DOC_NO,  
    KFIN_DET.KFIN_REF_DATE,  
    KFAD_DET.KFAD_ACQ_COST,  
    KFAD_DET.KFAD_SVG_VAL 
FROM KFA_MSTR,  
    KFAD_DET,  
    KFIN_DET,  
    CODE_MSTR 
WHERE ( KFA_MSTR.KFA_CODE = KFAD_DET.KFAD_CODE ) and 
    ( KFA_MSTR.KFA_DOMAIN = KFAD_DET.KFAD_DOMAIN ) and 
    ( KFAD_DET.KFAD_CODE = KFIN_DET.KFIN_FA_CODE ) and 
    ( KFIN_DET.KFIN_DOMAIN = KFAD_DET.KFAD_DOMAIN ) and 
    ( KFA_MSTR.KFA_OBLG = CODE_MSTR.CODE_VALUE ) and 
    ( KFA_MSTR.KFA_DOMAIN = CODE_MSTR.CODE_DOMAIN ) and 
    ( KFAD_DET.KFAD_COMP = KFIN_DET.KFIN_INFO_SEQ ) and 
    ( ( KFA_MSTR.KFA_CODE = '${fixcode}' ) AND  
    ( upper(CODE_MSTR.CODE_FLDNAME) = 'KFA_OBLG' ) AND 
    ( KFAD_DET.KFAD_BOOK = 'SL' ) AND 
    ( KFA_MSTR.KFA_DOMAIN = '9000' ) AND 
    ( KFAD_DET.KFAD_SEQ = '0' ) AND
    ( KFAD_DET.KFAD_CC = '${cc}') )
  ORDER BY  KFAD_DET.KFAD_COMP ASC
         `;

    const result = await connect.execute(query);
    connect.release();
    // // // console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
  }
};

//FactoryForInsert
module.exports.fac_insert = async function (req, res) {
  try {
    const UserLogin = req.query.Fac_Login;
    const connect = await oracledb.getConnection(CUSR);
    const query = `
    SELECT
    F.FACTORY_NAME,
    T.USER_SITE
  FROM CU_USER_M T
  INNER JOIN CU_FACTORY_M F ON F.FACTORY_CODE = T.USER_SITE
  WHERE T.USER_LOGIN = '${UserLogin}' `;
    const result = await connect.execute(query);
    connect.release();
    // // // console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
  }
};
//Costcenter
module.exports.cost_insert = async function (req, res) {
  try {
    const User_cost = req.query.Cost_Login;
    const connect = await oracledb.getConnection(CUSR);
    const query = `
    SELECT H.COST_CENTER 
    FROM CU_USER_M T
    INNER JOIN CU_USER_HUMANTRIX H
    ON H.EMPCODE = T.USER_EMP_ID  
    WHERE  T.USER_LOGIN ='${User_cost}' `;
    const result = await connect.execute(query);
    connect.release();
    // // // console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
  }
};
// Fixed Asset Group
module.exports.fix_group = async function (req, res) {
  try {
    const Fixasset = req.query.Asset_group;
    const connect = await oracledb.getConnection(AVO);
    const query = `
    SELECT T.FRC_CHK_PREFIX AS inpCode,
    T.FRC_CHK_PREFIX||' : '||T.FRC_GROUP AS ShowDesc 
    FROM FAM_RUNNING_CONTROL T 
    WHERE T.FRC_FACTORY = '${Fixasset}' 
    ORDER BY T.FRC_FACTORY,T.FRC_CHK_PREFIX,T.FRC_GROUP `;
    const result = await connect.execute(query);
    connect.release();
    // // // console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
  }
};
//Status
module.exports.status = async function (req, res) {
  try {
    const connect = await oracledb.getConnection(AVO);
    const query = `
    SELECT T.FFM_CODE, T.FFM_DESC 
    FROM FAM_FLOW_MASTER T 
    WHERE T.FFM_TYPE = 'TRANSFER' 
    AND T.FFM_SEQ = 1 AND T.FFM_STATUS = 'A' `;
    const result = await connect.execute(query);
    connect.release();
    // // // console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
  }
};

//หา Service  AssetGroup
module.exports.id_service = async function (req, res) {
  try {
    const Fac = req.query.fac;
    const FixGroup = req.query.fixgroub;
    const connect = await oracledb.getConnection(AVO);
    const query = `
    SELECT DISTINCT T.FRC_PIC_CC,
    T.FRC_PIC_CC||' : '||T.FRC_SERVICE_DEPT ,
    T.FRC_SERVICE_DEPT 
    FROM FAM_RUNNING_CONTROL T WHERE T.FRC_FACTORY = '${Fac}'
    AND T.FRC_CHK_PREFIX = '${FixGroup}' `;
    const result = await connect.execute(query);
    connect.release();
    // // // console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
  }
};
//หา Service Find_asset Cost
module.exports.find_service = async function (req, res) {
  try {
    const AssetCost = req.query.asset_find;
    // // // console.log("///////////", AssetCost);
    const connect = await oracledb.getConnection(AVO);
    const query = `
    SELECT DISTINCT T.CC_CTR ,
    T.CC_CTR||' : '||T.CC_DESC ,
    T.CC_DESC
    FROM CUSR.CU_MFGPRO_CC_MSTR T 
    WHERE  T.CC_ACTIVE = '1' 
    AND T.CC_CTR = '${AssetCost}'  
    ORDER BY T.CC_CTR `;
    const result = await connect.execute(query);
    connect.release();
    // // // console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
  }
};
// หา FAM NO.
module.exports.fam_no = async function (req, res) {
  try {
    const FamNo = req.query.famno;
    const connect = await oracledb.getConnection(AVO);
    const query = `
    SELECT MAX (FRH_FAM_NO)  
     FROM FAM_REQ_HEADER WHERE FRH_FAM_NO LIKE '${FamNo}-%'`;
    // // // console.log(query);
    const result = await connect.execute(query);
    connect.release();
    // // // console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
  }
};
// insert FAM NO.สำหรับ การได้ เอกสารครั้งแรก
module.exports.insert_tranfer = async function (req, res) {
  try {
    // // // console.log("----");
    const Tranfer_id = req.query.tranfer;
    const ReqBy = req.query.reqby;
    const ReTel = req.query.reTel;
    const Factory = req.query.fac;
    const CC = req.query.cc;
    const Dept = req.query.dept;
    const Type = req.query.type;
    const Assetgroup = req.query.assetgroup;
    const AssetCC = req.query.assetcc;
    const AssetName = req.query.assetname;
    const Status = req.query.status;
    const Remark = req.query.remark;
    const User_FAM = req.query.user;

    // // // console.log(Tranfer_id);
    // // // console.log(Remark);
    // // // console.log("////");
    const connect = await oracledb.getConnection(AVO);
    const query = `
      INSERT INTO FAM_REQ_HEADER 
      (FRH_FAM_NO, FAM_REQ_DATE, FAM_REQ_BY, FAM_REQ_TEL, FAM_FACTORY, FAM_REQ_CC,
      FAM_REQ_DEPT, FAM_REQ_TYPE, FAM_ASSET_GROUP, FAM_ASSET_CC,FAM_ASSET_CC_NAME, FAM_REQ_STATUS, FAM_REQ_REMARK,FAM_CREATE_BY,FAM_CREATE_DATE)
      VALUES 
      (:Tranfer_id, SYSDATE, :ReqBy, :ReTel, :Factory, :CC, :Dept, :Type, :Assetgroup, :AssetCC,:AssetName, :Status, :Remark ,:User_FAM ,SYSDATE)
    `;

    const data = {
      Tranfer_id,
      ReqBy,
      ReTel,
      Factory,
      CC,
      Dept,
      Type,
      Assetgroup,
      AssetCC,
      AssetName,
      Status,
      Remark,
      User_FAM
    };
    // // // console.log(query);
    // // // console.log(data);
    const result = await connect.execute(query, data, { autoCommit: true });
    connect.release();
    res.json(result);
  } catch (error) {
    console.error("Error in querying data:", error.message);
    res.status(500).send("Internal Server Error");
  }
};
module.exports.create_date = async function (req, res) {
  try {
    // // // console.log("----");
    const Tranfer_id = req.query.tranfer;

    // // // console.log(Tranfer_id);

    const connect = await oracledb.getConnection(AVO);
    const query = `
    UPDATE FAM_REQ_HEADER 
    SET FAM_CREATE_DATE = SYSDATE
    WHERE FRH_FAM_NO = :Tranfer_id
  `;

    const data = {
      Tranfer_id,
    };
    // // // console.log(query);
    // // // console.log(data);
    const result = await connect.execute(query, data, { autoCommit: true });
    connect.release();
    res.json(result);
  } catch (error) {
    console.error("Error in querying data:", error.message);
    res.status(500).send("Internal Server Error");
  }
};
module.exports.update_date = async function (req, res) {
  try {
    // // // console.log("----");
    const Tranfer_id = req.query.tranfer;

    // // // console.log(Tranfer_id);

    const connect = await oracledb.getConnection(AVO);
    const query = `
    UPDATE FAM_REQ_HEADER 
    SET FAM_UPDATE_DATE = SYSDATE
    WHERE FRH_FAM_NO = :Tranfer_id
  `;

    const data = {
      Tranfer_id,
    };
    // // // console.log(query);
    // // // console.log(data);
    const result = await connect.execute(query, data, { autoCommit: true });
    connect.release();
    res.json(result);
  } catch (error) {
    console.error("Error in querying data:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.insert_asset_transfer = async function (req, res) {
  try {
    const Tranfer_id = req.query.tranfer;
    const ReqBy = req.query.reqby;
    const AssetCC = req.query.assetcc;

    const connect = await oracledb.getConnection(AVO);
    const query = `
      INSERT INTO FAM_REQ_TRANSFER (FRT_FAM_NO, FRT_FROM_CC, FRT_CREATE_DATE, FRT_CREATE_BY)
VALUES (:Tranfer_id,:AssetCC, SYSDATE,:ReqBy)
    `;

    const data = {
      Tranfer_id,
      ReqBy,
      AssetCC,
    };

    const result = await connect.execute(query, data, { autoCommit: true });
    connect.release();
    res.json(result);
  } catch (error) {
    console.error("Error in querying data:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

// insert_FAM_DETAIL
module.exports.insert_FAM_REQ_DETAIL = async function (req, res) {
  try {
    const FRD_FAM_NO = req.query.famno;
    const FRD_ASSET_CODE = req.query.assetcode;
    const FRD_ASSET_NAME = req.query.assetname;
    const FRD_COMP = req.query.comp;
    const FRD_OWNER_CC = req.query.cc;
    const FRD_BOI_PROJ = req.query.boi;
    const FRD_QTY = req.query.qty;
    const FRD_INV_NO = req.query.inv;
    const FRD_ACQ_COST = req.query.cost;
    const FRD_BOOK_VALUE = req.query.val;
    const FRD_CREATE_BY = req.query.by;
    const connect = await oracledb.getConnection(AVO);
    const query = `
    MERGE INTO AVO.FAM_REQ_DETAIL dest
    USING (
        SELECT
            :FRD_FAM_NO AS FRD_FAM_NO,
            :FRD_ASSET_CODE AS FRD_ASSET_CODE,
            :FRD_ASSET_NAME AS FRD_ASSET_NAME,
            :FRD_COMP AS FRD_COMP,
            :FRD_OWNER_CC AS FRD_OWNER_CC,
            :FRD_BOI_PROJ AS FRD_BOI_PROJ,
            :FRD_QTY AS FRD_QTY,
            :FRD_INV_NO AS FRD_INV_NO,
            :FRD_ACQ_COST AS FRD_ACQ_COST,
            :FRD_BOOK_VALUE AS FRD_BOOK_VALUE,
            :FRD_CREATE_BY AS FRD_CREATE_BY
        FROM dual
    ) src
    ON (dest.FRD_FAM_NO = src.FRD_FAM_NO
        AND dest.FRD_ASSET_CODE = src.FRD_ASSET_CODE
        AND dest.FRD_COMP = src.FRD_COMP
    ) 
    WHEN MATCHED THEN
        UPDATE SET
            dest.FRD_ASSET_NAME = src.FRD_ASSET_NAME,
            dest.FRD_OWNER_CC = src.FRD_OWNER_CC,
            dest.FRD_BOI_PROJ = src.FRD_BOI_PROJ,
            dest.FRD_QTY = src.FRD_QTY,
            dest.FRD_INV_NO = src.FRD_INV_NO,
            dest.FRD_ACQ_COST = src.FRD_ACQ_COST,
            dest.FRD_BOOK_VALUE = src.FRD_BOOK_VALUE
    WHEN NOT MATCHED THEN
        INSERT (
            FRD_FAM_NO,
            FRD_ASSET_CODE,
            FRD_ASSET_NAME,
            FRD_COMP,
            FRD_OWNER_CC,
            FRD_BOI_PROJ,
            FRD_QTY,
            FRD_INV_NO,
            FRD_ACQ_COST,
            FRD_BOOK_VALUE,
            FRD_CREATE_DATE,
            FRD_CREATE_BY
        ) VALUES (
            src.FRD_FAM_NO,
            src.FRD_ASSET_CODE,
            src.FRD_ASSET_NAME,
            src.FRD_COMP,
            src.FRD_OWNER_CC,
            src.FRD_BOI_PROJ,
            src.FRD_QTY,
            src.FRD_INV_NO,
            src.FRD_ACQ_COST,
            src.FRD_BOOK_VALUE,
            SYSDATE,
            src.FRD_CREATE_BY
        )
    
    `;
    const data = {
      FRD_FAM_NO,
      FRD_ASSET_CODE,
      FRD_ASSET_NAME,
      FRD_COMP,
      FRD_OWNER_CC,
      FRD_BOI_PROJ,
      FRD_QTY,
      FRD_INV_NO,
      FRD_ACQ_COST,
      FRD_BOOK_VALUE,
      FRD_CREATE_BY,
    };
    // // console.log(query, data);
    const result = await connect.execute(query, data, { autoCommit: true });
    // // // console.log(result)
    connect.release();
    res.json(result);
  } catch (error) {
    console.error("Error in querying data:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

//Delete  Fixed Assets Code
module.exports.delete_FAM_REQ_DETAIL = async function (req, res) {
  try {
    const FRD_FAM_NO = req.query.famno;
    const FRD_ASSET_CODE = req.query.fixcode;
    const connect = await oracledb.getConnection(AVO);
    const query = `
    DELETE FROM FAM_REQ_DETAIL 
     WHERE FRD_FAM_NO = :fam
     AND FRD_ASSET_CODE = :code 
    `;
    const data = {
      fam: FRD_FAM_NO,
      code: FRD_ASSET_CODE,
    };
    const result = await connect.execute(query, data, { autoCommit: true });
    connect.release();
    res.json(result);
  } catch (error) {
    console.error("Error in querying data:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

// FROM_BOI_PROJ (UPDATE ค่า From_BOI )
module.exports.ins_from_Boi = async function (req, res) {
  try {
    const Tranfer_id = req.query.running_no;
    const from = req.query.from_boi;

    const connect = await oracledb.getConnection(AVO);
    const query = `
    UPDATE FAM_REQ_TRANSFER 
    SET FRT_FROM_PROJ  = :boi_from 
    WHERE FRT_FAM_NO = :running
`;
    const data = {
      running: Tranfer_id,
      boi_from: from,
    };
    const result = await connect.execute(query, data, { autoCommit: true });
    connect.release();
    res.json(result);
  } catch (error) {
    console.error("Error in querying data:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.new_boi = async function (req, res) {
  try {
    const Fac = req.query.fac;
    const CC = req.query.cc;
    // // console.log(Fac, CC);
    const connect = await oracledb.getConnection(AVO);
    const query = `
    SELECT T.FBMC_BOI_PROJ 
    FROM FAM_BOIPROJ_MAP_CC T 
    WHERE T.FBMC_FACTORY = '${Fac}' 
    AND T.FBMC_COST_CENTER = '${CC}' `;
    const result = await connect.execute(query);
    connect.release();
    // // // console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
  }
};

//Select ข้อมูลส่วนของ Transfer Detail
module.exports.select_BOI_from = async function (req, res) {
  try {
    const running = req.query.running_no;
    const connect = await oracledb.getConnection(AVO);
    const query = `
    SELECT FRD_BOI_PROJ  FROM FAM_REQ_DETAIL frd 
      WHERE FRD_FAM_NO = '${running}' `;
    const result = await connect.execute(query);
    connect.release();
    // // // console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
  }
};
// new Owner
module.exports.new_owner = async function (req, res) {
  try {
    const Fac = req.query.fac;
    const CC = req.query.cc;
    const connect = await oracledb.getConnection(AVO);
    const query = `
    SELECT
    M.USER_EMP_ID ||' : ' ||T.FPM_USER_LOGIN  AS NEW_OWNER
    FROM FAM_PERSON_MASTER T
    INNER JOIN CUSR.CU_USER_M M ON 
    M.USER_LOGIN = T.FPM_USER_LOGIN
    WHERE T.FPM_LEVEL = 'GP02001'
    AND T.FPM_FACTORY = '${Fac}'
    AND T.FPM_CC = '${CC}'
    AND T.FPM_PERSON_STS = 'A' `;
    const result = await connect.execute(query);
    connect.release();
    // // // console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
  }
};
// cc มี ALL
module.exports.cc = async function (req, res) {
  try {
    const connect = await oracledb.getConnection(AVO);
    const query = `
    SELECT DISTINCT T.CC_CTR, T.CC_DESC,1
    FROM CUSR.CU_MFGPRO_CC_MSTR T 
    WHERE T.CC_ACTIVE = '1'
    UNION ALL
    SELECT 'ALL' AS CC_CTR, 'ALL' AS CC_DESC,0
    FROM DUAL
    ORDER BY  1
         `;
    const result = await connect.execute(query);
    connect.release();
    // // // console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
  }
};
// D7 Department Manager
module.exports.level_mana = async function (req, res) {
  try {
    const Level = req.query.level;
    const CC = req.query.cc;
    // // console.log(Level, "////", CC);
    const connect = await oracledb.getConnection(AVO);
    const query = `
    SELECT T.FPM_USER_LOGIN FROM FAM_PERSON_MASTER T 
    WHERE T.FPM_LEVEL = 'GP02002'
    AND T.FPM_FACTORY = '${Level}'
    AND T.FPM_CC = '${CC}'
    AND T.FPM_PERSON_STS = 'A'
         `;
    const result = await connect.execute(query);
    connect.release();
    // // // console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
  }
};
// D8 Service By
module.exports.service_by = async function (req, res) {
  try {
    const Level = req.query.level;
    const CC = req.query.cc;
    //  // // console.log("Level",Level,"CC",CC)
    const connect = await oracledb.getConnection(AVO);
    const query = `
    SELECT T.FPM_USER_LOGIN FROM FAM_PERSON_MASTER T 
    WHERE T.FPM_LEVEL = 'GP02003'
    AND T.FPM_FACTORY = '${Level}'
    AND T.FPM_CC = '${CC}'
    AND T.FPM_PERSON_STS = 'A'
         `;
    const result = await connect.execute(query);
    connect.release();
    // // // console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
  }
};
// D9 BOI Staff
module.exports.boi_staff = async function (req, res) {
  try {
    const Fac = req.query.fac;
    const connect = await oracledb.getConnection(AVO);
    const query = `
    SELECT T.FPM_USER_LOGIN 
    FROM FAM_PERSON_MASTER T 
    WHERE T.FPM_LEVEL = 'GP02004'
    AND T.FPM_FACTORY = '${Fac}' 
    AND T.FPM_CC = 'ALL' 
    AND T.FPM_PERSON_STS = 'A'
    ORDER BY T.FPM_PRIORITY,T.FPM_USER_LOGIN
    
         `;
    const result = await connect.execute(query);
    connect.release();
    // // // console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
  }
};
//D10 BOI Manager
module.exports.boi_manager = async function (req, res) {
  try {
    const Fac = req.query.fac;
    const connect = await oracledb.getConnection(AVO);
    const query = `
    SELECT T.FPM_USER_LOGIN 
    FROM FAM_PERSON_MASTER T 
    WHERE T.FPM_LEVEL = 'GP02005'
    AND T.FPM_FACTORY = '${Fac}'
    AND T.FPM_CC = 'ALL' 
    AND T.FPM_PERSON_STS = 'A'
    ORDER BY T.FPM_PRIORITY,T.FPM_USER_LOGIN
         `;
    const result = await connect.execute(query);
    connect.release();
    // // // console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
  }
};
// D11 Factory Manager
module.exports.fac_manager = async function (req, res) {
  try {
    const Fac = req.query.fac;
    const connect = await oracledb.getConnection(AVO);
    const query = `
    SELECT T.FPM_USER_LOGIN 
    FROM FAM_PERSON_MASTER T
    WHERE T.FPM_LEVEL = 'GP02006' 
    AND T.FPM_FACTORY =  '${Fac}'  
    AND T.FPM_CC = 'ALL' AND T.FPM_PERSON_STS = 'A'
    ORDER BY T.FPM_PRIORITY,T.FPM_USER_LOGIN
         `;
    const result = await connect.execute(query);
    connect.release();
    // // // console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
  }
};
// D12 ACC Check
module.exports.acc_check = async function (req, res) {
  try {
    const Fac = req.query.fac;
    const connect = await oracledb.getConnection(AVO);
    const query = `
    SELECT T.FPM_USER_LOGIN 
    FROM FAM_PERSON_MASTER T 
    WHERE T.FPM_LEVEL = 'GP02007'
    AND T.FPM_FACTORY = ${Fac} 
    AND T.FPM_CC = 'ALL' AND T.FPM_PERSON_STS = 'A'
    ORDER BY T.FPM_PRIORITY,T.FPM_USER_LOGIN

         `;
    const result = await connect.execute(query);
    connect.release();
    // // // console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
  }
};
//D13 ACC Manager
module.exports.acc_manager = async function (req, res) {
  try {
    const Fac = req.query.fac;
    const connect = await oracledb.getConnection(AVO);
    const query = `
    SELECT T.FPM_USER_LOGIN 
    FROM FAM_PERSON_MASTER T
     WHERE T.FPM_LEVEL = 'GP02012' 
     AND T.FPM_FACTORY = '${Fac}'
     AND T.FPM_CC = 'ALL' 
     AND T.FPM_PERSON_STS = 'A'
    ORDER BY T.FPM_PRIORITY,T.FPM_USER_LOGIN

         `;
    const result = await connect.execute(query);
    connect.release();
    // // // console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
  }
};

module.exports.ins_transfer = async function (req, res) {
  try {
    const FAM_NO = req.query.running_no;
    const Date_plan1 = req.query.date_plan;
    const Factory = req.query.fac;
    const CC = req.query.cc;
    const To_TRANS = req.query.to_proj;
    const Receive_By = req.query.by;
    const Tel = req.query.tel;
    const Status = req.query.status;
    const Abnormal = req.query.abnormal;
    // // console.log("FAM_NO", FAM_NO,Date_plan1,Factory,CC);
    
    const connect = await oracledb.getConnection(AVO);
    const query = `
    UPDATE FAM_REQ_TRANSFER F
    SET
      F.FRT_PLAN_MOVE_DATE = TO_DATE(:date_plan1, 'YYYY-MM-DD'),
      F.FRT_TO_FACTORY = :factory,
      F.FRT_TO_CC = :cc_tran,
      F.FRT_TO_PROJ = :to_tran,
      F.FRT_RECEIVE_BY = :receive_by,
      F.FRT_RECEIVER_TEL = :tel_tran,
      F.FRT_ABNORMAL_STS = :status_tran,
      F.FRT_ABNORMAL_REASON = :abnormal_remark,
      F.FRT_RECEIVE_DATE = SYSDATE
    WHERE F.FRT_FAM_NO = :fam_no
    `;

    const data = {
      fam_no: FAM_NO,
      date_plan1: Date_plan1,
      factory: Factory,
      cc_tran: CC,
      to_tran: To_TRANS,
      receive_by: Receive_By,
      tel_tran: Tel,
      status_tran: Status,
      abnormal_remark: Abnormal,
    };
    // // console.log(query);
    // // console.log(data);

    // Execute the query
    const result = await connect.execute(query, data, { autoCommit: true });

    if (result) {
      //// // console.log("Rows updated:", result.rowsAffected);
      res.json(result);
    } else {
      // console.error("Error: Unexpected result from the database");
      res.status(500).send("Internal Server Error");
    }

    connect.release();
  } catch (error) {
    console.error("Error in querying data:", error.message);
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }
};

//ROUTING_For_request
module.exports.routing_tran = async function (req, res) {
  try {
    const FAM_NO = req.query.running_no;
    const MGR_DEPT = req.query.m_dept;
    const SERVICE_DEPT = req.query.s_dept;
    const SERVICE_TEL = req.query.s_tel;
    const SERVICE_BY = req.query.s_by;
    const BOI_CHK_BY = req.query.chk_by;
    const BOI_MGR_BY = req.query.boi_by;
    const FM_BY = req.query.fmby;
    const ACC_CHK_BY = req.query.acc_by;
    const OWNER_SEND_BY = req.query.own_by;
    const ACC_RECORD = req.query.acc_record;
    const ACC_MANAGER = req.query.acc_manager;
    const SERVICE_CLOSE_BY = req.query.service_close_by;
    // // console.log("มาละจ้าหนู", FAM_NO);
    const connect = await oracledb.getConnection(AVO);
    const query = `
    UPDATE FAM_REQ_HEADER H
    SET
         H.FAM_MGR_DEPT  = :FAM_MGR_DEPT,
         H.FAM_SERVICE_DEPT = :FAM_SERVICE_DEPT,
         H.FAM_SERVICE_TEL =:FAM_SERVICE_TEL,
         H.FAM_SERVICE_BY =:FAM_SERVICE_BY ,
         H.FAM_BOI_CHK_BY =:FAM_BOI_CHK_BY,
         H.FAM_BOI_MGR_BY =:FAM_BOI_MGR_BY,
         H.FAM_FM_BY =:FAM_FM_BY,
         H.FAM_ACC_CHK_BY =:FAM_ACC_CHK_BY,
         H.FAM_OWNER_SEND_BY =:FAM_OWNER_SEND_BY,
         H.FAM_ACC_REC_BY = :FAM_ACC_REC_BY,
         H.FAM_ACC_MGR_BY = :FAM_ACC_MGR_BY,
         H.FAM_SERVICE_CLOSE_BY = :FAM_SERVICE_CLOSE_BY
      WHERE H.FRH_FAM_NO= :FRH_FAM_NO
    `;

    const data = {
      FRH_FAM_NO: FAM_NO,
      FAM_MGR_DEPT: MGR_DEPT,
      FAM_SERVICE_DEPT: SERVICE_DEPT,
      FAM_SERVICE_TEL: SERVICE_TEL,
      FAM_SERVICE_BY: SERVICE_BY,
      FAM_BOI_CHK_BY: BOI_CHK_BY,
      FAM_BOI_MGR_BY: BOI_MGR_BY,
      FAM_FM_BY: FM_BY,
      FAM_ACC_CHK_BY: ACC_CHK_BY,
      FAM_OWNER_SEND_BY: OWNER_SEND_BY,
      FAM_ACC_REC_BY: ACC_RECORD,
      FAM_ACC_MGR_BY: ACC_MANAGER,
      FAM_SERVICE_CLOSE_BY: SERVICE_CLOSE_BY,
    };
    // // // console.log(query);
    // // // console.log(data);

    // Execute the query
    const result = await connect.execute(query, data, { autoCommit: true });

    if (result) {
      // // // console.log("Rows updated:", result.rowsAffected);
      res.json(result);
    } else {
      console.error("Error: Unexpected result from the database");
      res.status(500).send("Internal Server Error");
    }

    connect.release();
  } catch (error) {
    console.error("Error in querying data:", error.message);
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }
};

//Receiver for Tranfers
module.exports.receiver_tranfer = async function (req, res) {
  try {
    // // // console.log("g-hkkkkkkkkkkkkk");
    const { famno, receiver } = req.body;
    // // // console.log(famno, receiver);

    const connect = await oracledb.getConnection(AVO);
    const query = `
    UPDATE FAM_REQ_TRANSFER  T
    SET
    T.FRT_RECEIVE_BY  = :FRT_RECEIVE_BY
    WHERE T.FRT_FAM_NO= :FRT_FAM_NO
    `;

    const data = {
      FRT_FAM_NO: famno,
      FRT_RECEIVE_BY: receiver,
    };
    // // // console.log(query);
    // // // console.log(data);

    const result = await connect.execute(query, data, { autoCommit: true });

    if (result) {
      // // // console.log("Rows updated:", result.rowsAffected);
      res.json(result);
    } else {
      console.error("Error: Unexpected result from the database");
      res.status(500).send("Internal Server Error");
    }

    connect.release();
  } catch (error) {
    console.error("Error in querying data:", error.message);
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }
};
// Close Routing
module.exports.close_routing_tran = async function (req, res) {
  try {
    // // // console.log("g-hkkkkkkkkkkkkk");
    const { famno, acc_record, acc_manager, service_close_by } = req.body;
    // // // console.log(famno, acc_record, acc_manager, service_close_by);

    const connect = await oracledb.getConnection(AVO);
    const query = `
      UPDATE FAM_REQ_HEADER T
      SET
       
      WHERE T.FRH_FAM_NO = :FAM_NO
    `;

    const data = {
      FAM_NO: famno,
      FAM_ACC_REC_BY: acc_record,
      FAM_ACC_MGR_BY: acc_manager,
      FAM_SERVICE_CLOSE_BY: service_close_by,
    };
    // // // console.log(query);
    // // // console.log(data);

    // Execute the query
    const result = await connect.execute(query, data, { autoCommit: true });

    if (result) {
      // // // console.log("Rows updated:", result.rowsAffected);
      res.json(result);
    } else {
      console.error("Error: Unexpected result from the database");
      res.status(500).send("Internal Server Error");
    }

    connect.release();
  } catch (error) {
    console.error("Error in querying data:", error.message);
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }
};

// HEADER
module.exports.header = async function (req, res) {
  try {
    const FAM_NO = req.query.famno;
    const connect = await oracledb.getConnection(AVO);
    const query = `
    SELECT * FROM FAM_REQ_HEADER 
    WHERE FRH_FAM_NO = '${FAM_NO}'
         `;
    const result = await connect.execute(query);
    connect.release();
    // // // console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
  }
};
//update submit
module.exports.update_submit = async function (req, res) {
  try {
    // // console.log("g-hkkkkkkkkkkkkk");
    const { famno, sts_submit } = req.body;
    // // console.log(famno, sts_submit);

    const connect = await oracledb.getConnection(AVO);
    const query = `
      UPDATE FAM_REQ_HEADER T
      SET
        T.FAM_REQ_STATUS = :FAM_REQ_STATUS
      WHERE T.FRH_FAM_NO = :FAM_NO
    `;

    const data = {
      FAM_NO: famno,
      FAM_REQ_STATUS: sts_submit,
    };

    const result = await connect.execute(query, data, { autoCommit: true });

    if (result) {
      res.json(result);
    } else {
      //  console.error("Error: Unexpected result from the database");
      res.status(500).send("Internal Server Error");
    }

    connect.release();
  } catch (error) {
    console.error("Error in querying data:", error.message);
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }
};
//upload
let fam_file_server = "";
module.exports.insertFile_from_request = async function (req, res) {
  try {
    const fam_no = req.query.FAM_no;
    const fam_from = req.query.FAM_from;
    const fam_file_seq = req.query.FAM_file_seq;
    const fam_file_name = req.query.FAM_file_name;
    fam_file_server = req.query.FAM_file_server;
    const fam_create = req.query.FAM_create;
    const connect = await oracledb.getConnection(AVO);
    const query = `
    
MERGE INTO FAM_FILE_ATTACH T
USING (SELECT :fam_no AS FFA_FAM_NO, 
              :fam_from AS FFA_ATT_FROM, 
              :fam_file_seq AS FFA_FILE_SEQ, 
              :fam_file_name AS FFA_FILE_NAME, 
              :fam_file_server AS FFA_FILE_SERVER, 
              :fam_create AS FFA_CREATE_BY, 
              SYSDATE AS FFA_CREATE_DATE, 
              :fam_create AS FFA_UPDATE_BY, 
              SYSDATE AS FFA_UPDATE_DATE 
       FROM DUAL) S
ON (T.FFA_FAM_NO = S.FFA_FAM_NO AND T.FFA_ATT_FROM = S.FFA_ATT_FROM  AND T.FFA_FILE_SEQ = S.FFA_FILE_SEQ)
WHEN MATCHED THEN
  UPDATE SET 
             T.FFA_FILE_NAME = S.FFA_FILE_NAME,
             T.FFA_FILE_SERVER = S.FFA_FILE_SERVER,
             T.FFA_UPDATE_BY = S.FFA_UPDATE_BY,
             T.FFA_UPDATE_DATE = S.FFA_UPDATE_DATE
WHEN NOT MATCHED THEN
  INSERT (FFA_FAM_NO, FFA_ATT_FROM, FFA_FILE_SEQ, FFA_FILE_NAME, FFA_FILE_SERVER, FFA_CREATE_BY, FFA_CREATE_DATE, FFA_UPDATE_BY, FFA_UPDATE_DATE)
  VALUES (S.FFA_FAM_NO, S.FFA_ATT_FROM, S.FFA_FILE_SEQ, S.FFA_FILE_NAME, S.FFA_FILE_SERVER, S.FFA_CREATE_BY, S.FFA_CREATE_DATE, S.FFA_UPDATE_BY, S.FFA_UPDATE_DATE)




         `;
    const data = {
      fam_no,
      fam_from,
      fam_file_seq,
      fam_file_name,
      fam_file_server,
      fam_create,
    };
    const result = await connect.execute(query, data, { autoCommit: true });
    // // // console.log(query);
    connect.release();
    // // // // console.log(result.rows);
    res.status(200).send("YESSSSSSSSSSSSSSSSSSSs");
  } catch (error) {
    console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
    res.status(500).send("no");
  }
};

// get run seq request
module.exports.get_run_seq_request = async function (req, res) {
  try {
    const fam_no = req.query.FAM_no;

    // // // console.log(fam_no);

    const connect = await oracledb.getConnection(AVO);
    const query = `
    SELECT MAX(T.FFA_FILE_SEQ) AS RUN_SEQ_MAX 
    FROM FAM_FILE_ATTACH T
    WHERE T.FFA_FAM_NO = :fam_no
    ORDER BY T.FFA_FILE_SEQ ASC

         `;
    const data = {
      fam_no,
    };
    const result = await connect.execute(query, data, { autoCommit: true });
    // // // console.log(query);
    connect.release();
    // // // console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
  }
};
//UPLOAD
module.exports.insertFile_from_request_to_project_me = async function (
  req,
  res
) {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsPath);
    },
    filename: function (req, file, cb) {
      cb(null, fam_file_server); // Use the original filename
    },
  });

  const upload = multer({ storage: storage });
  try {
    // Handle the file upload logic here
    await upload.array("files")(req, res, (err) => {
      if (err) {
        console.error("Error uploading files:", err);
        res.status(500).send("Error uploading files");
      } else {
        // // console.log("Files uploaded:", req.files);
        res.send("Files uploaded successfully");
      }
    });
  } catch (error) {
    console.error("Error handling file upload:", error);
    res.status(500).send("Error handling file upload");
  }
};
// Show
module.exports.getEdit_Request_Show = async function (req, res) {
  try {
    const fam_no = req.query.FamNo;
    // // // console.log(fam_no, "fam_no");
    const connect = await oracledb.getConnection(AVO);
    const query = `
    
    SELECT T.FRH_FAM_NO ,
    TO_CHAR(T.FAM_REQ_DATE, 'DD/MM/YYYY') AS FAM_REQ_DATE,
    T.FAM_REQ_BY ,
    T.FAM_REQ_TEL ,
    M.FACTORY_NAME ,
    T.FAM_REQ_CC ,
    T.FAM_REQ_DEPT ,
    T.FAM_REQ_TYPE ,
    T.FAM_ASSET_GROUP, 
    T.FAM_ASSET_CC, 
    T.FAM_REQ_STATUS,
    F.FFM_DESC, 
    T.FAM_REQ_REMARK,
    T.FAM_ASSET_CC_NAME,
    T.FAM_FACTORY,
    R.USER_EMP_ID ||' : ' || R.USER_FNAME||' ' || R.USER_SURNAME AS REQ_BY,
    F.FFM_FLG
    
FROM FAM_REQ_HEADER T 
LEFT JOIN FAM_FLOW_MASTER F ON F.FFM_CODE = T.FAM_REQ_STATUS 
LEFT JOIN CUSR.CU_FACTORY_M M ON  M.FACTORY_CODE  =  T.FAM_FACTORY 
LEFT JOIN CUSR.CU_USER_M R ON R.USER_LOGIN = T.FAM_REQ_BY 


WHERE T.FRH_FAM_NO = :fam_no
          `;
    const data = {
      fam_no,
    };

    const result = await connect.execute(query, data, { autoCommit: true });
    connect.release();

    const flatArray = result.rows.map((item) => Object.values(item)).flat();
    res.json(flatArray);
    // // console.log(result);
  } catch (error) {
    // console.error("Error in querying data:", error.message);
    res.status(500).send("Internal Server Error");
  }
};
//show FixAsset
module.exports.getEdit_FixAsset = async function (req, res) {
  try {
    const fam_no = req.query.FamNo;
    // // // console.log(fam_no, "fam_no");
    const connect = await oracledb.getConnection(AVO);
    const query = `
    SELECT 
    FRD_ASSET_CODE AS FRD_ASSET_CODE,
    FRD_COMP AS FRD_COMP, 
    FRD_OWNER_CC AS FRD_OWNER_CC,
    FRD_ASSET_NAME AS FRD_ASSET_NAME, 
    FRD_CREATE_BY AS FRD_CREATE_BY,
    FRD_BOI_PROJ AS FRD_BOI_PROJ,
    FRD_QTY AS FRD_QTY,
    FRD_INV_NO AS FRD_INV_NO,
    FRD_CREATE_BY AS FRD_CREATE_BY,
    FRD_ACQ_COST AS FRD_ACQ_COST,
    FRD_BOOK_VALUE AS FRD_BOOK_VALUE
    FROM FAM_REQ_DETAIL  WHERE FRD_FAM_NO = '${fam_no}'
    `;

    const result = await connect.execute(query);
    connect.release();
    // // // console.log(result);
    res.json(result.rows);
  } catch (error) {
    console.error("Error in querying data:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.getEdit_FileUpload = async function (req, res) {
  try {
    const fam_no = req.query.FamNo;
    // // // console.log(fam_no, "fam_no");
    const connect = await oracledb.getConnection(AVO);
    const query = `
    SELECT FFA_FILE_NAME 
    FROM FAM_FILE_ATTACH
     WHERE FFA_FAM_NO = '${fam_no}'
    `;

    const result = await connect.execute(query);
    connect.release();
    // // // console.log(result);
    res.json(result.rows);
  } catch (error) {
    console.error("Error in querying data:", error.message);
    res.status(500).send("Internal Server Error");
  }
};


//Edit Trans
module.exports.getEdit_Trans = async function (req, res) {
  try {
    const fam_no = req.query.FamNo;
    // // // console.log(fam_no, "fam_no");
    const connect = await oracledb.getConnection(AVO);
    const query = `
    SELECT
    F.FRT_TO_FACTORY ,
    F.FRT_TO_CC ,
    F.FRT_TO_PROJ ,
    F.FRT_RECEIVE_BY AS NEW_OWNER ,
    F.FRT_RECEIVER_TEL,
    TO_CHAR(F.FRT_PLAN_MOVE_DATE, 'YYYY-MM-DD') AS FRT_PLAN_MOVE_DATE,
    F.FRT_ABNORMAL_REASON,
    F.FRT_RECEIVE_BY AS RECEIVER,
    F.FRT_FAM_NO,
    M.USER_EMP_ID ||' : ' ||F.FRT_RECEIVE_BY  AS NEW_OWNER,
    F.FRT_RECEIVER_JUD,
    TO_CHAR(F.FRT_RECEIVE_DATE, 'DD/MM/YYYY') AS FRT_RECEIVE_DATE,
    F.FRT_RECEIVE_CMMT,
    A.FACTORY_NAME
    

  FROM
    FAM_REQ_TRANSFER F 
    LEFT JOIN  CUSR.CU_USER_M M ON 
    M.USER_LOGIN =  F.FRT_RECEIVE_BY
    LEFT JOIN CUSR.CU_FACTORY_M A ON
    A.FACTORY_CODE = F.FRT_TO_FACTORY 
    WHERE F.FRT_FAM_NO = '${fam_no}'
    `;

    const result = await connect.execute(query);
    connect.release();
    // // // console.log(result);
    res.json(result.rows);
  } catch (error) {
    console.error("Error in querying data:", error.message);
    res.status(500).send("Internal Server Error");
  }
};
//Edit Trans
module.exports.getEdit_routing = async function (req, res) {
  try {
    const fam_no = req.query.FamNo;
    // // // console.log(fam_no, "fam_no");
    const connect = await oracledb.getConnection(AVO);
    const query = `
    SELECT
	FAM_MGR_DEPT,
	TO_CHAR(FAM_MGR_DATE, 'DD/MM/YYYY') AS FAM_MGR_DATE,
	FAM_MGR_JUD,
	FAM_MGR_CMMT,
	FAM_SERVICE_DEPT,
	FAM_SERVICE_BY,
	TO_CHAR(FAM_SERVICE_DATE, 'DD/MM/YYYY') AS FAM_SERVICE_DATE,
	FAM_SERVICE_TEL,
	FAM_BOI_CHK_BY,
	TO_CHAR(FAM_BOI_CHK_DATE, 'DD/MM/YYYY') AS FAM_BOI_CHK_DATE,
	FAM_BOI_CHK_JUD,
	FAM_BOI_CHK_CMMT,
	FAM_BOI_MGR_BY,
	TO_CHAR(FAM_BOI_MGR_DATE, 'DD/MM/YYYY') AS FAM_BOI_MGR_DATE,
	FAM_BOI_MGR_JUD,
	FAM_BOI_MGR_CMMT,
	FAM_FM_BY,
	TO_CHAR(FAM_FM_DATE, 'DD/MM/YYYY') AS FAM_FM_DATE,
	FAM_FM_JUD,
	FAM_FM_CMMT,
	FAM_ACC_CHK_BY,
	TO_CHAR(FAM_ACC_CHK_DATE, 'DD/MM/YYYY') AS FAM_ACC_CHK_DATE,
	FAM_ACC_CHK_JUD,
	FAM_ACC_CHK_CMMT,
	FAM_ACC_REC_BY,
	TO_CHAR(FAM_ACC_REC_DATE, 'DD/MM/YYYY') AS FAM_ACC_REC_DATE,
	FAM_ACC_REC_JUD,
	FAM_ACC_REC_CMMT,
	FAM_ACC_MGR_BY,
	TO_CHAR(FAM_ACC_MGR_DATE, 'DD/MM/YYYY') AS FAM_ACC_MGR_DATE,
	FAM_ACC_MGR_JUD,
	FAM_ACC_MGR_CMMT,
	FAM_OWNER_SEND_BY,
	TO_CHAR(FAM_OWNER_SEND_DATE, 'DD/MM/YYYY') AS FAM_OWNER_SEND_DATE,
	FAM_OWNER_SEND_JUD,
	FAM_OWNER_SEND_CMMT,
	FAM_SERVICE_CLOSE_BY,
	TO_CHAR(FAM_SERVICE_CLOSE_DATE, 'DD/MM/YYYY') AS FAM_SERVICE_CLOSE_DATE,
	FAM_SERVICE_CLOSE_CMMT,
	FAM_CREATE_BY,
	FAM_UPDATE_BY,
	FAM_SERVICE_JUD,
	FAM_SERVICE_CMMT,
	FAM_SERVICE_CLOSE_JUD
FROM
	AVO.FAM_REQ_HEADER WHERE FRH_FAM_NO = '${fam_no}'
    `;

    const result = await connect.execute(query);
    connect.release();
    // // // console.log(result);
    res.json(result.rows);
  } catch (error) {
    console.error("Error in querying data:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

// Update For Req_All
module.exports.Update_For_Req_All = async function (req, res) {
  try {
    // // console.log("LLLLLLLLLLLLLLLLLL");

    const {
      famno,
      dept,
      tel,
      remark,
      mrg_dept,
      serviceby,
      servicetel,
      boisff,
      boimrg,
      fmby,
      accchk,
      accmrg,
      updateby,
      record_by
    } = req.body;

 

    const connect = await oracledb.getConnection(AVO);
    const query = `
      UPDATE
        FAM_REQ_HEADER R
      SET
        R.FAM_REQ_DEPT = :FAM_REQ_DEPT,
        R.FAM_REQ_TEL = :FAM_REQ_TEL,
        R.FAM_REQ_REMARK = :FAM_REQ_REMARK,
        R.FAM_REQ_SUBMIT_DATE = SYSDATE,
        R.FAM_MGR_DEPT = :FAM_MGR_DEPT,
        R.FAM_SERVICE_BY = :FAM_SERVICE_BY,
        R.FAM_SERVICE_TEL = :FAM_SERVICE_TEL,
        R.FAM_BOI_CHK_BY = :FAM_BOI_CHK_BY,
        R.FAM_BOI_MGR_BY = :FAM_BOI_MGR_BY,
        R.FAM_FM_BY = :FAM_FM_BY,
        R.FAM_ACC_CHK_BY = :FAM_ACC_CHK_BY,
        R.FAM_ACC_MGR_BY = :FAM_ACC_MGR_BY,
        R.FAM_UPDATE_DATE = SYSDATE,
        R.FAM_UPDATE_BY = :FAM_UPDATE_BY,
        R.FAM_ACC_REC_BY = :FAM_ACC_REC_BY
      WHERE
        FRH_FAM_NO = :FAM_NO
    `;

    const data = {
      FAM_NO: famno,
      FAM_REQ_DEPT: dept,
      FAM_REQ_TEL: tel,
      FAM_REQ_REMARK: remark,
      FAM_MGR_DEPT: mrg_dept,
      FAM_SERVICE_BY: serviceby,
      FAM_SERVICE_TEL: servicetel,
      FAM_BOI_CHK_BY: boisff,
      FAM_BOI_MGR_BY: boimrg,
      FAM_FM_BY: fmby,
      FAM_ACC_CHK_BY: accchk,
      FAM_ACC_MGR_BY: accmrg,
      FAM_UPDATE_BY: updateby,
      FAM_ACC_REC_BY:record_by
    };

    const result = await connect.execute(query, data, { autoCommit: true });

    if (result) {
      res.json(result);
    } else {
      //  console.error("Error: Unexpected result from the database");
      res.status(500).send("Internal Server Error");
    }

    connect.release();
  } catch (error) {
    console.error("Error in querying data:", error.message);
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }
};
//Update For Transfer
module.exports.Update_For_Trans_All = async function (req, res) {
  try {
    // // console.log("MMMMMMM");

    const {
      famno,
      date_plan,
      fac_trans,
      cc_trans,
      to_proj,
      rec_by,
      tel,
      sts_for,
      abnormal_for,
      create_by
    } = req.body;

 
    const connect = await oracledb.getConnection(AVO);
    const query = `
    UPDATE
    FAM_REQ_TRANSFER
  SET
    FRT_PLAN_MOVE_DATE = TO_DATE(:FRT_PLAN_MOVE_DATE, 'YYYY-MM-DD'),
    FRT_TO_FACTORY = :FRT_TO_FACTORY,
    FRT_TO_CC = :FRT_TO_CC,
    FRT_TO_PROJ = :FRT_TO_PROJ,
    FRT_RECEIVE_BY = :FRT_RECEIVE_BY,
    FRT_RECEIVER_TEL = :FRT_RECEIVER_TEL,
    FRT_ABNORMAL_STS = :FRT_ABNORMAL_STS,
    FRT_ABNORMAL_REASON = :FRT_ABNORMAL_REASON,
    FRT_CREATE_DATE = SYSDATE,
    FRT_CREATE_BY = :FRT_CREATE_BY
  WHERE
    FRT_FAM_NO = :FRT_FAM_NO
    `;

    const data = {
      FRT_FAM_NO: famno,
      FRT_PLAN_MOVE_DATE: date_plan,
      FRT_TO_FACTORY: fac_trans,
      FRT_TO_CC: cc_trans,
      FRT_TO_PROJ: to_proj,
      FRT_RECEIVE_BY: rec_by,
      FRT_RECEIVER_TEL: tel,
      FRT_ABNORMAL_STS: sts_for,
      FRT_ABNORMAL_REASON: abnormal_for,
      FRT_CREATE_BY: create_by,
     
    };

    const result = await connect.execute(query, data, { autoCommit: true });

    if (result) {
      res.json(result);
    } else {
      //  console.error("Error: Unexpected result from the database");
      res.status(500).send("Internal Server Error");
    }

    connect.release();
  } catch (error) {
    console.error("Error in querying data:", error.message);
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }
};



module.exports.getFixcode = async function (req, res) {
  try {
    const fam_no = req.query.Fam;
    // // console.log(fam_no, "fam_no");
    const connect = await oracledb.getConnection(AVO);
    const query = `
    SELECT 
    FRD_ASSET_CODE AS FRD_ASSET_CODE,
    FRD_COMP AS FRD_COMP, 
    FRD_OWNER_CC AS FRD_OWNER_CC,
    FRD_ASSET_NAME AS FRD_ASSET_NAME, 
    FRD_CREATE_BY AS FRD_CREATE_BY,
    FRD_BOI_PROJ AS FRD_BOI_PROJ,
    FRD_QTY AS FRD_QTY,
    FRD_INV_NO AS FRD_INV_NO,
    FRD_CREATE_BY AS FRD_CREATE_BY,
    FRD_ACQ_COST AS FRD_ACQ_COST,
    FRD_BOOK_VALUE AS FRD_BOOK_VALUE 
    FROM FAM_REQ_DETAIL  WHERE FRD_FAM_NO = '${fam_no}'`;
    const result = await connect.execute(query);
    connect.release();
    // // // console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
  }
};
// DELETE ALL
module.exports.delect_all_fam_header = async function (req, res) {
  try {
    // // console.log("????????");
    const FRH_FAM_NO = req.query.famno;
    // // console.log("FRH_FAM_NO", FRH_FAM_NO);
    const connect = await oracledb.getConnection(AVO);
    const query = `
    DELETE FROM FAM_REQ_HEADER 
     WHERE FRH_FAM_NO = :fam
     
    `;
    const data = {
      fam: FRH_FAM_NO,
    };
    const result = await connect.execute(query, data, { autoCommit: true });
    connect.release();
    res.json(result);
  } catch (error) {
    console.error("Error in querying data:", error.message);
    res.status(500).send("Internal Server Error");
  }
};
module.exports.delect_all_fam_details = async function (req, res) {
  try {
    // // console.log("{}{}{}{}{}}}");
    const FRD_FAM_NO = req.query.famno;
    // // console.log("FRD_FAM_NO", FRD_FAM_NO);
    const connect = await oracledb.getConnection(AVO);
    const query = `
    DELETE FROM FAM_REQ_DETAIL 
     WHERE FRD_FAM_NO = :fam
     
    `;
    const data = {
      fam: FRD_FAM_NO,
    };
    const result = await connect.execute(query, data, { autoCommit: true });
    connect.release();
    res.json(result);
  } catch (error) {
    console.error("Error in querying data:", error.message);
    res.status(500).send("Internal Server Error");
  }
};
module.exports.delect_all_fam_transfer = async function (req, res) {
  try {
    // // console.log("JJJJJJJ");
    const FRT_FAM_NO = req.query.famno;
    // // console.log(FRT_FAM_NO, "FRT_FAM_NO");
    const connect = await oracledb.getConnection(AVO);
    const query = `
    DELETE FROM FAM_REQ_TRANSFER 
     WHERE FRT_FAM_NO = :fam
     
    `;
    const data = {
      fam: FRT_FAM_NO,
    };
    const result = await connect.execute(query, data, { autoCommit: true });
    connect.release();
    res.json(result);
  } catch (error) {
    console.error("Error in querying data:", error.message);
    res.status(500).send("Internal Server Error");
  }
};
module.exports.delete_all_file = async function (req, res) {
  try {
    const FFA_FAM_NO = req.query.famno;
    const connect = await oracledb.getConnection(AVO);
    const query = `
    DELETE FROM FAM_FILE_ATTACH 
     WHERE FFA_FAM_NO = :fam
    `;
    const data = {
      fam: FFA_FAM_NO,
    };
    const result = await connect.execute(query, data, { autoCommit: true });
    connect.release();
    res.json(result);
  } catch (error) {
    console.error("Error in querying data:", error.message);
    res.status(500).send("Internal Server Error");
  }
};
module.exports.deletefile = async function (req, res) {
  try {
    const FFA_FAM_NO = req.query.famno;
   const FFA_FILE_NAME = req.query.name_for_file;
    const connect = await oracledb.getConnection(AVO);
    const query = `
    DELETE FROM FAM_FILE_ATTACH 
     WHERE FFA_FAM_NO = :fam
     AND FFA_FILE_NAME =:name_file
     
    `;
    const data = {
      fam: FFA_FAM_NO,
      name_file :FFA_FILE_NAME
    };
    const result = await connect.execute(query, data, { autoCommit: true });
    connect.release();
    res.json(result);
  } catch (error) {
    console.error("Error in querying data:", error.message);
    res.status(500).send("Internal Server Error");
  }
};
// Update Manager Department
module.exports.update_manager_dept = async function (req, res) {
  try {
    // // console.log("UPDATE for Manager");
    const Fam_no = req.query.famno;
    const FAM_MGR_JUD = req.query.mgrjud;
    const FAM_MGR_CMMT = req.query.mgrcmmt;
    const FAM_REQ_STATUS = req.query.sts;
    const connect = await oracledb.getConnection(AVO);
    const query = `
    UPDATE FAM_REQ_HEADER
    SET 
        FAM_MGR_DATE = SYSDATE ,
        FAM_MGR_JUD = :FAM_MGR_JUD,
        FAM_MGR_CMMT = :FAM_MGR_CMMT,
        FAM_REQ_STATUS = :FAM_REQ_STATUS
    WHERE FRH_FAM_NO = :Fam_no
  `;

    const data = {
      Fam_no,
      FAM_MGR_JUD,
      FAM_MGR_CMMT,
      FAM_REQ_STATUS,
    };
    const result = await connect.execute(query, data, { autoCommit: true });
    connect.release();
    res.json(result);
  } catch (error) {
    console.error("Error in querying data:", error.message);
    res.status(500).send("Internal Server Error");
  }
};
// Update Service_by
module.exports.update_service_by = async function (req, res) {
  try {
    const Fam_no = req.query.famno;
    const FAM_SERVICE_JUD = req.query.serjud;
    const FAM_SERVICE_CMMT = req.query.sercmmt;
    const FAM_REQ_STATUS = req.query.sts;
    const connect = await oracledb.getConnection(AVO);
    const query = `
    UPDATE FAM_REQ_HEADER
SET 
    FAM_SERVICE_DATE  = SYSDATE ,
    FAM_SERVICE_JUD  = :FAM_SERVICE_JUD,
    FAM_SERVICE_CMMT  = :FAM_SERVICE_CMMT,
    FAM_REQ_STATUS = :FAM_REQ_STATUS
WHERE FRH_FAM_NO = :Fam_no
  `;

    const data = {
      Fam_no,
      FAM_SERVICE_JUD,
      FAM_SERVICE_CMMT,
      FAM_REQ_STATUS,
    };
    const result = await connect.execute(query, data, { autoCommit: true });
    connect.release();
    res.json(result);
  } catch (error) {
    console.error("Error in querying data:", error.message);
    res.status(500).send("Internal Server Error");
  }
};
// Update BOI staff
module.exports.update_boi_staff = async function (req, res) {
  try {
    const Fam_no = req.query.famno;
    const FAM_BOI_CHK_JUD = req.query.stff_jud;
    const FAM_BOI_CHK_CMMT = req.query.stff_cmmt;
    const FAM_REQ_STATUS = req.query.sts;
   
    const connect = await oracledb.getConnection(AVO);
    const query = `
    UPDATE FAM_REQ_HEADER
    SET 
        FAM_BOI_CHK_DATE = SYSDATE,
        FAM_BOI_CHK_JUD = :FAM_BOI_CHK_JUD,
        FAM_BOI_CHK_CMMT = :FAM_BOI_CHK_CMMT,
        FAM_REQ_STATUS = :FAM_REQ_STATUS
    WHERE FRH_FAM_NO = :Fam_no
    
  `;

    const data = {
      Fam_no,
      FAM_BOI_CHK_JUD,
      FAM_BOI_CHK_CMMT,
      FAM_REQ_STATUS,
    };
    const result = await connect.execute(query, data, { autoCommit: true });
    connect.release();
    res.json(result);
  } catch (error) {
    console.error("Error in querying data:", error.message);
    res.status(500).send("Internal Server Error");
  }
};
//uUpdate BOI manager
module.exports.update_boi_mana = async function (req, res) {
  try {
    
    const Fam_no = req.query.famno;
    const FAM_BOI_MGR_JUD = req.query.boimana_jud;
    const FAM_BOI_MGR_CMMT = req.query.boimana_cmmt;
    const FAM_REQ_STATUS = req.query.sts;

    const connect = await oracledb.getConnection(AVO);
    const query = `
    UPDATE
    FAM_REQ_HEADER
  SET
    FAM_BOI_MGR_DATE = SYSDATE,
    FAM_BOI_MGR_JUD = :FAM_BOI_MGR_JUD,
    FAM_BOI_MGR_CMMT = :FAM_BOI_MGR_CMMT,
    FAM_REQ_STATUS = :FAM_REQ_STATUS
  WHERE
    FRH_FAM_NO = :Fam_no
  `;

    const data = {
      Fam_no,
      FAM_BOI_MGR_JUD,
      FAM_BOI_MGR_CMMT,
      FAM_REQ_STATUS,
    };
    const result = await connect.execute(query, data, { autoCommit: true });
    connect.release();
    res.json(result);
  } catch (error) {
    console.error("Error in querying data:", error.message);
    res.status(500).send("Internal Server Error");
  }
};
//update fac_manager
module.exports.update_facmanager = async function (req, res) {
  try {
    const Fam_no = req.query.famno;
    const FAM_FM_JUD = req.query.fm_jud;
    const FAM_FM_CMMT = req.query.fm_cmmt;
    const FAM_REQ_STATUS = req.query.sts;
    const connect = await oracledb.getConnection(AVO);
    const query = `
    UPDATE
    FAM_REQ_HEADER
  SET
    FAM_FM_DATE  = SYSDATE,
    FAM_FM_JUD  = :FAM_FM_JUD,
    FAM_FM_CMMT  = :FAM_FM_CMMT,
    FAM_REQ_STATUS = :FAM_REQ_STATUS
  WHERE
    FRH_FAM_NO = :Fam_no
  
  `;

    const data = {
      Fam_no,
      FAM_FM_JUD,
      FAM_FM_CMMT,
      FAM_REQ_STATUS,
    };
    const result = await connect.execute(query, data, { autoCommit: true });
    connect.release();
    res.json(result);
  } catch (error) {
    console.error("Error in querying data:", error.message);
    res.status(500).send("Internal Server Error");
  }
};
//update acc check
module.exports.update_acccheck = async function (req, res) {
  try {
   // // console.log("MAAAAAAA")
    const Fam_no = req.query.famno;
    const FAM_ACC_CHK_JUD = req.query.chk_jud;
    const FAM_ACC_CHK_CMMT = req.query.chk_cmmt;
    const FAM_REQ_STATUS = req.query.sts;
    // // console.log(Fam_no,FAM_ACC_CHK_JUD,FAM_ACC_CHK_CMMT,FAM_REQ_STATUS)
    const connect = await oracledb.getConnection(AVO);
    const query = `
    UPDATE
    FAM_REQ_HEADER
  SET
    FAM_ACC_CHK_DATE = SYSDATE,
    FAM_ACC_CHK_JUD = :FAM_ACC_CHK_JUD,
    FAM_ACC_CHK_CMMT = :FAM_ACC_CHK_CMMT,
    FAM_REQ_STATUS = :FAM_REQ_STATUS
  WHERE
    FRH_FAM_NO = :Fam_no
  
  `;

    const data = {
      Fam_no,
      FAM_ACC_CHK_JUD,
      FAM_ACC_CHK_CMMT,
      FAM_REQ_STATUS,
    };
    const result = await connect.execute(query, data, { autoCommit: true });
    connect.release();
    res.json(result);
  } catch (error) {
    console.error("Error in querying data:", error.message);
    res.status(500).send("Internal Server Error");
  }
};
//update owner 
module.exports.update_owner = async function (req, res) {
  try {
    const Fam_no = req.query.famno;
    const FAM_OWNER_SEND_JUD  = req.query.owner_jud;
    const FAM_OWNER_SEND_CMMT  = req.query.owner_cmmt;
    const FAM_REQ_STATUS = req.query.sts;
    const connect = await oracledb.getConnection(AVO);
    const query = `
    UPDATE
    FAM_REQ_HEADER
  SET
    FAM_OWNER_SEND_DATE    = SYSDATE,
    FAM_OWNER_SEND_JUD    = :FAM_OWNER_SEND_JUD,
    FAM_OWNER_SEND_CMMT    = :FAM_OWNER_SEND_CMMT,
    FAM_REQ_STATUS = :FAM_REQ_STATUS
  WHERE
    FRH_FAM_NO = :Fam_no
  
  `;

    const data = {
      Fam_no,
      FAM_OWNER_SEND_JUD ,
      FAM_OWNER_SEND_CMMT ,
      FAM_REQ_STATUS,
    };
    const result = await connect.execute(query, data, { autoCommit: true });
    connect.release();
    res.json(result);
  } catch (error) {
    console.error("Error in querying data:", error.message);
    res.status(500).send("Internal Server Error");
  }
};
//update Recode
module.exports.update_recode = async function (req, res) {
  try {
    const Fam_no = req.query.famno;
    const FAM_ACC_REC_JUD   = req.query.rec_jud;
    const FAM_ACC_REC_CMMT   = req.query.rec_cmmt;
    const FAM_REQ_STATUS = req.query.sts;
    const connect = await oracledb.getConnection(AVO);
    const query = `
    UPDATE
    FAM_REQ_HEADER
  SET
    FAM_ACC_REC_DATE  = SYSDATE,
    FAM_ACC_REC_JUD  = :FAM_ACC_REC_JUD,
    FAM_ACC_REC_CMMT  = :FAM_ACC_REC_CMMT,
    FAM_REQ_STATUS = :FAM_REQ_STATUS
  WHERE
    FRH_FAM_NO = :Fam_no
  `;

    const data = {
      Fam_no,
      FAM_ACC_REC_JUD ,
      FAM_ACC_REC_CMMT  ,
      FAM_REQ_STATUS,
    };
    const result = await connect.execute(query, data, { autoCommit: true });
    connect.release();
    res.json(result);
  } catch (error) {
    console.error("Error in querying data:", error.message);
    res.status(500).send("Internal Server Error");
  }
};
// update Acc Manager 
module.exports.update_accmanager = async function (req, res) {
  try {
    const Fam_no = req.query.famno;
    const FAM_ACC_MGR_JUD    = req.query.acc_manajud;
    const FAM_ACC_MGR_CMMT    = req.query.acc_manacmmt;
    const FAM_REQ_STATUS = req.query.sts;
    const connect = await oracledb.getConnection(AVO);
    const query = `
    UPDATE
    FAM_REQ_HEADER
  SET
    FAM_ACC_MGR_DATE   = SYSDATE,
    FAM_ACC_MGR_JUD   = :FAM_ACC_MGR_JUD ,
    FAM_ACC_MGR_CMMT   = :FAM_ACC_MGR_CMMT ,
    FAM_REQ_STATUS = :FAM_REQ_STATUS
  WHERE
    FRH_FAM_NO = :Fam_no
  `;

    const data = {
      Fam_no,
      FAM_ACC_MGR_JUD  ,
      FAM_ACC_MGR_CMMT   ,
      FAM_REQ_STATUS,
    };
    const result = await connect.execute(query, data, { autoCommit: true });
    connect.release();
    res.json(result);
  } catch (error) {
    console.error("Error in querying data:", error.message);
    res.status(500).send("Internal Server Error");
  }
};
//update service close by
module.exports.update_service_close = async function (req, res) {
  try {
    // // console.log()
    const Fam_no = req.query.famno;
    const FAM_SERVICE_CLOSE_JUD  = req.query.cls_jud;
    const FAM_SERVICE_CLOSE_CMMT = req.query.cls_cmmt;
    const FAM_REQ_STATUS = req.query.sts;
    const connect = await oracledb.getConnection(AVO);
    const query = `
    UPDATE
    FAM_REQ_HEADER
  SET
  FAM_SERVICE_CLOSE_DATE    = SYSDATE,
  FAM_SERVICE_CLOSE_JUD    = :FAM_SERVICE_CLOSE_JUD  ,
  FAM_SERVICE_CLOSE_CMMT    = :FAM_SERVICE_CLOSE_CMMT  ,
    FAM_REQ_STATUS = :FAM_REQ_STATUS
  WHERE
    FRH_FAM_NO = :Fam_no
  `;

    const data = {
      Fam_no,
      FAM_SERVICE_CLOSE_JUD,
      FAM_SERVICE_CLOSE_CMMT,
      FAM_REQ_STATUS,
    };
    const result = await connect.execute(query, data, { autoCommit: true });
    connect.release();
    res.json(result);
  } catch (error) {
    console.error("Error in querying data:", error.message);
    res.status(500).send("Internal Server Error");
  }
};
// update receiver 
module.exports.update_receiver = async function (req, res) {
  try {

    const Fam_no = req.query.famno;
    const FRT_RECEIVER_JUD  = req.query.receiver_jud;
    const FRT_RECEIVE_CMMT = req.query.receiver_cmmt;

    const connect = await oracledb.getConnection(AVO);
    const query = `
    UPDATE
	FAM_REQ_TRANSFER 
  SET
	FRT_RECEIVE_DATE  = SYSDATE,
	FRT_RECEIVER_JUD  = :FRT_RECEIVER_JUD,
	FRT_RECEIVE_CMMT  = :FRT_RECEIVE_CMMT
WHERE
	FRT_FAM_NO  = :Fam_no

  `;

    const data = {
      Fam_no,
      FRT_RECEIVER_JUD,
      FRT_RECEIVE_CMMT,
    };
    const result = await connect.execute(query, data, { autoCommit: true });
    connect.release();
    res.json(result);
  } catch (error) {
    console.error("Error in querying data:", error.message);
    res.status(500).send("Internal Server Error");
  }
};
// update for Reject Reture To New Status 
module.exports.update_for_nullRouting_All = async function (req, res) {
  try {
// // console.log("HHHHHHHHHHHHHHH")
    const Fam_no = req.query.famno;
    const FAM_UPDATE_BY = req.query.user;
    // // console.log(Fam_no,FAM_UPDATE_BY)
   
    

    const connect = await oracledb.getConnection(AVO);
    const query = `
    UPDATE
    FAM_REQ_HEADER A
  SET
  A.FAM_MGR_DATE = NULL,
  A.FAM_MGR_JUD = NULL ,
  A.FAM_MGR_CMMT = NULL ,
  A.FAM_SERVICE_DATE = NULL ,
  A.FAM_BOI_CHK_DATE = NULL ,
  A.FAM_BOI_CHK_JUD = NULL ,
  A.FAM_BOI_CHK_CMMT = NULL ,
  A.FAM_BOI_MGR_DATE = NULL ,
  A.FAM_BOI_MGR_JUD = NULL ,
  A.FAM_BOI_MGR_CMMT = NULL ,
  A.FAM_FM_DATE = NULL ,
  A.FAM_FM_JUD = NULL ,
  A.FAM_FM_CMMT = NULL ,
  A.FAM_ACC_CHK_DATE = NULL ,
  A.FAM_ACC_CHK_JUD = NULL ,
  A.FAM_ACC_CHK_CMMT = NULL ,
  A.FAM_ACC_REC_DATE = NULL ,
  A.FAM_ACC_REC_JUD = NULL ,
  A.FAM_ACC_REC_CMMT = NULL ,
  A.FAM_ACC_MGR_DATE = NULL ,
  A.FAM_ACC_MGR_JUD = NULL ,
  A.FAM_ACC_MGR_CMMT = NULL ,
  A.FAM_OWNER_SEND_DATE = NULL ,
  A.FAM_OWNER_SEND_JUD = NULL ,
  A.FAM_OWNER_SEND_CMMT = NULL ,
  A.FAM_SERVICE_CLOSE_DATE = NULL ,
  A.FAM_SERVICE_CLOSE_CMMT = NULL ,
  A.FAM_UPDATE_BY = :FAM_UPDATE_BY ,
  A.FAM_SERVICE_JUD = NULL ,
  A.FAM_SERVICE_CMMT = NULL ,
  A.FAM_SERVICE_CLOSE_JUD = NULL 
  WHERE
  A.FRH_FAM_NO = :Fam_no 
    
  `;

    const data = {
      Fam_no,
      FAM_UPDATE_BY
    };
    const result = await connect.execute(query, data, { autoCommit: true });
    connect.release();
    res.json(result);
  } catch (error) {
    console.error("Error in querying data:", error.message);
    res.status(500).send("Internal Server Error");
  }
};
//
module.exports.update_All_for_receive = async function (req, res) {
  try {
 
        const Fam_no = req.query.famno;
        const User_by = req.query.user;
       
        const connect = await oracledb.getConnection(AVO);
        const query = `
        UPDATE
        FAM_REQ_TRANSFER A
      SET
      A.FRT_UPDATE_DATE = NULL,
      A.FRT_UPDATE_BY = :User_by,
      A.FRT_RECEIVE_CMMT = NULL,
      A.FRT_RECEIVER_JUD = NULL 
      WHERE
      FRT_FAM_NO = :Fam_no 
        
      `;
    
        const data = {
          Fam_no,
          User_by
        };
        const result = await connect.execute(query, data, { autoCommit: true });
        connect.release();
        res.json(result);
      } catch (error) {
        console.error("Error in querying data:", error.message);
        res.status(500).send("Internal Server Error");
      }
    };

    
// get level
module.exports.level_person_maintain = async function (req, res) {
  try {
    const connect = await oracledb.getConnection(AVO);
    const query = `
    SELECT T.FCM_CODE,t.fcm_desc 
    FROM FAM_CODE_MASTER T 
    WHERE T.FCM_GROUP_ID = 'GP02' 
    AND T.FCM_STATUS = 'A' 
    ORDER BY T.FCM_SORT,T.FCM_DESC
           `;
    const result = await connect.execute(query);
    connect.release();
    res.json(result.rows);
  } catch (error) {
    console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
  }
};

    /// get show data user login Person maintain
module.exports.getData_UserLogin_Person = async function (req, res) {
  try {
    const User_login = req.query.User_Login;
    const connect = await oracledb.getConnection(CUSR);
    const query = `
    SELECT '(' || H.EMPCODE || ') ' || H.ENAME || ' ' || H.ESURNAME AS ENAME,T.USER_EMAIL
    FROM CUSR.CU_USER_HUMANTRIX H, CUSR.CU_USER_M T
    WHERE H.EMPCODE = T.USER_EMP_ID
    AND UPPER(T.USER_LOGIN) = UPPER(:User_login)
    `;
    const data = {
      User_login,
    };

    const result = await connect.execute(query, data, { autoCommit: true });
    connect.release();
    // res.json(result);
    res.json(result.rows);
    // // console.log(result);
  } catch (error) {
    console.error("Error in querying data:", error.message);
    res.status(500).send("Internal Server Error");
  }
};
// insert person maintian
module.exports.insertPerson_Maintain = async function (req, res) {
  try {
    const fam_person_fctory = req.query.FPM_factory;
    const fam_person_level = req.query.FPM_level;
    const fam_person_cost_center = req.query.FPM_cost_center;
    const fam_person_user_login = req.query.FPM_user_login;
    const fam_person_email = req.query.FPM_email;
    const fam_person_status = req.query.FPM_status;
    const fam_person_create_by = req.query.FPM_create_by;
    const fam_person_update_by = req.query.FPM_update_by;

    // // console.log(fam_person_fctory);
    // // console.log(fam_person_level);
    // // console.log(fam_person_cost_center);
    // // console.log(fam_person_user_login);
    // // console.log(fam_person_email);
    // // console.log(fam_person_status);
    // // console.log(fam_person_create_by);
    // // console.log(fam_person_update_by);

    const connect = await oracledb.getConnection(AVO);
    const query = `
    
    INSERT INTO FAM_PERSON_MASTER (FPM_FACTORY, FPM_LEVEL, FPM_CC, FPM_USER_LOGIN, FPM_PERSON_STS, FPM_EMAIL, FPM_CREATE_BY, FPM_CREATE_DATE, FPM_UPDATE_BY, FPM_UPDATE_DATE)
    VALUES (:fam_person_fctory, :fam_person_level, :fam_person_cost_center, :fam_person_user_login, :fam_person_status, :fam_person_email, :fam_person_create_by, SYSDATE, :fam_person_update_by, SYSDATE)

         `;
    const data = {
      fam_person_fctory,
      fam_person_level,
      fam_person_cost_center,
      fam_person_user_login,
      fam_person_status,
      fam_person_email,
      fam_person_create_by,
      fam_person_update_by,
    };
    const result = await connect.execute(query, data, { autoCommit: true });
    // // console.log(query);
    connect.release();
    // // // console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("ข้อผิดพลาดในการบันทึกข้อมูล:", error.message);
  }
};

// update person maintian
module.exports.updatePerson_Maintain = async function (req, res) {
  try {
    const fam_person_fctory = req.query.FPM_factory;
    const fam_person_level = req.query.FPM_level;
    const fam_person_cost_center = req.query.FPM_cost_center;
    const fam_person_user_login = req.query.FPM_user_login;
    const fam_person_email = req.query.FPM_email;
    const fam_person_status = req.query.FPM_status;
    const fam_person_update_by = req.query.FPM_update_by;

    // // console.log(fam_person_fctory);
    // // console.log(fam_person_level);
    // // console.log(fam_person_cost_center);
    // // console.log(fam_person_user_login);
    // // console.log(fam_person_email);
    // // console.log(fam_person_status);
    // // console.log(fam_person_update_by);

    const connect = await oracledb.getConnection(AVO);
    const query = `
    UPDATE
    FAM_PERSON_MASTER
  SET
    FPM_EMAIL = :fam_person_email,
    FPM_PERSON_STS = :fam_person_status,
    FPM_UPDATE_BY = :fam_person_update_by,
    FPM_UPDATE_DATE = SYSDATE
  WHERE
    FPM_FACTORY = :fam_person_fctory
    AND FPM_LEVEL = :fam_person_level
    AND FPM_CC = :fam_person_cost_center
    AND FPM_USER_LOGIN = :fam_person_user_login
         `;
    const data = {
      fam_person_fctory,
      fam_person_level,
      fam_person_cost_center,
      fam_person_user_login,
      fam_person_status,
      fam_person_email,
      fam_person_update_by,
    };
    const result = await connect.execute(query, data, { autoCommit: true });
    // // console.log(query);
    connect.release();
    // // // console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("ข้อผิดพลาดในการบันทึกข้อมูล:", error.message);
  }
};

//Search person maintain
module.exports.search_person_maintain = async function (req, res) {
  try {
    const factory = req.query.FPM_factory;
    const level = req.query.FPM_level;
    const cost_center = req.query.FPM_cost_center;
    const user_login = req.query.FPM_user_login;
    // // console.log("F", factory);
    // // console.log("L", level);
    // // console.log("C", cost_center);
    // // console.log("U", user_login);
    const connect = await oracledb.getConnection(AVO);
    const query = `
    SELECT DISTINCT 
      C.FACTORY_NAME AS FACTORY, 
      T.FPM_FACTORY AS FACTORY_CC,	
           CM.FCM_DESC AS LEVEL_DESC ,
           T.FPM_LEVEL  AS LEVEL_CC,
           CMCC.CC_DESC  AS COST_CENTER,
           T.FPM_CC AS COST_CENTER_CC,
           T.FPM_USER_LOGIN , 
      (SELECT
        '(' || HH.EMPCODE || ') ' || HH.ENAME || ' ' || HH.ESURNAME AS ENAME
        FROM CUSR.CU_USER_HUMANTRIX HH, CUSR.CU_USER_M TE 		
        WHERE HH.EMPCODE = TE.USER_EMP_ID
          AND UPPER(TE.USER_LOGIN) = UPPER(T.FPM_USER_LOGIN)) AS NAME_SURNAME,
      T.FPM_EMAIL, 
      CASE 
        WHEN T.FPM_PERSON_STS = 'A' THEN 'Active'
        WHEN T.FPM_PERSON_STS = 'I' THEN 'In Active'
        ELSE T.FPM_PERSON_STS 
      END AS PERSON_STATUS,
      T.FPM_UPDATE_BY, 
      TO_CHAR(T.FPM_UPDATE_DATE, 'DD/MM/YYYY') AS UPDATE_DATE
    FROM 
      FAM_PERSON_MASTER T
    LEFT JOIN 
      CUSR.CU_FACTORY_M C ON C.FACTORY_CODE = T.FPM_FACTORY 
    LEFT JOIN 
      FAM_CODE_MASTER CM ON CM.FCM_CODE = T.FPM_LEVEL 
    LEFT JOIN 
      CUSR.CU_MFGPRO_CC_MSTR CMCC ON CMCC.CC_CTR = T.FPM_CC 
    WHERE 
      (T.FPM_FACTORY = '${factory}' OR '${factory}' IS NULL)
      AND (T.FPM_LEVEL = '${level}' OR '${level}' IS NULL)
      AND (TRIM(T.FPM_CC) = '${cost_center}' OR '${cost_center}' IS NULL)
      AND (UPPER(T.FPM_USER_LOGIN) = UPPER('${user_login}') OR UPPER('${user_login}') IS NULL)
      ORDER BY  C.FACTORY_NAME,CM.FCM_DESC,CMCC.CC_DESC,T.FPM_USER_LOGIN DESC
    `;

    const result = await connect.execute(query);
    connect.release();
    res.json(result.rows);
    // // console.log(result);
  } catch (error) {
    console.error("Error in querying data:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

// get show data edit person
module.exports.getEdit_Person_Show = async function (req, res) {
  try {
    const factory = req.query.FPM_factory;
    const level = req.query.FPM_level;
    const cost_center = req.query.FPM_cost_center;
    const user_login = req.query.FPM_user_login;
    // // console.log("F", factory);
    // // console.log("L", level);
    // // console.log("C", cost_center);
    // // console.log("U", user_login);
    const connect = await oracledb.getConnection(AVO);
    const query = `
    SELECT DISTINCT   
    T.FPM_FACTORY,
    CU.FACTORY_NAME,
    T.FPM_LEVEL,
    FCM.FCM_DESC ,
    T.FPM_CC ,
    CTM.CC_DESC ,
    T.FPM_USER_LOGIN,
     T.FPM_EMAIL,
    T.FPM_PERSON_STS,
    T.FPM_CREATE_BY,
    TO_CHAR(T.FPM_CREATE_DATE , 'DD/MM/YYYY') AS FPM_CREATE_DATE_E,
    T.FPM_UPDATE_BY,
    TO_CHAR(T.FPM_UPDATE_DATE , 'DD/MM/YYYY') AS FPM_UPDATE_DATE_E
FROM FAM_PERSON_MASTER T 
    LEFT JOIN CUSR.CU_FACTORY_M CU ON CU.FACTORY_CODE = T.FPM_FACTORY 
    LEFT JOIN FAM_CODE_MASTER FCM ON FCM.FCM_CODE = T.FPM_LEVEL 
    LEFT JOIN CUSR.CU_MFGPRO_CC_MSTR CTM ON CTM.CC_CTR =  T.FPM_CC 
WHERE T.FPM_FACTORY = '${factory}'
AND T.FPM_LEVEL = '${level}'
AND T.FPM_CC = '${cost_center}'
AND T.FPM_USER_LOGIN = '${user_login}'
    `;
    const result = await connect.execute(query);
    connect.release();
    const flatArray = result.rows.map((item) => Object.values(item)).flat();
    res.json(flatArray);
    // // console.log("เช็คดูรอบที่ 1",result);
    // // console.log("เช็คดูรอบที่ 2",flatArray);
  } catch (error) {
    console.error("Error in querying data:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

// Delete Person Maintain
module.exports.deletePerson_Maintain = async function (req, res) {
  try {
    const fam_person_fctory_delete = req.query.FPM_factory_delete;
    const fam_person_level_delete = req.query.FPM_level_delete;
    const fam_person_cost_center_delete = req.query.FPM_cost_center_delete;
    const fam_person_user_login_delete = req.query.FPM_user_login_delete;

    // // console.log(fam_person_fctory_delete);
    // // console.log(fam_person_level_delete);
    // // console.log(fam_person_cost_center_delete);
    // // console.log(fam_person_user_login_delete);

    const connect = await oracledb.getConnection(AVO);
    const query = `
    DELETE FROM FAM_PERSON_MASTER T
    WHERE T.FPM_FACTORY = :fam_person_fctory_delete
      AND T.FPM_LEVEL = :fam_person_level_delete 
      AND T.FPM_CC = :fam_person_cost_center_delete
      AND T.FPM_USER_LOGIN = :fam_person_user_login_delete
         `;
    const data = {
      fam_person_fctory_delete,
      fam_person_level_delete,
      fam_person_cost_center_delete,
      fam_person_user_login_delete,
    };
    const result = await connect.execute(query, data, { autoCommit: true });
    // // console.log(query);
    connect.release();
    // // // console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("ข้อผิดพลาดในการบันทึกข้อมูล:", error.message);
  }
};


//BOI Project 
module.exports.get_BOI_project = async function (req, res) {
  try {
    const connect = await oracledb.getConnection(AVO);
    const query = `
    SELECT
        DISTINCT T.FBMC_BOI_PROJ
    FROM
        FAM_BOIPROJ_MAP_CC T
    ORDER BY
        T.FBMC_BOI_PROJ
         `;
    const result = await connect.execute(query);
    connect.release();
    res.json(result.rows);
  } catch (error) {
    console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
  }
};


//Search BOI Project
module.exports.search_BOI_project = async function (req, res) {
  try {
    const factory = req.query.FBMC_factory;
    const cost_center = req.query.FBMC_cost_center;
    const BOI_Project = req.query.FBMC_BOI_project;
    // // console.log("F", factory);
    // // console.log("C", cost_center);
    // // console.log("B", BOI_Project);
    const connect = await oracledb.getConnection(AVO);
    const query = `
      SELECT
    DISTINCT 
                      T.FBMC_FACTORY AS FACTORY_CC,
    C.FACTORY_NAME AS FACTORY ,
    CMCC.CC_DESC AS COST_CENTER,
    T.FBMC_COST_CENTER AS COST_CENTER_CC,
    T.FBMC_BOI_PROJ,
  CASE
      WHEN T.FBMC_STATUS = 'A' THEN 'Active'
      WHEN T.FBMC_STATUS = 'I' THEN 'In Active'
      ELSE T.FBMC_STATUS
  END AS BOI_STATUS,
    T.FBMC_UPDATE_BY,
  TO_CHAR(T.FBMC_UPDATE_DATE, 'DD/MM/YYYY') AS UPDATE_DATE
FROM
    FAM_BOIPROJ_MAP_CC T
LEFT JOIN CUSR.CU_FACTORY_M C ON
    C.FACTORY_CODE = T.FBMC_FACTORY
LEFT JOIN CUSR.CU_MFGPRO_CC_MSTR CMCC ON
    CMCC.CC_CTR = T.FBMC_COST_CENTER
WHERE
    (T.FBMC_FACTORY = '${factory}'
        OR '${factory}' IS NULL)
    AND (TRIM(T.FBMC_COST_CENTER) = '${cost_center}'
        OR '${cost_center}' IS NULL)
    AND (T.FBMC_BOI_PROJ = '${BOI_Project}'
        OR '${BOI_Project}' IS NULL)
ORDER BY
    C.FACTORY_NAME,
    CMCC.CC_DESC,
    T.FBMC_BOI_PROJ DESC
    `;

    const result = await connect.execute(query);
    connect.release();
    res.json(result.rows);
    // // console.log(result);
  } catch (error) {
    console.error("Error in querying data:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

// insert BOI project  
module.exports.insertBOI_Maintain = async function (req, res) {
  try {
    const  fbmc_person_cost_center= req.query.FBMC_cost_center;
    const  fbmc_factory= req.query.FBMC_factory;
    const fbmc_boiproject = req.query.FBMC_BOI_Project;
    const fbmc_status = req.query.FBMC_status;
    const fbmc_comment = req.query.FBMC_comment;
    const fbmc_create_by = req.query.FBMC_create_by;
    const fbmc_update_by = req.query.FBMC_update_by;

    // // console.log(fbmc_person_cost_center);
    // // console.log(fbmc_factory);
    // // console.log(fbmc_boiproject);
    // // console.log(fbmc_status);
    // // console.log(fbmc_comment);
    // // console.log(fbmc_create_by);
    // // console.log(fbmc_update_by);

    const connect = await oracledb.getConnection(AVO);
    const query = `
    INSERT INTO FAM_BOIPROJ_MAP_CC (FBMC_COST_CENTER,FBMC_FACTORY,FBMC_BOI_PROJ,FBMC_STATUS,FBMC_COMMENT,FBMC_CREATE_DATE,FBMC_CREATE_BY,FBMC_UPDATE_DATE,FBMC_UPDATE_BY)
    VALUES (:fbmc_person_cost_center,:fbmc_factory,:fbmc_boiproject,:fbmc_status,:fbmc_comment,SYSDATE,:fbmc_create_by,SYSDATE,:fbmc_update_by)

         `;
    const data = {
      fbmc_person_cost_center,
      fbmc_factory,
      fbmc_boiproject,
      fbmc_status,
      fbmc_comment,
      fbmc_create_by,
      fbmc_update_by,
    };
    const result = await connect.execute(query, data, { autoCommit: true });
    // // console.log(query);
    connect.release();
    res.json(result.rows);
  } catch (error) {
    console.error("ข้อผิดพลาดในการบันทึกข้อมูล:", error.message);
  }
};


// update BOI maintian
module.exports.updateBOI_Maintain = async function (req, res) {
  try {
    const  fbmc_cost_center_a= req.query.FBMC_cost_center;
    const  fbmc_factory_a= req.query.FBMC_factory;
    const fbmc_boi_project_a = req.query.FBMC_BOI_Project;
    const fbmc_status_a = req.query.FBMC_status;
    const fbmc_comment_a = req.query.FBMC_comment;
    const fbmc_update_by_a = req.query.FBMC_update_by;

    // // console.log(fbmc_cost_center_a);
    // // console.log(fbmc_factory_a);
    // // console.log(fbmc_boi_project_a);
    // // console.log(fbmc_status_a);
    // // console.log(fbmc_comment_a);
    // // console.log(fbmc_update_by_a);

    const connect = await oracledb.getConnection(AVO);
    const query = `
    UPDATE
        FAM_BOIPROJ_MAP_CC
    SET
        FBMC_FACTORY = :fbmc_factory_a,
        FBMC_BOI_PROJ = :fbmc_boi_project_a,
        FBMC_STATUS = :fbmc_status_a,
        FBMC_COMMENT = :fbmc_comment_a,
        FBMC_UPDATE_DATE = SYSDATE,
        FBMC_UPDATE_BY = :fbmc_update_by_a
    WHERE
        FBMC_COST_CENTER = :fbmc_cost_center_a
         `;
    const data = {
      fbmc_cost_center_a,
      fbmc_factory_a,
      fbmc_boi_project_a,
      fbmc_status_a,
      fbmc_comment_a,
      fbmc_update_by_a,
    };
    const result = await connect.execute(query, data, { autoCommit: true });
    // // console.log(query);
    connect.release();
    // // // console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("ข้อผิดพลาดในการบันทึกข้อมูล:", error.message);
  }
};



// get show data edit BOI
module.exports.getEdit_BOI_Show = async function (req, res) {
  try {
    const cost_center = req.query.FBMC_cost_center;
    // // console.log("C", cost_center);

    const connect = await oracledb.getConnection(AVO);
    const query = `
    SELECT DISTINCT 
    T.FBMC_COST_CENTER,
    CTM.CC_DESC, 
    T.FBMC_FACTORY,
    CU.FACTORY_NAME,
    T.FBMC_BOI_PROJ,
    T.FBMC_STATUS,
    T.FBMC_COMMENT,
     TO_CHAR(T.FBMC_CREATE_DATE , 'DD/MM/YYYY') AS CREATE_E,
    T.FBMC_CREATE_BY,
    TO_CHAR(T.FBMC_UPDATE_DATE , 'DD/MM/YYYY') AS UPDATE_E,
    T.FBMC_UPDATE_BY
FROM
    FAM_BOIPROJ_MAP_CC T
    LEFT JOIN CUSR.CU_FACTORY_M CU ON CU.FACTORY_CODE = T.FBMC_FACTORY 
    LEFT JOIN CUSR.CU_MFGPRO_CC_MSTR CTM ON CTM.CC_CTR = T.FBMC_COST_CENTER 
WHERE
    T.FBMC_COST_CENTER = '${cost_center}'
    `;
    const result = await connect.execute(query);
    connect.release();
    const flatArray = result.rows.map((item) => Object.values(item)).flat();
    res.json(flatArray);
    // // console.log(result);
  } catch (error) {
    console.error("Error in querying data:", error.message);
    res.status(500).send("Internal Server Error");
  }
};


// Delete BOI Maintain
module.exports.deleteBOI_Maintain = async function (req, res) {
  try {
    const cost_center_a = req.query.FBMC_cost_center_delete;
    // // console.log(cost_center_a);

    const connect = await oracledb.getConnection(AVO);
    const query = `
    DELETE
    FROM
      FAM_BOIPROJ_MAP_CC T
    WHERE
      T.FBMC_COST_CENTER = :cost_center_a 
         `;
    const data = {
      cost_center_a,
    };
    const result = await connect.execute(query, data, { autoCommit: true });
    // // console.log(query);
    connect.release();
    res.json(result.rows);
  } catch (error) {
    console.error("ข้อผิดพลาดในการบันทึกข้อมูล:", error.message);
  }
};

//CountTransfer
module.exports.getCountTransfer = async function (req, res) {
  try {
    const userlogin = req.query.UserLogin;
    const connect = await oracledb.getConnection(AVO);
    const query = `
    SELECT  COUNT(T.FRH_FAM_NO) 
    FROM FAM_REQ_HEADER T
    LEFT JOIN FAM_REQ_TRANSFER A ON A.FRT_FAM_NO = T.FRH_FAM_NO
    WHERE 1=1
        AND (T.FAM_REQ_BY = '${userlogin}' AND T.FAM_REQ_STATUS = 'FLTR001'
        OR (T.FAM_MGR_DEPT = '${userlogin}' AND T.FAM_REQ_STATUS = 'FLTR002')
        OR (T.FAM_SERVICE_BY  = '${userlogin}' AND T.FAM_REQ_STATUS = 'FLTR003')
        OR (T.FAM_BOI_CHK_BY  = '${userlogin}' AND T.FAM_REQ_STATUS = 'FLTR004')
        OR (T.FAM_BOI_MGR_BY  = '${userlogin}'  AND T.FAM_REQ_STATUS = 'FLTR005')
        OR (T.FAM_FM_BY  = '${userlogin}'  AND T.FAM_REQ_STATUS = 'FLTR006')
        OR (T.FAM_ACC_CHK_BY  = '${userlogin}'  AND T.FAM_REQ_STATUS = 'FLTR007')
        OR (T.FAM_OWNER_SEND_BY  = '${userlogin}'  AND T.FAM_REQ_STATUS = 'FLTR008')
        OR ( A.FRT_RECEIVE_BY  = '${userlogin}'  AND T.FAM_REQ_STATUS = 'FLTR009')
        OR (T.FAM_ACC_REC_BY  = '${userlogin}'  AND T.FAM_REQ_STATUS = 'FLTR010')
        OR (T.FAM_ACC_MGR_BY  = '${userlogin}' AND T.FAM_REQ_STATUS = 'FLTR011')
        OR (T.FAM_SERVICE_CLOSE_BY  = '${userlogin}'  AND T.FAM_REQ_STATUS = 'FLTR012'))
       AND T.FAM_REQ_TYPE  = 'GP01001'
         `;
    // // console.log(query);
    const result = await connect.execute(query);
    connect.release();
    // // // console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
  }
};

//CountTransferListALL
module.exports.getCountTransferlistaLL = async function (req, res) {
  try {
    const userlogin = req.query.UserLogin;
    const connect = await oracledb.getConnection(AVO);
    const query = `
    SELECT
    COUNT(CASE WHEN TT.FFM_CODE = 'FLTR001' THEN 1 ELSE NULL END) AS T_CREATE,
    COUNT(CASE WHEN TT.FFM_CODE = 'FLTR002' THEN 1 ELSE NULL END) AS T_WAIT_DM,
    COUNT(CASE WHEN TT.FFM_CODE = 'FLTR003' THEN 1 ELSE NULL END) AS T_WAIT_SDC,
    COUNT(CASE WHEN TT.FFM_CODE = 'FLTR004' THEN 1 ELSE NULL END) AS T_WAIT_BOI_SC,
    COUNT(CASE WHEN TT.FFM_CODE = 'FLTR005' THEN 1 ELSE NULL END) AS T_WAIT_BOI_M,
    COUNT(CASE WHEN TT.FFM_CODE = 'FLTR006' THEN 1 ELSE NULL END) AS T_WAIT_FACTORY_M,
    COUNT(CASE WHEN TT.FFM_CODE = 'FLTR007' THEN 1 ELSE NULL END) AS T_WAIT_ACC_SC,
    COUNT(CASE WHEN TT.FFM_CODE = 'FLTR008' THEN 1 ELSE NULL END) AS T_WAIT_O_C,
    COUNT(CASE WHEN TT.FFM_CODE = 'FLTR009' THEN 1 ELSE NULL END) AS T_WAIT_RECEIVER_A,
    COUNT(CASE WHEN TT.FFM_CODE = 'FLTR010' THEN 1 ELSE NULL END) AS T_WAIT_ACC_SUD,
    COUNT(CASE WHEN TT.FFM_CODE = 'FLTR011' THEN 1 ELSE NULL END) AS T_WAIT_ACC_MGR,
    COUNT(CASE WHEN TT.FFM_CODE = 'FLTR012' THEN 1 ELSE NULL END) AS T_WAIT_SERVICE_DC
FROM FAM_FLOW_MASTER TT
LEFT JOIN FAM_REQ_HEADER HT ON HT.FAM_REQ_STATUS = TT.FFM_CODE
LEFT JOIN FAM_REQ_TRANSFER A ON A.FRT_FAM_NO = HT.FRH_FAM_NO
WHERE 
    TT.FFM_TYPE = 'TRANSFER'
    AND TT.FFM_STATUS = 'A'
    AND (
        HT.FAM_REQ_BY = '${userlogin}' AND HT.FAM_REQ_STATUS = 'FLTR001'
        OR HT.FAM_MGR_DEPT = '${userlogin}' AND HT.FAM_REQ_STATUS = 'FLTR002'
        OR HT.FAM_SERVICE_BY = '${userlogin}' AND HT.FAM_REQ_STATUS = 'FLTR003'
        OR HT.FAM_BOI_CHK_BY = '${userlogin}' AND HT.FAM_REQ_STATUS = 'FLTR004'
        OR HT.FAM_BOI_MGR_BY = '${userlogin}' AND HT.FAM_REQ_STATUS = 'FLTR005'
        OR HT.FAM_FM_BY = '${userlogin}' AND HT.FAM_REQ_STATUS = 'FLTR006'
        OR HT.FAM_ACC_CHK_BY = '${userlogin}' AND HT.FAM_REQ_STATUS = 'FLTR007'
        OR HT.FAM_OWNER_SEND_BY = '${userlogin}' AND HT.FAM_REQ_STATUS = 'FLTR008'
        OR A.FRT_RECEIVE_BY = '${userlogin}' AND HT.FAM_REQ_STATUS = 'FLTR009'
        OR HT.FAM_ACC_REC_BY = '${userlogin}' AND HT.FAM_REQ_STATUS = 'FLTR010'
        OR HT.FAM_ACC_MGR_BY = '${userlogin}' AND HT.FAM_REQ_STATUS = 'FLTR011'
        OR HT.FAM_SERVICE_CLOSE_BY = '${userlogin}' AND HT.FAM_REQ_STATUS = 'FLTR012' )
         `;
    // // console.log(query);
    const result = await connect.execute(query);
    connect.release();
    // // // console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
  }
};