const express = require("express");
const router = express.Router();

const authRoute = require("./routes/auth.route");
const propertyRoute = require("./routes/property.route");
const rentingRoute = require("./routes/renting.route");
const depositRoute = require("./routes/deposit.route");
const waterRoute = require("./routes/water.route");
const electricityRoute = require("./routes/electricity.route");
const usersRoute = require("./routes/users.route");
const reviewRoute = require("./routes/review.route");
const requestRoute = require("./routes/request.route");

router.use("/water", waterRoute);
router.use("/electricity", electricityRoute);
router.use("/deposit", depositRoute);
router.use("/rent", rentingRoute);
router.use("/property", propertyRoute);
router.use("/request", requestRoute);
router.use("/review", reviewRoute);
router.use("/auth", authRoute);
router.use("/user", usersRoute);

module.exports = router;
