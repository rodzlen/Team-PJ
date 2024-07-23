const express = require("express");
const port = 8500;
const expressLayouts = require("express-ejs-layouts");
const userRoutes = require("./routes/user/main");

const adminRoutes = require("./routes/admin/main");
const path = require("path");
const connectDB = require("./config/db");
const session = require("express-session");
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt')

// 세션 설정
app.use(
  session({
    secret: "12345", // 반드시 강력한 비밀 키를 사용하세요.
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // HTTPS를 사용하는 경우 true로 설정
  })
);

connectDB();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));
app.use(expressLayouts);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/", userRoutes);
app.use("/admin", adminRoutes);
app.use("/user", userRoutes);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.set("layout", "./layouts/main");
app.set("layout extractScripts", true);


app.listen(port, () => {
  console.log(`서버가 ${port}에서 실행중입니다.`);
});

// app.js
