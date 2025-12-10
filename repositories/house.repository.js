// repositories/house.repository.js
const { house, properties } = require("../models");
const { MySQLManager } = require("../config/mysql.config.js");
const SPropertyDB = MySQLManager.getDatabase(process.env.DB_NAME);

class HouseRepository {
    /**
     * Buat house house (property + house)
     * @param {Object} propertyData data untuk tabel properties
     * @param {Object} houseData data untuk tabel house
     * @returns {Promise<Object>}
     */
    async create(propertyData, houseData) {
        let transaction;
        try {
            transaction = await SPropertyDB.transaction();

            // 1. Buat property dulu
            const prop = await properties.create(propertyData, { transaction });

            // 2. Buat house dengan id yang sama
            const kos = await house.create(
                { ...houseData, id: prop.id },
                { transaction }
            );

            await transaction.commit();
            return { ...prop.toJSON(), house: kos.toJSON() };
        } catch (error) {
            if (transaction) await transaction.rollback();
            console.error(">> Error creating house house:", error);
            throw error;
        }
    }

    /**
     * Cari house house by ID
     * @param {string} id
     * @returns {Promise<Object|null>}
     */
    async findById(id) {
        try {
            return await house.findByPk(id, {
                include: [{ model: properties, as: "property" }],
            });
        } catch (error) {
            console.error(">> Error fetching house by id:", id, error);
            throw error;
        }
    }

    /**
     * Ambil semua house houses
     * @returns {Promise<Array>}
     */
    async findAll() {
        try {
            return await house.findAll({
                include: [{ model: properties, as: "property" }],
            });
        } catch (error) {
            console.error(">> Error fetching all house houses:", error);
            throw error;
        }
    }

    /**
     * Filter house houses dengan custom filter
     * @param {Object} filter contoh: { has_private_bathroom: true }
     * @returns {Promise<Array>}
     */
    async customFilter(filter = {}) {
        try {
            return await house.findAll({
                where: filter,
                include: [{ model: properties, as: "property" }],
            });
        } catch (error) {
            console.error(">> Error filtering house houses:", filter, error);
            throw error;
        }
    }

    /**
     * Update house + property
     * @param {string} id
     * @param {Object} propertyData
     * @param {Object} houseData
     * @returns {Promise<Object>}
     */
    async update(id, propertyData, houseData) {
        let transaction;
        try {
            transaction = await SPropertyDB.transaction();

            if (propertyData && Object.keys(propertyData).length > 0) {
                await properties.update(propertyData, { where: { id }, transaction });
            }
            if (houseData && Object.keys(houseData).length > 0) {
                await house.update(houseData, { where: { id }, transaction });
            }

            await transaction.commit();
            return await this.findById(id);
        } catch (error) {
            if (transaction) await transaction.rollback();
            console.error(">> Error updating house house:", id, error);
            throw error;
        }
    }

    /**
     * Hapus house house (hapus properties -> cascade hapus house)
     * @param {string} id
     * @returns {Promise<number>} jumlah record property yang dihapus
     */
    async delete(id) {
        try {
            return await properties.destroy({ where: { id } });
        } catch (error) {
            console.error(">> Error deleting house house:", id, error);
            throw error;
        }
    }
}

module.exports = new HouseRepository();
