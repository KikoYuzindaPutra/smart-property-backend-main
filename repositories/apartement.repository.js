// repositories/apartement.repository.js
const { apartement, properties } = require("../models");
const { MySQLManager } = require("../config/mysql.config.js");
const SPropertyDB = MySQLManager.getDatabase(process.env.DB_NAME);

class ApartementRepository {
    /**
     * Buat apartement house (property + apartement)
     * @param {Object} propertyData data untuk tabel properties
     * @param {Object} apartementData data untuk tabel apartement
     * @returns {Promise<Object>}
     */
    async create(propertyData, apartementData) {
        let transaction;
        try {
            transaction = await SPropertyDB.transaction();
            // 1. Buat property dulu
            const prop = await properties.create(propertyData, { transaction });

            // 2. Buat apartement dengan id yang sama
            const kos = await apartement.create(
                { ...apartementData, id: prop.id },
                { transaction }
            );

            await transaction.commit();
            return { ...prop.toJSON(), apartement: kos.toJSON() };
        } catch (error) {
            if (transaction) await transaction.rollback();
            console.error(">> Error creating apartement house:", error);
            throw error;
        }
    }

    /**
     * Cari apartement house by ID
     * @param {string} id
     * @returns {Promise<Object|null>}
     */
    async findById(id) {
        try {
            return await apartement.findByPk(id, {
                include: [{ model: properties, as: "property" }],
            });
        } catch (error) {
            console.error(">> Error fetching apartement by id:", id, error);
            throw error;
        }
    }

    /**
     * Ambil semua apartement houses
     * @returns {Promise<Array>}
     */
    async findAll() {
        try {
            return await apartement.findAll({
                include: [{ model: properties, as: "property" }],
            });
        } catch (error) {
            console.error(">> Error fetching all apartement houses:", error);
            throw error;
        }
    }

    /**
     * Filter apartement houses dengan custom filter
     * @param {Object} filter contoh: { has_private_bathroom: true }
     * @returns {Promise<Array>}
     */
    async customFilter(filter = {}) {
        try {
            return await apartement.findAll({
                where: filter,
                include: [{ model: properties, as: "property" }],
            });
        } catch (error) {
            console.error(">> Error filtering apartement houses:", filter, error);
            throw error;
        }
    }

    /**
     * Update apartement + property
     * @param {string} id
     * @param {Object} propertyData
     * @param {Object} apartementData
     * @returns {Promise<Object>}
     */
    async update(id, propertyData, apartementData) {
        let transaction;
        try {
            transaction = await SPropertyDB.transaction();

            // Sanitasi propertyData
            const sanitizedPropertyData = { ...propertyData };
            if (sanitizedPropertyData.rent_price !== undefined)
                sanitizedPropertyData.rent_price = Number(sanitizedPropertyData.rent_price);
            if (sanitizedPropertyData.deposit !== undefined)
                sanitizedPropertyData.deposit = Number(sanitizedPropertyData.deposit);
            if (sanitizedPropertyData.surface_area !== undefined)
                sanitizedPropertyData.surface_area = Number(sanitizedPropertyData.surface_area);
            if (sanitizedPropertyData.building_area !== undefined)
                sanitizedPropertyData.building_area = Number(sanitizedPropertyData.building_area);
            if (sanitizedPropertyData.property_type)
                sanitizedPropertyData.property_type =
                    sanitizedPropertyData.property_type.toLowerCase();
            if (sanitizedPropertyData.rent_type)
                sanitizedPropertyData.rent_type = sanitizedPropertyData.rent_type.toLowerCase();
            if (sanitizedPropertyData.is_furnished)
                sanitizedPropertyData.is_furnished =
                    sanitizedPropertyData.is_furnished.toLowerCase();

            // Sanitasi apartementData
            const sanitizedApartementData = { ...apartementData };
            if (sanitizedApartementData.floor_number !== undefined)
                sanitizedApartementData.floor_number = Number(sanitizedApartementData.floor_number);
            if (sanitizedApartementData.bedrooms !== undefined)
                sanitizedApartementData.bedrooms = Number(sanitizedApartementData.bedrooms);
            if (sanitizedApartementData.bathrooms !== undefined)
                sanitizedApartementData.bathrooms = Number(sanitizedApartementData.bathrooms);
            if (sanitizedApartementData.ipl !== undefined)
                sanitizedApartementData.ipl = Number(sanitizedApartementData.ipl);

            // Update property
            if (sanitizedPropertyData && Object.keys(sanitizedPropertyData).length > 0) {
                await properties.update(sanitizedPropertyData, {
                    where: { id },
                    transaction,
                });
            }

            // Update apartement
            if (sanitizedApartementData && Object.keys(sanitizedApartementData).length > 0) {
                await apartement.update(sanitizedApartementData, {
                    where: { id },
                    transaction,
                });
            }

            await transaction.commit();

            // Kembalikan data terbaru
            return await this.findById(id);
        } catch (error) {
            if (transaction) await transaction.rollback();
            console.error(">> Error updating apartement:", id, error);
            throw error;
        }
    }

    /**
     * Hapus apartement house (hapus properties -> cascade hapus apartement)
     * @param {string} id
     * @returns {Promise<number>} jumlah record property yang dihapus
     */
    async delete(id) {
        try {
            return await properties.destroy({ where: { id } });
        } catch (error) {
            console.error(">> Error deleting apartement house:", id, error);
            throw error;
        }
    }
}

module.exports = new ApartementRepository();
