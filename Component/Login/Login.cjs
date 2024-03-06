const express = require("express");
const oracledb = require("oracledb");

const app = express();
const port = 5000;


app.use(express.json());

oracledb.initOracleClient({
    tnsnames: process.env.TNS_ADMIN,
  });

const CUSR = {
  user: process.env.USER_CUSR,
  password: process.env.PASS_CUSR,
  connectString: process.env.CON_CUSR,
};
// console.log(CUSR,"-------------------------------------------------------------")

// const CUSR = {
//   user: import.meta.env.VITE_USER_CUSR,
//   password: import.meta.env.VITE_PASS_CUSR,
//   connectString: import.meta.env.VITE_CON_CUSR,
// };
// // console.log(CUSR,"-------------------------------------------------------------")

// Login
module.exports.login = async function (req, res) {
  try {
    const  User  = req.query.username;
    const  Password  = req.query.password;
    // console.log(User,Password)
    const connect = await oracledb.getConnection(CUSR);
    const query = `
        SELECT R.ROLE_ID ,T.USER_FNAME , T.USER_SURNAME , T.USER_LOGIN 
        ,T.USER_EMP_ID , REPLACE(R.ROLE_NAME,'FAS-','') AS ROLE_NAME_SHOW
        FROM CU_USER_M T
        INNER JOIN CU_ROLE_USER RU ON RU.USER_LOGIN = T.USER_LOGIN
        INNER JOIN CU_ROLE_M R ON R.ROLE_ID = RU.ROLE_ID
        WHERE T.USER_LOGIN = '${User}'
        AND T.USER_PASSWORD = '${Password}'
        AND R.SYSTEM_ID = '65'
       `;
    const result = await connect.execute(query);
    connect.release();
    // // console.log(result.rows);
    res.json(result.rows);
    
  } catch (error) {
    console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
  }
};
//Menu
module.exports.menu = async function (req, res) {
  try {
    const  Userlogin  = req.query.userlogin;
    const  Role  = req.query.role;
    // // console.log(Userlogin,Role)
    const connect = await oracledb.getConnection(CUSR);
    const query = 
    `SELECT DISTINCT M.MENU_ID,
                M.MENU_NAME,
                M.MENU_DESC,
                M.MENU_PARENT_ID,
                M.MENU_SORT
                FROM CU_ROLE_USER T
                INNER JOIN CU_ROLE_M R ON R.ROLE_ID = T.ROLE_ID
                LEFT JOIN CU_ROLE_MENU RM ON RM.ROLE_ID = T.ROLE_ID
                LEFT JOIN CU_MENU_M M ON M.MENU_ID = RM.MENU_ID AND M.SYSTEM_ID = R.SYSTEM_ID
                WHERE T.USER_LOGIN = '${Userlogin}' 
                AND R.SYSTEM_ID = '65'
                ORDER BY CAST(M.MENU_ID AS INTEGER),CAST(M.MENU_PARENT_ID AS INTEGER),M.MENU_SORT`;
    const result = await connect.execute(query);
    connect.release();
    // // console.log(result.rows);
    res.json(result.rows);
    
  } catch (error) {
    console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
  }
};



// module.exports.menu = async function (req, res) {
//   try {
//     const  Userlogin  = req.query.userlogin;
//     const  Role  = req.query.role;
//     // // console.log(Userlogin,Role)
//     const connect = await oracledb.getConnection(CUSR);
//     const query = 
//     `SELECT DISTINCT M.MENU_ID,
//                 M.MENU_NAME,
//                 M.MENU_DESC,
//                 M.MENU_PARENT_ID,
//                 M.MENU_SORT
//                 FROM CU_ROLE_USER T
//                 INNER JOIN CU_ROLE_M R ON R.ROLE_ID = T.ROLE_ID
//                 LEFT JOIN CU_ROLE_MENU RM ON RM.ROLE_ID = T.ROLE_ID
//                 LEFT JOIN CU_MENU_M M ON M.MENU_ID = RM.MENU_ID AND M.SYSTEM_ID = R.SYSTEM_ID
//                 WHERE T.USER_LOGIN = '${Userlogin}' 
//                 AND T.ROLE_ID = '${Role}'
//                 AND R.SYSTEM_ID = '65'
//                 ORDER BY CAST(M.MENU_ID AS INTEGER),CAST(M.MENU_PARENT_ID AS INTEGER),M.MENU_SORT`;
//     const result = await connect.execute(query);
//     connect.release();
//     // // console.log(result.rows);
//     res.json(result.rows);
    
//   } catch (error) {
//     console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
//   }
// };







// กรณี where role กับ userlogin
// module.exports.mainmenu = async function (req, res) {
//   try {
//     const  Userlogin  = req.query.userlogin;
//     const  Role  = req.query.role;
//     // console.log(Userlogin,Role)
//     const connect = await oracledb.getConnection(CUSR);
//     const query = 
//     `SELECT DISTINCT M.MENU_ID,
//     M.MENU_NAME,
//     M.MENU_DESC,
//     M.MENU_PARENT_ID,
//     M.MENU_SORT
// FROM CU_ROLE_USER T
// INNER JOIN CU_ROLE_M R ON R.ROLE_ID = T.ROLE_ID
// LEFT JOIN CU_ROLE_MENU RM ON RM.ROLE_ID = T.ROLE_ID
// LEFT JOIN CU_MENU_M M ON M.MENU_ID = RM.MENU_ID AND M.SYSTEM_ID = R.SYSTEM_ID
// WHERE T.USER_LOGIN = '${Userlogin}'
// AND T.ROLE_ID = '${Role}'
// AND R.SYSTEM_ID = '65'
// AND M.MENU_PARENT_ID IS NULL 
// ORDER BY CAST(M.MENU_ID AS INTEGER),CAST(M.MENU_PARENT_ID AS INTEGER),M.MENU_SORT`;
//     const result = await connect.execute(query);
//     connect.release();
//     // console.log(result.rows);
//     res.json(result.rows);
    
//   } catch (error) {
//     console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
//   }
// };

module.exports.mainmenu = async function (req, res) {
  try {
    const connect = await oracledb.getConnection(CUSR);
    const query = 
    `SELECT DISTINCT M.MENU_ID,
    M.MENU_NAME,
    M.MENU_DESC,
    M.MENU_PARENT_ID,
    M.MENU_SORT
FROM CU_ROLE_USER T
INNER JOIN CU_ROLE_M R ON R.ROLE_ID = T.ROLE_ID
LEFT JOIN CU_ROLE_MENU RM ON RM.ROLE_ID = T.ROLE_ID
LEFT JOIN CU_MENU_M M ON M.MENU_ID = RM.MENU_ID AND M.SYSTEM_ID = R.SYSTEM_ID
AND R.SYSTEM_ID = '65'
AND M.MENU_PARENT_ID IS NULL 
ORDER BY CAST(M.MENU_ID AS INTEGER),CAST(M.MENU_PARENT_ID AS INTEGER),M.MENU_SORT`;
    const result = await connect.execute(query);
    connect.release();
    // // console.log(result.rows);
    res.json(result.rows);
    
  } catch (error) {
    console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
  }
};


module.exports.submenu = async function (req, res) {
  try {
    const  Userlogin  = req.query.userlogin;
    const  Role  = req.query.role;
    // // console.log(Userlogin,Role)
    const connect = await oracledb.getConnection(CUSR);
    const query = 
    `SELECT DISTINCT M.MENU_ID,
    M.MENU_NAME,
    M.MENU_DESC,
    M.MENU_PARENT_ID,
    M.MENU_SORT
FROM CU_ROLE_USER T
INNER JOIN CU_ROLE_M R ON R.ROLE_ID = T.ROLE_ID
LEFT JOIN CU_ROLE_MENU RM ON RM.ROLE_ID = T.ROLE_ID
LEFT JOIN CU_MENU_M M ON M.MENU_ID = RM.MENU_ID AND M.SYSTEM_ID = R.SYSTEM_ID
WHERE T.USER_LOGIN = '${Userlogin}'
AND R.SYSTEM_ID = '65'
AND M.MENU_PARENT_ID IS NOT NULL 
ORDER BY CAST(M.MENU_ID AS INTEGER),CAST(M.MENU_PARENT_ID AS INTEGER),M.MENU_SORT`;
    const result = await connect.execute(query);
    connect.release();
    // // console.log(result.rows);
    res.json(result.rows);
    
  } catch (error) {
    console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
  }
};

// module.exports.submenu = async function (req, res) {
//   try {
//     const  Userlogin  = req.query.userlogin;
//     const  Role  = req.query.role;
//     // // console.log(Userlogin,Role)
//     const connect = await oracledb.getConnection(CUSR);
//     const query = 
//     `SELECT DISTINCT M.MENU_ID,
//     M.MENU_NAME,
//     M.MENU_DESC,
//     M.MENU_PARENT_ID,
//     M.MENU_SORT
// FROM CU_ROLE_USER T
// INNER JOIN CU_ROLE_M R ON R.ROLE_ID = T.ROLE_ID
// LEFT JOIN CU_ROLE_MENU RM ON RM.ROLE_ID = T.ROLE_ID
// LEFT JOIN CU_MENU_M M ON M.MENU_ID = RM.MENU_ID AND M.SYSTEM_ID = R.SYSTEM_ID
// WHERE T.USER_LOGIN = '${Userlogin}'
// AND T.ROLE_ID = '${Role}'
// AND R.SYSTEM_ID = '65'
// AND M.MENU_PARENT_ID IS NOT NULL 
// ORDER BY CAST(M.MENU_ID AS INTEGER),CAST(M.MENU_PARENT_ID AS INTEGER),M.MENU_SORT`;
//     const result = await connect.execute(query);
//     connect.release();
//     // // console.log(result.rows);
//     res.json(result.rows);
    
//   } catch (error) {
//     console.error("ข้อผิดพลาดในการค้นหาข้อมูล:", error.message);
//   }
// };


// app.get("/getLogin", async (req, res) => {
//     try {
//       const connection = await oracledb.getConnection(CUSR);
//       const strUsername = req.query.username;
//       const strPassword = req.query.password;

//       const result = await connection.execute(
//         `SELECT * FROM TRAIN_PROGRAMMER_PERSON WHERE F_ID_CODE = :username AND F_NAME = :password`,
//         { username: strUsername, password: strPassword }
//       );

//       const rows = result.rows;

//       // ตรวจสอบว่ามีข้อมูลที่ถูกต้องหรือไม่
//       if (rows && rows.length > 0) {
//         res.json(rows);
//       } else {
//         console.error("Login failed");
//         res.status(401).json({ error: "Invalid username or password" });
//       }
//     } catch (error) {
//       console.error("Error fetching Material_Trace:", error);
//       res.status(500).json({ error: "An error occurred" });
//     } finally {
//       // await connection.close();
//     }
//   });
