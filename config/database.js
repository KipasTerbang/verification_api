require("dotenv").config();
module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: "",
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "mysql",
  },
};
