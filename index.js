// index.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const { MySQLManager } = require("./config/mysql.config.js");
const RedisManager = require("./config/redis.config.js");
const path = require("path");
const http = require("http");

const app = express();

dotenv.config({ path: "./config/.env" });

// Inisialisasi koneksi
new MySQLManager(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD);

MySQLManager.authenticate(process.env.DB_NAME);
// MySQLManager.synchronize(process.env.DB_NAME, true);

new RedisManager("localhost", process.env.REDIS_PORT);

app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        origin: ["http://localhost:3000", "https://kikofe.smartkos.com", "https://smartkos.com"],
        methods: ["POST", "GET", "DELETE", "PUT", "PATCH", "OPTIONS"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"],
        exposedHeaders: ["Authorization"],
    })
);

app.use(cookieParser(process.env.SECRET_KEY));
app.use(
    session({
        secret: process.env.SECRET_KEY,
        resave: false,
        saveUninitialized: false,
    })
);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

const { router } = require("./api");

app.use("/", router);

// Buat server HTTP dari Express
const server = http.createServer(app);
const port = 4020;

server.listen(port, "0.0.0.0", () => {
    console.log(`>> Server is running on http://0.0.0.0:${port}`);
});
