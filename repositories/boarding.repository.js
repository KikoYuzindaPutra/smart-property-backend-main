// repositories/boarding.repository.js
const { boarding, properties } = require("../models");
const { MySQLManager } = require("../config/mysql.config.js");
const SPropertyDB = MySQLManager.getDatabase(process.env.DB_NAME);

class BoardingRepository {
    /**
     * Buat boarding house (property + boarding)
     * @param {Object} propertyData data untuk tabel properties
     * @param {Object} boardingData data untuk tabel boarding
     * @returns {Promise<Object>}
     */
    async create(propertyData, boardingData) {
        let transaction;
        try {
            transaction = await SPropertyDB.transaction();

            // 1. Buat property dulu
            const prop = await properties.create(propertyData, { transaction });

            // 2. Buat boarding dengan id yang sama
            const kos = await boarding.create(
                { ...boardingData, id: prop.id },
                { transaction }
            );

            await transaction.commit();
            return { ...prop.toJSON(), boarding: kos.toJSON() };
        } catch (error) {
            if (transaction) await transaction.rollback();
            console.error(">> Error creating boarding house:", error);
            throw error;
        }
    }

    /**
     * Cari boarding house by ID
     * @param {string} id
     * @returns {Promise<Object|null>}
     */
    async findById(id) {
        try {
            return await boarding.findByPk(id, {
                include: [{ model: properties, as: "property" }],
            });
        } catch (error) {
            console.error(">> Error fetching boarding by id:", id, error);
            throw error;
        }
    }

    /**
     * Ambil semua boarding houses
     * @returns {Promise<Array>}
     */
    async findAll() {
        try {
            return await boarding.findAll({
                include: [{ model: properties, as: "property" }],
            });
        } catch (error) {
            console.error(">> Error fetching all boarding houses:", error);
            throw error;
        }
    }

    /**
     * Filter boarding houses dengan custom filter
     * @param {Object} filter contoh: { has_private_bathroom: true }
     * @returns {Promise<Array>}
     */
    async customFilter(filter = {}) {
        try {
            return await boarding.findAll({
                where: filter,
                include: [{ model: properties, as: "property" }],
            });
        } catch (error) {
            console.error(">> Error filtering boarding houses:", filter, error);
            throw error;
        }
    }

    /**
     * Update boarding + property
     * @param {string} id
     * @param {Object} propertyData
     * @param {Object} boardingData
     * @returns {Promise<Object>}
     */
    async update(id, propertyData, boardingData) {
        let transaction;
        try {
            transaction = await SPropertyDB.transaction();

            if (propertyData && Object.keys(propertyData).length > 0) {
                await properties.update(propertyData, { where: { id }, transaction });
            }
            if (boardingData && Object.keys(boardingData).length > 0) {
                await boarding.update(boardingData, { where: { id }, transaction });
            }

            await transaction.commit();
            return await this.findById(id);
        } catch (error) {
            if (transaction) await transaction.rollback();
            console.error(">> Error updating boarding house:", id, error);
            throw error;
        }
    }

    /**
     * Hapus boarding house (hapus properties -> cascade hapus boarding)
     * @param {string} id
     * @returns {Promise<number>} jumlah record property yang dihapus
     */
    async delete(id) {
        try {
            return await properties.destroy({ where: { id } });
        } catch (error) {
            console.error(">> Error deleting boarding house:", id, error);
            throw error;
        }
    }
}

module.exports = new BoardingRepository();
