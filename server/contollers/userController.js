/** controller.js */

require("dotenv").config();

// Home
exports.homeGET = (req, res) => {
  console.log("GET //");
  res.render("home");
};
