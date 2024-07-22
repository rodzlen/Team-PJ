const express = require("express");
const app = express();
const port = 8500;
const expressLayouts = require("express-ejs-layouts");
const userRoutes = require('./routes/user/main');
const adminRoutes = require('./routes/admin/main');
const path = require('path');
const connectDB = require("./config/db");

connectDB(); 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.use(expressLayouts);

app.use('/img', express.static(path.join(__dirname, 'public/img')));


app.use('/', userRoutes);
app.use('/admin', adminRoutes);

app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "ejs");
app.set('layout', './layouts/main');
app.set('layout extractScripts', true);




app.listen(port,()=>{
  console.log(`서버가 ${port}에서 실행중입니다.`);
})