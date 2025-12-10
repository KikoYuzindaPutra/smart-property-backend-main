const express = require("express");
const router = express.Router();
const { BaseController } = require("../controllers");
const { Authorization } = require("../../middleware/authorization.middleware");
const { RentingService } = require("../../services")
const upload = require("../../middleware/uploadInvoice");
const { convertToNestedObject } = require("../../utils/parseFormData");

const controller = new BaseController(RentingService)

router.get("/", Authorization.verifySession("users"), controller.getAll)
router.get("/:id", Authorization.verifySession("users"), controller.getOne)
router.post("/", Authorization.verifySession("users"), upload.single("photo"),
    (req, res, next) => {
        req.body = convertToNestedObject(req.body);

        if (req.file) {
        }
        req.body.photo = `/uploads/invoice/${req.file.filename}`;

        next();
    }, controller.create)

router.post("/check/:id", Authorization.verifySession("users"), controller.checkInCheckOut)
router.patch("/verify/:id", Authorization.verifySession("users"), controller.update)

module.exports = router;
