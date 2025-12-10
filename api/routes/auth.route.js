const express = require("express");
const router = express.Router();
const { UserController } = require("../controllers");
const { Authorization } = require("../../middleware/authorization.middleware");
const { AuthService } = require("../../services")

const controller = new UserController(AuthService)

router.get("/session", Authorization.getSession("users"))
router.post("/request-otp", (req, res) => controller.requestOtp(req, res))
router.post("/validate-otp", (req, res) => controller.login(req, res))
router.post("/register", (req, res) => controller.register(req, res))
router.post("/logout", Authorization.logout());

module.exports = router;
