const mysql = require('mysql')
const Promise = require('bluebird')

class AppDAO {
    constructor(params) {

        this.db = mysql.createConnection(params)

        this.db.connect((err) => {
            if (err) {
                console.error('Could not connect to database', err)
            } else {
                console.log('Connected to database')
            }
        })
    }

    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.query(sql, params, function (err) {
                if (err) {
                    console.error('Error running sql ' + sql)
                    console.error(err)
                    reject(err)
                } else {
                    resolve({ id: this.lastID })
                }
            })
        })
    }

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.query(sql, params, function (err, result) {
                if (err) {
                    console.error('Error running sql: ' + sql)
                    console.error(err)
                    reject(err)
                } else if (result) {
                    resolve(result[0])
                } else {
                    resolve(undefined)
                }
            })
        })
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.query(sql, params, (err, rows) => {
                if (err) {
                    console.error('Error running sql: ' + sql)
                    console.error(err)
                    reject(err)
                } else {
                    resolve(rows)
                }
            })
        })
    }
}

// Database access with DAO
var config = require('./config');
var dao = new AppDAO(config.db)

dao.run('CREATE TABLE IF NOT EXISTS user (rowid INT PRIMARY KEY NOT NULL AUTO_INCREMENT, username TEXT, password TEXT, pubkey TEXT);');
dao.run('CREATE TABLE IF NOT EXISTS message (rowid INT PRIMARY KEY NOT NULL AUTO_INCREMENT, userid INT, target DATE, message TEXT, post DATETIME);');

module.exports = dao;