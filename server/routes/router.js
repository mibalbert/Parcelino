/** router.js */

const express = require("express");
const router = express.Router();

const userController = require("../contollers/userController");

router.get("/", userController.homeGET);
router.get("/testing", userController.testingGET);

module.exports = router;
