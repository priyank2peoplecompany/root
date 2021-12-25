let redis = require("redis");
let config = { 'port': '6379', 'host': '127.0.0.1' };
const common = require('./common.helper');
exports.setKey = (data) => {
    return new Promise((resolve, reject) => {
        let client = redis.createClient(config.port, config.host);
        client.on('connect', function () {
            client.select(5, function () {
                let key = common.generateKey();
                client.hmset(key, data, function (err, res) {
                    //storeUsersTokens(client, key, data);
                    if (err) reject(err);
                    let time = 60 * 60 * (24 * 7); //SECONDS
                    client.expire(key, time);
                    resolve(key);
                });
            });
        });
        client.on('error', function (err) {
            client.quit();
            reject(err);
        });
    });
}

exports.getKey = (key) => {
    return new Promise((resolve, reject) => {
        let client = redis.createClient(config.port, config.host);
        client.on('connect', function () {
            client.select(5, function () {
                client.hgetall(key, function (err, response) {
                    client.quit();
                    if (err) {
                        reject(err);
                    }
                    var time = 60 * 60 * (24 * 7); //SECONDS
                    client.expireat(key, time);
                    resolve(response);
                });
            });
        });
        client.on('error', function (err) {
            client.quit();
            reject(err);
        });
    });
}

exports.deleteKey = (key, data) => {
    return new Promise((resolve, reject) => {
        let client = redis.createClient(config.port, config.host);
        client.on('connect', function () {
            client.select(5, function () {
                client.del(key, function (err, data) {
                    client.quit();
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data)
                    }
                });
            });
        });

        client.on('error', function (err) {
            client.quit();
            reject(err);
        });
    });
}

function storeUsersTokens(client, key, data) {
    client.select(5, function () {
        client.sadd(data._id, key, function () {
            client.quit();
        })
    });
}