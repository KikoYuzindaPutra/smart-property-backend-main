const jwt = require("jsonwebtoken");
const RedisManager = require("../config/redis.config");

class Authorization {

    responseError(res, error) {
        const status = error.status || 500;
        const message = error?.message || "Internal server error"
        res.status(status).json({ status, code: error?.code || "Permintaan anda tidak dapat di proses akibat kesalahan server", message });
    }

    static encryption(payload, time) {
        try {
            const secretKey = process.env.SECRET_KEY;

            const options = {
                expiresIn: time ? time : "12h",
            };

            const token = jwt.sign(payload, secretKey, options);

            return { Token: token, Payload: payload };
        } catch (error) {
            throw error;
        }
    }

    static decryption() {
        return async (req, res, next) => {
            try {
                const { token } = req.session;

                if (!token) {
                    return res.status(401).json({ status: 401, error: "Access Denied!", message: "Youre not allowed to access this page" });
                }

                const decoded = jwt.verify(token, process.env.SECRET_KEY);

                req.dataLogin = decoded;

                next();
            } catch (error) {
                error.status = 403;
                error.code = "Access Denied";
                error.mesage = error.name === "TokenExpiredError"
                    ? "Token has expired"
                    : "Access Denied!";
                throw error
            }
        };
    }

    static verifySession(typeSession = "") {
        return async (req, res, next) => {
            try {
                // Ambil sessionId dari cookie yang di-sign

                const sessionId = req.signedCookies[typeSession];

                if (!sessionId) {
                    return res.status(401).json({
                        status: 401,
                        error: "Access Denied!",
                        message: "You're not allowed to access this page",
                    });
                }

                // Ambil token dari Redis
                const token = await RedisManager.getKey(`${typeSession}:${sessionId}`);
                if (!token) {
                    return res.status(401).json({
                        status: 401,
                        error: "Access Denied!",
                        message: "Session not found or expired",
                    });
                }

                // Verifikasi token JWT
                const decoded = jwt.verify(token, process.env.SECRET_KEY);
                req.dataLogin = decoded;

                next();
            } catch (error) {
                console.error("Error verifying session:", error);

                const errorMessage =
                    error.name === "TokenExpiredError"
                        ? "Session has expired"
                        : "Access Denied!";

                return res.status(401).json({
                    status: 401,
                    error: "Access Denied!",
                    message: errorMessage,
                });
            }
        }

    }

    static getSession(typeSession = "") {
        return async (req, res) => {
            try {
                const sessionId = req.signedCookies[typeSession];
                if (!sessionId) {
                    return res.status(401).json({
                        status: 401,
                        error: "Access Denied!",
                        message: "You're not allowed to access this page",
                    });
                }

                // Ambil token dari Redis
                const token = await RedisManager.getKey(`${typeSession}:${sessionId}`);
                if (!token) {
                    return res.status(401).json({
                        status: 401,
                        error: "Access Denied!",
                        message: "Session not found or expired",
                    });
                }


                res.status(200).json({ status: 200, message: "Sesi anda valid!" })
            } catch (error) {
                console.error("Error verifying session:", error);

                const errorMessage =
                    error.name === "TokenExpiredError"
                        ? "Session has expired"
                        : "Access Denied!";

                return res.status(401).json({
                    status: 401,
                    error: "Access Denied!",
                    message: errorMessage,
                });
            }
        }

    }

    static async setSession(req, res) {
        try {
            const { token } = req.session;

            if (!token) {
                return res.status(401).json({ message: "Access Denied!" });
            }

            const decoded = jwt.verify(token, process.env.SECRET_KEY);

            let dataCookies;
            if (req.query && Object.keys(req.query).length > 0) {
                if (req.query.OutletID) {
                    let isFindOutlet = false;

                    for (const outletID of decoded.Outlets) {
                        if (outletID === req.query.OutletID) {
                            dataCookies = {
                                OutletID: outletID,
                            };

                            isFindOutlet = true;
                            break;
                        }
                    }

                    if (!isFindOutlet) {
                        const newError = new Error("Outlet not found!");
                        newError.status = 404;
                        throw newError;
                    }
                } else {
                    const newError = new Error("Invalid request format.");
                    newError.status = 400;
                    throw newError;
                }
            } else {
                dataCookies = {
                    EnterpriseID: decoded.EnterpriseID,
                };
            }

            res.cookie("dataSession", dataCookies, {
                httpOnly: true,
                secure: process.env.NODE_ENV == "production",
                maxAge: 12 * 60 * 60 * 1000,
                sameSite: "Lax",
                signed: true,
            });

            res.status(200).json({
                success: true,
                data: dataCookies,
            });
        } catch (error) {
            console.error(error);
            const errorMessage =
                error.name === "TokenExpiredError"
                    ? "Token has expired"
                    : "Access Denied!";

            return res.status(401).json({ message: errorMessage });
        }
    }



    static async verifyToken(token) {
        try {
            if (!token) {
                return res.status(401).json({ message: "Token undefined" });
            }

            const secretKey = process.env.SECRET_KEY;

            const decoded = jwt.verify(token, secretKey);

            return decoded;
        } catch (error) {
            console.error(error);

            if (error.name === "TokenExpiredError") {
                return res.status(403).json({ message: "Token has expired" });
            }

            return res.status(403).json({ message: "Access Denied!" });
        }
    }

    static logout() {
        return async (req, res) => {
            try {
                // Ambil sessionId dari cookie yang di-sign
                const sessionId = req.signedCookies["users"];
                if (!sessionId) {
                    return res.status(401).json({
                        status: 401,
                        error: "Access Denied!",
                        message: "You're not allowed to access this page",
                    });
                }


                // Hapus sesi dari Redis
                await RedisManager.deleteKey(`${"users"}:${sessionId}`);

                // Hapus cookie dari client
                res.clearCookie("users", {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "Lax",
                });

                // Kirim response sukses
                return res.status(200).json({
                    status: 200,
                    message: "Logout successful",
                });

            } catch (error) {
                console.error("Error during logout:", error);
                return res.status(500).json({
                    status: 500,
                    error: "Server Error",
                    message: "Failed to logout",
                });
            }
        };
    }
}

module.exports = { Authorization };
