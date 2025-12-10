const { MySQLManager, DataTypes } = require("../config/mysql.config.js");
const SPropertyDB = MySQLManager.getDatabase(process.env.DB_NAME);
const { generateID } = require("../utils/formatter.utils.js");

const properties = SPropertyDB.define(
    "properties",
    {
        id: {
            type: DataTypes.STRING(36),
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(36),
            allowNull: false,
        },
        province: {
            type: DataTypes.STRING(36),
            allowNull: false,
        },
        city: {
            type: DataTypes.STRING(36),
            allowNull: false,
        },
        full_address: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        surface_area: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        building_area: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        photo: {
            type: DataTypes.JSON, // Changed to JSON to store array of photo URLs
            allowNull: true,
            defaultValue: [], // Default empty array
        },
        property_type: {
            type: DataTypes.ENUM("apartement", "boarding", "house", "commercial"),
            allowNull: false,
        },
        rent_type: {
            type: DataTypes.ENUM("daily", "monthly", "yearly"),
            allowNull: false,
            defaultValue: "monthly",
        },
        is_furnished: {
            type: DataTypes.ENUM("unfurnished", "semi-furnished", "furnished"),
            allowNull: false,
        },
        min_rent: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        rent_price: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
        },
        deposit: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
        },
    },
    {
        tableName: "properties",
        timestamps: false,
        hooks: {
            beforeCreate: (properties) => {
                properties.id = generateID("prp");
            },
        },
    }
);

module.exports = { properties };
