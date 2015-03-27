var redis = require('redis')
var multer  = require('multer')
var express = require('express')
var fs      = require('fs')
var http = require('http')
var httpproxy = require('http-proxy')
var app = express()
var client = redis.createClient(6379, '127.0.0.1', {})
var str = "this message will self-destruct in 10 seconds"

// REDIS
//var client = redis.createClient(6379, '127.0.0.1', {})

client.on('connect', function() {
	console.log('Connected')
})
///////////// WEB ROUTES
//New web srver that listens at port 3002
var server = app.listen(3002, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)
})

// Add hook to make it easier to get all visited URLS.
app.use(function(req, res, next) 
{
  console.log(req.method, req.url);
  var host = server.address().address
  var port = server.address().port
  var urlvisited = req.url;
  var finalurl = "http://"+host+":"+port+urlvisited
  client.lpush("queue", finalurl, function(err, reply) {
    console.log(reply)
  })
  client.ltrim("queue", 0, 4)

  next(); // Passing the request to the next handler in the stack.
});

//Just to show the users that this web server is listening
app.get('/', function(req, res) {
  res.send('hello world')
})

//Creating route '/set' where a key value is set to the client
app.get('/set', function(req, res) {
  client.set("string key", str)
    client.expire("string key", 10)
  res.send(str)
})

/*Creating route '/get' where the 
key value set to the client is extracted to display it to the user*/
app.get('/get', function(req, res) {
  client.get("string key", function(err,value){ console.log(value); res.send(value);})
})


app.get('/recent', function(req, res) {
  client.lrange("queue", 0, 4, function(err, message) {
      res.send(message);
      console.log(message);
  })
})


app.use('/uploads', express.static(__dirname+'/uploads'))

app.post('/upload',[ multer({ dest: './uploads/'}), function(req, res){
   console.log(req.body) // form fields
   console.log(req.files) // form files

   if( req.files.image )
   {
	   fs.readFile( req.files.image.path, function (err, imageval) {
	  		if (err) throw err;
	  		var img = new Buffer(imageval).toString('base64');
	  		//console.log(img);
        client.lpush("queue1", req.files.image.path)
		});
	}

   res.status(204).end()
}]);

app.get('/meow', function(req, res, err) {
		//if (err) throw err
    client.rpop("queue1", function(err,imagedata)
    {
      res.writeHead(200, {'content-type':'text/html'});
      res.write("<h1>\n<img src='"+imagedata+"'/>");
      console.log(imagedata);
      res.end();
    });
})

