const express = require('express');
const router = express.Router();
const mainLayout = "../views/layouts/main.ejs";
const userLayout = "../views/layouts/user"
const asyncHandler = require("express-async-handler");
const db = require("../../config/db").db;
const upload = require("../../config/upload")
const multer = require("multer");
//게시글 검색 기능


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
      res.render('user/notice/user_notice_main', { data: results });
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
        res.render('user/notice/user_notice_detail', { data: results[0] });
      } else {
        res.status(404).send('공지사항을 찾을 수 없습니다.');
      }
    }
  });
}));

// 자유게시판 목록
router.get("/freeboard", asyncHandler(async (req, res) => {
  const locals = {title: "자유게시판"};
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
      res.render('user/freeboard/user_freeboard_main', {locals, data: results });
    }
  });
}));


// 자유게시판 세부 내용 페이지 라우터
router.get("/freeboard/detail/:id", asyncHandler(async (req, res) => {
  const locals = {title: req.params.title}
  const id = req.params.id;

   const query = "SELECT * FROM freeBoard WHERE id = ?";
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('서버 오류가 발생했습니다.');
    } else {
      if (results.length > 0) {
        res.render('user/freeboard/user_freeboard_detail', { locals,data: results[0] });
      } else {
        res.status(404).send('게시글을 찾을 수 없습니다.');
      }
    }
  });
}));

// 자유게시판 글쓰기 페이지
router.get("/freeboard/add", asyncHandler(async (req, res) => {
  const locals= {title : "새 게시글 작성"}
  res.render("user/freeboard/user_freeboard_add", { locals });
}));


//자유게시판 글쓰기 처리
router.post(
  "/freeboard/add",
  upload.single('image'),
  asyncHandler(async (req, res) => {
    try { 
      const { title, content  } = req.body;
      const image = req.file ? req.file.filename : null;
      const post_date = new Date();

      // MySQL 쿼리
      const query = `
        INSERT INTO freeboard (title, content, image, post_date)
        VALUES (?, ?, ?, ?)
      `;
      const values = [title, content, image, post_date];

      db.query(query, values, (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).send('<script>alert("게시글 추가 중 오류가 발생했습니다."); window.location.href="/freeboard/add";</script>');
        } else {
          res.redirect("/freeboard");
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('<script>alert("게시글 추가 중 오류가 발생했습니다."); window.location.href="/user/freeboard/add";</script>');
    }
  })
);
// 자유게시판 수정 페이지
router.get(
  "/freeboard/edit/:id",
  asyncHandler(async (req, res) => {
    const locals = { title: "게시글 수정" };
    const id = req.params.id;
    const query = 'SELECT * FROM freeboard WHERE id = ?';
    db.query(query, [id], (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send('서버 오류가 발생했습니다.');
      } else {
        if (results.length > 0) {
          res.render('user/freeboard/user_freeboard_edit', { locals, data: results[0] });
        } else {
          res.status(404).send('게시글을 찾을 수 없습니다.');
        }
      }
    });
  })
);
// 자유게시판 수정 처리
router.post(
  "/freeboard/edit/:id",
  upload.single('image'),
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const { title, content } = req.body;
    const image = req.file ? req.file.filename : null;

    let query = 'UPDATE freeboard SET title = ?, content = ?';
    const values = [title, content];

    if (image) {
      query += ', image = ?';
      values.push(image);
    }

    query += ' WHERE id = ?';
    values.push(id);

    db.query(query, values, (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('<script>alert("게시글 수정 중 오류가 발생했습니다."); window.location.href="/freeboard/edit/' + id + '";</script>');
      } else {
        res.redirect('/freeboard/detail/' + id);
      }
    });
  })
);
// 자유게시판 삭제
router.post(
  "/freeboard/delete/:id",
  async (req, res) => {
    const id = req.params.id;
    const query = 'DELETE FROM freeboard WHERE id = ?';

    db.query(query, [id], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('<script>alert("게시글 삭제 중 오류가 발생했습니다."); window.location.href="/freeboard";</script>');
      } else {
        res.redirect("/freeboard");
      }
    });
  }
);


//qna 목록 
router.get("/qna", asyncHandler(async (req, res) => {
  const locals ={title:"QnA 게시판"}
  let query = 'SELECT q.question_id, q.title AS question_title, q.question, q.question_date, q.question_by, a.answer_id, a.title AS answer_title, a.answer, a.answer_date, a.answered_by FROM Questions q LEFT JOIN Answers a ON q.question_id = a.question_id';
  const searchQuery = req.query.search || "";
  const typeQuery = req.query.type || "";
  let queryParams = [];
  const search = (query, searchQuery, typeQuery)=> {
    if (searchQuery) {
      if (typeQuery === "title") {
        query += " WHERE q.title LIKE ?";
        queryParams.push(`%${searchQuery}%`);
      } else if (typeQuery === "question_by") {
        query += " WHERE q.question_by LIKE ?";
        queryParams.push(`%${searchQuery}%`);
      } else if (typeQuery === "title||question_by") {
        query += " WHERE q.title LIKE ? OR q.question_by LIKE ?";
        queryParams.push(`%${searchQuery}%`, `%${searchQuery}%`);
      }
    }
  }
search(query, searchQuery, typeQuery)
  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('서버 오류가 발생했습니다.');
    } else {
      res.render('user/qna/user_qna_main', { locals, data: results });
    }
  });
}));
//qna 세부 
router.get("/qna/detail/:id", asyncHandler(async (req, res) => {
  const id = req.params.id;
  
  const questionQuery = "SELECT * FROM Questions WHERE question_id = ?";
  const answerQuery = "SELECT * FROM Answers WHERE question_id = ?";
  const locals = { title: "QnA 상세" };

  db.query(questionQuery, [id], (err, questionResults) => {
    if (err) {
      console.error(err);
      res.status(500).send('서버 오류가 발생했습니다.');
    } else {
      if (questionResults.length > 0) {
        db.query(answerQuery, [id], (err, answerResults) => {
          if (err) {
            console.error(err);
            res.status(500).send('서버 오류가 발생했습니다.');
          } else {
            res.render('user/qna/user_qna_detail', {
              locals,
              question: questionResults[0],
              answers: answerResults,
             // isAdmin: req.session.isAdmin || false, // 관리자 여부 확인
           //   adminId: req.session.adminId || null   // 관리자 ID
            });
          }
        });
      } else {
        res.status(404).send('질문을 찾을 수 없습니다.');
      }
    }
  });
}));
// qna 작성 페이지
router.get("/qna/ask", asyncHandler(async (req, res) => {
  const locals= {title : "질문 작성"}
  res.render("user/qna/user_qna_ask", { locals });
}));

//qna 작성 처리 페이지
// 질문 제출
router.post('/qna/ask', async (req, res) => {
  const { title, content } = req.body;  // session 구현시 user_id 추가
  const question_by = "김"; // 임시 데이터

  try {
    // 프라미스 기반으로 db.query를 래핑
    const query = 'INSERT INTO Questions (question_by, title, question) VALUES (?, ?, ?)';
    const values = [question_by, title, content];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('서버 오류');
      } else {
        res.redirect('/qna');
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('서버 오류');
  }
});
// QnA 질문 수정 페이지
router.get('/qna/edit/:id', asyncHandler(async (req, res) => {
  const questionId = req.params.id;
  const locals = { title: '질문 수정' };

  db.query('SELECT * FROM Questions WHERE question_id = ?', [questionId], (err, questions) => {
    if (err) {
      console.error(err);
      res.status(500).send('서버 오류가 발생했습니다.');
    } else {
      if (questions.length === 0) {
        return res.status(404).send('질문을 찾을 수 없습니다.');
      }
      res.render('user/qna/user_qna_edit', { locals, question: questions[0] });
    }
  });
}));
// 질문 수정 제출
router.post('/qna/edit/:id', asyncHandler(async (req, res) => {
  const questionId = req.params.id;
  const { title, question } = req.body;

  db.query(
    'UPDATE Questions SET title = ?, question = ? WHERE question_id = ?',
    [title, question, questionId],
    (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send('서버 오류가 발생했습니다.');
      } else {
        res.redirect(`/qna/detail/${questionId}`);
      }
    }
  );
}));

// 질문 삭제
router.post('/qna/delete/:id', asyncHandler(async (req, res) => {
  const questionId = req.params.id;
  try {
    // 질문과 관련된 답변 모두 삭제
    await db.query('DELETE FROM Answers WHERE question_id = ?', [questionId]);
    await db.query('DELETE FROM Questions WHERE question_id = ?', [questionId]);
    res.redirect('/qna');
  } catch (err) {
    console.error(err);
    res.status(500).send('서버 오류');
  }
}));




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

// 유저 캘린더 화면
router.get("/userCalendar", (req, res) => {
  res.render("user/calendar/user_Calendar");
});

// 유저 메인페이지 화면
router.get("/usermainpage", (req, res) => {
  res.render("mainpage");
});


// 유저 시설소개 직원소개 메인페이지
router.get("/userfacilitiesMain", (req, res) => {
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
      res.render("user/facilities/user_FacilitiesMain", { // 경로 수정
        facilities: facilitiesResult,
        staff: staffResult
      });
    })
    .catch((err) => {
      res.send(err);
    });
});



module.exports = router;