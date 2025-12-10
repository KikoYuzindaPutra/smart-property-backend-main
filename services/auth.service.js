const { UsersRepository } = require("../repositories");
const { generateOTP } = require("../utils/formatter.utils.js");
const { Transporter } = require("../utils/transporter.utils.js");
const RedisManager = require("../config/redis.config.js");
const { OtpMailSender } = require("../utils/OtpComponent.js");
const { Op } = require("sequelize");
const { Authorization } = require("../middleware/authorization.middleware.js")

class AuthService {

    /**
     * Register user baru
     * @param {Object} data
     * @returns {Promise<Object>}
     */
    async registerAccount(data) {
        const { email, phone_number } = data;

        // Cek email
        const existingEmail = await UsersRepository.getUserByEmail(email);
        if (existingEmail) {
            const error = new Error(`User dengan email ${email} sudah terdaftar`);
            error.status = 400;
            error.code = "EMAIL_ALREADY_EXISTS";
            throw error;
        }

        // Cek phone_number
        const existingPhone = await UsersRepository.customFilterUser({ phone_number });
        if (existingPhone && existingPhone.length > 0) {
            const error = new Error(
                `User dengan nomor ${phone_number} sudah terdaftar`
            );
            error.status = 400;
            error.code = "PHONE_ALREADY_EXISTS";
            throw error;
        }

        // Jika lolos validasi → buat user baru
        return await UsersRepository.createUser(data);
    }


    async sendOtpEmail(email) {
        const user = await UsersRepository.getUserByEmail(email);
        if (!user) {
            const error = new Error(`User dengan email ${email} tidak ditemukan`);
            error.status = 404;
            error.code = "USER_NOT_FOUND";
            throw error;
        }

        const otp = generateOTP();
        await RedisManager.setKey(email, otp, 300);

        const mailOptions = OtpMailSender(user, otp, process.env.EMAIL_USER);
        Transporter.sendEmail(mailOptions);
    }

    async sendOtpPhoneNumber(phone_number) {
        const user = await UsersRepository.customFilterUser({ phone_number: phone_number });
        if (!user) {
            const error = new Error(`User dengan nomor ${phone_number} tidak ditemukan`);
            error.status = 404;
            error.code = "USER_NOT_FOUND";
            throw error;
        }

        const otp = generateOTP();
        await RedisManager.setKey(phone_number, otp, 300);
        Transporter.sendOtp(user.name, otp);
    }

    async validateOtp({ identifier, otp }) {
        const storedOtp = await RedisManager.getKey(identifier);

        if (!storedOtp) {
            const error = new Error("OTP tidak ditemukan atau sudah kadaluarsa");
            error.status = 400;
            error.code = "OTP_EXPIRED";
            throw error;
        }

        if (storedOtp !== otp) {
            const error = new Error("OTP tidak valid");
            error.status = 400;
            error.code = "OTP_INVALID";
            throw error;
        }

        await RedisManager.deleteKey(identifier);
    }

    async login({ identifier }) {
        const filter = {
            [Op.or]: [
                { email: identifier },
                { phone_number: identifier }
            ]
        }

        const findUser = await UsersRepository.customFilterUser(filter)
        const dataUser = findUser[0].get({ plain: true });

        const { Token } = Authorization.encryption(dataUser, "12h");

        return {
            sessionName: dataUser.name,
            sessionId: dataUser.id + dataUser.name,
            token: Token,
            sessionTTL: 43200,
            payload: dataUser
        }
    }

}

module.exports = new AuthService();
