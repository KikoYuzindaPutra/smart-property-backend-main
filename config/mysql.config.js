const { Sequelize, DataTypes, Op, QueryTypes } = require("sequelize");

class MySQLManager {
    static DATABASES = {};

    constructor(dbName, username, password) {
        this.db = new Sequelize(dbName, username, password, {
            host: process.env.HBASE_HOST,
            dialect: "mysql",
            logging: false,
        });
        MySQLManager.DATABASES[dbName] = this.db;
    }

    static getDatabase(dbName) {
        return MySQLManager.DATABASES[dbName];
    }

    static getDatabaseDetail(dbName) {
        const db = MySQLManager.DATABASES[dbName];

        if (db) {
            return db.config;
        } else {
            console.error(`>> ${dbName} database is not configured.`);
            return null;
        }
    }

    static async authenticate(dbName) {
        const db = MySQLManager.DATABASES[dbName];

        if (!db) {
            console.error(`>> ${dbName} database is not configured.`);
            return;
        }

        try {
            await db.authenticate();
            console.log(`>> ${dbName} database connected successfully.`);
        } catch (error) {
            console.error(`>> Error connecting to ${dbName} database:`, error);
        }
    }

    static async synchronize(dbName, isForce = false) {
        const db = MySQLManager.DATABASES[dbName];

        if (!db) {
            console.error(`>> ${dbName} database is not configured.`);
            return;
        }

        if (!isForce || isForce !== true) {
            isForce = false;
        }

        try {
            if (isForce === true) {
                await db.query("SET FOREIGN_KEY_CHECKS = 0");
            }

            await db.sync({
                force: isForce,
            });

            console.log(`>> ${dbName} database synchronized successfully.`);

            if (isForce === true) {
                await db.query("SET FOREIGN_KEY_CHECKS = 1");
            }
        } catch (error) {
            console.error(`>> Error synchronizing ${dbName} database:`, error);
        }
    }

    static async closeConnection(dbName) {
        const db = MySQLManager.DATABASES[dbName];

        if (!db) {
            console.error(`>> ${dbName} database is not configured.`);
            return;
        }

        try {
            await db.close();
            console.log(`>> Connection to ${dbName} database closed.`);
        } catch (error) {
            console.error(`Error closing connection to ${dbName} database:`, error);
        }
    }
}

module.exports = {
    MySQLManager,
    Sequelize,
    DataTypes,
    Op,
    QueryTypes,
};
