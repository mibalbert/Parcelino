/** controller.js */

require("dotenv").config();

// Home
exports.homeGET = (req, res) => {
  console.log("GET //");
  const googleMapsKey = process.env.GOOGLE_MAPS_API_KEY;
  res.render("home", { googleMapsKey });
};

exports.testingGET = (req, res) => {
  console.log("GET /testing");
  res.render("testing");
};
