// repositories/commercial.repository.js
const { commercial, properties } = require("../models");
const { MySQLManager } = require("../config/mysql.config.js");
const SPropertyDB = MySQLManager.getDatabase(process.env.DB_NAME);

class CommercialRepository {
    /**
     * Buat commercial house (property + commercial)
     * @param {Object} propertyData data untuk tabel properties
     * @param {Object} commercialData data untuk tabel commercial
     * @returns {Promise<Object>}
     */
    async create(propertyData, commercialData) {
        let transaction;
        try {
            transaction = await SPropertyDB.transaction();

            // 1. Buat property dulu
            const prop = await properties.create(propertyData, { transaction });

            // 2. Buat commercial dengan id yang sama
            const kos = await commercial.create(
                { ...commercialData, id: prop.id },
                { transaction }
            );

            await transaction.commit();
            return { ...prop.toJSON(), commercial: kos.toJSON() };
        } catch (error) {
            if (transaction) await transaction.rollback();
            console.error(">> Error creating commercial house:", error);
            throw error;
        }
    }

    /**
     * Cari commercial house by ID
     * @param {string} id
     * @returns {Promise<Object|null>}
     */
    async findById(id) {
        try {
            return await commercial.findByPk(id, {
                include: [{ model: properties, as: "property" }],
            });
        } catch (error) {
            console.error(">> Error fetching commercial by id:", id, error);
            throw error;
        }
    }

    /**
     * Ambil semua commercial houses
     * @returns {Promise<Array>}
     */
    async findAll() {
        try {
            return await commercial.findAll({
                include: [{ model: properties, as: "property" }],
            });
        } catch (error) {
            console.error(">> Error fetching all commercial houses:", error);
            throw error;
        }
    }

    /**
     * Filter commercial houses dengan custom filter
     * @param {Object} filter contoh: { has_private_bathroom: true }
     * @returns {Promise<Array>}
     */
    async customFilter(filter = {}) {
        try {
            return await commercial.findAll({
                where: filter,
                include: [{ model: properties, as: "property" }],
            });
        } catch (error) {
            console.error(">> Error filtering commercial houses:", filter, error);
            throw error;
        }
    }

    /**
     * Update commercial + property
     * @param {string} id
     * @param {Object} propertyData
     * @param {Object} commercialData
     * @returns {Promise<Object>}
     */
    async update(id, propertyData, commercialData) {
        let transaction;
        try {
            transaction = await SPropertyDB.transaction();

            if (propertyData && Object.keys(propertyData).length > 0) {
                await properties.update(propertyData, { where: { id }, transaction });
            }
            if (commercialData && Object.keys(commercialData).length > 0) {
                await commercial.update(commercialData, { where: { id }, transaction });
            }

            await transaction.commit();
            return await this.findById(id);
        } catch (error) {
            if (transaction) await transaction.rollback();
            console.error(">> Error updating commercial house:", id, error);
            throw error;
        }
    }

    /**
     * Hapus commercial house (hapus properties -> cascade hapus commercial)
     * @param {string} id
     * @returns {Promise<number>} jumlah record property yang dihapus
     */
    async delete(id) {
        try {
            return await properties.destroy({ where: { id } });
        } catch (error) {
            console.error(">> Error deleting commercial house:", id, error);
            throw error;
        }
    }
}

module.exports = new CommercialRepository();
