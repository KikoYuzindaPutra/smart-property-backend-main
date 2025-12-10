const { ulid } = require("ulid");

const generateID = (modelCode, idCode = "") => {
    try {
        if (typeof modelCode !== "string" || modelCode.trim() === "") {
            throw new Error("Invalid modelCode");
        }

        // Generate ULID full tanpa dipotong
        const uniqueID = ulid();

        // Gabungkan dengan kode model
        let ID = `${uniqueID}-${modelCode}`;

        if (idCode) {
            ID += idCode;
        }

        return ID;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const generateEpochTime = () => {
    return Math.floor(new Date().getTime() / 1000)
}

/**
 * Generate OTP berbasis ULID
 * @param {number} length - panjang OTP yang diambil (default 6 digit)
 * @returns {string} OTP
 */
function generateOTP(length = 6) {
    // Buat ULID
    const id = ulid();

    // Ambil karakter terakhir ULID → lebih random
    const otpSource = id.replace(/[^0-9]/g, ""); // ambil angka saja

    // Kalau tidak cukup panjang, pad ulangi ULID
    let otp = otpSource;
    while (otp.length < length) {
        otp += ulid().replace(/[^0-9]/g, "");
    }

    return otp.slice(0, length);
}



module.exports = { generateID, generateEpochTime, generateOTP };
