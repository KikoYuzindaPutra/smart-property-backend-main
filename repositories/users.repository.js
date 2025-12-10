const { users } = require("../models");

class UsersRepository {
    /**
     * Buat user baru
     * @param {Object} data
     * @returns {Promise<Object>}
     */
    async createUser(data) {
        try {
            const newUser = await users.create(data);
            return newUser;
        } catch (error) {
            console.error(">> Error creating user:", error);
            throw error;
        }
    }

    /**
     * Ambil semua user
     * @returns {Promise<Array>}
     */
    async getAllUsers() {
        try {
            return await users.findAll();
        } catch (error) {
            console.error(">> Error fetching users:", error);
            throw error;
        }
    }

    /**
     * Cari user berdasarkan ID
     * @param {string} id
     * @returns {Promise<Object|null>}
     */
    async getUserById(id) {
        try {
            return await users.findByPk(id);
        } catch (error) {
            console.error(`>> Error fetching user by id (${id}):`, error);
            throw error;
        }
    }

    /**
     * Cari user berdasarkan email
     * @param {string} email
     * @returns {Promise<Object|null>}
     */
    async getUserByEmail(email) {
        try {
            return await users.findOne({ where: { email } });
        } catch (error) {
            console.error(`>> Error fetching user by email (${email}):`, error);
            throw error;
        }
    }

    /**
     * Cari banyak user dengan filter (optional)
     * @param {Object} filter - contoh: { name: "Adrian" }
     * @returns {Promise<Array>}
     */
    async customFilterUser(filter = {}) {
        try {
            return await users.findAll({ where: filter });
        } catch (error) {
            console.error(">> Error fetching users with filter:", filter, error);
            throw error;
        }
    }

    /**
     * Update user
     * @param {string} id
     * @param {Object} data
     * @returns {Promise<number>} jumlah baris yang diupdate
     */
    async updateUser(id, data) {
        try {
            const [updated] = await users.update(data, {
                where: { id },
            });
            return updated; // 0 atau 1
        } catch (error) {
            console.error(`>> Error updating user (${id}):`, error);
            throw error;
        }
    }

    /**
     * Hapus user
     * @param {string} id
     * @returns {Promise<number>} jumlah baris yang dihapus
     */
    async deleteUser(id) {
        try {
            return await users.destroy({
                where: { id },
            });
        } catch (error) {
            console.error(`>> Error deleting user (${id}):`, error);
            throw error;
        }
    }
}

module.exports = new UsersRepository();
