const express = require("express");
const router = express.Router();
const { BaseController } = require("../controllers");
const { Authorization } = require("../../middleware/authorization.middleware");
const { RequestService } = require("../../services")

const controller = new BaseController(RequestService)

router.get("/", Authorization.verifySession("users"), controller.getAll)
router.get("/:id", Authorization.verifySession("users"), controller.getOne)
router.post("/", Authorization.verifySession("users"), controller.create)
router.post("/extend", Authorization.verifySession("users"), controller.extendRent)
router.patch("/verify/:id", Authorization.verifySession("users"), controller.update)
router.delete("/:id", Authorization.verifySession("users"), controller.delete)

module.exports = router;
