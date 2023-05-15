/** app.js */

const express = require("express");
const exphbs = require("express-handlebars");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const dotenv = require("dotenv");

const app = express();
const port = process.env.PORT || 8000;

// app.locals.googleMapsKey = process.env.GOOGLE_MAPS_API_KEY;
// console.log(app.locals.googleMapsKey);

dotenv.config();
app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Static Files
app.use(express.static("public"));
global.googleMapsKey = process.env.GOOGLE_MAPS_API_KEY;

console.log(global.googleMapsKey);

// Templating Engine
const handlebars = exphbs.create({
  extname: ".hbs",
});

app.engine(".hbs", handlebars.engine);
app.set("view engine", ".hbs");
app.set("views", "server/views");

const routes = require("./server/routes/router");
app.use("/", routes);

app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
