const { PropertyRepository, TransactionRepository } = require("../repositories");
const { Op } = require("sequelize");
class RequestService {

    /**
     * Ambil semua properti yang sedang di air
     * @param {object} dataLogin datalogin untuk mengambil id
     * @returns {Promise<Object|null>}
     */

    async getAll(dataLogin) {
        // transaksi air yang dikirim oleh user
        const requestRequest = await TransactionRepository.getAllTransaction("request", dataLogin.id);

        // property yang dikelola user
        const propertyManaged = await PropertyRepository.getPropertiesByRelation(dataLogin.id, "management");

        const propertyIds = propertyManaged.map((p) => p.property_id);

        // ambil semua transaksi berdasarkan property yang user kelola
        let managedTransactions = [];
        if (propertyIds.length > 0) {
            managedTransactions = await TransactionRepository.customFilter({
                property_id: { [Op.in]: propertyIds },
                transaction_type: "request"
            });
        }

        const request = {
            sent_request_invocie: requestRequest,
            received_request_invoice: managedTransactions
        };

        return request;
    }

    async getOne(id) {
        return await TransactionRepository.getTransactionById(id)
    }

    /**
    * Buat air properti baru
    * @param {Object} dataRequest data tagihan air
    * @param {Object} dataLogin data login user
    * @returns {Promise<Object>}
    */
    async create(dataRequest, dataLogin) {

        try {
            const now = Date.now();
            const property = await PropertyRepository.getOnePropertyById(dataRequest.property_id);

            if (!property) {
                const error = new Error("Properti tidak ditemukan");
                error.status = 404;
                error.code = "PROPERTY_NOT_FOUND";
                throw error;
            }

            // ✅ Buat transaksi request
            const datarequestInvoice = {
                property_id: property.id,
                transaction_type: "request",
                transaction_date: now,
                photo: null,
                created_by: dataLogin.id,
                nominal: dataRequest.quantity,
            };

            return await TransactionRepository.createTransaction(datarequestInvoice);

        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    /**
     * Hapus transaksi berdasarkan transactionId
     * @param {String|Number} transactionId id transaksi
     * @param {Object} dataLogin data login user
     * @returns {Promise<Object>}
     */
    async update(dataLogin, _, transactionId) {
        try {
            const now = Date.now();

            const transactionRequest = await TransactionRepository.getTransactionById(transactionId);
            const property = await PropertyRepository.getOnePropertyById(transactionRequest.property_id);


            if (!transactionRequest) {
                const error = new Error("Transaksi tidak ditemukan");
                error.status = 404;
                error.code = "TRANSACTION_NOT_FOUND";
                throw error;
            }

            const existingRent = await TransactionRepository.customFilter({
                property_id: property.id,
                transaction_type: "rent",
                status: "Check In",
                expired_date: { [Op.gt]: now }
            });

            if (existingRent.length > 0) {
                const error = new Error("Properti sedang disewa, tidak bisa membuat deposit baru");
                error.status = 400;
                error.code = "PROPERTY_ALREADY_RENTED";
                throw error;
            }

            // ✅ Validasi minimum quantity
            if (property.min_rent > transactionRequest.nominal) {
                const error = new Error(`Minimal sewa adalah ${property.min_rent} ${property.rent_type}`);
                error.status = 400;
                error.code = "MIN_RENT_NOT_REACHED";
                throw error;
            }



            // ✅ Buat transaksi deposit
            const dataDeposit = {
                property_id: property.id,
                transaction_type: "deposit",
                nominal: property.deposit,
                transaction_date: now,
                photo: null,
                created_by: transactionRequest.created_by,
                status: "Verified"
            };

            const depositTransaction = await TransactionRepository.createTransaction(dataDeposit);

            // Helper untuk pastikan nilai epoch dalam milidetik
            function toMillis(v) {
                if (v instanceof Date) return v.getTime();
                if (typeof v === "string" && /^\d+$/.test(v)) return Number(v); // "1765051699246"
                if (typeof v === "number") {
                    // jika 10 digit (detik), konversi ke ms
                    if (v < 1e11) return v * 1000;
                    return v;
                }
                return Date.now();
            }

            const nowMillis = toMillis(now);
            const qty = Number(transactionRequest.nominal) || 0;
            let rentExpiredDate = new Date(nowMillis);
            switch (property.rent_type) {
                case "daily":
                    // gunakan setDate untuk tambah hari
                    rentExpiredDate.setDate(rentExpiredDate.getDate() + qty);
                    break;
                case "monthly":
                    // simpan currentMonth dulu untuk deteksi overflow (opsional)
                    rentExpiredDate.setMonth(rentExpiredDate.getMonth() + qty);
                    break;
                case "yearly":
                    rentExpiredDate.setFullYear(rentExpiredDate.getFullYear() + qty);
                    break;
                default:
                    // jika rent_type unknown, jangan ubah date
                    console.warn("Unknown rent_type:", property.rent_type);
            }

            const rentExpired = rentExpiredDate.getTime();
            const rentNominal = parseFloat((transactionRequest.nominal * property.rent_price).toFixed(2));

            const rentTranscation = {
                property_id: property.id,
                transaction_type: "rent",
                nominal: rentNominal,
                transaction_date: now,
                expired_date: rentExpired,
                created_by: transactionRequest.created_by,
                parent_transaction_id: depositTransaction.id
            };

            await TransactionRepository.createTransaction(rentTranscation);


            await TransactionRepository.deleteTransaction(transactionId);

            return {
                message: "Transaksi berhasil dihapus",
                transactionId,
            };

        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    /**
     * Hapus transaksi berdasarkan transactionId
     * @param {String|Number} transactionId id transaksi
     * @param {Object} dataLogin data login user
     * @returns {Promise<Object>}
     */
    async delete(transactionId) {
        try {
            const transaction = await TransactionRepository.getTransactionById(transactionId);

            if (!transaction) {
                const error = new Error("Transaksi tidak ditemukan");
                error.status = 404;
                error.code = "TRANSACTION_NOT_FOUND";
                throw error;
            }


            await TransactionRepository.deleteTransaction(transactionId);

            return {
                message: "Transaksi berhasil dihapus",
                transactionId,
            };

        } catch (error) {
            console.error(error);
            throw error;
        }
    }


    /**
    * Buat air properti baru
    * @param {Object} dataRequest data tagihan air
    * @param {Object} dataLogin data login user
    * @returns {Promise<Object>}
    */
    async extendRent(dataRequest, dataLogin) {

        try {
            const now = Date.now();
            const property = await PropertyRepository.getOnePropertyById(dataRequest.property_id);

            if (!property) {
                const error = new Error("Properti tidak ditemukan");
                error.status = 404;
                error.code = "PROPERTY_NOT_FOUND";
                throw error;
            }

            // ✅ Buat transaksi request
            const datarequestInvoice = {
                property_id: property.id,
                transaction_type: "request",
                transaction_date: now,
                photo: null,
                created_by: dataLogin.id,
                nominal: dataRequest.quantity,
            };

            return await TransactionRepository.createTransaction(datarequestInvoice);

        } catch (error) {
            console.error(error);
            throw error;
        }
    }

}

module.exports = new RequestService();
