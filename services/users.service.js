const { UsersRepository } = require("../repositories");

class UsersService {
    /**
     * Ambil data user yang sedang login
     */
    async getOne(_, dataLogin) {
        return await UsersRepository.getUserById(dataLogin.id);
    }

    /**
     * Update data diri user yang sedang login
     * @param {Object} dataLogin - object hasil auth (ada id)
     * @param {Object} updateData - data baru (misal { name, phone })
     * @returns {Promise<Object>}
     */
    async update(dataLogin, updateData) {
        const { email, phone_number } = updateData;
        // Cek email
        if (email) {
            const existingEmail = await UsersRepository.getUserByEmail(email);
            if (existingEmail) {
                const error = new Error(`User dengan email ${email} sudah terdaftar`);
                error.status = 400;
                error.code = "EMAIL_ALREADY_EXISTS";
                throw error;
            }
        }

        // Cek phone_number
        if (phone_number) {
            const existingPhone = await UsersRepository.customFilterUser({ phone_number });
            if (existingPhone && existingPhone.length > 0) {
                const error = new Error(
                    `User dengan nomor ${phone_number} sudah terdaftar`
                );
                error.status = 400;
                error.code = "PHONE_ALREADY_EXISTS";
                throw error;
            }
        }
        const updated = await UsersRepository.updateUser(
            dataLogin.id,
            updateData
        );

        if (!updated) {
            throw new Error("Update gagal, user tidak ditemukan");
        }

        return await UsersRepository.getUserById(dataLogin.id);
    }
}

module.exports = new UsersService();
