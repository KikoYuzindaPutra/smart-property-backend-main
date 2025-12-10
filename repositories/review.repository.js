const { reviews, transactions, properties, users, property_users } = require("../models");

class ReviewRepository {
    /**
     * Ambil semua review berdasarkan property_id
     */
    async getReviewsByProperty(propertyId) {
        try {



            const allReview = await reviews.findAll({
                include: [
                    {
                        model: transactions,
                        as: "transaction",
                        required: true,
                        where: { property_id: propertyId }, // Filter by property_id directly on transactions
                        include: [
                            {
                                model: properties,
                                as: "property",
                                // Remove required: true and where clause here since we're filtering on transactions
                            },
                            {
                                model: users,
                                as: "createdByUser",
                                attributes: ["id", "name", "email"],
                            },
                        ],
                    },
                ],
                order: [["created_at", "DESC"]],
            });



            const transformed = allReview.map((r) => ({
                id: r.id,
                transaction_id: r.transaction_id,
                created_by: r.transaction.createdByUser.name,
                rating: r.rating,
                comment: r.comment,
                created_at: r.created_at,
                reply_comment: r.reply_comment,
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
                allReview: transformed,
            };
        } catch (error) {
            console.error(">> Error getReviewsByProperty:", error);
            throw error;
        }
    }

    /**
     * Ambil review berdasarkan user & property
     * (hanya boleh review 1 kali)
     */
    async getReviewByUser(propertyId, userId) {
        try {
            return await reviews.findOne({
                include: [
                    {
                        model: transactions,
                        as: "transaction",
                        required: true,
                        where: { created_by: userId },
                        include: [
                            {
                                model: properties,
                                as: "property",
                                where: { id: propertyId },
                                required: true,
                            },
                        ],
                    },
                ],
            });
        } catch (error) {
            console.error(">> Error getReviewByUser:", error);
            throw error;
        }
    }

    /**
     * Buat review baru
     */
    async createReview(data) {
        try {
            return await reviews.create(data);
        } catch (error) {
            console.error(">> Error createReview:", error);
            throw error;
        }
    }

    /**
     * Tambahkan reply comment untuk review tertentu
     * @param {string} reviewId - ID review yang akan direply
     * @param {string} userId - ID user yang membuat reply
     * @param {string} replyComment - Isi reply comment
     */
    async addReplyToReview(reviewId, userId, replyComment) {
        try {
            // Validate review exists
            const review = await reviews.findByPk(reviewId, {
                include: [
                    {
                        model: transactions,
                        as: "transaction",
                        include: [
                            {
                                model: properties,
                                as: "property",
                                include: [{
                                    model: property_users,
                                    as: "property_users",
                                    where: { relation_type: "owner" },
                                    required: true
                                }]
                            }
                        ]
                    }
                ]
            });

            if (!review) {
                const error = new Error("Review not found");
                error.status = 404;
                error.code = "REVIEW_NOT_FOUND";
                throw error;
            }

            // Check if user is the property owner
            const isOwner = review.transaction.property.property_users.some(pu => pu.user_id === userId);
            if (!isOwner) {
                const error = new Error("Only property owner can reply to reviews");
                error.status = 403;
                error.code = "NOT_AUTHORIZED_TO_REPLY";
                throw error;
            }

            // Update review with reply comment
            return await review.update({
                reply_comment: replyComment
            });
        } catch (error) {
            console.error(">> Error addReplyToReview:", error);
            throw error;
        }
    }

    /**
     * Update review berdasarkan review_id + pastikan transaksi miliknya sendiri
     */
    async updateReview(reviewId, userId, updates) {
        try {
            // validate ownership
            const review = await reviews.findOne({
                where: { id: reviewId },
                include: [
                    {
                        model: transactions,
                        as: "transaction",
                        where: { created_by: userId },
                        required: true,
                    },
                ],
            });

            if (!review) return null;

            return await review.update(updates);
        } catch (error) {
            console.error(">> Error updateReview:", error);
            throw error;
        }
    }

    /**
     * Hapus review (user hanya bisa hapus review miliknya sendiri)
     */
    async deleteReview(reviewId, userId) {
        try {
            const review = await reviews.findOne({
                where: { id: reviewId },
                include: [
                    {
                        model: transactions,
                        as: "transaction",
                        where: { created_by: userId },
                        required: true,
                    },
                ],
            });

            if (!review) return null;

            return await review.destroy();
        } catch (error) {
            console.error(">> Error deleteReview:", error);
            throw error;
        }
    }

    /**
     * Ambil review berdasarkan ID
     */
    async getReviewById(id) {
        try {
            return await reviews.findByPk(id, {
                include: [
                    {
                        model: transactions,
                        as: "transaction",
                        include: [
                            { model: properties, as: "property" },
                            {
                                model: users,
                                as: "createdByUser",
                                attributes: ["id", "name", "email"],
                            },
                        ],
                    },
                ],
            });
        } catch (error) {
            console.error(">> Error getReviewById:", error);
            throw error;
        }
    }

    /**
     * Filter review (rating saja yang realistis)
     */
    async filterReviews(filter = {}) {
        try {
            return await reviews.findAll({
                where: filter,
                include: [
                    {
                        model: transactions,
                        as: "transaction",
                        include: [
                            { model: users, as: "createdByUser", attributes: ["id", "name"] },
                        ],
                    },
                ],
            });
        } catch (error) {
            console.error(">> Error filterReviews:", error);
            throw error;
        }
    }
}

module.exports = new ReviewRepository();
