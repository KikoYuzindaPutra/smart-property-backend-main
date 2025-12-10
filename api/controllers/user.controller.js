const { BaseController } = require("./base.controller");
const RedisManager = require("../../config/redis.config");

class UserController extends BaseController {
    constructor(services) {
        super(services);
    }

    async login(req, res) {
        try {
            await this.service.validateOtp(req.body)
            const sessionData = await this.service.login(req.body)
            await RedisManager.setKey(`users:${sessionData.sessionId}`, sessionData.token, sessionData.sessionTTL);
            res.cookie("users", sessionData.sessionId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 12 * 60 * 60 * 1000,
                sameSite: "Lax",
                signed: true,
            });

            this.responseSuccess(
                res,
                200,
                "Selamat datang di aplikasi Smart Property Management System",
                sessionData.payload
            )
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({ status, message: error.message, error });
        }
    }

    async requestOtp(req, res) {
        let transaction;
        try {
            const method = req.body?.login_type

            if (method === "email") {
                await this.service.sendOtpEmail(req.body.email)
            } else {
                await this.service.sendOtpPhoneNumber(req.body.phone_number)
            }

            this.responseSuccess(
                res,
                200,
                `Kami telah mengirimkan kode otp ke ${method} anda`,
                null
            );

        } catch (error) {
            if (transaction) await transaction.rollback();
            this.responseError(res, error)
        }
    }

    async register(req, res) {
        let transaction;
        try {

            await this.service.registerAccount(req.body)

            this.responseSuccess(
                res,
                200,
                `Akun anda berhasil di registrasi silahkan login menggunankan email atau nomor telfon`,
                null
            );

        } catch (error) {
            if (transaction) await transaction.rollback();
            this.responseError(res, error)
        }
    }

}

module.exports = { UserController };
