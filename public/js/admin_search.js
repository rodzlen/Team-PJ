const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");
const db = require("../../config/db"); // 데이터베이스 설정 파일

// 검색 페이지를 렌더링하는 라우터
router.get("/admin_search", async (req, res) => {
  res.render("admin/dashboard/admin_search", { title: "강아지 검색" });
});

// 검색 결과를 반환하는 라우터
router.get("/admin_search/results", async (req, res) => {
  const searchTerm = req.query.keyword; // 쿼리 파라미터에서 검색어 가져오기

  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      port: db.config.port,
      user: db.config.user,
      password: db.config.password,
      database: db.config.database,
    });

    // 검색 쿼리 실행
    const [rows] = await connection.execute(
      "SELECT * FROM dogs WHERE pet_name LIKE ?",
      [`%${searchTerm}%`]
    );

    await connection.end();

    res.render("admin/dashboard/admin_search_results", {
      title: "검색 결과",
      results: rows,
    });
  } catch (error) {
    console.error("검색 중 오류가 발생했습니다:", error);
    res.status(500).send("검색 중 오류가 발생했습니다.");
  }
});

module.exports = router;
// public/js/admin_search.js
