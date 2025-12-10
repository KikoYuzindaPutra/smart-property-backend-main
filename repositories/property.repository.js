// repositories/properties.repository.js
const { properties, property_users, users } = require("../models");
const { MySQLManager } = require("../config/mysql.config.js");
const SPropertyDB = MySQLManager.getDatabase(process.env.DB_NAME);

class PropertyRepository {
    /**
     * Ambil semua properti
     * @returns {Promise<Array>}
     */
    async getAllProperties() {
        try {
            return await properties.findAll({
                include: [
                    {
                        model: property_users,
                        as: "property_users",
                        include: [{ model: users, as: "user" }]
                    }
                ]
            });
        } catch (error) {
            console.error(">> Error fetching all properties:", error);
            throw error;
        }
    }

    /**
     * Ambil detail satu properti berdasarkan ID,
     * termasuk user-user yang terkait (owner, tenant, management)
     * @param {string} propertyId
     * @returns {Promise<Object|null>}
     */
    async getOnePropertyById(propertyId) {
        try {
            return await properties.findByPk(propertyId, {
                include: [
                    {
                        model: property_users,
                        as: "property_users",
                        include: [
                            {
                                model: users,
                                as: "user",
                            },
                        ],
                    }
                ],
            });
        } catch (error) {
            console.error(
                `>> Error fetching property with id ${propertyId}:`,
                error
            );
            throw error;
        }
    }

    /**
     * Ambil properti berdasarkan relation_type
     * @param {string} userId
     * @param {"owner"|"tenant"|"management"} relationType
     * @returns {Promise<Array>}
     */
    async getPropertiesByRelation(userId, relationType) {
        try {
            return await property_users.findAll({
                where: { user_id: userId, relation_type: relationType },
                include: [{ model: properties, as: "property" }]
            });
        } catch (error) {
            console.error(
                `>> Error fetching properties for user ${userId} with relation ${relationType}:`,
                error
            );
            throw error;
        }
    }

    /**
     * Tambah relasi user ke property
     * @param {string} propertyId
     * @param {string} userId
     * @param {"owner"|"tenant"|"management"} relationType
     * @returns {Promise<Object>}
     */
    async addUserToProperty(propertyId, userId, relationType, rentFrom, rentTo) {
        let transaction;
        try {
            transaction = await SPropertyDB.transaction();

            const relation = await property_users.create(
                {
                    property_id: propertyId,
                    user_id: userId,
                    relation_type: relationType,
                    rent_from: rentFrom,
                    rent_to: rentTo
                },
                { transaction }
            );

            await transaction.commit();
            return relation;
        } catch (error) {
            if (transaction) await transaction.rollback();
            console.error(">> Error adding user to property:", error);
            throw error;
        }
    }



    /**
 * Hapus relasi user dari property
 * @param {string} propertyId
 * @param {string} userId
 * @returns {Promise<boolean>} true kalau berhasil hapus
 */
    async removeUserFromProperty(propertyId, userId) {
        let transaction;
        try {
            transaction = await SPropertyDB.transaction();

            const deleted = await property_users.destroy(
                {
                    where: {
                        property_id: propertyId,
                        user_id: userId,
                    },
                    transaction,
                }
            );

            await transaction.commit();

            // return true kalau ada row yang kehapus
            return deleted > 0;
        } catch (error) {
            if (transaction) await transaction.rollback();
            console.error(">> Error removing user from property:", error);
            throw error;
        }
    }



}

module.exports = new PropertyRepository();
