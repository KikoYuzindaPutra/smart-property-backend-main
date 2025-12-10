const { PropertyRepository, TransactionRepository } = require("../repositories");
const { Op } = require("sequelize");
class ElectricityService {

    /**
     * Ambil semua properti yang sedang di air
     * @param {object} dataLogin datalogin untuk mengambil id
     * @returns {Promise<Object|null>}
     */

    async getAll(dataLogin) {
        // transaksi air yang dikirim oleh user
        const electricityRequest = await TransactionRepository.getAllTransaction("electricity", dataLogin.id);

        // property yang dikelola user
        const propertyManaged = await PropertyRepository.getPropertiesByRelation(dataLogin.id, "management");

        const propertyIds = propertyManaged.map((p) => p.property_id);

        // ambil semua transaksi berdasarkan property yang user kelola
        let managedTransactions = [];
        if (propertyIds.length > 0) {
            managedTransactions = await TransactionRepository.customFilter({
                property_id: { [Op.in]: propertyIds },
                transaction_type: "electricity"
            });
        }

        const electricity = {
            sent_electricity_invocie: electricityRequest,
            received_electricity_invoice: managedTransactions
        };

        return electricity;
    }

    async getOne(id) {
        return await TransactionRepository.getTransactionById(id)
    }

    /**
    * Buat air properti baru
    * @param {Object} dataElectricity data tagihan air
    * @param {Object} dataLogin data login user
    * @returns {Promise<Object>}
    */
    async create(dataElectricity, dataLogin) {
        try {
            const now = Date.now();
            const property = await PropertyRepository.getOnePropertyById(dataElectricity.property_id);

            if (!property) {
                const error = new Error("Properti tidak ditemukan");
                error.status = 404;
                error.code = "PROPERTY_NOT_FOUND";
                throw error;
            }

            // ✅ Buat transaksi deposit
            const dataelectricityInvoice = {
                property_id: property.id,
                transaction_type: "electricity",
                nominal: dataElectricity.nominal,
                transaction_date: now,
                photo: dataElectricity.photo,
                created_by: dataLogin.id,
            };

            return await TransactionRepository.createTransaction(dataelectricityInvoice);

        } catch (error) {
            console.error(error);
            throw error;
        }
    }


    /**
     * Update verified_by di transaksi tertentu
     * @param {string} transactionId id transaksi
     * @param {Object} dataLogin data login user
     * @returns {Promise<Object>}
     */
    async update(dataLogin, _, transactionId) {
        try {
            const transaction = await TransactionRepository.getTransactionById(transactionId);

            if (!transaction || transaction.transaction_type !== "electricity" || transaction.verified_by) {
                const error = new Error("Transaksi tidak ditemukan");
                error.status = 404;
                error.code = "TRANSACTION_NOT_FOUND";
                throw error;
            }

            const propertyData = await PropertyRepository.getOnePropertyById(transaction.property_id);

            // cek apakah user login punya akses (owner / management)
            const isAuthorized = propertyData.property_users.some(
                (pu) =>
                    pu.user_id === dataLogin.id &&
                    ["owner", "management"].includes(pu.relation_type)
            );

            if (!isAuthorized) {
                const error = new Error("Anda tidak memiliki akses untuk memverifikasi transaksi ini");
                error.status = 403;
                error.code = "UNAUTHORIZED";
                throw error;
            }

            await TransactionRepository.updateTransaction(transactionId, {
                verified_by: dataLogin.id,
                status: "Verified"
            });



            // kembalikan data terbaru
            return "Data berhasil di verifikasi";

        } catch (error) {
            console.error(error);
            throw error;
        }
    }





}

module.exports = new ElectricityService();
