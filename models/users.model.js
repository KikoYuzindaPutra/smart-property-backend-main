const { MySQLManager, DataTypes } = require("../config/mysql.config.js");
const SPropertyDB = MySQLManager.getDatabase(process.env.DB_NAME);
const { generateID } = require("../utils/formatter.utils.js");

const users = SPropertyDB.define(
    "users",
    {
        id: {
            type: DataTypes.STRING(36),
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(36),
            allowNull: false,
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(36),
            allowNull: false,
            unique: true,
        },
        phone_number: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        profile_photo: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "users",
        timestamps: false,
        hooks: {
            beforeCreate: (users) => {
                users.id = generateID("usr");
            },
        },
    }
);


module.exports = { users };
