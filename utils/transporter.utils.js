const nodemailer = require("nodemailer");
const axios = require("axios");
const FormData = require("form-data");

class Transporter {
    static getTransporter() {
        try {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            return transporter;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    static async sendEmail(mailOptions) {
        try {
            const transporter = this.getTransporter();
            await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    static async sendOtp(name, phone) {
        try {
            const formData = new FormData();
            formData.append("secret", process.env.WA_OTP_SECRET);
            formData.append("type", "whatsapp");
            formData.append("message", `Selamat datang kak ${name} di Smart Property Management System, silahkan gunakan otp berikut {{otp}} untuk masuk kedalam aplikasi`);
            formData.append("phone", `+${phone}`);
            formData.append("expire", 300);
            formData.append("account", process.env.WA_OTP_DEVICE);

            const url = "https://whapify.id/api/send/otp";

            const headers = formData.getHeaders(); // Dapatkan header yang benar dari FormData

            const response = await axios.post(url, formData, { headers }); // Sertakan header

            console.log(response);


        } catch (error) {
            console.error(error);
            throw new Error(`Gagal mengirimkan whatsapp ke nomor ${phone}`); // Propagasi error agar bisa ditangani di tempat lain
        }
    }

    static async sendMessage(user, phone, verifurl) {
        try {
            const formData = new FormData();
            formData.append("secret", process.env.WA_OTP_SECRET);
            formData.append("account", process.env.WA_OTP_DEVICE);
            formData.append("type", "text");
            formData.append("message", `Silahkan salin link untuk verifikasi akun anda, ${verifurl} `);
            formData.append("recipient", `+${phone}`);

            const url = "https://whapify.id/api/send/whatsapp";

            const headers = formData.getHeaders(); // Dapatkan header yang benar dari FormData
            const response = await axios.post(url, formData, { headers }); // Sertakan header
            return response.data.data.otp

        } catch (error) {
            console.error(error);

            throw new Error(`Gagal mengirimkan whatsapp ke nomor ${user.resident_phone_number}`); // Propagasi error agar bisa ditangani di tempat lain
        }
    }
}

module.exports = { Transporter };
