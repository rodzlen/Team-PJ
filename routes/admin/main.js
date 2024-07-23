const express = require('express');
const router = express.Router();
const mainLayout = "../views/layouts/main.ejs";
const asyncHandler = require("express-async-handler");
const db = require("../../config/db").db;
const upload = require("../../config/upload")
const multer = require("multer");



// 공지사항 메인
// /admin/notice
router.get("/notice", asyncHandler(async (req, res) => {
  const searchQuery = req.query.search || "";
  const typeQuery = req.query.type || "";
  const locals = {title : "공지사항"}

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

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('서버 오류가 발생했습니다.');
    } else {
      res.render('admin/notice/admin_notice_main', {locals, data: results });
    }
  });
}));

// 공지사항 세부 내용 페이지 라우터
router.get("/notice/detail/:id", asyncHandler(async (req, res) => {
  const id = req.params.id;
  
  const query = "SELECT * FROM noticeBoard WHERE id = ?";
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('서버 오류가 발생했습니다.');
    } else {
      if (results.length > 0) {
        res.render('admin/notice/admin_notice_detail', { data: results[0] });
      } else {
        res.status(404).send('공지사항을 찾을 수 없습니다.');
      }
    }
  });
}));



// 공지사항 추가 페이지
router.get("/notice/add", asyncHandler(async (req, res) => {
  const locals= {title : "공지사항 추가"}
  res.render("admin/notice/admin_notice_add", { locals });
}));

// 공지사항 추가 처리
router.post(
  "/notice/add",
  upload.single('image'),
  asyncHandler(async (req, res) => {
    try {
      const { title, content, admin_id } = req.body;
      const image = req.file ? req.file.filename : null;
      const post_date = new Date();
      const createBy = "작성자 테스트" // 임시데이터 session에서 받아와야댐 

      // MySQL 쿼리
      const query = `
        INSERT INTO NoticeBoard (title, content, image, post_date, createBy, admin_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const values = [title, content, image, post_date, createBy, admin_id];

      db.query(query, values, (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).send('<script>alert("공지사항 추가 중 오류가 발생했습니다."); window.location.href="/admin/notice/add";</script>');
        } else {
          res.redirect("/admin/notice");
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('<script>alert("공지사항 추가 중 오류가 발생했습니다."); window.location.href="/admin/notice/add";</script>');
    }
  })
);

//공지 수정 페이지
router.get(
  "/notice/edit/:id",
  asyncHandler(async (req, res) => {
    const locals = { title: "공지사항 수정" };
    const id = req.params.id;

    try {
      // MySQL 쿼리로 공지사항 조회
      const query = 'SELECT * FROM NoticeBoard WHERE id = ?';
      
      // db.query를 사용할 때 쿼리 문자열과 파라미터를 명확히 전달
      db.query(query, [id], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send('서버 오류');
        } 

        if (result.length === 0) {
          return res.status(404).send('공지사항을 찾을 수 없습니다.');
        }

        // 쿼리 결과를 post로 전달하여 EJS 템플릿에 렌더링
        res.render("admin/notice/admin_notice_edit", { locals, post: result[0] });
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('서버 오류');
    }
  })
);
 // 공지사항 수정 처리
router.post(
  "/notice/edit/:id",
  upload.single('image'),
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const { title, content } = req.body;
    const image = req.file ? req.file.filename : null;

    // 현재 날짜와 시간을 가져옴
    const post_date = new Date();

    try {
      // MySQL 쿼리
      const query = `
        UPDATE NoticeBoard
        SET title = ?, content = ?, image = ?, post_date = ?
        WHERE id = ?
      `;
      const values = [title, content, image, post_date, id];

      db.query(query, values, (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).send('<script>alert("공지사항 수정 중 오류가 발생했습니다."); window.location.href="/admin/notice";</script>');
        } else {
          res.redirect(`/admin/notice`);
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('<script>alert("공지사항 수정 중 오류가 발생했습니다."); window.location.href="/admin/notice";</script>');
    }
  })
);

// 공지사항 삭제
router.post(
  "/notice/delete/:id",
  asyncHandler(async (req, res) => {
    const noticeId = req.params.id;

    try {
      // MySQL 쿼리로 공지사항 삭제
      const query = 'DELETE FROM NoticeBoard WHERE id = ?';
      await db.query(query, [noticeId]);

      // 성공적으로 삭제 후 리디렉션
      res.redirect('/admin/notice');
    } catch (error) {
      console.error(error);
      // 오류 발생 시 사용자에게 알림
      res.status(500).send('<script>alert("공지사항 삭제 중 오류가 발생했습니다."); window.location.href="/admin/notice";</script>');
    }
  })
);


// QnA 목록 페이지
router.get('/qna', async (req, res) => {
  try {
      const [questions] = await db.query('SELECT * FROM Questions');
      res.render('admin/qna/admin_qna', { questions });
  } catch (err) {
      console.error(err);
      res.status(500).send('서버 오류');
  }
});

// QnA 상세 페이지
router.get('/qna/detail/:id', async (req, res) => {
  const questionId = req.params.id;
  try {
      const [questions] = await db.query('SELECT * FROM Questions WHERE id = ?', [questionId]);
      const [answers] = await db.query('SELECT * FROM Answers WHERE question_id = ?', [questionId]);
      if (questions.length === 0) {
          return res.status(404).send('질문을 찾을 수 없습니다.');
      }
      res.render('admin/qna/admin_qna_detail', { question: questions[0], answers, isAdmin: req.user.isAdmin });
  } catch (err) {
      console.error(err);
      res.status(500).send('서버 오류');
  }
});

router.post('/answer/:id', async (req, res) => {
  const questionId = req.params.id;
  const { admin_id, content } = req.body;
  try {
      await db.query('INSERT INTO Answers (question_id, admin_id, content) VALUES (?, ?, ?)', [questionId, admin_id, content]);
      res.redirect('/qna/detail/' + questionId);
  } catch (err) {
      console.error(err);
      res.status(500).send('서버 오류');
  }
});
// 답변 삭제
router.post('qna/delete/:id', async (req, res) => {
  const answerId = req.params.id;
  const { questionId } = req.body;
  try {
      await db.query('DELETE FROM Answers WHERE id = ?', [answerId]);
      res.redirect('admin/qna/detail/' + questionId);
  } catch (err) {
      console.error(err);
      res.status(500).send('서버 오류');
  }
});


// 홈 페이지(관리자용)
router.get(
  ["/admin_main"],
  asyncHandler(async (req, res) => {
    res.render("admin/admin_home", { layout: adminLayout });
  })
);

// 홈 페이지(관리자용)
router.get(
  ["/application"],
  asyncHandler(async (req, res) => {
    res.render("admin/_application/admin_application", { layout: adminLayout });
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
  "/admin/admin_mypage",
  asyncHandler(async (req, res) => {
    res.render("admin/adminManagement/admin_mypage", { layout: adminLayout });
  })
);

// 회원가입 처리
router.post(
  "/admin/signup",
  asyncHandler(async (req, res) => {
    const { admin_id, admin_pw, admin_name, admin_phone } = req.body;

    // 데이터베이스에 삽입할 SQL 쿼리
    const sql = `INSERT INTO Admin (admin_id, admin_pw, admin_name, admin_phone) 
                VALUES (?, ?, ?, ?)`;

    // 쿼리 실행
    db.query(
      sql,
      [admin_id, admin_pw, admin_name, admin_phone],
      (err, results) => {
        if (err) {
          console.error("회원가입 중 에러 발생:", err);
          res.status(500).json({ error: "회원가입 중 에러가 발생했습니다." });
        } else {
          console.log("회원가입 성공:", results);
          res.json({ message: "회원가입이 성공적으로 완료되었습니다." });
        }
      }
    );
  })
);

// 로그인 처리
router.post(
  "/admin/login",
  asyncHandler(async (req, res) => {
    const { admin_id, admin_pw } = req.body;

    // 데이터베이스에서 아이디와 비밀번호 확인
    const sql = `SELECT * FROM Admin WHERE admin_id = ? AND admin_pw = ?`;

    db.query(sql, [admin_id, admin_pw], (err, results) => {
      if (err) {
        console.error("로그인 중 에러 발생:", err);
        res.status(500).json({ error: "로그인 중 에러가 발생했습니다." });
      } else {
        if (results.length > 0) {
          // 로그인 성공
          res.json({ message: "로그인 성공!" });
          req.session.user = {
            id: results[0].id,
            name: results[0].admin_name,
            role: 'admin'
          };
          
        } else {
          // 로그인 실패
          res
            .status(401)
            .json({ error: "아이디 또는 비밀번호가 일치하지 않습니다." });
        }
      }
    });
  })
);

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
<<<<<<< HEAD
        window.location.href = "/admin/admindashboard";
=======
        window.location.href = "/admin/admin_dashboard";
>>>>>>> chae
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
              window.location.href = "/admin/admin_postlist";
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
  db.query("SELECT * FROM Dogs WHERE class_info = '종일", (err, posts) => {
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

// 관리자 강아지 정보 수정 페이지 라우트: GET /admin/dashboard/admin_edit/:id
router.get(
  "/dashboard/admin_edit/:id",
  asyncHandler(async (req, res) => {
    try {
      const postId = req.params.id;

      // 비동기 연결을 사용하여 데이터베이스 연결
      const connection = await mysql.createConnection({
        host: "localhost",
        port: db.config.port, // 포트 정보
        user: db.config.user, // 사용자 정보
        password: db.config.password, // 비밀번호 정보
        database: db.config.database, // 데이터베이스 정보
      });

      // 비동기 쿼리 실행
      const [rows] = await connection.execute(
        "SELECT * FROM dogs WHERE dog_id = ?",
        [postId]
      );
      await connection.end(); // 연결 종료

      const post = rows[0];

      if (!post) {
        return res.status(404).send("강아지 정보를 찾을 수 없습니다.");
      }

      // 데이터와 함께 EJS 템플릿을 렌더링
      res.render("admin/dashboard/admin_edit", {
        title: "강아지 정보 수정",
        post: post,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("서버 오류가 발생했습니다.");
    }
  })
);

// 관리자 강아지 정보 수정 처리: POST /admin/dashboard/admin_edit/:id
router.post(
  "/dashboard/admin_edit/:id",
  upload.single("walk_photo"),
  asyncHandler(async (req, res) => {
    try {
      const postId = req.params.id;
      const { walk_date, walk_time, teacher, note_info, class_info, feed } =
        req.body;
      const walk_photo = req.file ? req.file.filename : null;

      // 비동기 연결을 사용하여 데이터베이스 연결
      const connection = await mysql.createConnection({
        host: "localhost",
        port: db.port, // 포트 정보
        user: db.user, // 사용자 정보
        password: db.password, // 비밀번호 정보
        database: db.database, // 데이터베이스 정보
      });

      // 비동기 쿼리 실행
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
      await connection.end(); // 연결 종료

      // 수정 완료 후 리디렉션
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

// // 강아지 정보 수정 페이지 라우트: GET /dashboard/admin/edit/:id
// router.get("/admin/admin_edit/:id", async (req, res) => {
//   const id = req.params.id;

//   try {
//     // 데이터베이스에서 해당 id의 강아지 정보 가져오기
//     const [result] = await db.query("SELECT * FROM dogs WHERE dog_id = ?;", [
//       id,
//     ]);
//     const post = result[0];

//     if (!post) {
//       return res.status(404).send("해당 강아지 정보를 찾을 수 없습니다.");
//     }

//     res.render("dashboard/admin/admin_edit", {
//       title: "강아지 정보 수정",
//       post,
//     });
//   } catch (error) {
//     res.status(500).send("정보를 불러오는 중 오류가 발생했습니다.");
//   }
// });

// // 강아지 정보 수정 라우트: PUT /dashboard/admin/edit/:id
// router.put(
//   "/admin/admin_edit/:id",
//   upload.fields([
//     { name: "photo", maxCount: 1 },
//     { name: "walk_photo", maxCount: 1 },
//   ]),
//   async (req, res) => {
//     const id = req.params.id;
//     const photo = req.files["photo"] ? req.files["photo"][0] : null;
//     const walk_photo = req.files["walk_photo"]
//       ? req.files["walk_photo"][0]
//       : null;

//     const { walk_time, teacher, note_info, class_info, feed } = req.body;

//     try {
//       // 데이터베이스 업데이트 쿼리 작성
//       const query =
//         "UPDATE dogs SET walk_time = ?, teacher = ?, note_info = ?, class_info = ?, feed = ?, dog_photo = ?, walk_photo = ? WHERE id = ?";
//       const values = [
//         walk_time,
//         teacher,
//         note_info,
//         class_info,
//         feed === "1",
//         photo ? photo.filename : undefined,
//         walk_photo ? walk_photo.filename : undefined,
//         id,
//       ];

//       await db.query(
//         query,
//         values.filter((value) => value !== undefined)
//       );

//       res.redirect("/admin/admin_dashboard");
//     } catch (error) {
//       res.status(500).send("정보 수정 중 오류가 발생했습니다.");
//     }
//   }
// );

// 강아지 정보 삭제 라우트: DELETE /dashboard/admin/delete/:id
router.delete("/admin/delete/:id", async (req, res) => {
  const id = req.params.id;

  try {
    await db.query("DELETE FROM dogs WHERE id = ?", [id]);
    res.redirect("/admin/admin_dashboard");
  } catch (error) {
    res.status(500).send("정보 삭제 중 오류가 발생했습니다.");
  }
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
router.post('/adminfacilitiescreate', upload.single('facility_photo'), (req, res) => {
  try {
    const { facility_name, main_facilities = ''} = req.body;
    const facility_photo = req.file ? req.file.path : '';

    const query = `INSERT INTO Facilities (facility_name, main_facilities, facility_photo) VALUES (?, ?, ?)`;

    db.query(query, [facility_name, main_facilities, facility_photo], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).send('Internal Server Error');
      }
      res.redirect('/admin/adminFacilitiesMain');
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// 시설 수정 페이지
router.get("/adminfacilitiesedit/:id", (req, res) => {
  const ID = req.params.id;
  const query = "SELECT * FROM Facilities WHERE id = ?";
  db.query(query, [ID], (err, result) => {
    if (err) {
      res.send(err);
    } else if (result.length === 0) {
      res.send("찾으시는 페이지가 존재하지 않습니다.");
    } else {
      res.render("admin/facilities/admin_FacilitiesEdit", { Data: result[0] });
    }
  });
});

// 시설 정보 수정 처리
router.post("/adminfacilitiesedit/:id", upload.single('facility_photo'), (req, res) => {
  const id = req.body.id;
  const name = req.body.facility_name || 'default_name';
  const features = req.body.main_facilities || 'default_features';
  const facility_photo = req.file ? req.file.path.replace(/\\/g, '/') : req.body.facility_photo;

  const query = `UPDATE Facilities SET facility_name = ?, main_facilities = ?, facility_photo = ? WHERE id = ?`;

  db.query(query, [name, features, facility_photo, id], (err, result) => {
    if (err) {
      console.log(err);
      res.send(err);
    } else {
      res.redirect("/admin/adminFacilitiesMain");
    }
  });
});

// 시설 생성 페이지
// http://localhost:8500/admin/adminfacilitiescreate
router.get("/adminfacilitiescreate", (req, res) => {
  res.render("admin/facilities/admin_FacilitiesCreate");
});

// 시설 정보 삭제 처리
router.post('/delete', (req, res) => {
  const id = req.body.id;
  const query = "DELETE FROM Facilities WHERE id = ?";
  
  db.query(query, [id], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
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
router.post('/adminstaffcreate', upload.single('staff_photo'), (req, res) => {
  const { name, role, contact_info = '' } = req.body;
  const staff_photo = req.file ? req.file.path : '';

  const query = `INSERT INTO Staff (name, role, staff_photo, contact_info) VALUES (?, ?, ?, ?)`;

  db.query(query, [name, role, staff_photo, contact_info], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
      res.redirect('/admin/adminFacilitiesMain'); // 생성 후 리다이렉트할 경로
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
router.post("/adminstaffedit/:id", upload.single('staff_photo'), (req, res) => {
  const id = req.params.id; // URL에서 직원 ID 가져오기
  const name = req.body.name ? req.body.name.trim() : 'default_name'; // name이 NULL이면 기본값 설정
  const role = req.body.role ? req.body.role.trim() : 'default_role'; // role이 NULL이면 기본값 설정
  const contact_info = req.body.contact_info ? req.body.contact_info.trim() : 'default_contact_info';
  const staff_photo = req.file ? req.file.path.replace(/\\/g, '/') : req.body.staff_photo;

  // 필수 필드가 존재하지 않으면 오류 처리
  if (!name) {
    res.status(400).send("직원 이름은 필수 입력 항목입니다.");
    return;
  }

  const query = `UPDATE Staff SET name = ?, role = ?, staff_photo = ?, contact_info = ? WHERE staff_id = ?`;

  db.query(query, [name, role, staff_photo, contact_info, id], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("데이터베이스 오류가 발생했습니다.");
    } else {
      res.redirect("/admin/adminFacilitiesMain");
    }
  });
});


// 직원 정보 삭제 처리
router.post('/delete2', (req, res) => {
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


// 어드민 캘린더 페이지 
router.get('/adminCalendar', (req, res) => {
  res.render('admin/calendar/admin_Calendar');
});


module.exports = router;
