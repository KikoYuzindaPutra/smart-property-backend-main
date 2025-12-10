const express = require("express");
const router = express.Router();
const { BaseController } = require("../controllers");
const { Authorization } = require("../../middleware/authorization.middleware");
const { DepositService } = require("../../services")

const controller = new BaseController(DepositService)

router.get("/", Authorization.verifySession("users"), controller.getAll)
router.get("/:id", Authorization.verifySession("users"), controller.getOne)
router.patch("/verify/:id", Authorization.verifySession("users"), controller.update)

module.exports = router;
