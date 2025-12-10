// models/property_users.model.js
const { MySQLManager, DataTypes } = require("../config/mysql.config.js");
const SPropertyDB = MySQLManager.getDatabase(process.env.DB_NAME);
const { generateID } = require("../utils/formatter.utils.js");
const { properties } = require("./properties.model.js");
const { users } = require("./users.model.js");

const property_users = SPropertyDB.define(
    "property_users",
    {
        id: {
            type: DataTypes.STRING(36),
            primaryKey: true,
        },
        property_id: {
            type: DataTypes.STRING(36),
            allowNull: false,
        },
        user_id: {
            type: DataTypes.STRING(36),
            allowNull: false,
        },
        relation_type: {
            type: DataTypes.ENUM("owner", "tenant", "management"),
            allowNull: false,
        },
        rent_from: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        rent_to: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
    },
    {
        tableName: "property_users",
        timestamps: false,
        hooks: {
            beforeCreate: (propertyUser) => {
                propertyUser.id = generateID("pru");
            },
        },
    }
);

function associatePropertiesUsers() {
    property_users.belongsTo(properties, {
        foreignKey: "property_id",
        targetKey: "id",
        as: "property",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });

    property_users.belongsTo(users, {
        foreignKey: "user_id",
        targetKey: "id",
        as: "user",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });

    properties.hasMany(property_users, {
        foreignKey: "property_id",
        sourceKey: "id",
        as: "property_users",
    });

    users.hasMany(property_users, {
        foreignKey: "user_id",
        sourceKey: "id",
        as: "property_users",
    });
}

// ✅ Langsung dipanggil biar ke-register
associatePropertiesUsers();

module.exports = { property_users };
