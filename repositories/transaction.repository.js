// repositories/transactions.repository.js
const { transactions, properties, users } = require("../models");

class TransactionsRepository {
    /**
     * Ambil semua transaksi berdasarkan type (misal: "rent")
     * Tambahkan status jika verified_by masih null
     * @param {string} trxType contoh: "rent"
     * @returns {Promise<Array>}
     */
    async getAllTransaction(trxType, userId) {
        try {
            const trxList = await transactions.findAll({
                where: {
                    transaction_type: trxType,
                    created_by: userId
                },
                include: [
                    {
                        model: users,
                        as: "verifiedByUser", // alias harus sesuai dengan associate di model
                        attributes: ["id", "name", "email"],
                    },
                    {
                        model: users,
                        as: "createdByUser",
                        attributes: ["id", "name", "email"],
                    },
                    {
                        model: properties,
                        as: "property",
                        attributes: ["id", "name", "full_address", "province", "city"],
                    },
                    {
                        model: transactions,
                        as: "parentTransaction",

                    },
                    {
                        model: transactions,
                        as: "childTransactions",
                    },
                ]
            });

            return trxList;

        } catch (error) {
            console.error(">> Error getAllTransactionsWithStatus:", error);
            throw error;
        }
    }


    /**
     * Buat transaksi baru
     * @param {Object} data transaction data
     */
    async createTransaction(data) {
        return await transactions.create(data);
    }

    /**
     * Ambil transaksi berdasarkan ID dengan relasi lengkap
     * @param {string} id
     * @returns {Promise<Object|null>}
     */
    async getTransactionById(id) {
        return await transactions.findByPk(id, {
            include: [
                {
                    model: users,
                    as: "createdByUser", // alias creator
                    foreignKey: "created_by",
                    attributes: ["id", "name", "email"], // pilih field yang penting saja
                },
                {
                    model: users,
                    as: "verifiedByUser", // alias verifier
                    foreignKey: "verified_by",
                    attributes: ["id", "name", "email"],
                },
                {
                    model: properties,
                    as: "property",
                },
                {
                    model: transactions,
                    as: "parentTransaction",

                },
                {
                    model: transactions,
                    as: "childTransactions",

                },
            ],
        });
    }


    /**
    * Filter commercial houses dengan custom filter
    * @param {Object} filter contoh: { property_id: prp-12341... }
    * @returns {Promise<Array>}
    */
    async customFilter(filter = {}) {
        try {
            return await transactions.findAll({
                where: filter,
                include: [
                    {
                        model: users,
                        as: "createdByUser", // alias creator
                        foreignKey: "created_by",
                        attributes: ["id", "name", "email"], // pilih field yang penting saja
                    },
                    {
                        model: users,
                        as: "verifiedByUser", // alias verifier
                        foreignKey: "verified_by",
                        attributes: ["id", "name", "email"],
                    },
                    {
                        model: properties,
                        as: "property",
                    },
                    {
                        model: transactions,
                        as: "parentTransaction",

                    },
                    {
                        model: transactions,
                        as: "childTransactions",
                    },
                ],
            });
        } catch (error) {
            console.error(">> Error filtering commercial houses:", filter, error);
            throw error;
        }
    }

    async updateStatus(transactionId, status) {

        const trx = await transactions.findOne({ where: { id: transactionId } });

        if (!trx) {
            throw new Error("Transaction not found");
        }

        if (status !== "Check In" && status !== "Check Out") {
            throw new Error("Invalid status value");
        }


        await trx.update({ status: status });

        return {
            message: `Transaction updated to Cancelled and Refunded`,
            transaction: trx
        };
    }

    async canceledTransaction(transactionId) {
        const trx = await transactions.findOne({ where: { id: transactionId } });

        if (!trx) {
            throw new Error("Transaction not found");
        }

        await trx.update({ status: "Cancelled and Refunded" });

        return {
            message: `Transaction updated to Cancelled and Refunded`,
            transaction: trx
        };
    }

    /**
     * Update transaksi
     * @param {string} id
     * @param {Object} updates field yang diupdate
     * @returns {Promise<[number, Object[]]>} hasil update
     */
    async updateTransaction(id, updates) {
        return await transactions.update(updates, { where: { id } });
    }

    /**
     * Hapus transaksi
     * @param {string} id
     * @returns {Promise<number>} jumlah baris yang dihapus
     */
    async deleteTransaction(id) {
        return await transactions.destroy({ where: { id } });
    }

}

// Export dalam bentuk instance biar langsung bisa dipakai
module.exports = new TransactionsRepository();
