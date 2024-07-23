const express = require("express");
const router = express.Router();
const adminLayout = "../views/layouts/admin.ejs";
const asyncHandler = require("express-async-handler");
const db = require("../../config/db").db;
const mysql = require("mysql2/promise");
const upload = require("../../config/upload");
const multer = require("multer");
const bcrypt = require("bcrypt");

//세션에 로그인 정보 담겨있는지 확인
const checkAdminLogin = (req, res, next) => {
  if (!req.session.admin || !req.session.admin.admin_id) {
    return res
      .status(401)
      .send(
        '<script>alert("로그인이 필요합니다"); window.location.href="/";</script>'
      );
  }
  next();
};

// 공지사항 메인
router.get(
  "/notice",
  checkAdminLogin,
  asyncHandler(async (req, res) => {
    const searchQuery = req.query.search || "";
    const typeQuery = req.query.type || "";

    let query = "SELECT * FROM noticeBoard";
    let queryParams = [];

    if (searchQuery) {
      if (typeQuery === "title") {
        query += " WHERE title LIKE ?";
        queryParams.push(`%${searchQuery}%`);
      } else if (typeQuery === "createBy") {
        query += " WHERE createBy LIKE ?";
        queryParams.push(`%${searchQuery}%`);
      } else if (typeQuery === "title||createBy") {
        query += " WHERE title LIKE ? OR createBy LIKE ?";
        queryParams.push(`%${searchQuery}%`, `%${searchQuery}%`);
      }
    }
  })
);

// 공지사항 추가 페이지
router.get(
  "/notice/add",
  checkAdminLogin,
  checkAdminLogin,
  asyncHandler(async (req, res) => {
    const locals = { title: "공지사항 추가" };
    res.render("admin/notice/admin_notice_add", { locals });
  })
);

// 공지사항 추가 처리
router.post(
  "/notice/add",
  checkAdminLogin,
  upload.single("image"),
  asyncHandler(async (req, res) => {
    try {
      const { title, content, admin_id } = req.body;
      const image = req.file ? req.file.filename : null;
      const post_date = new Date();

      // MySQL 쿼리
      const query = `
        INSERT INTO NoticeBoard (title, content, image, post_date, createBy, admin_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const values = [title, content, image, post_date, createBy, admin_id];

      db.query(query, values, (err, result) => {
        if (err) {
          console.error(err);
          res
            .status(500)
            .send(
              '<script>alert("공지사항 추가 중 오류가 발생했습니다."); window.location.href="/admin/notice/add";</script>'
            );
        } else {
          res.redirect("/admin/notice");
        }
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .send(
          '<script>alert("공지사항 추가 중 오류가 발생했습니다."); window.location.href="/admin/notice/add";</script>'
        );
    }
  })
);

// 공지사항 수정 페이지
router.get(
  "/notice/edit/:id",
  checkAdminLogin,
  asyncHandler(async (req, res) => {
    const locals = { title: "공지사항 수정" };
    const id = req.params.id;

    try {
      // MySQL 쿼리로 공지사항 조회
      const query = "SELECT * FROM NoticeBoard WHERE id = ?";

      // db.query를 사용할 때 쿼리 문자열과 파라미터를 명확히 전달
      db.query(query, [id], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send("서버 오류");
        }

        if (result.length === 0) {
          return res.status(404).send("공지사항을 찾을 수 없습니다.");
        }

        // 쿼리 결과를 post로 전달하여 EJS 템플릿에 렌더링
        res.render("admin/notice/admin_notice_edit", {
          locals,
          post: result[0],
        });
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("서버 오류");
    }
  })
);
// 공지사항 수정 처리
router.post(
  "/notice/edit/:id",
  checkAdminLogin,
  upload.single("image"),
  asyncHandler(async (req, res) => {
    try {
      const { title, content } = req.body;
      const Image = req.file ? req.file.filename : null;
      await NoticeBoard.findByIdAndUpdate(req.params.id, {
        title,
        content,
        Image,
        date,
      });
      res.redirect("/admin/notice/edit/:id");
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .send(
          '<script>alert("공지사항 수정 중 오류가 발생했습니다."); window.location.href="/admin/notice";</script>'
        );
    }
  })
);

// 공지사항 삭제
router.post(
  "/notice/delete/:id",
  checkAdminLogin,
  asyncHandler(async (req, res) => {
    try {
      await NoticeBoard.findByIdAndDelete(req.params.id);
      res.redirect("/admin/notice");
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .send(
          '<script>alert("공지사항 삭제 중 오류가 발생했습니다."); window.location.href="/admin/notice";</script>'
        );
    }
  })
);

// QnA 목록 페이지
router.get("/qna", checkAdminLogin, async (req, res) => {
  try {
    const [questions] = await db.query("SELECT * FROM Questions");
    res.render("admin/qna/qna", { questions });
  } catch (err) {
    console.error(err);
    res.status(500).send("서버 오류");
  }
});
// QnA 상세 페이지
router.get("/qna/detail/:id", checkAdminLogin, async (req, res) => {
  const questionId = req.params.id;
  try {
    const [questions] = await db.query("SELECT * FROM Questions WHERE id = ?", [
      questionId,
    ]);
    const [answers] = await db.query(
      "SELECT * FROM Answers WHERE question_id = ?",
      [questionId]
    );
    if (questions.length === 0) {
      return res.status(404).send("질문을 찾을 수 없습니다.");
    }
    res.render("admin/qna/qna-detail", {
      question: questions[0],
      answers,
      isAdmin: req.user.isAdmin,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("서버 오류");
  }
});

router.post("/answer/:id", checkAdminLogin, async (req, res) => {
  const questionId = req.params.id;
  const { admin_id, content } = req.body;
  try {
    await db.query(
      "INSERT INTO Answers (question_id, admin_id, content) VALUES (?, ?, ?)",
      [questionId, admin_id, content]
    );
    res.redirect("/qna/detail/" + questionId);
  } catch (err) {
    console.error(err);
    res.status(500).send("서버 오류");
  }
});
// 답변 삭제
router.post("qna/delete/:id", checkAdminLogin, async (req, res) => {
  const answerId = req.params.id;
  const { questionId } = req.body;
  try {
    await db.query("DELETE FROM Answers WHERE id = ?", [answerId]);
    res.redirect("admin/qna/detail/" + questionId);
  } catch (err) {
    console.error(err);
    res.status(500).send("서버 오류");
  }
});

// 수업 신청 수정 페이지
router.get(
  "/classRegList/detail/:id",
  checkAdminLogin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const query = `SELECT * FROM ClassRegistration WHERE id = ?`;

    db.query(query, [id], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res
          .status(500)
          .send(
            '<script>alert("내부 서버 오류가 발생했습니다."); window.location.href="/admin/classRegList";</script>'
          );
      }
      if (results.length === 0) {
        return res
          .status(404)
          .send(
            '<script>alert("수업 신청 정보를 찾을 수 없습니다."); window.location.href="/admin/classRegList";</script>'
          );
      }
      const locals = { registration: results[0] };
      res.render("admin/application/admin_class_register_detail.ejs", {
        locals,
        layout: adminLayout,
      });
    });
  })
);
// 신청서 승인 및 수강 정보 등록
router.post("/classreg/apply/:id", checkAdminLogin, (req, res) => {
  const { id } = req.params;

  // 신청서 승인
  const updateQuery =
    'UPDATE ClassRegistration SET status = "approved", admin_id = ? WHERE id = ?';
  db.query(updateQuery, [req.session.admin.id, id], (err) => {
    if (err) {
      console.error("Database error:", err);
      return res
        .status(500)
        .send(
          '<script>alert("내부 서버 오류가 발생했습니다."); window.location.href="/admin/classreglist";</script>'
        );
    }

    // 승인된 신청서를 수강 정보로 추가
    const selectQuery = "SELECT * FROM ClassRegistration WHERE id = ?";
    db.query(selectQuery, [id], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res
          .status(500)
          .send(
            '<script>alert("내부 서버 오류가 발생했습니다."); window.location.href="/admin/classreglist";</script>'
          );
      }

      const registration = results[0];
      const insertQuery = `
        INSERT INTO ClassAttendance (registration_id, owner_name, pet_name, class_name, feed_status, pickup_status, start_date, end_date, consultation)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(
        insertQuery,
        [
          registration.id,
          registration.owner_name,
          registration.pet_name,
          registration.class_name,
          registration.feed_status,
          registration.pickup_status,
          registration.start_date,
          registration.end_date,
          registration.consultation,
        ],
        (err) => {
          if (err) {
            console.error("Database error:", err);
            return res
              .status(500)
              .send(
                '<script>alert("내부 서버 오류가 발생했습니다."); window.location.href="/admin/classreg/list";</script>'
              );
          }

          res.send(
            '<script>alert("신청이 승인되고 수강 정보가 등록되었습니다!"); window.location.href="/admin/classreg/list";</script>'
          );
        }
      );
    });
  });
});

// 신청서 삭제 처리
router.post("/admin/application/delete/:id", checkAdminLogin, (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM ClassRegistration WHERE id = ?";

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res
        .status(500)
        .send(
          '<script>alert("내부 서버 오류가 발생했습니다."); window.location.href="/admin/classRegList";</script>'
        );
    }

    res.send(
      '<script>alert("신청서가 성공적으로 삭제되었습니다!"); window.location.href="/admin/classRegList";</script>'
    );
  });
});
// 수업 신청 목록 조회
router.get(
  "/classRegList",
  checkAdminLogin,
  asyncHandler(async (req, res) => {
    const { search = "", type = "no||createBy" } = req.query;

    let query = "SELECT * FROM ClassRegistration";
    let queryParams = [];

    if (search) {
      if (type === "no") {
        query += " WHERE id LIKE ?";
        queryParams.push(`%${search}%`);
      } else if (type === "createBy") {
        query += " WHERE owner_name LIKE ?"; // 수정: 'createBy'를 'owner_name'으로 변경
        queryParams.push(`%${search}%`);
      } else if (type === "no||createBy") {
        query += " WHERE id LIKE ? OR owner_name LIKE ?"; // 수정: 'createBy'를 'owner_name'으로 변경
        queryParams.push(`%${search}%`, `%${search}%`);
      }
    }

    db.query(query, queryParams, (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).send("Internal Server Error");
      }

      const locals = { title: "수업 신청 목록", classReg: results };
      res.render("admin/application/admin_class_register_list", {
        locals,
        layout: adminLayout,
      });
    });
  })
);

// 수업 신청 수정 처리
router.post(
  "/classregistration/edit/:id",
  checkAdminLogin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
      class_name,
      feed_status,
      pickup_status,
      start_date,
      end_date,
      consultation,
    } = req.body;

    const query = `
    UPDATE ClassRegistration 
    SET class_name = ?, feed_status = ?, pickup_status = ?, start_date = ?, end_date = ?, consultation = ?
    WHERE id = ?
  `;

    db.query(
      query,
      [
        class_name,
        feed_status === "on",
        pickup_status === "on",
        start_date,
        end_date,
        consultation,
        id,
      ],
      (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res
            .status(500)
            .send(
              '<script>alert("내부 서버 오류가 발생했습니다."); window.location.href="/admin/classregistration";</script>'
            );
        }
        res.send(
          '<script>alert("수업 신청 정보가 성공적으로 수정되었습니다!"); window.location.href="/admin/classregistration";</script>'
        );
      }
    );
  })
);

// 홈 페이지(관리자용)
router.get(
  ["/admin_main"],
  checkAdminLogin,
  asyncHandler(async (req, res) => {
    const locals = { admin: req.session.admin };
    res.render("admin/admin_home", { locals, layout: adminLayout });
  })
);

// 로그인 페이지(관리자용)
router.get(
  "/admin_login",
  asyncHandler(async (req, res) => {
    res.render("admin/adminManagement/admin_login", { layout: false });
  })
);

// 마이페이지(관리자용)
router.get(
  "/admin_mypage",
  asyncHandler(async (req, res) => {
    res.render("admin/adminManagement/admin_mypage", { layout: adminLayout });
  })
);

// 회원가입 처리
router.post(
  "/signup",
  asyncHandler(async (req, res) => {
    const { admin_id, admin_pw, admin_name, admin_phone, authRegNo } = req.body;

    if (authRegNo != "1234") {
      return res
        .status(401)
        .send(
          '<script>alert("사원 인증번호가 다릅니다"); window.location.href="/admin/admin_login";</script>'
        );
    }

    // 비밀번호 해싱
    const saltRounds = 10;
    try {
      const hashedPassword = await bcrypt.hash(admin_pw, saltRounds);

      // 데이터베이스에 삽입할 SQL 쿼리
      const sql = `INSERT INTO Admin (admin_id, admin_pw, admin_name, admin_phone) 
                    VALUES (?, ?, ?, ?)`;

      // 쿼리 실행
      db.query(
        sql,
        [admin_id, hashedPassword, admin_name, admin_phone],
        (err, results) => {
          if (err) {
            console.error("회원가입 중 에러 발생:", err);
            res.status(500).json({ error: "회원가입 중 에러가 발생했습니다." });
          } else {
            console.log("회원가입 성공:", results);
            res.send(
              '<script>alert("관리자 등록이 완료되었습니다!"); window.location.href="/admin/admin_login";</script>'
            );
          }
        }
      );
    } catch (error) {
      console.error("Error hashing password:", error);
      return res
        .status(500)
        .send(
          '<script>alert("내부 서버 오류가 발생했습니다."); window.location.href="/signup";</script>'
        );
    }
  })
);

// 관리자 로그인 처리
router.post("/admin_login", async (req, res) => {
  const { admin_id, admin_pw } = req.body;

  const query = "SELECT * FROM Admin WHERE admin_id = ?";

  db.query(query, [admin_id], async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res
        .status(500)
        .send(
          '<script>alert("내부 서버 오류가 발생했습니다."); window.location.href="/admin/admin_login";</script>'
        );
    }

    if (results.length === 0) {
      return res.send(
        '<script>alert("아이디 또는 비밀번호가 잘못되었습니다."); window.location.href="/admin/admin_login";</script>'
      );
    }

    const admin = results[0];
    try {
      const match = await bcrypt.compare(admin_pw, admin.admin_pw);
      if (!match) {
        return res.send(
          '<script>alert("아이디 또는 비밀번호가 잘못되었습니다."); window.location.href="/admin/admin_login";</script>'
        );
      }

      // 세션에 관리자 정보 저장
      req.session.admin = admin;

      res.send(
        '<script>alert("로그인 성공!"); window.location.href="/admin/admin_main";</script>'
      );
    } catch (compareError) {
      console.error("비밀번호 비교 오류:", compareError);
      return res
        .status(500)
        .send(
          '<script>alert("내부 서버 오류가 발생했습니다."); window.location.href="/admin/admin_login";</script>'
        );
    }
  });
});

// 오늘 산책 사진 업로드를 위한 Multer 설정
const todayWalkStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/img/todaywalkphotos/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, "todaywalk-" + Date.now() + ext);
  },
});

const uploadTodayWalk = multer({ storage: todayWalkStorage });

// 관리자 대시보드 라우트: GET /admin/admin_dashboard
router.get("/admin_dashboard", (req, res) => {
  const formData = {
    ownerName: req.query.ownerName || "",
    petName: req.query.petName || "",
    walkTime: req.query.walkTime || "",
    walkDate: req.query.walkDate || "",
    teacher: req.query.teacher || "",
    noteInfo: req.query.noteInfo || "",
    timetable: req.query.timetable || "",
    classInfo: req.query.classInfo || "",
    feed: req.query.feed || "",
  };
  res.render("admin/dashboard/admin_dashboard", {
    title: "관리자 대시보드",
    formData,
  });
});

// 이미지 업로드 라우트: POST /dashboard/admin/uploadphoto
router.post("/uploadphoto", upload.single("dog_photo"), (req, res) => {
  const file = req.file;
  if (!file) {
    // 실패 시 팝업을 띄우고, 확인을 누르면 대시보드로 돌아간다.
    res.send(`
      <script>
        alert("강아지 사진을 업로드 해주세요.");
        window.location.href = "/admin/admindashboard";
      </script>
    `);
  } else {
    // 성공 시 팝업을 띄우고, 확인을 누르면 대시보드로 돌아간다.
    res.send(`
      <script>
        alert("강아지 사진이 성공적으로 저장되었습니다.");
        window.location.href = "/admin/admin_dashboard";
      </script>
    `);
  }
});

// 강아지 정보 유저 대시보드 라우트: GET /user/user_dashboard
router.get("/user/user_dashboard", async (req, res) => {
  const dogId = req.query.dog_id; // 클라이언트에서 dog_id를 쿼리 파라미터로 받는다고 가정
  const query = "SELECT * FROM dogs WHERE dog_id = ?";

  try {
    const [rows] = await db.query(query, [dogId]);
    if (rows.length > 0) {
      res.render("user/dashboard/user_dashboard", { data: rows[0] });
    } else {
      res.status(404).send("해당 정보를 찾을 수 없습니다.");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("서버 오류가 발생했습니다.");
  }
});

// 강아지 정보 저장 라우트: POST /dashboard/admin/saveinfo
router.post(
  "/saveinfo",
  upload.fields([
    { name: "dog_photo", maxCount: 1 },
    { name: "walk_photo", maxCount: 1 },
  ]),
  async (req, res) => {
    const dog_photo = req.files["dog_photo"] ? req.files["dog_photo"][0] : null;
    const walk_photo = req.files["walk_photo"]
      ? req.files["walk_photo"][0]
      : null;

    const {
      pet_name,
      owner_name,
      walk_date,
      walk_time,
      teacher,
      class_info,
      note_info,
      feed,
    } = req.body;

    try {
      // 파일 업로드 확인
      if (!req.files || !dog_photo || !walk_photo) {
        throw new Error(
          "강아지 사진과 오늘의 산책 사진을 모두 업로드 해주세요."
        );
      }

      // 쿼리 준비
      const sql = `
        INSERT INTO Dogs (dog_photo, pet_name, owner_name, walk_date, walk_time, walk_photo, teacher, class_info, note_info, feed)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        dog_photo.filename,
        pet_name,
        owner_name,
        walk_date,
        walk_time,
        walk_photo.filename,
        teacher,
        class_info,
        note_info,
        feed,
      ];

      // 쿼리 실행
      db.query(sql, values, (err, result) => {
        if (err) {
          console.error(err);
          res
            .status(500)
            .send(
              '<script>alert("정보 추가 중 오류가 발생했습니다."); window.location.href="/admin/admin_dashboard";</script>'
            );
        } else {
          res.send(`
            <script>
              alert("정보가 성공적으로 저장되었습니다.");
              window.location.href = "/admin/class/admin_postlist";
            </script>
          `);
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).send(`
        <script>
          alert("${err.message}");
          window.location.href = "/admin/admin_dashboard";
        </script>
      `);
    }
  }
);

// 강아지 정보 검색
function search(query, searchQuery, typeQuery) {
  let queryParams = [];
  if (searchQuery) {
    if (typeQuery === "pet_name") {
      query += " WHERE pet_name LIKE ?";
      queryParams.push(`%${searchQuery}%`);
    }
  }
  return { query, queryParams };
}

router.get(
  "/admin_postlist",
  asyncHandler(async (req, res) => {
    const searchQuery = req.query.search || "";
    const typeQuery = req.query.type || "";

    let query = "SELECT * FROM dogs";
    const { query: finalQuery, queryParams } = search(
      query,
      searchQuery,
      typeQuery
    );

    // 로그를 추가하여 쿼리와 파라미터를 확인
    console.log("Final Query:", finalQuery);
    console.log("Query Parameters:", queryParams);

    db.query(finalQuery, queryParams, (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send("서버 오류가 발생했습니다.");
      } else {
        res.render("admin/class/admin_postlist", { data: results });
      }
    });
  })
);

// admin_afternoonClassPosts
router.get(
  "/admin_afternoonClassPosts",
  asyncHandler(async (req, res) => {
    const searchQuery = req.query.search || "";
    const typeQuery = req.query.type || "";

    let query = "SELECT * FROM dogs WHERE class_info = '오후'";
    const { query: finalQuery, queryParams } = search(
      query,
      searchQuery,
      typeQuery
    );

    db.query(finalQuery, queryParams, (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send("서버 오류가 발생했습니다.");
      } else {
        res.render("admin/class/admin_afternoonClassPosts", { data: results });
      }
    });
  })
);

// admin_morningClassPosts
router.get(
  "/admin_morningClassPosts",
  asyncHandler(async (req, res) => {
    const searchQuery = req.query.search || "";
    const typeQuery = req.query.type || "";

    let query = "SELECT * FROM dogs WHERE class_info = '오전'";
    const { query: finalQuery, queryParams } = search(
      query,
      searchQuery,
      typeQuery
    );

    db.query(finalQuery, queryParams, (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send("서버 오류가 발생했습니다.");
      } else {
        res.render("admin/class/admin_morningClassPosts", { data: results });
      }
    });
  })
);

// admin_alldayClassPosts
router.get(
  "/admin_alldayClassPosts",
  asyncHandler(async (req, res) => {
    const searchQuery = req.query.search || "";
    const typeQuery = req.query.type || "";

    let query = "SELECT * FROM dogs WHERE class_info = '종일'";
    const { query: finalQuery, queryParams } = search(
      query,
      searchQuery,
      typeQuery
    );

    db.query(finalQuery, queryParams, (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send("서버 오류가 발생했습니다.");
      } else {
        res.render("admin/class/admin_alldayClassPosts", { data: results });
      }
    });
  })
);

// admin_onedayClassPosts
router.get(
  "/admin_onedayClassPosts",
  asyncHandler(async (req, res) => {
    const searchQuery = req.query.search || "";
    const typeQuery = req.query.type || "";

    let query = "SELECT * FROM dogs WHERE class_info = '일일'";
    const { query: finalQuery, queryParams } = search(
      query,
      searchQuery,
      typeQuery
    );

    db.query(finalQuery, queryParams, (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send("서버 오류가 발생했습니다.");
      } else {
        res.render("admin/class/admin_onedayClassPosts", { data: results });
      }
    });
  })
);

// 게시물 리스트 라우트: GET /admin/class/admin_postlist
router.get("/class/admin_postlist", (req, res) => {
  db.query("SELECT * FROM Dogs", (err, posts) => {
    if (err) {
      console.error(err);
      return res.status(500).send("서버 오류");
    }
    res.render("admin/dashboard/admin_postlist", { data: posts });
  });
});

// 게시물 클래스별 라우트
router.get("/class/admin_morningClassPosts", (req, res) => {
  db.query("SELECT * FROM Dogs WHERE class_info = '오전'", (err, posts) => {
    if (err) {
      console.error(err);
      return res.status(500).send("서버 오류");
    }
    res.render("admin/class/admin_morningClassPosts", { data: posts });
  });
});

router.get("/class/admin_afternoonClassPosts", (req, res) => {
  db.query("SELECT * FROM dogs WHERE class_info = '오후'", (err, posts) => {
    if (err) {
      console.error(err);
      return res.status(500).send("서버 오류");
    }
    res.render("admin/class/admin_afternoonClassPosts", {
      data: posts,
    });
  });
});

router.get("/class/admin_alldayClassPosts", (req, res) => {
  db.query("SELECT * FROM Dogs WHERE class_info = '종일'", (err, posts) => {
    if (err) {
      console.error(err);
      return res.status(500).send("서버 오류");
    }
    res.render("admin/class/admin_alldayClassPosts", {
      data: posts,
    });
  });
});

router.get("/class/admin_onedayClassPosts", (req, res) => {
  db.query("SELECT * FROM Dogs WHERE class_info = '일일'", (err, posts) => {
    if (err) {
      console.error(err);
      return res.status(500).send("서버 오류");
    }
    res.render("admin/class/admin_onedayClassPosts", { data: posts });
  });
});

// 강아지 정보 수정 페이지: GET /admin/dashboard/admin_edit/:id
router.get(
  "/dashboard/admin_edit/:dog_id",
  asyncHandler(async (req, res) => {
    const postId = req.params.dog_id;

    const connection = await mysql.createConnection({
      host: "localhost",
      port: db.config.port,
      user: db.config.user,
      password: db.config.password,
      database: db.config.database,
    });

    try {
      const [rows] = await connection.execute(
        "SELECT * FROM dogs WHERE dog_id = ?",
        [postId]
      );

      const post = rows[0];

      if (!post) {
        return res.status(404).send("강아지 정보를 찾을 수 없습니다.");
      }

      res.render("admin/dashboard/admin_edit", {
        title: "강아지 정보 수정",
        post: post,
      });
    } finally {
      await connection.end();
    }
  })
);

// 강아지 정보 수정 처리: POST /admin/dashboard/admin_edit/:id
router.post(
  "/dashboard/admin_edit/:dog_id",
  upload.single("walk_photo"),
  asyncHandler(async (req, res) => {
    const postId = req.params.dog_id;
    try {
      const { walk_date, walk_time, teacher, note_info, class_info, feed } =
        req.body;
      const walk_photo = req.file ? req.file.filename : null;

      const connection = await mysql.createConnection({
        host: "localhost",
        port: db.config.port,
        user: db.config.user,
        password: db.config.password,
        database: db.config.database,
      });

      try {
        await connection.execute(
          "UPDATE dogs SET walk_date = ?, walk_time = ?, walk_photo = ?, teacher = ?, note_info = ?, class_info = ?, feed = ? WHERE dog_id = ?",
          [
            walk_date,
            walk_time,
            walk_photo,
            teacher,
            note_info,
            class_info,
            feed,
            postId,
          ]
        );
      } finally {
        await connection.end();
      }

      res.redirect(`/admin/dashboard/admin_edit/${postId}`);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .send(
          '<script>alert("강아지 정보 수정 중 오류가 발생했습니다."); window.location.href="/admin/dashboard/admin_edit/' +
            postId +
            '";</script>'
        );
    }
  })
);

// 강아지 정보 삭제 라우트: POST /admin/dashboard/delete/:dog_id
router.post("/dashboard/delete/:dog_id", (req, res) => {
  const dogId = req.params.dog_id; // URL 파라미터에서 강아지 ID를 가져옵니다.
  const query = "DELETE FROM dogs WHERE dog_id = ?";

  db.query(query, [dogId], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("정보 삭제 중 오류가 발생했습니다.");
    } else {
      res.redirect("/admin/class/admin_postlist"); // 삭제 후 리디렉션
    }
  });
});

// 직원소개 및 시설소개 모든 데이터

router.get("/adminfacilitiesMain", (req, res) => {
  const facilitiesQuery = "SELECT * FROM Facilities";
  const staffQuery = "SELECT * FROM Staff";

  const facilitiesPromise = new Promise((resolve, reject) => {
    db.query(facilitiesQuery, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });

  const staffPromise = new Promise((resolve, reject) => {
    db.query(staffQuery, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });

  Promise.all([facilitiesPromise, staffPromise])
    .then(([facilitiesResult, staffResult]) => {
      res.render("admin/facilities/admin_FacilitiesMain", {
        facilities: facilitiesResult,
        staff: staffResult,
      });
    })
    .catch((err) => {
      res.send(err);
    });
});

// 시설 생성 페이지
router.get("/adminfacilitiescreate", (req, res) => {
  res.render("admin/facilities/admin_FacilitiesCreate");
});

// 시설 생성
router.post(
  "/adminfacilitiescreate",
  upload.single("facility_photo"),
  (req, res) => {
    try {
      const { facility_name, main_facilities = "" } = req.body;
      const facility_photo = req.file ? req.file.path : "";

      const query = `INSERT INTO Facilities (facility_name, main_facilities, facility_photo) VALUES (?, ?, ?)`;

      db.query(
        query,
        [facility_name, main_facilities, facility_photo],
        (err, result) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).send("Internal Server Error");
          }
          res.redirect("/admin/adminFacilitiesMain");
        }
      );
    } catch (error) {
      console.error("Unexpected error:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

// 시설 수정 페이지
router.get("/facilitiesedit/:id", (req, res) => {
  const ID = req.params.id;
  const query = "SELECT * FROM Facilities WHERE id = ?";
  db.query(query, [ID], (err, result) => {
    if (err) {
      res.send(err);
    } else if (result.length === 0) {
      res.send("찾으시는 페이지가 존재하지 않습니다.");
    } else {
      res.render("facilitiesEdit", { Data: result[0] }); // 데이터 변수명을 "Data"로 맞추기
    }
  });
});

// 시설 정보 수정 처리
router.post(
  "/adminfacilitiesedit/:id",
  upload.single("facility_photo"),
  (req, res) => {
    const id = req.body.id;
    const name = req.body.facility_name || "default_name";
    const features = req.body.main_facilities || "default_features";
    const facility_photo = req.file
      ? req.file.path.replace(/\\/g, "/")
      : req.body.facility_photo;

    const query = `UPDATE Facilities SET facility_name = ?, main_facilities = ?, facility_photo = ? WHERE id = ?`;

    db.query(query, [name, features, facility_photo, id], (err, result) => {
      if (err) {
        console.log(err);
        res.send(err);
      } else {
        res.redirect("/admin/adminFacilitiesMain");
      }
    });
  }
);

// 시설 생성 페이지
router.get("/facilitiescreate", (req, res) => {
  res.render("facilitiesCreate");
});

// 시설 정보 삭제 처리
router.post("/delete", (req, res) => {
  const id = req.body.id;
  const query = "DELETE FROM Facilities WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.log(err);
      res.send(err);
    } else {
      res.redirect("/admin/adminFacilitiesMain");
    }
  });
});

// --------------------------------------------------------------------------

// 직원 생성 페이지
router.get("/adminstaffcreate", (req, res) => {
  res.render("admin/staff/admin_StaffCreate");
});

// 직원 생성
router.post("/adminstaffcreate", upload.single("staff_photo"), (req, res) => {
  const { name, role, contact_info = "" } = req.body;
  const staff_photo = req.file ? req.file.path : "";

  const query = `INSERT INTO Staff (name, role, staff_photo, contact_info) VALUES (?, ?, ?, ?)`;

  db.query(query, [name, role, staff_photo, contact_info], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
      res.redirect("/admin/adminFacilitiesMain"); // 생성 후 리다이렉트할 경로
    }
  });
});

// 직원 수정 페이지
router.get("/adminstaffedit/:id", (req, res) => {
  const ID = req.params.id;

  const query = "SELECT * FROM staff WHERE staff_id = ?";
  db.query(query, [ID], (err, result) => {
    if (err) {
      res.send(err);
    } else if (result.length === 0) {
      res.send("찾으시는 페이지가 존재하지 않습니다.");
    } else {
      res.render("admin/staff/admin_StaffEdit", { Data2: result[0] });
    }
  });
});

// 직원 정보 수정 처리
router.post("/adminstaffedit/:id", upload.single("staff_photo"), (req, res) => {
  const id = req.params.id; // URL에서 직원 ID 가져오기
  const name = req.body.name ? req.body.name.trim() : "default_name"; // name이 NULL이면 기본값 설정
  const role = req.body.role ? req.body.role.trim() : "default_role"; // role이 NULL이면 기본값 설정
  const contact_info = req.body.contact_info
    ? req.body.contact_info.trim()
    : "default_contact_info";
  const staff_photo = req.file
    ? req.file.path.replace(/\\/g, "/")
    : req.body.staff_photo;

  // 필수 필드가 존재하지 않으면 오류 처리
  if (!name) {
    res.status(400).send("직원 이름은 필수 입력 항목입니다.");
    return;
  }

  const query = `UPDATE Staff SET name = ?, role = ?, staff_photo = ?, contact_info = ? WHERE staff_id = ?`;

  db.query(
    query,
    [name, role, staff_photo, contact_info, id],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("데이터베이스 오류가 발생했습니다.");
      } else {
        res.redirect("/admin/adminFacilitiesMain");
      }
    }
  );
});

// 직원 정보 삭제 처리
router.post("/delete2", (req, res) => {
  const id = req.body.staff_id;
  const query = "DELETE FROM staff WHERE staff_id = ?";

  db.query(query, [id], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
      res.redirect("/admin/adminFacilitiesMain");
    }
  });
});

// 어드민 메인페이지
router.get("/adminmainpage", (req, res) => {
  res.render("mainpage");
});

router.get("/calendar", (req, res) => {
  res.render("calendar");
});

router.get("/Calendar", (req, res) => {
  res.render("admin/calendar/adminCalendar");
});

module.exports = router;

// routes/admin/main.js
