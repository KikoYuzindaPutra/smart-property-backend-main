// models/refunds.model.js
const { MySQLManager, DataTypes } = require("../config/mysql.config.js");
const SPropertyDB = MySQLManager.getDatabase(process.env.DB_NAME);
const { generateID } = require("../utils/formatter.utils.js");
const { transactions } = require("./transactions.model.js");
const { users } = require("./users.model.js");

const refunds = SPropertyDB.define(
    "refunds",
    {
        id: {
            type: DataTypes.STRING(36),
            primaryKey: true,
        },
        transaction_id: {
            type: DataTypes.STRING(36),
            allowNull: false,
            unique: true, // one-to-one
        },
        amount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
        },
        refund_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        created_by: {
            type: DataTypes.STRING(36),
            allowNull: false,
        },
        verified_by: {
            type: DataTypes.STRING(36),
            allowNull: true,
        },
    },
    {
        tableName: "refunds",
        timestamps: false,
        hooks: {
            beforeCreate: (refund) => {
                refund.id = generateID("rfd");
            },
        },
    }
);

function associateRefunds() {
    // one-to-one dengan transactions
    refunds.belongsTo(transactions, {
        foreignKey: "transaction_id",
        targetKey: "id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });

    transactions.hasOne(refunds, {
        foreignKey: "transaction_id",
        sourceKey: "id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });

    // relasi ke users
    refunds.belongsTo(users, {
        foreignKey: "created_by",
        targetKey: "id",
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
    });

    refunds.belongsTo(users, {
        foreignKey: "verified_by",
        targetKey: "id",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
    });
}
associateRefunds()
module.exports = { refunds };
