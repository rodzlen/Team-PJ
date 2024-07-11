const express = require('express');
const router = express.Router();
const mainLayout = "../views/layouts/main.ejs";
const asyncHandler = require("express-async-handler");




// 홈 페이지
router.get(["/"], asyncHandler(async (req, res) => {

  res.render("user/home", { layout: mainLayout });
}));


module.exports = router;
