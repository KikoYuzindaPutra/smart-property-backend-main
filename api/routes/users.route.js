const express = require("express");
const router = express.Router();
const { UserController } = require("../controllers");
const { Authorization } = require("../../middleware/authorization.middleware");
const { UsersService } = require("../../services")

const controller = new UserController(UsersService)

router.get("/", Authorization.verifySession("users"), controller.getOne)
router.patch("/", Authorization.verifySession("users"), controller.update)

module.exports = router;
