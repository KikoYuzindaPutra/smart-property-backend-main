const { boarding } = require("./boarding.model");
const { house } = require("./house.model");
const { apartement } = require("./apartement.model");
const { commercial } = require("./commercial.model");
const { properties } = require("./properties.model");
const { users } = require("./users.model");
const { transactions } = require("./transactions.model");
const { refunds } = require("./refund.model");
const { property_users } = require("./propertyusers.model");
const { reviews } = require("./reviews.model");
module.exports = {
    boarding,
    house,
    apartement,
    commercial,
    properties,
    users,
    property_users,
    transactions,
    refunds,
    reviews,
};
