const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// registar utilizador
router.post("/register", authController.register);

// login
router.post("/login", authController.login);

module.exports = router;
