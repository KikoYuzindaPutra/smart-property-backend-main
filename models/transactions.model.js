// models/transactions.model.js
const { MySQLManager, DataTypes } = require("../config/mysql.config.js");
const SPropertyDB = MySQLManager.getDatabase(process.env.DB_NAME);
const { generateID } = require("../utils/formatter.utils.js");
const { users } = require("./users.model.js");
const { properties } = require("./properties.model.js");

const transactions = SPropertyDB.define(
    "transactions",
    {
        id: {
            type: DataTypes.STRING(36),
            primaryKey: true,
        },
        property_id: {
            type: DataTypes.STRING(36),
            allowNull: false,
        },
        transaction_type: {
            type: DataTypes.ENUM("deposit", "water", "electricity", "rent", "request"),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM("Pending", "Verified", "Check In", "Check Out", "Cancelled and Refunded"),
            allowNull: false,
            defaultValue: "Pending",
        },
        nominal: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
        },
        transaction_date: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        expired_date: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        photo: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        created_by: {
            type: DataTypes.STRING(36),
            allowNull: false,
        },
        verified_by: {
            type: DataTypes.STRING(36),
            allowNull: true,
        },
        parent_transaction_id: {
            type: DataTypes.STRING(36),
            allowNull: true,
        },


    },
    {
        tableName: "transactions",
        timestamps: false,
        hooks: {
            beforeCreate: (transaction) => {
                transaction.id = generateID("trx");
            },
        },
    }
);

// relasi ke users
function associateTransactionsUsers() {
    transactions.belongsTo(users, {
        foreignKey: "created_by",
        targetKey: "id",
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
        as: "createdByUser", 

    });

    transactions.belongsTo(users, {
        foreignKey: "verified_by",
        targetKey: "id",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
        as: "verifiedByUser"
    });

    transactions.belongsTo(properties, {
        foreignKey: "property_id",
        targetKey: "id",
        as: "property",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });

    properties.hasMany(transactions, {
        foreignKey: "property_id",
        sourceKey: "id",
        as: "transaction",
    });

    transactions.belongsTo(transactions, {
        foreignKey: "parent_transaction_id",
        as: "parentTransaction",
    });

    transactions.hasMany(transactions, {
        foreignKey: "parent_transaction_id",
        as: "childTransactions",
    });

}
associateTransactionsUsers()
module.exports = { transactions };
