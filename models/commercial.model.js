const { MySQLManager, DataTypes } = require("../config/mysql.config.js");
const SPropertyDB = MySQLManager.getDatabase(process.env.DB_NAME);
const { properties } = require("./properties.model.js");

const commercial = SPropertyDB.define(
    "commercial",
    {
        id: {
            type: DataTypes.STRING(36),
            primaryKey: true,
            references: {
                model: properties,
                key: "id",
            },
            onDelete: "CASCADE", // kalau property dihapus -> commercial ikut hilang
            onUpdate: "CASCADE",
        },
        bathrooms: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        electricity_capacity: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        parking_capacity: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        tableName: "commercial",
        timestamps: false,
    }
);

// 🔗 Definisi asosiasi langsung (tanpa alias)
function associateCommercialProperties() {
    commercial.belongsTo(properties, {
        foreignKey: "id",
        targetKey: "id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });

    properties.hasOne(commercial, {
        foreignKey: "id",
        sourceKey: "id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });
}

associateCommercialProperties()
module.exports = { commercial };
