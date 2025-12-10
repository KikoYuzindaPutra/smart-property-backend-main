// models/boarding.model.js
const { MySQLManager, DataTypes } = require("../config/mysql.config.js");
const SPropertyDB = MySQLManager.getDatabase(process.env.DB_NAME);
const { properties } = require("./properties.model.js");

const boarding = SPropertyDB.define(
    "boarding",
    {
        id: {
            type: DataTypes.STRING(36),
            primaryKey: true,
            references: {
                model: properties,
                key: "id",
            },
            onDelete: "CASCADE", // kalau property dihapus -> boarding ikut hilang
            onUpdate: "CASCADE",
        },
        // apakah kamar mandi dalam
        has_private_bathroom: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        // jumlah orang per kamar (opsional, bisa dipakai untuk kos sharing)
        max_occupants: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        // fasilitas tambahan (opsional, JSON untuk fleksibilitas)
        facilities: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: "misalnya: {wifi: true, ac: true, laundry: false}"
        }
    },
    {
        tableName: "boarding",
        timestamps: false,
    }
);

// 🔗 Definisi asosiasi langsung (tanpa alias)
function associateBoardingProperties() {
    boarding.belongsTo(properties, {
        foreignKey: "id",
        targetKey: "id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });

    properties.hasOne(boarding, {
        foreignKey: "id",
        sourceKey: "id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });
}

// ✅ Register asosiasi
associateBoardingProperties();

module.exports = { boarding };
