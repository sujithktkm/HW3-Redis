var express = require('express')
var app = express()
var redis = require('redis')
var client = redis.createClient(6379, '127.0.0.1', {})
var str = "this message will self-destruct in 10 seconds"

var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)
})

app.get('/', function(req, res) {
  res.send('hello world')
})

app.get('/set', function(req, res) {
  client.set("string key", str)
  client.expire("string key", 10)
  res.send(str)
})

app.get('/get', function(req, res) {
  client.get("string key", function(err,value){ console.log(value); res.send(value);})
})

app.use(function(req, res, next) {

})
app.get('/recent', function(req, res) {
  
})
