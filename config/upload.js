const multer = require("multer");
const path = require("path"); // path 모듈을 require해야 합니다

// Multer 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/img/"); // 업로드된 파일이 저장될 폴더
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // 파일명 설정
  },
});

const upload = multer({ storage: storage });

module.exports = upload;

// config/upload.js
