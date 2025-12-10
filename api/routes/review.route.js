const express = require("express");
const router = express.Router();
const { Authorization } = require("../../middleware/authorization.middleware");
const { ReviewService } = require("../../services");
const { BaseController } = require("../controllers");

const controller = new BaseController(ReviewService);

// Buat review baru
router.post("/", Authorization.verifySession("users"), controller.create);

// Buat reply untuk review
router.post("/:reviewId/reply", Authorization.verifySession("users"), controller.createReply);

// Update review
router.patch("/:reviewId", Authorization.verifySession("users"), controller.update);

// Hapus review
router.delete("/:reviewId", Authorization.verifySession("users"), controller.delete);

module.exports = router;
