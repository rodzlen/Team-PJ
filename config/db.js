const mysql = require("mysql2");
const util = require('util');

const db_info = {
  port: "3306",
  user: "root",
  password: "1234",
  database: "kindergarten",
};

const db = mysql.createConnection(db_info);

const connectDB = () => {
  db.connect((err) => {
    if (err) {
      console.error("mysql connection error: " + err);
    } else {
      console.log("mysql is connected successfully!");
    }
  });
};
db.query = util.promisify(db.query);

module.exports = connectDB;
module.exports.db = db;
