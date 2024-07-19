const express = require('express');
const router = express.Router();
const mainLayout = "../views/layouts/main.ejs";
const userLayout = "../views/layouts/user"
const asyncHandler = require("express-async-handler");
const db = require("../../config/db").db;
const upload = require("../../config/upload")

let queryParams = [];
function search(query, searchQuery, typeQuery) {
  

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

  return { query, queryParams };
}


// 공지사항 목록 페이지 라우터
router.get("/notice", asyncHandler(async (req, res) => {
  const searchQuery = req.query.search || "";
  const typeQuery = req.query.type || "";

  let query = "SELECT * FROM noticeBoard";
  let queryParams = [];
  search(query, searchQuery, typeQuery);  

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('서버 오류가 발생했습니다.');
    } else {
      res.render('user/notice/notice', { data: results });
    }
  });
}));

// 공지사항 세부 내용 페이지 라우터
router.get("/notice/:id", asyncHandler(async (req, res) => {
  const id = req.params.id;
  
  const query = "SELECT * FROM noticeBoard WHERE id = ?";
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('서버 오류가 발생했습니다.');
    } else {
      if (results.length > 0) {
        res.render('user/notice/notice-detail', { data: results[0] });
      } else {
        res.status(404).send('공지사항을 찾을 수 없습니다.');
      }
    }
  });
}));

// 자유게시판 목록
router.get("/freeboard", asyncHandler(async (req, res) => {
  const searchQuery = req.query.search || "";
  const typeQuery = req.query.type || "";

  let query = "SELECT * FROM freeboard";
  let queryParams = [];
  search(query, searchQuery, typeQuery);

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('서버 오류가 발생했습니다.');
    } else {
      res.render('user/freeboard/freeboard', { data: results });
    }
  });
}));


// 자유게시판 세부 내용 페이지 라우터
router.get("/freeboard/:id", asyncHandler(async (req, res) => {
  const id = req.params.id;

   const query = "SELECT * FROM freeBoard WHERE id = ?";
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('서버 오류가 발생했습니다.');
    } else {
      if (results.length > 0) {
        res.render('user/freeboard/freeboard-detail', { data: results[0] });
      } else {
        res.status(404).send('공지사항을 찾을 수 없습니다.');
      }
    }
  });
}));

// 자유게시판 글쓰기 페이지
router.get("/freeboard/add", asyncHandler(async (req, res) => {
  const locals= {title : "새 게시글 작성"}
  res.render("user/freeboard/add", { locals });// 임시 데이터
}));
//자유게시판 글쓰기 처리
router.post(
  "/freeboard/add",
  upload.single('image'),
  asyncHandler(async (req, res) => {
    try {
      const { title, content, user_id } = req.body;
      const image = req.file ? req.file.filename : null;
      const post_date = new Date();

      // MySQL 쿼리
      const query = `
        INSERT INTO freeboard (title, content, image, post_date, createBy, user_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const values = [title, content, image, post_date, createBy, user_id];

      db.query(query, values, (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).send('<script>alert("공지사항 추가 중 오류가 발생했습니다."); window.location.href="/user/freeboard/add";</script>');
        } else {
          res.redirect("/freeboard");
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('<script>alert("공지사항 추가 중 오류가 발생했습니다."); window.location.href="/user/freeboard/add";</script>');
    }
  })
);
// QnA 목록 페이지
router.get('/qna', async (req, res) => {
  const searchQuery = req.query.search || "";
  const typeQuery = req.query.type || "";

     let query ='SELECT * FROM Questions';
     let queryParams = [];
     search(query, searchQuery, typeQuery);
     db.query(query, queryParams, (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send('서버 오류가 발생했습니다.');
      } else {
        res.render('/user/qna', { data: results });
      }
    });
  });
//qna 목록 
router.get("/qna", asyncHandler(async (req, res) => {
 

  let query = 'SELECT q.id AS question_id, q.question, q.question_date, q.asked_by,  a.id AS answer_id, a.answer, a.answer_date, a.answered_by  FROM Questions q  LEFT JOIN Answers a ON q.id = a.question_id';
  let queryParams = [];
  search(query, searchQuery, typeQuery);

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('서버 오류가 발생했습니다.');
    } else {
      res.render('/user/qna', { data: results });
    }
  });
}));
//qna 세부 
router.get("/qna/detail/:id", asyncHandler(async (req, res) => {
  const id = req.params.id;
  
  const query = "SELECT * FROM qnaboard WHERE id = ?";
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('서버 오류가 발생했습니다.');
    } else {
      if (results.length > 0) {
        res.render('user/qna/qna-detail', { data: results[0] });
      } else {
        res.status(404).send('공지사항을 찾을 수 없습니다.');
      }
    }
  });
}));
// qna 작성 페이지
router.get("/qna/ask", asyncHandler(async (req, res) => {
  const locals= {title : "질문 작성"}
  res.render("user/qna/ask", { locals });
}));

//qna 작성 처리 페이지
// 질문 제출
router.post('/qna/ask', async (req, res) => {
  const { user_id, title, content } = req.body;
  try {
      await db.query('INSERT INTO Questions (user_id, title, content) VALUES (?, ?, ?)', [user_id, title, content]);
      res.redirect('/qna');
  } catch (err) {
      console.error(err);
      res.status(500).send('서버 오류');
  }
});
// 질문 수정 페이지
router.get('/qna/edit/:id', async (req, res) => {
  const questionId = req.params.id;
  try {
      const [questions] = await db.query('SELECT * FROM Questions WHERE id = ?', [questionId]);
      if (questions.length === 0) {
          return res.status(404).send('질문을 찾을 수 없습니다.');
      }
      res.render('user/qna/edit', { question: questions[0] });
  } catch (err) {
      console.error(err);
      res.status(500).send('서버 오류');
  }
});
// 질문 수정 제출
router.post('/edit/:id', async (req, res) => {
  const questionId = req.params.id;
  const { title, content } = req.body;
  try {
      await db.query('UPDATE Questions SET title = ?, content = ? WHERE id = ?', [title, content, questionId]);
      res.redirect('/qna/detail/' + questionId);
  } catch (err) {
      console.error(err);
      res.status(500).send('서버 오류');
  }
});

// 질문 삭제
router.post('/qna/delete/:id', async (req, res) => {
  const questionId = req.params.id;
  try {
      await db.query('DELETE FROM Questions WHERE id = ?', [questionId]);
      await db.query('DELETE FROM Answers WHERE question_id = ?', [questionId]);
      res.redirect('/qna');
  } catch (err) {
      console.error(err);
      res.status(500).send('서버 오류');
  }
});





// 홈 페이지
router.get(
  "/",
  asyncHandler(async (req, res) => {
    res.render("user/home", { layout: mainLayout }); // home에 layout 입히기, layout : false => layout 없이 렌더링
  })
);

// 홈 페이지(유저용)
router.get(
  "/user_main",
  asyncHandler(async (req, res) => {
    res.render("user/user_home", { layout: userLayout });
  })
);

// 로그인 및 회원가입 페이지(유저용)
router.get(
  "/user_login",
  asyncHandler(async (req, res) => {
    res.render("user/userManagement/user_login", { layout: false });
  })
);

// 마이페이지(유저용)
router.get(
  "/user_mypage",
  asyncHandler(async (req, res) => {
    res.render("user/userManagement/user_mypage", { layout: userLayout });
  })
);
  
// 회원가입 처리
router.post("/users/signup", asyncHandler(async (req, res) => {
  const { user_id, user_pw, user_name, user_phone, pet_name, pet_gender, pet_neutering, peculiarity } = req.body;

  // 데이터베이스에 삽입할 SQL 쿼리
  const sql = `INSERT INTO Users (user_id, user_pw, user_name, user_phone, pet_name, pet_gender, pet_neutering, peculiarity) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  // 쿼리 실행
  db.query(sql, [user_id, user_pw, user_name, user_phone, pet_name, pet_gender, pet_neutering, peculiarity], (err, results) => {
    if (err) {
      console.error('회원가입 중 에러 발생:', err);
      res.status(500).json({ error: '회원가입 중 에러가 발생했습니다.' });
    } else {
      console.log('회원가입 성공:', results);
      res.json({ message: '회원가입이 성공적으로 완료되었습니다.' });
    }
  });
}));

// 로그인 처리
router.post("/users/login", asyncHandler(async (req, res) => {
  const { user_id, user_pw } = req.body;

  // 데이터베이스에서 아이디와 비밀번호 확인
  const sql = `SELECT * FROM Users WHERE user_id = ? AND user_pw = ?`;
  
  db.query(sql, [user_id, user_pw], (err, results) => {
    if (err) {
      console.error('로그인 중 에러 발생:', err);
      res.status(500).json({ error: '로그인 중 에러가 발생했습니다.' });
    } else {
      if (results.length > 0) {
        // 로그인 성공
        res.json({ message: '로그인 성공!' });
      } else {
        // 로그인 실패
        res.status(401).json({ error: '아이디 또는 비밀번호가 일치하지 않습니다.' });
      }
    }
  });
}));

/* */
// 사용자 정보 가져오기
router.get(
  "/users/mypage/info",
  asyncHandler(async (req, res) => {
    const userId = req.session.user_id; // 세션에서 사용자 아이디 가져오기
    const sql = "SELECT user_id, user_name, user_phone, pet_name, pet_gender, pet_neutering, peculiarity FROM Users WHERE user_id = ?";
    
    db.query(sql, [userId], (err, results) => {
      if (err) {
        console.error('사용자 정보 가져오기 실패:', err);
        res.status(500).json({ error: '사용자 정보를 가져오는 도중 오류가 발생했습니다.' });
      } else {
        if (results.length > 0) {
          const userInfo = results[0]; // 사용자 정보
          res.json(userInfo);
        } else {
          res.status(404).json({ error: '사용자 정보를 찾을 수 없습니다.' });
        }
      }
    });
  })
);

// 정보 수정 처리
router.post("/users/mypage/update", asyncHandler(async (req, res) => {
  const { current_password, confirm_password, user_phone, pet_name, sex, neutering, peculiarity } = req.body;
  const userId = req.session.user_id; // 세션에서 사용자 아이디 가져오기
  
  // 기존 비밀번호 확인 로직 (예시)
  if (current_password !== confirm_password) {
    return res.status(400).json({ error: '기존 비밀번호와 비밀번호 확인이 일치하지 않습니다.' });
  }

  const sql = `
    UPDATE Users 
    SET user_phone = ?, pet_name = ?, pet_gender = ?, pet_neutering = ?, peculiarity = ?
    WHERE user_id = ?
  `;
  
  db.query(sql, [user_phone, pet_name, sex, neutering, peculiarity, userId], (err, results) => {
    if (err) {
      console.error('정보 수정 중 에러 발생:', err);
      res.status(500).json({ error: '정보 수정 중 오류가 발생했습니다.' });
    } else {
      res.json({ message: '정보가 성공적으로 수정되었습니다.' });
    }
  });
}));


// 유저 대시보드 라우트: GET /dashboard/user/userdashboard
router.get("/userdashboard", (req, res) => {
  const query = "select * from dogs where dog_id=4";
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("서버 오류가 발생했습니다.");
    } else {
      if (results.length > 0) {
        res.render("dashboard/user/userdashboard", { data: results[0] });
      } else {
        res.status(404).send("해당 정보를 찾을 수 없습니다.");
      }
    }
  });
});

// 게시물 리스트 라우트: GET /dashboard/user/userpostlist
router.get("/userpostlist", (req, res) => {
  res.render("dashboard/user/userpostlist", { data: posts });
});

// 게시물 검색 라우트: GET /dashboard/user/search
router.get("/search", (req, res) => {
  const keyword = req.query.keyword;
  const filteredPosts = posts.filter((post) => post.title.includes(keyword));
  res.render("dashboard/user/userpostlist", { data: filteredPosts });
});

router.get("/class/u_morningClassPosts", (req, res) => {
  res.render("dashboard/user/class/u_morningClassPosts", { data: posts });
});

router.get("/class/u_afternoonClassPosts", (req, res) => {
  res.render("dashboard/user/class/u_afternoonClassPosts", { data: posts });
});

router.get("/class/u_alldayClassPosts", (req, res) => {
  res.render("dashboard/user/class/u_alldayClassPosts", { data: posts });
});

router.get("/class/u_onedayClassPosts", (req, res) => {
  res.render("dashboard/user/class/u_onedayClassPosts", { data: posts });
});
module.exports = router;