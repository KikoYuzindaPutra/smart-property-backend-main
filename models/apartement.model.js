// models/apartement.model.js
const { MySQLManager, DataTypes } = require("../config/mysql.config.js");
const SPropertyDB = MySQLManager.getDatabase(process.env.DB_NAME);
const { generateID } = require("../utils/formatter.utils.js");
const { properties } = require("./properties.model");

const apartement = SPropertyDB.define(
    "apartement",
    {
        id: {
            type: DataTypes.STRING(36),
            primaryKey: true,
            references: {
                model: properties,
                key: "id",
            },
            onDelete: "CASCADE", // kalau property dihapus → apartement ikut hilang
            onUpdate: "CASCADE",
        },
        tower_name: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        floor_number: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        unit_number: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        bedrooms: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        bathrooms: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ipl: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
        },
    },
    {
        tableName: "apartement",
        timestamps: false,
        hooks: {
            beforeCreate: (ua) => {
                ua.id = generateID("apt");
            },
        },
    }
);

// 🔗 Definisi asosiasi langsung (mirip flats–towers)
function associateApartementProperties() {
    apartement.belongsTo(properties, {
        foreignKey: "id",
        targetKey: "id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });

    properties.hasOne(apartement, {
        foreignKey: "id",
        sourceKey: "id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });
}

// ✅ Langsung panggil biar asosiasi ke-register
associateApartementProperties();

module.exports = { apartement };
