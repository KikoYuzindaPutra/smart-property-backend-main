const { MySQLManager, DataTypes } = require("../config/mysql.config.js");
const SPropertyDB = MySQLManager.getDatabase(process.env.DB_NAME);
const { properties } = require("./properties.model.js");
const { generateID } = require("../utils/formatter.utils.js");

const house = SPropertyDB.define(
    "house",
    {
        id: {
            type: DataTypes.STRING(36),
            primaryKey: true,
            references: {
                model: properties,
                key: "id",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
        bedrooms: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        bathrooms: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        floors: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        garage: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
    {
        tableName: "house",
        timestamps: false,
        hooks: {
            beforeCreate: (h) => {
                h.id = generateID("hme");
            },
        },
    }
);

// 🔗 Definisi asosiasi langsung (tanpa alias)
function associateHouseProperties() {
    house.belongsTo(properties, {
        foreignKey: "id",
        targetKey: "id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });

    properties.hasOne(house, {
        foreignKey: "id",
        sourceKey: "id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });
}
associateHouseProperties();

module.exports = { house };
