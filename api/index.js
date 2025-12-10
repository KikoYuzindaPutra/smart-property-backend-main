const express = require("express");
const router = express.Router();
const path = require("path");

const v1Route = require("./v1.api");

router.get("/", (_, res) => {
    res.send("<h1>Selamat datang di Smart Property Management System REST</h1>");
});


const rootDir = path.join(__dirname, "..", "..");

router.use(
    "/uploads",
    express.static(path.join(rootDir, "public/uploads"))
);


router.use("/v1", v1Route);

module.exports = { router };
