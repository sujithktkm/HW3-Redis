var redis = require("redis"),
        client = redis.createClient();
var client = redis.createClient(6379, '127.0.0.1', {});

    client.on("error", function (err) {
        console.log("Error " + err);
    });

