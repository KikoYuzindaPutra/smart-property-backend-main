const {
    ApartementRepository,
    BoardingRepository,
    PropertyRepository,
    CommercialRepository,
    HouseRepository,
    UsersRepository,
    ReviewRepository,
    TransactionRepository,
} = require("../repositories");
const { property_users } = require("../models/propertyusers.model");
const { transactions } = require("../models/transactions.model");
const { Sequelize } = require("sequelize");

class PropertyService {
    /**
     * Ambil semua properties beserta relasinya
     * @returns {Promise<Array>}
     */
    async getAll() {
        try {
            return await PropertyRepository.getAllProperties();
        } catch (err) {
            console.error(">> Error di PropertyService.getAllProperties:", err);
            const error = new Error("Gagal mengambil data properties");
            error.status = 500;
            error.code = "GET_ALL_PROPERTIES_FAILED";
            throw error;
        }
    }

    /**
     * Ambil data dashboard untuk user tertentu
     * @param {string} userId - ID user yang sedang login
     * @returns {Promise<Object>} Dashboard data
     */
    async getDashboard(userId) {
        try {
            // Hitung jumlah property yang disewakan (relation_type = 'owner')
            const ownedPropertiesCount = await property_users.count({
                where: {
                    user_id: userId,
                    relation_type: 'owner'
                }
            });

            // Ambil semua property_id yang dimiliki user ini
            const ownedProperties = await property_users.findAll({
                where: {
                    user_id: userId,
                    relation_type: 'owner'
                },
                attributes: ['property_id']
            });

            const propertyIds = ownedProperties.map(p => p.property_id);

            // Hitung total pendapatan dari transaksi yang verified
            let totalEarnings = 0;
            if (propertyIds.length > 0) {
                const earningsResult = await transactions.findAll({
                    where: {
                        property_id: {
                            [Sequelize.Op.in]: propertyIds
                        },
                        transaction_type: 'rent',
                        status: {
                            [Sequelize.Op.in]: ["Verified", "Check In", "Check Out", "Cancelled and Refunded"]   // contoh: Verified, Canceled, Refunded
                        }
                    },
                    attributes: [
                        [Sequelize.fn('SUM', Sequelize.col('nominal')), 'total']
                    ],
                    raw: true
                });

                totalEarnings = earningsResult[0]?.total || 0;
            }

            // Ambil transaksi berdasarkan property_id
            let transactionsManaged = [];
            if (propertyIds.length > 0) {
                transactionsManaged = await TransactionRepository.customFilter({
                    property_id: {
                        [Sequelize.Op.in]: propertyIds
                    }
                });
            }

            return {
                total_properties: ownedPropertiesCount,
                total_earnings: parseFloat(totalEarnings),
                transactionsManaged: transactionsManaged
            };

        } catch (err) {
            console.error(">> Error di PropertyService.getDashboard:", err);
            const error = new Error("Gagal mengambil data dashboard");
            error.status = 500;
            error.code = "GET_DASHBOARD_FAILED";
            throw error;
        }
    }

    /**
     * Ambil satu properties beserta relasinya
     * @param {String} id untuk id properti
     * @param {String} type untuk tipe properti
     * @returns {Promise<Array>}
     */
    async getOne(id, _, type) {

        try {
            let property;

            const dataProperty = await PropertyRepository.getOnePropertyById(id)
            const relation = dataProperty.toJSON().property_users
            switch (dataProperty.property_type.toLowerCase()) {
                case "apartement":
                    property = await ApartementRepository.findById(id);
                    break;

                case "boarding":
                    property = await BoardingRepository.findById(id);
                    break;

                case "commercial":
                    property = await CommercialRepository.findById(id);
                    break;

                case "house":
                    property = await HouseRepository.findById(id);
                    break;

                default:
                    const error = new Error(`Tipe property '${type}' tidak didukung`);
                    error.status = 400;
                    error.code = "PROPERTY_TYPE_NOT_SUPPORTED";
                    throw error;
            }

            if (!property) {
                const error = new Error("Property tidak ditemukan");
                error.status = 404;
                error.code = "PROPERTY_NOT_FOUND";
                throw error;
            }

            // Ambil semua review untuk property ini
            const allReviews = await ReviewRepository.getReviewsByProperty(id);

            // Pastikan photo adalah array, bukan string
            const propertyData = property.toJSON ? property.toJSON() : property;
            if (!Array.isArray(propertyData.photo)) {
                propertyData.photo = propertyData.photo ? [propertyData.photo] : [];
            }


            // Sertakan review ke object property
            return {
                ...propertyData,
                reviews: allReviews,
                relation

            };
        } catch (err) {
            console.error(">> Error di PropertyService.getOne:", err);
            const error = new Error("Gagal mengambil data property");
            error.status = 500;
            error.code = "GET_PROPERTY_FAILED";
            throw error;
        }
    }

    /**
     * Buat property baru berdasarkan type
     * @param {Object} dataProperty
     * @param {string} dataProperty.type apartement|boarding|commercial|house
     * @param {Object} dataProperty.property_data data umum untuk tabel properties
     * @param {Object} dataProperty.detail_data data spesifik berdasarkan type
     * @param {Object} dataLogin - object hasil auth (ada id)
     * @returns {Promise<Object>}
     */
    async create(dataProperty, dataLogin) {
        const { type, property_data, detail_data } = dataProperty;
        let detailProperty;
        let error;

        try {

            switch (type.toLowerCase()) {
                case "apartement":
                    detailProperty = await ApartementRepository.create(property_data, detail_data);
                    break;

                case "boarding":
                    detailProperty = await BoardingRepository.create(property_data, detail_data);
                    break;

                case "commercial":
                    detailProperty = await CommercialRepository.create(property_data, detail_data);
                    break;

                case "house":
                    detailProperty = await HouseRepository.create(property_data, detail_data);
                    break;

                default:
                    error = new Error(`Tipe property '${type}' tidak didukung`);
                    error.status = 400;
                    error.code = "PROPERTY_TYPE_NOT_SUPPORTED";
            }
            return await PropertyRepository.addUserToProperty(detailProperty.id, dataLogin.id, "owner");
        } catch (error) {

            console.error(error);
            throw error
        }

    }

    /**
     * Buat property baru berdasarkan type
     * @param {Object} dataProperty
     * @param {string} dataProperty.type apartement|boarding|commercial|house
     * @param {Object} dataProperty.property_data data umum untuk tabel properties
     * @param {Object} dataProperty.detail_data data spesifik berdasarkan type
     * @param {Object} dataLogin - object hasil auth (ada id)
     * @returns {Promise<Object>}
     */
    async update(_, dataProperty, id) {
        const { type, property_data, detail_data } = dataProperty;

        switch (type.toLowerCase()) {
            case "apartement":
                return await ApartementRepository.update(id, property_data, detail_data);

            case "boarding":
                return await BoardingRepository.update(id, property_data, detail_data);

            case "commercial":
                return await CommercialRepository.update(id, property_data, detail_data);

            case "house":
                return await HouseRepository.update(id, property_data, detail_data);

            default:
                const error = new Error(`Tipe property '${type}' tidak didukung`);
                error.status = 400;
                error.code = "PROPERTY_TYPE_NOT_SUPPORTED";
                throw error;
        }
    }

    async getPropertyManager(propertyId) {
        const property = await PropertyRepository.getOnePropertyById(propertyId);

        if (!property) {
            const error = new Error("Property tidak ditemukan");
            error.status = 404;
            throw error;
        }

        // Ambil hanya property_users dengan relation_type 'management'
        const managers = property.property_users.filter((pu) => pu.relation_type === "management");

        return managers;
    }

    /**
     * Wrapper service memanggil repository addUserToProperty
     *
     * @param {string} propertyId
     * @param {string} userId
     * @param {"owner"|"tenant"|"management"} relationType
     * @param {string|null} rentFrom
     * @param {string|null} rentTo
     * @returns {Promise<Object>}
     */

    async addManager({ property_id, email }) {
        try {
            // validasi simple
            if (!property_id || !email) {
                throw new Error("property_id, userId dan relationType wajib diisi");
            }

            const user = await UsersRepository.getUserByEmail(email);

            // panggil repository
            const result = await PropertyRepository.addUserToProperty(
                property_id,
                user.id,
                "management",
                null,
                null
            );

            return {
                success: true,
                message: "User successfully added to property",
                data: result,
            };
        } catch (err) {
            console.error("Service::addUserToProperty Error:", err);
            throw err;
        }
    }

    async deleteManager(officer_id, property_id) {
        try {
            // Validasi input
            if (!property_id || !officer_id) {
                throw new Error("property_id dan officer_id wajib diisi");
            }

            // Panggil repository untuk menghapus relasi
            const result = await PropertyRepository.removeUserFromProperty(
                property_id,
                officer_id,
                "management"
            );

            return {
                success: true,
                message: "User successfully removed from property",
                data: result,
            };
        } catch (err) {
            console.error("Service::deleteManager Error:", err);
            throw err;
        }
    }

    async managedProperty(userId) {
        try {
            return await PropertyRepository.getPropertiesByRelation(userId, "management");
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async canceledTransaction(transactionId, dataLogin) {
        try {
            return await TransactionRepository.canceledTransaction(transactionId);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

module.exports = new PropertyService();
