// models/reviews.model.js
const { MySQLManager, DataTypes } = require("../config/mysql.config.js");
const SPropertyDB = MySQLManager.getDatabase(process.env.DB_NAME);
const { generateID } = require("../utils/formatter.utils.js");
const { transactions } = require("./transactions.model.js");

const reviews = SPropertyDB.define(
    "reviews",
    {
        id: {
            type: DataTypes.STRING(36),
            primaryKey: true,
        },
        transaction_id: {
            type: DataTypes.STRING(36),
            allowNull: false,
        },
        user_id: {
            type: DataTypes.STRING(36),
            allowNull: false,
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: 1,
                max: 5,
            },
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        reply_comment: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
    },
    {
        tableName: "reviews",
        timestamps: false,
        hooks: {
            beforeCreate: (review) => {
                review.id = generateID("rev");
                review.created_at = Date.now();
            },
        },
    }
);

function associateReviewTransactions() {
    reviews.belongsTo(transactions, {
        foreignKey: "transaction_id",
        as: "transaction",
    });

    transactions.hasMany(reviews, {
        foreignKey: "transaction_id",
        as: "reviews",
    });
}

associateReviewTransactions();

module.exports = { reviews };
