const { PropertyRepository, TransactionRepository } = require("../repositories");
const { Op } = require("sequelize");
class DepositService {

    /**
     * Ambil semua properti yang sedang di sewa
     * @param {object} dataLogin datalogin untuk mengambil id
     * @returns {Promise<Object|null>}
     */
    async getAll(dataLogin) {
        // transaksi sewa yang dikirim oleh user
        const depositRequest = await TransactionRepository.getAllTransaction("deposit", dataLogin.id);

        // property yang dikelola user
        const propertyManaged = await PropertyRepository.getPropertiesByRelation(dataLogin.id, "owner");

        const propertyIds = propertyManaged.map((p) => p.property_id);

        // ambil semua transaksi berdasarkan property yang user kelola
        let managedTransactions = [];
        if (propertyIds.length > 0) {
            managedTransactions = await TransactionRepository.customFilter({
                property_id: { [Op.in]: propertyIds },
                transaction_type: "deposit"
            });
        }

        const deposit = {
            sent_deposit_request: depositRequest,
            managed_deposit_request: managedTransactions
        };

        return deposit;
    }


    async getOne(id) {
        return await TransactionRepository.getTransactionById(id)
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

            if (!transaction || transaction.transaction_type !== "deposit" || transaction.verified_by) {
                const error = new Error("Transaksi tidak ditemukan");
                error.status = 404;
                error.code = "TRANSACTION_NOT_FOUND";
                throw error;
            }

            const propertyData = await PropertyRepository.getOnePropertyById(transaction.property_id);

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

module.exports = new DepositService();
