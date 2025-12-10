const { PropertyRepository, TransactionRepository } = require("../repositories");
const { Op } = require("sequelize");
class RentingService {

    /**
     * Ambil semua properti yang sedang di sewa
     * @param {object} dataLogin datalogin untuk mengambil id
     * @returns {Promise<Object|null>}
     */

    async getAll(dataLogin) {
        // transaksi sewa yang dikirim oleh user
        const rentRequest = await TransactionRepository.getAllTransaction("rent", dataLogin.id);

        // property yang dikelola user
        const propertyManaged = await PropertyRepository.getPropertiesByRelation(dataLogin.id, "management");

        const propertyIds = propertyManaged.map((p) => p.property_id);

        // ambil semua transaksi berdasarkan property yang user kelola
        let managedTransactions = [];
        if (propertyIds.length > 0) {
            managedTransactions = await TransactionRepository.customFilter({
                property_id: { [Op.in]: propertyIds },
                transaction_type: "rent"
            });
        }

        const rent = {
            sent_rent_request: rentRequest,
            managed_rent_request: managedTransactions
        };

        return rent;
    }

    async getOne(id) {
        return await TransactionRepository.getTransactionById(id)
    }

    /**
    * Buat sewa properti baru
    * @param {Object} dataRent data sewa
    * @param {Object} dataLogin data login user
    * @returns {Promise<Object>}
    */
    async create(dataRent, dataLogin) {
        try {
            const now = Date.now();
            const property = await PropertyRepository.getOnePropertyById(dataRent.property_id);

            if (!property) {
                const error = new Error("Properti tidak ditemukan");
                error.status = 404;
                error.code = "PROPERTY_NOT_FOUND";
                throw error;
            }

            // ✅ Cek apakah properti sedang disewa (langsung expired_date > now)
            const existingRent = await TransactionRepository.customFilter({
                property_id: property.id,
                transaction_type: "rent",
                expired_date: { [Op.gt]: now }
            });

            if (existingRent.length > 0) {
                const error = new Error("Properti sedang disewa, tidak bisa membuat deposit baru");
                error.status = 400;
                error.code = "PROPERTY_ALREADY_RENTED";
                throw error;
            }

            // ✅ Buat transaksi deposit
            const dataDeposit = {
                property_id: property.id,
                transaction_type: "deposit",
                nominal: property.deposit,
                transaction_date: now,
                photo: null,
                created_by: dataLogin.id,
            };

            const depositTransaction = await TransactionRepository.createTransaction(dataDeposit);

            // ✅ Validasi minimum quantity
            if (property.min_rent > dataRent.quantity) {
                const error = new Error(`Minimal sewa adalah ${property.min_rent} ${property.rent_type}`);
                error.status = 400;
                error.code = "MIN_RENT_NOT_REACHED";
                throw error;
            }



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

            // gunakan ini sebagai sumber waktu (jika kamu sudah punya `now`, tetap gunakan tapi dipaksa ke millis)
            const nowMillis = toMillis(now); // aman dari string / detik / Date / number
            // pastikan quantity jadi integer
            const qty = Number(dataRent.quantity) || 0;

            let rentExpiredDate = new Date(nowMillis); // buat Date baru supaya tidak merusak `now`
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



            const rentNominal = parseFloat((dataRent.quantity * property.rent_price).toFixed(2));

            // ✅ Buat transaksi sewa
            const rentTranscation = {
                property_id: property.id,
                transaction_type: "rent",
                nominal: rentNominal,
                transaction_date: now,
                expired_date: rentExpired,
                photo: dataRent.photo,
                created_by: dataLogin.id,
                parent_transaction_id: depositTransaction.id
            };

            await TransactionRepository.createTransaction(rentTranscation);
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

            if (!transaction || transaction.transaction_type !== "rent" || transaction.verified_by) {
                const error = new Error("Transaksi tidak ditemukan");
                error.status = 404;
                error.code = "TRANSACTION_NOT_FOUND";
                throw error;
            }


            await TransactionRepository.updateTransaction(transactionId, {
                verified_by: dataLogin.id,
                status: "Verified"
            });

            await PropertyRepository.addUserToProperty(
                transaction.property_id,
                transaction.created_by,
                "tenant",
                transaction.transaction_date,
                transaction.expired_date
            );

            // kembalikan data terbaru
            return "Data berhasil di verifikasi";

        } catch (error) {
            console.error(error);
            throw error;
        }
    }


    async handleCheckinCheckout(transactionId, status) {
        try {
            await TransactionRepository.updateStatus(transactionId, status);
            return `Transaction updated to ${status}`;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

}

module.exports = new RentingService();
