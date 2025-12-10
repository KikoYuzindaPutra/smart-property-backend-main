const { TransactionRepository, ReviewRepository } = require("../repositories");

class ReviewService {
    /**
     * Buat review baru
     * @param {Object} data - data review
     * @param {string} data.transaction_id - ID transaksi
     * @param {string} data.rating - rating property
     * @param {string} data.comment - komentar review
     * @param {string} userId - ID user yang membuat review
     */
    async create(data, userId) {
        try {
            // Pastikan transaksi milik user
            const transaction = await TransactionRepository.getTransactionById(data.transaction_id);

            if (!transaction || transaction.created_by !== userId.id) {
                const error = new Error("Transaksi tidak valid atau bukan milik user");
                error.status = 403;
                throw error;
            }

            const reviewData = {
                ...data,
                user_id: userId.id,
                created_at: new Date(),
            };

            const review = await ReviewRepository.createReview(reviewData);
            return review;
        } catch (err) {
            console.error(">> Error di ReviewService.create:", err);
            throw err;
        }
    }

    /**
     * Update review
     * @param {string} reviewId - ID review
     * @param {string} userId - ID user
     * @param {Object} updates - data update (rating, comment)
     */
    async update(reviewId, userId, updates) {
        try {
            updates.updated_at = new Date();

            const updatedReview = await ReviewRepository.updateReview(reviewId, userId, updates);

            if (!updatedReview) {
                const error = new Error("Review tidak ditemukan atau bukan milik user");
                error.status = 404;
                throw error;
            }

            return updatedReview;
        } catch (err) {
            console.error(">> Error di ReviewService.update:", err);
            throw err;
        }
    }

    /**
     * Hapus review
     * @param {string} reviewId - ID review
     * @param {string} userId - ID user
     */
    async delete(reviewId, userId) {
        try {
            const deletedReview = await ReviewRepository.deleteReview(reviewId, userId);

            if (!deletedReview) {
                const error = new Error("Review tidak ditemukan atau bukan milik user");
                error.status = 404;
                throw error;
            }

            return deletedReview;
        } catch (err) {
            console.error(">> Error di ReviewService.delete:", err);
            throw err;
        }
    }

    /**
     * Ambil semua review berdasarkan property
     * @param {string} propertyId
     */
    async getByProperty(propertyId) {
        try {
            const reviews = await ReviewRepository.getReviewsByProperty(propertyId);

            const transformed = reviews.map((r) => ({
                id: r.id,
                transaction_id: r.transaction_id,
                user_id: r.user_id,
                rating: r.rating,
                comment: r.comment,
                reply_comment: r.reply_comment,
                created_at: r.created_at,
                transaction: {
                    id: r.transaction.id,
                    property_id: r.transaction.property_id,
                    transaction_type: r.transaction.transaction_type,
                    nominal: r.transaction.nominal,
                    transaction_date: r.transaction.transaction_date,
                    expired_date: r.transaction.expired_date,
                    photo: r.transaction.photo || "",
                },
            }));

            // Hitung rata-rata rating
            const total_review = transformed.length;
            const average_rating =
                total_review === 0
                    ? 0
                    : transformed.reduce((sum, r) => sum + r.rating, 0) / total_review;

            return {
                average_rating,
                total_review,
                reviews: transformed,
            };
        } catch (err) {
            console.error(">> Error di ReviewService.getByProperty:", err);
            throw err;
        }
    }

    /**
     * Tambahkan reply comment untuk review tertentu
     * @param {string} reviewId - ID review yang akan direply
     * @param {Object} data - data reply
     * @param {string} data.reply_comment - isi reply comment
     * @param {Object} userId - user data yang membuat reply
     */
    async createReply(reviewId, data, userId) {
        try {
            const updatedReview = await ReviewRepository.addReplyToReview(reviewId, userId.id, data.reply_comment);

            return {
                id: updatedReview.id,
                reply_comment: updatedReview.reply_comment,
                updated_at: updatedReview.updated_at
            };
        } catch (err) {
            console.error(">> Error di ReviewService.createReply:", err);
            throw err;
        }
    }

    /**
     * Ambil review user tertentu untuk property tertentu
     */
    async getByUser(propertyId, userId) {
        try {
            const review = await ReviewRepository.getReviewByUser(propertyId, userId);
            return review;
        } catch (err) {
            console.error(">> Error di ReviewService.getByUser:", err);
            throw err;
        }
    }
}

module.exports = new ReviewService();
